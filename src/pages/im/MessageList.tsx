/**
 * 消息列表：历史分页 + WebSocket 新消息，支持加载更多
 * 历史消息拉取后对 content 解密（当配置 VITE_IM_MASTER_KEY 时）
 */
import React, { useEffect, useRef } from 'react';
import { Spin } from 'antd';
import { getMessages } from '@/services/im';
import type { IMessage } from './types';
import { decryptContentOrPlain } from './crypto';
import MessageItem from './MessageItem';
import './style.less';

async function decryptMessageList(list: IMessage[], currentUserId: number, peerUserId: number): Promise<IMessage[]> {
  return Promise.all(
    list.map(async (m) => ({
      ...m,
      content: await decryptContentOrPlain(m.content, currentUserId, m.sender_id, m.receiver_id),
    })),
  );
}

export interface MessageListProps {
  currentUserId: number;
  peerUserId: number | null;
  messages: IMessage[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  onMessagesChange: (list: IMessage[], hasMore: boolean) => void;
}

const PAGE_SIZE = 20;

export default function MessageList({ currentUserId, peerUserId, messages, hasMore, loading, onLoadMore, onMessagesChange }: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    if (!peerUserId) {
      onMessagesChange([], false);
      return;
    }
    loadingMoreRef.current = true;
    getMessages({ peer_user_id: peerUserId, limit: PAGE_SIZE })
      .then(async (res) => {
        const list = res?.list ?? [];
        const more = res?.has_more ?? false;
        const decrypted = await decryptMessageList(list, currentUserId, peerUserId);
        onMessagesChange(decrypted, more);
      })
      .catch(() => onMessagesChange([], false))
      .finally(() => {
        loadingMoreRef.current = false;
      });
  }, [peerUserId, currentUserId, onMessagesChange]);

  const loadMore = () => {
    if (!peerUserId || !hasMore || loadingMoreRef.current || messages.length === 0) return;
    const before = messages[messages.length - 1].created_at;
    loadingMoreRef.current = true;
    getMessages({ peer_user_id: peerUserId, limit: PAGE_SIZE, before })
      .then(async (res) => {
        const nextList = res?.list ?? [];
        const more = res?.has_more ?? false;
        const decrypted = await decryptMessageList(nextList, currentUserId, peerUserId);
        onMessagesChange([...messages, ...decrypted], more);
      })
      .catch(() => {})
      .finally(() => {
        loadingMoreRef.current = false;
      });
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  if (!peerUserId) return null;

  if (loading) {
    return (
      <div className='im-message-list-wrap' style={{ justifyContent: 'center' }}>
        <Spin size='small' />
      </div>
    );
  }

  return (
    <div className='im-message-list-wrap' ref={listRef}>
      {hasMore && (
        <div style={{ alignSelf: 'center', marginBottom: 8 }}>
          <a onClick={loadMore} style={{ fontSize: 12, color: '#1890ff' }}>
            加载更多
          </a>
        </div>
      )}
      {/* 接口按 created_at 降序返回，展示时倒序使最新在底部 */}
      {[...messages].reverse().map((msg) => (
        <MessageItem key={msg.id} message={msg} isSelf={msg.sender_id === currentUserId} />
      ))}
    </div>
  );
}
