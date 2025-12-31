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
 */

import React from 'react';
import { HomeOutlined, DatabaseOutlined, DesktopOutlined } from '@ant-design/icons';
import { RoomStatistics } from '@/pages/room/types';
import { Skeleton } from 'antd';
import './index.less';

interface OverviewCardsProps {
  totalRooms: number;
  statistics: RoomStatistics | null;
  loading?: boolean;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ totalRooms, statistics, loading }) => {
  if (loading) {
    return (
      <div className='overview-cards'>
        <Skeleton active paragraph={{ rows: 2 }} />
        <Skeleton active paragraph={{ rows: 2 }} />
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
    );
  }

  return (
    <div className='overview-cards'>
      <div className='overview-card'>
        <div className='card-icon'>
          <HomeOutlined style={{ fontSize: 24, color: '#4fd1c7' }} />
        </div>
        <div className='card-content'>
          <div className='card-label'>机房总数</div>
          <div className='card-value'>{totalRooms}</div>
        </div>
      </div>
      <div className='overview-card'>
        <div className='card-icon'>
          <DatabaseOutlined style={{ fontSize: 24, color: '#4299e1' }} />
        </div>
        <div className='card-content'>
          <div className='card-label'>机柜总数</div>
          <div className='card-value'>{statistics?.rackTotal || 0}</div>
          <div className='card-subtitle'>
            已用 {statistics?.rackUsed || 0} / 总数 {statistics?.rackTotal || 0}
          </div>
        </div>
      </div>
      <div className='overview-card'>
        <div className='card-icon'>
          <DesktopOutlined style={{ fontSize: 24, color: '#48bb78' }} />
        </div>
        <div className='card-content'>
          <div className='card-label'>设备总数</div>
          <div className='card-value'>{statistics?.deviceTotal || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default OverviewCards;
