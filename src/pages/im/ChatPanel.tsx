/**
 * 右侧聊天面板：头部、消息列表、输入区
 */
import React, { useState, useCallback } from 'react';
import MessageList from './MessageList';
import InputArea from './InputArea';
import type { IMessage, IMsgBody } from './types';
import './style.less';

export interface ChatPanelProps {
  currentUserId: number;
  peerUserId: number | null;
  peerNickname: string;
  messages: IMessage[];
  hasMore: boolean;
  onMessagesChange: (list: IMessage[], hasMore: boolean) => void;
  sendMessage: (toUserId: number, body: IMsgBody) => void;
  wsConnected: boolean;
}

export default function ChatPanel({ currentUserId, peerUserId, peerNickname, messages, hasMore, onMessagesChange, sendMessage, wsConnected }: ChatPanelProps) {
  const [loading, setLoading] = useState(false);

  const handleMessagesChange = useCallback(
    (list: IMessage[], more: boolean) => {
      onMessagesChange(list, more);
      setLoading(false);
    },
    [onMessagesChange],
  );

  React.useEffect(() => {
    if (peerUserId) setLoading(true);
  }, [peerUserId]);

  if (!peerUserId) {
    return (
      <div className='im-chat-panel'>
        <div className='im-chat-placeholder'>请从左侧选择联系人开始聊天</div>
      </div>
    );
  }

  return (
    <div className='im-chat-panel'>
      <div className='im-chat-header'>
        {peerNickname}
        <span className={`im-ws-status ${wsConnected ? 'connected' : 'connecting'}`}>{wsConnected ? '已连接' : '连接中...'}</span>
      </div>

      <MessageList
        currentUserId={currentUserId}
        peerUserId={peerUserId}
        messages={messages}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={() => {}}
        onMessagesChange={handleMessagesChange}
      />
      <InputArea peerUserId={peerUserId} sendMessage={sendMessage} disabled={!wsConnected} />
    </div>
  );
}
