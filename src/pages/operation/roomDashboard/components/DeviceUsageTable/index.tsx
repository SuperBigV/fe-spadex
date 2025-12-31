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
import { Table } from 'antd';
import { DeviceUsage } from '../../types';
import { Skeleton } from 'antd';
import './index.less';

interface DeviceUsageTableProps {
  data: DeviceUsage[];
  loading?: boolean;
}

const DeviceUsageTable: React.FC<DeviceUsageTableProps> = ({ data, loading }) => {
  const getUsageColor = (usage: number) => {
    if (usage < 50) return '#48bb78';
    if (usage < 80) return '#f6ad55';
    return '#fc8181';
  };

  const getUsageRowClassName = (record: DeviceUsage) => {
    const maxUsage = Math.max(record.cpuUsage, record.memoryUsage);
    if (maxUsage >= 90) return 'usage-critical';
    if (maxUsage >= 70) return 'usage-warning';
    return '';
  };

  const columns = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 100,
      ellipsis: true,
      render: (text: string) => <span style={{ color: '#ffffff' }}>{text}</span>,
    },
    {
      title: 'CPU使用率',
      dataIndex: 'cpuUsage',
      key: 'cpuUsage',
      width: 80,
      align: 'right' as const,
      render: (value: number) => <span style={{ color: getUsageColor(value) }}>{value.toFixed(1)}%</span>,
    },
    {
      title: '内存使用率',
      dataIndex: 'memoryUsage',
      key: 'memoryUsage',
      width: 80,
      align: 'right' as const,
      render: (value: number) => <span style={{ color: getUsageColor(value) }}>{value.toFixed(1)}%</span>,
    },
  ];

  if (loading) {
    return (
      <div className='device-usage-table-card dashboard-card'>
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  }

  return (
    <div className='device-usage-table-card dashboard-card'>
      <div className='card-header'>
        <span className='card-title'>设备使用率</span>
      </div>
      <Table dataSource={data} columns={columns} pagination={false} size='small' rowClassName={getUsageRowClassName} rowKey='deviceId' />
    </div>
  );
};

export default DeviceUsageTable;
