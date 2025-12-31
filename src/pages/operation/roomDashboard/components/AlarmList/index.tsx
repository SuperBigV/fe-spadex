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
import { Table, Badge } from 'antd';
import moment from 'moment';
import { Alarm } from '../../types';
import { Skeleton } from 'antd';
import './index.less';

interface AlarmListProps {
  data: Alarm[];
  loading?: boolean;
}

const AlarmList: React.FC<AlarmListProps> = ({ data, loading }) => {
  const getLevelColor = (level: string) => {
    const colorMap: Record<string, string> = {
      critical: '#fc8181',
      warning: '#f6ad55',
      info: '#4299e1',
    };
    return colorMap[level] || '#718096';
  };

  const columns = [
    {
      title: '告警标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
      render: (text: string) => <span style={{ color: '#ffffff' }}>{text}</span>,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => {
        const levelMap: Record<string, string> = {
          critical: '严重',
          warning: '警告',
          info: '信息',
        };
        return <Badge color={getLevelColor(level)} text={levelMap[level] || level} />;
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (source: string) => {
        const sourceMap: Record<string, string> = {
          rack: '机柜',
          device: '设备',
          environment: '环境',
        };
        return <span style={{ color: '#a0aec0' }}>{sourceMap[source] || source}</span>;
      },
    },
    {
      title: '告警消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (text: string) => <span style={{ color: '#a0aec0' }}>{text}</span>,
    },
    {
      title: '触发时间',
      dataIndex: 'triggerTime',
      key: 'triggerTime',
      width: 180,
      render: (time: string) => <span style={{ color: '#a0aec0' }}>{moment(time).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
  ];

  if (loading) {
    return (
      <div className='alarm-list-card dashboard-card'>
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  }

  return (
    <div className='alarm-list-card dashboard-card'>
      <div className='card-header'>
        <span className='card-title'>最近告警</span>
        <Badge count={data.length} showZero />
      </div>
      <Table dataSource={data} columns={columns} pagination={false} size='small' scroll={{ y: 250 }} rowClassName={(record) => `alarm-row alarm-${record.level}`} rowKey='id' />
    </div>
  );
};

export default AlarmList;
