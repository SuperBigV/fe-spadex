/**
 * IM 消息加解密：AES-GCM，会话密钥由主密钥派生（仅前端持有）
 * 主密钥通过环境变量 VITE_IM_MASTER_KEY 配置；未配置时不加密，兼容明文历史。
 */

const CONV_SALT_PREFIX = 'im-conv-';
const PBKDF2_ITERATIONS = 100000;
const AES_GCM_IV_LENGTH = 12;
const AES_GCM_TAG_LENGTH = 128; // bits

const keyCache = new Map<string, CryptoKey>();

function convKey(userId1: number, userId2: number): string {
  const a = Math.min(userId1, userId2);
  const b = Math.max(userId1, userId2);
  return `${a}_${b}`;
}

/** 转为 Web Crypto 可接受的 BufferSource（TS 中 ArrayBufferLike 与 BufferSource 不兼容时用） */
function asBufferSource(data: Uint8Array): BufferSource {
  const buf = new ArrayBuffer(data.length);
  new Uint8Array(buf).set(data);
  return new Uint8Array(buf) as BufferSource;
}

function getMasterKeyBytes(): Uint8Array | null {
  const raw = import.meta.env.VITE_IM_MASTER_KEY;
  if (!raw || typeof raw !== 'string' || !raw.trim()) return null;
  const encoded = new TextEncoder().encode(raw.trim());
  const buf = new ArrayBuffer(encoded.length);
  new Uint8Array(buf).set(encoded);
  return new Uint8Array(buf);
}

/** 是否启用加密（已配置主密钥） */
export function isEncryptionEnabled(): boolean {
  return getMasterKeyBytes() !== null;
}

/**
 * 获取会话对称密钥（派生并缓存）
 */
export async function getConversationKey(currentUserId: number, peerUserId: number): Promise<CryptoKey | null> {
  const masterBytes = getMasterKeyBytes();
  if (!masterBytes) return null;

  const cacheKey = convKey(currentUserId, peerUserId);
  const cached = keyCache.get(cacheKey);
  if (cached) return cached;

  const salt = asBufferSource(new TextEncoder().encode(CONV_SALT_PREFIX + cacheKey));
  const baseKey = await crypto.subtle.importKey('raw', asBufferSource(masterBytes), { name: 'PBKDF2' }, false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    256,
  );
  const key = await crypto.subtle.importKey('raw', derived as ArrayBuffer, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  keyCache.set(cacheKey, key);
  return key;
}

/**
 * AES-GCM 加密，返回 base64(iv + ciphertext + tag)
 */
export async function encryptMessage(plainText: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_LENGTH));
  const encoded = new TextEncoder().encode(plainText);
  const cipher = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: AES_GCM_TAG_LENGTH,
    },
    key,
    encoded,
  );
  const combined = new Uint8Array(iv.length + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), iv.length);
  return btoa(String.fromCharCode(...combined));
}

/**
 * AES-GCM 解密；若格式错误或校验失败则返回 null（可当作未加密原文由调用方处理）
 */
export async function decryptMessage(cipherText: string, key: CryptoKey): Promise<string | null> {
  try {
    const binary = atob(cipherText);
    const combined = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) combined[i] = binary.charCodeAt(i);
    if (combined.length < AES_GCM_IV_LENGTH + 16) return null; // iv + min tag
    const iv = combined.slice(0, AES_GCM_IV_LENGTH);
    const cipher = combined.slice(AES_GCM_IV_LENGTH);
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: AES_GCM_TAG_LENGTH,
      },
      key,
      cipher,
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

/**
 * 尝试解密；若未启用加密或解密失败则返回原文（兼容历史明文）
 */
export async function decryptContentOrPlain(content: string, currentUserId: number, senderId: number, receiverId: number): Promise<string> {
  if (!content) return content;
  if (!isEncryptionEnabled()) return content;
  const peerId = senderId === currentUserId ? receiverId : senderId;
  const key = await getConversationKey(currentUserId, peerId);
  if (!key) return content;
  const decrypted = await decryptMessage(content, key);
  return decrypted ?? content;
}
