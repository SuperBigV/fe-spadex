/**
 * 最近联系列表：GET /im/conversations，展示 last_content、unread_count、peer_nickname
 */
import React, { useEffect, useState } from 'react';
import { List, Spin, Empty } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { getConversations } from '@/services/im';
import { getUserInfo } from '@/services/manage';
import type { IConversation } from './types';
import { formatTime } from '@/pages/im/utils';
import './style.less';

export interface ConversationListProps {
  currentUserId: number;
  peerUserId: number | null;
  onSelectPeer: (peerUserId: number, nickname?: string) => void;
  refreshTrigger?: number;
}

export default function ConversationList({ currentUserId, peerUserId, onSelectPeer, refreshTrigger = 0 }: ConversationListProps) {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<IConversation[]>([]);
  const [nicknameMap, setNicknameMap] = useState<Record<number, string>>({});

  const fetchList = () => {
    setLoading(true);
    getConversations()
      .then((rows: IConversation[]) => {
        setList(rows);
        const ids = [...new Set(rows.map((r) => r.peer_user_id).filter((id) => id && id !== currentUserId))];
        Promise.all(
          ids.map((id) =>
            getUserInfo(String(id))
              .then((u: any) => ({ id, name: u?.nickname || u?.username || String(id) }))
              .catch(() => ({ id, name: String(id) })),
          ),
        ).then((results) => {
          const map: Record<number, string> = {};
          results.forEach((r) => {
            map[r.id] = r.name;
          });
          setNicknameMap((prev) => ({ ...prev, ...map }));
        });
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [currentUserId, refreshTrigger]);

  if (loading) {
    return (
      <div className='im-conversation-list im-loading'>
        <Spin size='small' />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className='im-conversation-list'>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无最近联系' />
      </div>
    );
  }

  return (
    <List
      className='im-conversation-list'
      dataSource={list}
      renderItem={(item) => {
        const nickname = item.peer_nickname || nicknameMap[item.peer_user_id] || `用户${item.peer_user_id}`;
        const isActive = peerUserId === item.peer_user_id;
        return (
          <List.Item className={`im-conversation-item ${isActive ? 'active' : ''}`} onClick={() => onSelectPeer(item.peer_user_id, nickname)}>
            <div className='im-conversation-item-inner'>
              <span className='im-conversation-avatar'>
                <MessageOutlined />
              </span>
              <div className='im-conversation-body'>
                <div className='im-conversation-row'>
                  <span className='im-conversation-name'>{nickname}</span>
                  {item.unread_count > 0 && <span className='im-conversation-unread'>{item.unread_count > 99 ? '99+' : item.unread_count}</span>}
                </div>
                <div className='im-conversation-preview'>{item.last_content || '[无消息]'}</div>
                <div className='im-conversation-time'>{formatTime(item.last_msg_at)}</div>
              </div>
            </div>
          </List.Item>
        );
      }}
    />
  );
}
