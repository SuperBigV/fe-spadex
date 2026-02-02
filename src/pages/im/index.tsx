/**
 * IM 即时通讯页面：左侧会话/用户栏 + 右侧聊天区域
 */
import React, { useState, useCallback, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import { CommonStateContext } from '@/App';
import LeftSidebar from './LeftSidebar';
import ChatPanel from './ChatPanel';
import { useImWs } from './hooks/useImWs';
import { useNotificationSound } from './hooks/useNotificationSound';
import { markConversationRead } from '@/services/im';
import type { IMessage } from './types';
import './style.less';

export default function ImPage() {
  const { profile } = useContext(CommonStateContext);
  const location = useLocation();
  const currentUserId = profile?.id ?? 0;

  const [peerUserId, setPeerUserId] = useState<number | null>(null);
  const [peerNickname, setPeerNickname] = useState('');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [conversationRefreshTrigger, setConversationRefreshTrigger] = useState(0);

  const { play, shouldPlay } = useNotificationSound();

  const handleNewMessage = useCallback(
    (msg: IMessage) => {
      const isForCurrent =
        peerUserId !== null && ((msg.sender_id === currentUserId && msg.receiver_id === peerUserId) || (msg.sender_id === peerUserId && msg.receiver_id === currentUserId));
      if (isForCurrent) {
        setMessages((prev) => [msg, ...prev]);
      } else {
        if (shouldPlay(currentUserId, peerUserId, msg.sender_id, msg.receiver_id)) {
          play();
        }
      }
      setConversationRefreshTrigger((t) => t + 1);
    },
    [currentUserId, peerUserId, play, shouldPlay],
  );

  const { status, sendMessage } = useImWs({
    currentUserId,
    enabled: location.pathname === '/im' && currentUserId > 0,
    onMessage: handleNewMessage,
    onError: (code, message) => {
      if (code === 'INVALID_PEER') {
        // 可在此用 message 提示
      }
    },
  });

  const handleSelectPeer = useCallback((uid: number, nickname?: string) => {
    setPeerUserId(uid);
    setPeerNickname(nickname || `用户${uid}`);
    setMessages([]);
    setHasMore(false);
    markConversationRead(uid).catch(() => {});
  }, []);

  const handleMessagesChange = useCallback((list: IMessage[], more: boolean) => {
    setMessages(list);
    setHasMore(more);
  }, []);

  if (!currentUserId) {
    return (
      <PageLayout title='即时通讯'>
        <div className='im-page'>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>请先登录</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title='即时通讯'>
      <div className='im-page'>
        <div className='im-page-left'>
          <LeftSidebar currentUserId={currentUserId} peerUserId={peerUserId} onSelectPeer={handleSelectPeer} conversationRefreshTrigger={conversationRefreshTrigger} />
        </div>
        <div className='im-page-right'>
          <ChatPanel
            currentUserId={currentUserId}
            peerUserId={peerUserId}
            peerNickname={peerNickname}
            messages={messages}
            hasMore={hasMore}
            onMessagesChange={handleMessagesChange}
            sendMessage={sendMessage}
            wsConnected={status === 'connected'}
          />
        </div>
      </div>
    </PageLayout>
  );
}
