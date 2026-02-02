/**
 * 消息列表：历史分页 + WebSocket 新消息，支持加载更多
 */
import React, { useEffect, useRef } from 'react';
import { Spin } from 'antd';
import { getMessages } from '@/services/im';
import type { IMessage } from './types';
import MessageItem from './MessageItem';
import './style.less';

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
      .then((res) => {
        const list = res?.list ?? [];
        const more = res?.has_more ?? false;
        onMessagesChange(list, more);
      })
      .catch(() => onMessagesChange([], false))
      .finally(() => {
        loadingMoreRef.current = false;
      });
  }, [peerUserId, onMessagesChange]);

  const loadMore = () => {
    if (!peerUserId || !hasMore || loadingMoreRef.current || messages.length === 0) return;
    const before = messages[messages.length - 1].created_at;
    loadingMoreRef.current = true;
    getMessages({ peer_user_id: peerUserId, limit: PAGE_SIZE, before })
      .then((res) => {
        const nextList = res?.list ?? [];
        const more = res?.has_more ?? false;
        onMessagesChange([...messages, ...nextList], more);
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
