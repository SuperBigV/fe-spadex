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
}

export default function LeftSidebar({ currentUserId, peerUserId, onSelectPeer, conversationRefreshTrigger = 0 }: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>('recent');

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
            children: <UserList currentUserId={currentUserId} peerUserId={peerUserId} onSelectPeer={onSelectPeer} />,
          },
        ]}
      />
    </div>
  );
}
