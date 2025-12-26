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

import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Progress, Input, List, Badge, Button, Space } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRoomStatistics, getRackList } from '@/pages/room/services';
import { Room, Rack, RoomStatistics } from '@/pages/room/types';
import './index.less';

const { Search } = Input;

interface RoomInfoPanelProps {
  room: Room;
  selectedRackId: number | null;
  onRackSelect: (rackId: number) => void;
  onRackDoubleClick: (rackId: number) => void;
}

const RoomInfoPanel: React.FC<RoomInfoPanelProps> = ({ room, selectedRackId, onRackSelect, onRackDoubleClick }) => {
  const [statistics, setStatistics] = useState<RoomStatistics | null>(null);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [rackSearchKeyword, setRackSearchKeyword] = useState('');

  useEffect(() => {
    fetchData();
  }, [room.id]);

  const fetchData = async () => {
    try {
      const [stats, rackList] = await Promise.all([getRoomStatistics(room.id), getRackList({ roomId: room.id, page: 1, pageSize: 50 })]);
      setStatistics(stats);
      setRacks(rackList.list);
    } catch (error) {
      console.error('获取数据失败', error);
    }
  };

  const filteredRacks = racks.filter(
    (rack) => rack.name.toLowerCase().includes(rackSearchKeyword.toLowerCase()) || rack.code.toLowerCase().includes(rackSearchKeyword.toLowerCase()),
  );

  const getUsageColor = (rate: number) => {
    if (rate < 0.5) return '#52c41a';
    if (rate < 0.8) return '#1890ff';
    if (rate < 0.95) return '#faad14';
    return '#ff4d4f';
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

  return (
    <div className='room-info-panel'>
      <Card title='机房信息' size='small' style={{ marginBottom: 16 }}>
        <Descriptions column={1} size='small'>
          <Descriptions.Item label='名称'>{room.name}</Descriptions.Item>
          <Descriptions.Item label='编号'>{room.code}</Descriptions.Item>
          <Descriptions.Item label='地址'>{room.address || '-'}</Descriptions.Item>
          <Descriptions.Item label='类型'>{room.type || '-'}</Descriptions.Item>
          <Descriptions.Item label='等级'>{room.level || '-'}</Descriptions.Item>
          <Descriptions.Item label='状态'>{getStatusBadge(room.status)}</Descriptions.Item>
          {room.contact && <Descriptions.Item label='联系人'>{room.contact}</Descriptions.Item>}
          {room.contactPhone && <Descriptions.Item label='联系电话'>{room.contactPhone}</Descriptions.Item>}
        </Descriptions>
      </Card>

      {statistics && (
        <Card title='统计信息' size='small' style={{ marginBottom: 16 }}>
          <div className='stat-item'>
            <div className='stat-label'>机柜统计</div>
            <div className='stat-value'>
              {statistics.rackUsed}/{statistics.rackTotal} (可用: {statistics.rackAvailable})
            </div>
          </div>
          <div className='stat-item'>
            <div className='stat-label'>设备统计</div>
            <div className='stat-value'>{statistics.deviceTotal}</div>
          </div>
          <div className='stat-item'>
            <div className='stat-label'>U位使用率</div>
            <div className='progress-container'>
              <Progress percent={statistics.uUsageRate * 100} strokeColor={getUsageColor(statistics.uUsageRate)} format={() => `${statistics.uUsed}/${statistics.uTotal}`} />
            </div>
          </div>
          <div className='stat-item'>
            <div className='stat-label'>功率使用率</div>
            <div className='progress-container'>
              <Progress
                percent={statistics.powerUsageRate * 100}
                strokeColor={getUsageColor(statistics.powerUsageRate)}
                format={() => `${statistics.powerUsed.toFixed(1)}/${statistics.powerTotal.toFixed(1)} KW`}
              />
            </div>
          </div>
          {statistics.alarmCount !== undefined && statistics.alarmCount > 0 && (
            <div className='stat-item'>
              <div className='stat-label'>告警数</div>
              <div className='stat-value alarm-count'>{statistics.alarmCount}</div>
            </div>
          )}
        </Card>
      )}

      <Card title='机柜列表' size='small'>
        <Search
          placeholder='搜索机柜'
          allowClear
          style={{ marginBottom: 12 }}
          onSearch={setRackSearchKeyword}
          onChange={(e) => {
            if (!e.target.value) {
              setRackSearchKeyword('');
            }
          }}
        />
        <List
          dataSource={filteredRacks}
          renderItem={(rack) => {
            const rate = (rack.usedU || 0) / rack.totalU;
            return (
              <List.Item
                className={selectedRackId === rack.id ? 'rack-list-item-selected' : 'rack-list-item'}
                onClick={() => onRackSelect(rack.id)}
                onDoubleClick={() => onRackDoubleClick(rack.id)}
              >
                <div style={{ width: '100%', margin: 5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{rack.name}</span>
                    {getStatusBadge(rack.status)}
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <span className='rack-info-text'>
                      {rack.usedU || 0}/{rack.totalU}U
                    </span>
                  </div>
                  <Progress percent={rate * 100} strokeColor={getUsageColor(rate)} size='small' showInfo={false} />
                  <div className='rack-info-text' style={{ marginTop: 4 }}>
                    设备: {rack.deviceCount || 0}
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default RoomInfoPanel;
