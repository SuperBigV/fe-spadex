/**
 * 全部用户列表：复用 getUserInfoList，支持搜索
 */
import React, { useEffect, useState } from 'react';
import { List, Input, Spin, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getUserInfoList } from '@/services/manage';
import type { IUserItem } from './types';
import './style.less';

export interface UserListProps {
  currentUserId: number;
  peerUserId: number | null;
  onSelectPeer: (peerUserId: number, nickname?: string) => void;
}

export default function UserList({ currentUserId, peerUserId, onSelectPeer }: UserListProps) {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<IUserItem[]>([]);
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState<IUserItem[]>([]);

  useEffect(() => {
    setLoading(true);
    getUserInfoList({ limit: 5000 })
      .then((res: any) => {
        const raw = res?.dat?.list ?? res?.list ?? [];
        // 过滤掉用户名包含机器人的用户
        const users = raw.filter((u: any) => u.id !== currentUserId && !u.nickname.includes('机器人'));
        setAllUsers(users);
        setList(users);
      })
      .catch(() => {
        setAllUsers([]);
        setList([]);
      })
      .finally(() => setLoading(false));
  }, [currentUserId]);

  useEffect(() => {
    const kw = (search || '').trim().toLowerCase();
    if (!kw) {
      setList(allUsers);
      return;
    }
    const filtered = allUsers.filter(
      (u) =>
        String(u.username || '')
          .toLowerCase()
          .includes(kw) ||
        String(u.nickname || '')
          .toLowerCase()
          .includes(kw),
    );
    setList(filtered);
  }, [search, allUsers]);

  const displayName = (u: IUserItem) => u.nickname || u.username || `用户${u.id}`;

  if (loading) {
    return (
      <div className='im-user-list im-loading'>
        <Spin size='small' />
      </div>
    );
  }

  return (
    <div className='im-user-list'>
      <Input placeholder='搜索用户' value={search} onChange={(e) => setSearch(e.target.value)} allowClear className='im-user-list-search' />
      {list.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={search ? '无匹配用户' : '暂无用户'} />
      ) : (
        <List
          dataSource={list}
          renderItem={(item) => {
            const isActive = peerUserId === item.id;
            return (
              <List.Item className={`im-user-item ${isActive ? 'active' : ''}`} onClick={() => onSelectPeer(item.id, displayName(item))}>
                <span className='im-user-avatar'>{item.portrait ? <img src={item.portrait} alt='' className='im-user-avatar-img' /> : <UserOutlined />}</span>
                <span className='im-user-name'>{displayName(item)}</span>
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
}
