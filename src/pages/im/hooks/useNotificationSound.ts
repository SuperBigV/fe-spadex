/**
 * 消息提示音：收到新消息且（非当前会话或窗口未 focus）时播放 /audio/im.mp3
 */
import { useRef } from 'react';

const SOUND_URL = '/audio/im.mp3';

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(SOUND_URL);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {
      // ignore
    }
  };

  /** 是否应播放提示音：当前不在该会话 或 窗口未 focus。currentUserId 为当前登录用户 id，currentPeerUserId 为当前选中的会话对方 id */
  const shouldPlay = (currentUserId: number, currentPeerUserId: number | null, msgSenderId: number, msgReceiverId: number) => {
    const isCurrentConversation =
      currentPeerUserId !== null &&
      ((msgSenderId === currentUserId && msgReceiverId === currentPeerUserId) || (msgSenderId === currentPeerUserId && msgReceiverId === currentUserId));
    if (!isCurrentConversation) return true; // 不是当前会话，应播放
    if (document.visibilityState !== 'visible') return true; // 窗口未 focus，应播放
    return false;
  };

  return { play, shouldPlay };
}
