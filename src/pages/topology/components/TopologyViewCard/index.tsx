/*
 * 拓扑视图卡片组件
 */

import React from 'react';
import { Card, Badge, Button, Space, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, DatabaseOutlined } from '@ant-design/icons';
import { TopologyView } from '../../types';
import moment from 'moment';
import './index.less';

interface TopologyViewCardProps {
  view: TopologyView;
  nodeCount?: number;
  connectionCount?: number;
  onView: (view: TopologyView) => void;
  onEdit: (view: TopologyView) => void;
  onDelete: (view: TopologyView) => void;
}

const TopologyViewCard: React.FC<TopologyViewCardProps> = ({
  view,
  nodeCount = 0,
  connectionCount = 0,
  onView,
  onEdit,
  onDelete,
}) => {
  const getTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      room: '机房拓扑',
      rack: '机柜拓扑',
      'cross-room': '跨机房拓扑',
      business: '业务拓扑',
    };
    return typeMap[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      room: 'blue',
      rack: 'green',
      'cross-room': 'purple',
      business: 'orange',
    };
    return colorMap[type] || 'default';
  };

  return (
    <Card
      className='topology-view-card'
      hoverable
      actions={[
        <Button key='view' type='link' icon={<EyeOutlined />} onClick={() => onView(view)}>
          查看
        </Button>,
        <Button key='edit' type='link' icon={<EditOutlined />} onClick={() => onEdit(view)}>
          编辑
        </Button>,
        <Popconfirm
          key='delete'
          title='确定要删除这个拓扑视图吗？'
          onConfirm={() => onDelete(view)}
          okText='确定'
          cancelText='取消'
        >
          <Button type='link' danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>,
      ]}
    >
      <div className='view-card-header'>
        <div className='view-card-icon'>
          <DatabaseOutlined style={{ fontSize: 32, color: 'var(--fc-primary-color)' }} />
        </div>
        <div className='view-card-title-group'>
          <h3 className='view-card-title'>{view.name}</h3>
          <Tag color={getTypeColor(view.type)} className='view-card-type'>
            {getTypeLabel(view.type)}
          </Tag>
        </div>
      </div>

      <div className='view-card-stats'>
        <div className='view-card-stat-item'>
          <span className='stat-label'>设备节点：</span>
          <span className='stat-value'>{nodeCount}</span>
        </div>
        <div className='view-card-stat-item'>
          <span className='stat-label'>连接关系：</span>
          <span className='stat-value'>{connectionCount}</span>
        </div>
      </div>

      <div className='view-card-footer'>
        <div className='view-card-time'>
          <span className='time-label'>更新时间：</span>
          <span className='time-value'>{moment(view.updatedAt).format('YYYY-MM-DD HH:mm')}</span>
        </div>
      </div>
    </Card>
  );
};

export default TopologyViewCard;

