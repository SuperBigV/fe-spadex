/**
 * 左侧栏：最近联系 + 全部用户，Tab 切换
 */
import React, { useState } from 'react';
import { Tabs } from 'antd';
import { MessageOutlined, TeamOutlined } from '@ant-design/icons';
import ConversationList from './ConversationList';
import UserList from './UserList';
import './style.less';

export interface LeftSidebarProps {
  currentUserId: number;
  peerUserId: number | null;
  onSelectPeer: (peerUserId: number, nickname?: string) => void;
  conversationRefreshTrigger?: number;
  /** 各用户未读数，用于全部用户列表角标 */
  unreadByPeer?: Record<number, number>;
}

export default function LeftSidebar({ currentUserId, peerUserId, onSelectPeer, conversationRefreshTrigger = 0, unreadByPeer = {} }: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>('users');

  return (
    <div className='im-left-sidebar'>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size='small'
        items={[
          {
            key: 'recent',
            label: (
              <span>
                <MessageOutlined /> 最近联系
              </span>
            ),
            children: <ConversationList currentUserId={currentUserId} peerUserId={peerUserId} onSelectPeer={onSelectPeer} refreshTrigger={conversationRefreshTrigger} />,
          },
          {
            key: 'users',
            label: (
              <span>
                <TeamOutlined /> 全部用户
              </span>
            ),
            children: <UserList currentUserId={currentUserId} peerUserId={peerUserId} onSelectPeer={onSelectPeer} unreadByPeer={unreadByPeer} />,
          },
        ]}
      />
    </div>
  );
}
