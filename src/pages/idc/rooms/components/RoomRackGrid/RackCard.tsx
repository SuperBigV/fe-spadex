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
import { Card, Badge, Progress } from 'antd';
import { Rack } from '@/pages/room/types';
import './RackCard.less';

interface RackCardProps {
  rack: Rack;
  selected: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isDragging?: boolean;
}

const RackCard: React.FC<RackCardProps> = ({ rack, selected, onClick, onDoubleClick, isDragging = false }) => {
  const rate = (rack.usedU || 0) / rack.totalU;

  const getUsageColor = (rate: number) => {
    if (rate < 0.5) return 'var(--fc-green-6-color)';
    if (rate < 0.8) return 'var(--fc-geekblue-5-color)';
    if (rate < 0.95) return 'var(--fc-gold-6-color)';
    return 'var(--fc-red-5-color)';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { status: 'success' | 'warning' | 'default'; text: string }> = {
      active: { status: 'success', text: '正常' },
      maintenance: { status: 'warning', text: '维护' },
      inactive: { status: 'default', text: '停用' },
    };
    const config = statusMap[status] || { status: 'default', text: status };
    return <Badge status={config.status} text={config.text} />;
  };

  const color = getUsageColor(rate);

  const handleClick = (e: React.MouseEvent) => {
    // 如果正在拖拽，不触发点击事件
    if (!isDragging) {
      onClick?.();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // 如果正在拖拽，不触发双击事件
    if (!isDragging) {
      onDoubleClick?.();
    }
  };

  return (
    <Card
      className={`rack-card ${selected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      hoverable={!isDragging}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{ borderColor: selected ? 'var(--fc-primary-color)' : color }}
    >
      <div className='rack-card-header'>
        <div className='rack-card-title'>{rack.name}</div>
        <div className='rack-card-code'>{rack.code}</div>
      </div>
      <div className='rack-card-status'>{getStatusBadge(rack.status)}</div>
      <div className='rack-card-usage'>
        <div className='usage-item'>
          <div className='usage-label'>
            <div>U位使用</div>
            <div className='usage-value'>
              {rack.usedU || 0}/{rack.totalU}U
            </div>
          </div>
          <Progress percent={rate * 100} strokeColor={color} size='small' showInfo={false} />
        </div>
        <div className='rack-card-stats'>
          <div className='stat-item'>
            <span className='stat-label'>功率:</span>
            <span className='stat-value'>
              {rack.powerUsed?.toFixed(1) || 0}/{rack.powerCapacity || 0} KW
            </span>
          </div>
          <div className='stat-item'>
            <span className='stat-label'>设备:</span>
            <span className='stat-value'>{rack.deviceCount || 0}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RackCard;
