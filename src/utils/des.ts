import CryptoJS from 'crypto-js';
/**
 * rsa加密
 * @author: talon
 * @Date: 2023-07-05 15:06:44
 */

export function DesEncry(password: any) {
  const publicKey = 'ydw@sina';
  // 使用 RSA 公钥加密 请求响应解密的key
  // const encryptedPassword = CryptoJS.DES.encrypt(password, publicKey).toString();
  const encrypted = CryptoJS.DES.encrypt(password, CryptoJS.enc.Utf8.parse(publicKey), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
  return encrypted;
}

const key = 'aaaabbbbccccdddd';
const iv = '1234567887654321';

// 加密
export function Encrypt(text) {
  return CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
}

// 解密
export function Decrypt(text) {
  let decrypted = CryptoJS.AES.decrypt(text, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
