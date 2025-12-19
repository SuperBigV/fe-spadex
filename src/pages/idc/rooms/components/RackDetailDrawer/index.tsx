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
import { Drawer, Card, Descriptions, Button, Input, List, Badge, Space, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getRackDetail, getRackDevices, getRackStatistics } from '@/pages/room/services';
import { Rack, RackDevice, RackStatistics } from '@/pages/room/types';
import UUnitVisualization from './UUnitVisualization';
import DeviceSelectModal from './DeviceSelectModal';
import './index.less';

const { Search } = Input;

interface RackDetailDrawerProps {
  visible: boolean;
  rackId: number;
  onClose: () => void;
}

const RackDetailDrawer: React.FC<RackDetailDrawerProps> = ({ visible, rackId, onClose }) => {
  const [rack, setRack] = useState<Rack | null>(null);
  const [devices, setDevices] = useState<RackDevice[]>([]);
  const [statistics, setStatistics] = useState<RackStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [deviceSearchKeyword, setDeviceSearchKeyword] = useState('');
  const [deviceSelectModalVisible, setDeviceSelectModalVisible] = useState(false);
  const [selectedU, setSelectedU] = useState<number | null>(null);

  useEffect(() => {
    if (visible && rackId) {
      fetchData();
    }
  }, [visible, rackId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rackData, deviceList, stats] = await Promise.all([
        getRackDetail(rackId),
        getRackDevices(rackId),
        getRackStatistics(rackId),
      ]);
      setRack(rackData);
      setDevices(deviceList);
      setStatistics(stats);
    } catch (error) {
      message.error('获取机柜信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = (u?: number) => {
    setSelectedU(u || null);
    setDeviceSelectModalVisible(true);
  };

  const handleDeviceSelectSuccess = () => {
    setDeviceSelectModalVisible(false);
    setSelectedU(null);
    fetchData();
  };

  const filteredDevices = devices.filter((device) =>
    device.deviceName.toLowerCase().includes(deviceSearchKeyword.toLowerCase()),
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { status: 'success' | 'warning' | 'default'; text: string }> = {
      online: { status: 'success', text: '在线' },
      offline: { status: 'default', text: '离线' },
      maintenance: { status: 'warning', text: '维护' },
    };
    const config = statusMap[status] || { status: 'default', text: status };
    return <Badge status={config.status} text={config.text} />;
  };

  if (!rack) {
    return null;
  }

  return (
    <Drawer
      title={`机柜详情: ${rack.name}`}
      placement='right'
      width={1000}
      visible={visible}
      onClose={onClose}
      loading={loading}
    >
      <div className='rack-detail-drawer'>
        <Card title='机柜信息' size='small' style={{ marginBottom: 16 }}>
          <Descriptions column={2} size='small'>
            <Descriptions.Item label='机柜名称'>{rack.name}</Descriptions.Item>
            <Descriptions.Item label='机柜编号'>{rack.code}</Descriptions.Item>
            <Descriptions.Item label='总U数'>{rack.totalU}</Descriptions.Item>
            <Descriptions.Item label='已用U数'>{rack.usedU || 0}</Descriptions.Item>
            <Descriptions.Item label='功率容量'>{rack.powerCapacity} KW</Descriptions.Item>
            <Descriptions.Item label='已用功率'>{rack.powerUsed?.toFixed(1) || 0} KW</Descriptions.Item>
            <Descriptions.Item label='网络端口'>{rack.networkPorts || 0}</Descriptions.Item>
            <Descriptions.Item label='已用端口'>{rack.networkPortsUsed || 0}</Descriptions.Item>
          </Descriptions>
        </Card>

        <div className='rack-detail-content'>
          <div className='u-unit-section'>
            <div className='section-header'>
              <h3>U位可视化</h3>
              <Button type='primary' icon={<PlusOutlined />} onClick={() => handleAddDevice()}>
                添加设备
              </Button>
            </div>
            <UUnitVisualization
              rack={rack}
              devices={devices}
              onUClick={(u) => handleAddDevice(u)}
              onDeviceClick={(device) => {
                // 可以打开设备详情
                console.log('点击设备', device);
              }}
            />
          </div>

          <div className='device-list-section'>
            <div className='section-header'>
              <h3>设备列表</h3>
            </div>
            <Search
              placeholder='搜索设备'
              allowClear
              style={{ marginBottom: 12 }}
              onSearch={setDeviceSearchKeyword}
              onChange={(e) => {
                if (!e.target.value) {
                  setDeviceSearchKeyword('');
                }
              }}
            />
            <List
              dataSource={filteredDevices}
              renderItem={(device) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{device.deviceName}</span>
                      {getStatusBadge(device.status)}
                    </div>
                    <div className='device-info-text'>
                      U位: {device.startU}-{device.startU + device.heightU - 1}U
                    </div>
                    {device.deviceType && (
                      <div className='device-info-text'>类型: {device.deviceType}</div>
                    )}
                  </div>
                </List.Item>
              )}
            />
          </div>
        </div>

        <DeviceSelectModal
          visible={deviceSelectModalVisible}
          selectedU={selectedU}
          rackId={rackId}
          onCancel={() => {
            setDeviceSelectModalVisible(false);
            setSelectedU(null);
          }}
          onSuccess={handleDeviceSelectSuccess}
        />
      </div>
    </Drawer>
  );
};

export default RackDetailDrawer;

