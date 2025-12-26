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
import { Modal, Descriptions, Badge, Progress, Button, Space, Table } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRackStatistics, getRackDevices } from '@/pages/room/services';
import { Rack, RackStatistics, RackDevice } from '@/pages/room/types';
import './index.less';

interface RackDetailModalProps {
  visible: boolean;
  rack: Rack;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewUUnits: () => void;
}

const RackDetailModal: React.FC<RackDetailModalProps> = ({ visible, rack, onCancel, onEdit, onDelete, onViewUUnits }) => {
  const [statistics, setStatistics] = useState<RackStatistics | null>(null);
  const [devices, setDevices] = useState<RackDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (visible && rack) {
      setLoading(true);
      Promise.all([getRackStatistics(rack.id), getRackDevices(rack.id)])
        .then(([stats, devs]) => {
          setStatistics(stats);
          setDevices(devs);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [visible, rack]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { status: 'success' | 'warning' | 'default'; text: string }> = {
      active: { status: 'success', text: '活跃' },
      maintenance: { status: 'warning', text: '维护' },
      inactive: { status: 'default', text: '停用' },
      online: { status: 'success', text: '在线' },
      offline: { status: 'default', text: '离线' },
    };
    const config = statusMap[status] || { status: 'default', text: status };
    return <Badge status={config.status} text={config.text} />;
  };

  const getUsageColor = (rate: number) => {
    if (rate < 0.5) return '#52c41a';
    if (rate < 0.8) return '#1890ff';
    if (rate < 0.95) return '#faad14';
    return '#ff4d4f';
  };

  const deviceColumns = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: 'U位范围',
      key: 'uRange',
      render: (_: any, record: RackDevice) => `${record.startU}-${record.startU + record.heightU - 1}U`,
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusBadge(status),
    },
  ];

  return (
    <Modal
      title={`机柜详情: ${rack.name}`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key='viewUUnits' type='primary' onClick={onViewUUnits}>
          查看U位管理
        </Button>,
        <Button key='edit' icon={<EditOutlined />} onClick={onEdit}>
          编辑
        </Button>,
        <Button key='delete' danger icon={<DeleteOutlined />} onClick={onDelete}>
          删除
        </Button>,
        <Button key='cancel' onClick={onCancel}>
          关闭
        </Button>,
      ]}
      width={800}
    >
      <Descriptions title='基本信息' bordered column={2} style={{ marginBottom: 24 }}>
        <Descriptions.Item label='机柜名称'>{rack.name}</Descriptions.Item>
        <Descriptions.Item label='机柜编号'>{rack.code}</Descriptions.Item>
        <Descriptions.Item label='所属机房'>{rack.roomName || <span className='text-secondary'>未分配</span>}</Descriptions.Item>
        <Descriptions.Item label='状态'>{getStatusBadge(rack.status)}</Descriptions.Item>
        <Descriptions.Item label='总U数'>{rack.totalU}</Descriptions.Item>
        <Descriptions.Item label='已用U数'>{rack.usedU || 0}</Descriptions.Item>
        <Descriptions.Item label='功率容量'>{rack.powerCapacity} KW</Descriptions.Item>
        <Descriptions.Item label='已用功率'>{rack.powerUsed?.toFixed(1) || 0} KW</Descriptions.Item>
        <Descriptions.Item label='网络端口'>{rack.networkPorts || 0}</Descriptions.Item>
        <Descriptions.Item label='已用端口'>{rack.networkPortsUsed || 0}</Descriptions.Item>
        {rack.description && (
          <Descriptions.Item label='描述' span={2}>
            {rack.description}
          </Descriptions.Item>
        )}
      </Descriptions>

      {statistics && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: 'var(--fc-text-1)' }}>容量信息</h3>
          <div style={{ marginBottom: 16, marginRight: 50 }}>
            <div style={{ marginBottom: 8, color: 'var(--fc-text-1)' }}>
              <span>U位使用率: </span>
              <span style={{ marginLeft: 8 }}>{(statistics.uUsageRate * 100).toFixed(1)}%</span>
            </div>
            <Progress
              percent={statistics.uUsageRate * 100}
              strokeColor={getUsageColor(statistics.uUsageRate)}
              format={() => `${statistics.uUsed}/${statistics.uUsed + statistics.uAvailable}`}
            />
          </div>
          <div style={{ marginBottom: 16, marginRight: 50 }}>
            <div style={{ marginBottom: 8, color: 'var(--fc-text-1)' }}>
              <span>功率使用率: </span>
              <span style={{ marginLeft: 8 }}>{(statistics.powerUsageRate * 100).toFixed(1)}%</span>
            </div>
            <Progress
              percent={statistics.powerUsageRate * 100}
              strokeColor={getUsageColor(statistics.powerUsageRate)}
              format={() => `${statistics.powerUsed.toFixed(1)}/${(statistics.powerUsed + statistics.powerAvailable).toFixed(1)} KW`}
            />
          </div>
        </div>
      )}

      <div>
        <h3 style={{ color: 'var(--fc-text-1)' }}>设备列表 ({devices.length})</h3>
        <Table columns={deviceColumns} dataSource={devices} rowKey='id' pagination={false} size='small' />
      </div>
    </Modal>
  );
};

export default RackDetailModal;
