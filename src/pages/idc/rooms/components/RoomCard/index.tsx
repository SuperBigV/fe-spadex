/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React from 'react';
import { Card, Badge, Progress, Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Room, RoomStatus } from '@/pages/room/types';
import './index.less';

interface RoomCardProps {
  room: Room;
  onView: (room: Room) => void;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  getStatusBadge: (status: RoomStatus) => React.ReactNode;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onView, onEdit, onDelete, getStatusBadge }) => {
  const getUsageColor = (rate: number) => {
    if (rate < 0.5) return '#52c41a';
    if (rate < 0.8) return '#1890ff';
    if (rate < 0.95) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <Card
      className='room-card'
      hoverable
      actions={[
        <Button type='link' icon={<EyeOutlined />} onClick={() => onView(room)}>
          详情
        </Button>,
        <Button type='link' icon={<EditOutlined />} onClick={() => onEdit(room)}>
          编辑
        </Button>,
        <Popconfirm title='确定要删除这个机房吗？' onConfirm={() => onDelete(room)} okText='确定' cancelText='取消'>
          <Button type='link' danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>,
      ]}
    >
      <div className='room-card-header'>
        <h3 className='room-card-title'>{room.name}</h3>
        <div className='room-card-code'>{room.code}</div>
      </div>
      <div className='room-card-status'>{getStatusBadge(room.status)}</div>
      <div className='room-card-stats'>
        <div className='room-card-stat-item'>
          <span className='stat-label'>机柜数：</span>
          <span className='stat-value'>{room.rackCount || 0}</span>
        </div>
        <div className='room-card-stat-item'>
          <span className='stat-label'>设备数：</span>
          <span className='stat-value'>{room.deviceCount || 0}</span>
        </div>
      </div>
      <div className='room-card-usage'>
        <div className='usage-item'>
          <div className='usage-label'>
            <span>U位使用率</span>
            <span className='usage-percent'>{((room.uUsageRate || 0) * 100).toFixed(1)}%</span>
          </div>
          {/* 显示整数 */}
          <Progress percent={Math.round((room.uUsageRate || 0) * 100)} strokeColor={getUsageColor(room.uUsageRate || 0)} size='small' />
        </div>
        <div className='usage-item'>
          <div className='usage-label'>
            <span>功率使用率</span>
            {/* 保留两位小数 */}
            <span className='usage-percent'>{((room.powerUsageRate || 0) * 100).toFixed(1)}%</span>
          </div>
          <Progress percent={(room.powerUsageRate || 0) * 100} strokeColor={getUsageColor(room.powerUsageRate || 0)} size='small' />
        </div>
      </div>
      {room.address && (
        <div className='room-card-address'>
          <span className='address-label'>地址：</span>
          <span className='address-value'>{room.address}</span>
        </div>
      )}
    </Card>
  );
};

export default RoomCard;
