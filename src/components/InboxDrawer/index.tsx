import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Drawer, List, Spin, Empty, Tag } from 'antd';
import { getMessages, markMessageRead, InboxMessageItem } from '@/services/workform';
import { formatRelativeTime, getEventTypeLabel, getEventTypeTip } from './utils';
import './index.less';

interface InboxDrawerProps {
  open: boolean;
  onClose: () => void;
  unreadCount?: number;
  onRead?: () => void; // 标记已读后回调，用于刷新未读数
}

export default function InboxDrawer({ open, onClose, unreadCount = 0, onRead }: InboxDrawerProps) {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<InboxMessageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchList = (p = 1) => {
    if (!open) return;
    setLoading(true);
    getMessages({ page: p, pageSize })
      .then((res) => {
        setList(res.list);
        setTotal(res.total);
        setPage(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (open) fetchList(1);
  }, [open]);

  const handleItemClick = (item: InboxMessageItem) => {
    const link = item.link_url ? (item.link_url.startsWith('/') ? item.link_url : `/${item.link_url}`) : '/workform-orders';
    markMessageRead(item.id)
      .then(() => {
        onRead?.();
        onClose();
        history.push(link);
      })
      .catch(() => {});
  };

  return (
    <Drawer
      title={
        <span>
          站内信
          {unreadCount > 0 && <span className='inbox-drawer-unread'>（未读 {unreadCount}）</span>}
        </span>
      }
      placement='right'
      width={400}
      onClose={onClose}
      open={open}
      destroyOnClose
      className='inbox-drawer'
    >
      {loading ? (
        <div className='inbox-drawer-loading'>
          <Spin />
        </div>
      ) : list.length === 0 ? (
        <Empty description='暂无站内信' />
      ) : (
        <List
          itemLayout='vertical'
          dataSource={list}
          renderItem={(item) => (
            <List.Item className={`inbox-drawer-item ${item.is_read === 0 ? 'is-unread' : ''}`}>
              <div role='button' tabIndex={0} onClick={() => handleItemClick(item)} onKeyDown={(e) => e.key === 'Enter' && handleItemClick(item)}>
                <div className='inbox-drawer-item-meta'>
                  <Tag color='blue' className='inbox-drawer-item-type'>
                    {getEventTypeLabel(item.event_type)}
                  </Tag>
                  <span className='inbox-drawer-item-time'>{formatRelativeTime(item.created_at)}</span>
                </div>
                <div className='inbox-drawer-item-title'>{item.title}</div>
                <div className='inbox-drawer-item-tip'>{getEventTypeTip(item.event_type)}</div>
                {item.content && <div className='inbox-drawer-item-content'>{item.content}</div>}
              </div>
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
}
