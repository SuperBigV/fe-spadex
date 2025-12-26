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
import { Drawer, Card, Descriptions, Button, Input, List, Badge, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRackDetail, getRackDevices, getRackStatistics, removeDeviceFromRack } from '@/pages/room/services';
import { Rack, RackDevice, RackStatistics } from '@/pages/room/types';
import UUnitVisualization from './UUnitVisualization';
import DeviceSelectModal from './DeviceSelectModal';
import DeviceEditModal from './DeviceEditModal';
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
  const [deviceEditModalVisible, setDeviceEditModalVisible] = useState(false);
  const [selectedU, setSelectedU] = useState<number | null>(null);
  const [editingDevice, setEditingDevice] = useState<RackDevice | null>(null);

  useEffect(() => {
    if (visible && rackId) {
      fetchData();
    }
  }, [visible, rackId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rackData, deviceList, stats] = await Promise.all([getRackDetail(rackId), getRackDevices(rackId), getRackStatistics(rackId)]);
      setRack(rackData);
      setDevices(deviceList);
      setStatistics(stats);
    } catch (error) {
      message.error('获取机柜信息失败:' + error);
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

  const handleDeviceEdit = (device: RackDevice) => {
    setEditingDevice(device);
    setDeviceEditModalVisible(true);
  };

  const handleDeviceDelete = async (device: RackDevice) => {
    try {
      await removeDeviceFromRack(rackId, device.deviceId);
      message.success('设备已删除');
      fetchData();
    } catch (error: any) {
      message.error(error?.message || '删除设备失败');
    }
  };

  const handleDeviceEditSuccess = () => {
    setDeviceEditModalVisible(false);
    setEditingDevice(null);
    fetchData();
  };
  const deviceTypeDict = {
    host_phy: '物理机',
    host_storage: '存储',
    net_switch: '交换机',
    net_firewall: '防火墙',
    net_router: '路由器',
  };
  const getDeviceType = (deviceType: string) => {
    return deviceTypeDict[deviceType] || deviceType;
  };

  const filteredDevices = devices.filter((device) => device.deviceName.toLowerCase().includes(deviceSearchKeyword.toLowerCase()));

  const getStatusBadge = (target_up: number) => {
    if (target_up > 0) {
      return <Badge status='success' text='在线' />;
    } else {
      return <Badge status='default' text='离线' />;
    }
    // const statusMap: Record<string, { status: 'success' | 'warning' | 'default'; text: string }> = {
    //   online: { status: 'success', text: '在线' },
    //   offline: { status: 'default', text: '离线' },
    //   maintenance: { status: 'warning', text: '维护' },
    // };
    // const config = statusMap[status] || { status: 'default', text: status };
    // return <Badge status={config.status} text={config.text} />;
  };

  if (!rack) {
    return null;
  }

  return (
    <Drawer title={`机柜详情: ${rack.name}`} placement='right' width={1000} visible={visible} onClose={onClose}>
      <div className='rack-detail-drawer'>
        {loading && <div style={{ textAlign: 'center', padding: 20 }}>加载中...</div>}
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
              onDeviceEdit={handleDeviceEdit}
              onDeviceDelete={handleDeviceDelete}
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
                <List.Item
                  actions={[
                    <Button key='edit' type='link' size='small' onClick={() => handleDeviceEdit(device)}>
                      编辑
                    </Button>,
                    <Popconfirm
                      key='delete'
                      title={
                        <div>
                          <div>确定要删除此设备吗？</div>
                          <div style={{ fontSize: '12px', color: 'var(--fc-text-3)', marginTop: 4 }}>删除后设备将从机柜中移除</div>
                        </div>
                      }
                      onConfirm={() => handleDeviceDelete(device)}
                      okText='确定'
                      cancelText='取消'
                      okButtonProps={{ danger: true }}
                    >
                      <Button type='link' size='small' danger icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{device.deviceName}</span>
                      {/* {getStatusBadge(device.target_up || 0)} */}
                      {getStatusBadge(1)}
                    </div>
                    <div className='device-info-text'>
                      U位: {device.startU}-{device.startU + device.heightU - 1}U
                    </div>
                    {device.deviceType && <div className='device-info-text'>类型: {getDeviceType(device.deviceType)}</div>}
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

        <DeviceEditModal
          visible={deviceEditModalVisible}
          device={editingDevice}
          rack={rack}
          onCancel={() => {
            setDeviceEditModalVisible(false);
            setEditingDevice(null);
          }}
          onSuccess={handleDeviceEditSuccess}
        />
      </div>
    </Drawer>
  );
};

export default RackDetailDrawer;
