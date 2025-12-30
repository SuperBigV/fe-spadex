/*
 * 设备列表弹窗
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Input, Select, Card, Empty, Spin, message } from 'antd';
import { MonitoredAsset, AssetListParams } from '../../types';
import { getMonitoredAssets } from '@/services/topology';
import DeviceIcon from '../DeviceIcon';
import StatusIndicator from '../StatusIndicator';
import './index.less';

const { Search } = Input;
const { Option } = Select;

interface DeviceListModalProps {
  visible: boolean;
  deviceType: string | null;
  onCancel: () => void;
  onSelect: (device: MonitoredAsset) => void;
  addedDeviceIds: number[];
}

const DeviceListModal: React.FC<DeviceListModalProps> = ({ visible, deviceType, onCancel, onSelect, addedDeviceIds }) => {
  const [devices, setDevices] = useState<MonitoredAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<AssetListParams>({
    page: 1,
    pageSize: 50,
  });

  // 根据设备类型获取对应的 gid（资产模型ID）
  const getGidByDeviceType = (type: string): string | undefined => {
    // 机房和互联网是图形元素，不需要从资产列表选择
    if (type === 'topology_room' || type === 'topology_cloud') {
      return undefined;
    }
    // 直接返回设备类型
    return type;
    // const typeToGidMap: { [key: string]: string } = {
    //   net_router: '30',
    //   net_switch_core: '4',
    //   net_switch_access: '4',
    //   net_switch_three: '4',
    //   net_fireware: '35',
    //   net_ap: '14',
    //   server: '1',
    // };
    // return typeToGidMap[type];
  };

  // 加载设备列表
  const loadDevices = useCallback(async () => {
    if (!deviceType) return;

    setLoading(true);
    try {
      const type = getGidByDeviceType(deviceType);
      // 如果是机房或云，不需要从资产列表加载
      if (!type) {
        setDevices([]);
        setLoading(false);
        return;
      }

      const params: AssetListParams = {
        ...filters,
        deviceType: type,
      };
      const response = await getMonitoredAssets(params);
      setDevices(response.list);
    } catch (error) {
      console.error('加载设备列表失败:', error);
      message.error('加载设备列表失败');
    } finally {
      setLoading(false);
    }
  }, [deviceType, filters]);

  useEffect(() => {
    if (visible && deviceType) {
      loadDevices();
    } else {
      setDevices([]);
    }
  }, [visible, deviceType, loadDevices]);

  // 搜索处理
  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, keyword: value, page: 1 }));
  };

  // 状态筛选
  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value || undefined, page: 1 }));
  };

  // 选择设备，直接添加到画布
  const handleSelectDevice = (device: MonitoredAsset) => {
    if (addedDeviceIds.includes(device.id)) {
      message.warning('该设备已添加到画布');
      return;
    }

    // 直接添加设备，不选择端口
    onSelect(device);
    onCancel();
  };

  const isDeviceAdded = (deviceId: number) => {
    return addedDeviceIds.includes(deviceId);
  };

  const getDeviceTypeName = (type: string): string => {
    const nameMap: { [key: string]: string } = {
      net_router: '路由器',
      net_switch_core: '核心交换机',
      net_switch_access: '接入交换机',
      net_switch_three: '汇聚交换机',
      net_firewall: '防火墙',
      net_ap: '无线AP',
      host_phy: '服务器',
      host_storage: '存储设备',
      topology_room: '机房',
      topology_cloud: '互联网',
    };
    return nameMap[type] || type;
  };
  return (
    <Modal title={`选择${deviceType ? getDeviceTypeName(deviceType) : '设备'}`} open={visible} onCancel={onCancel} footer={null} width={800} destroyOnClose>
      <div className='device-list-modal'>
        <div className='modal-filters'>
          <Search placeholder='搜索设备名称或IP' allowClear onSearch={handleSearch} style={{ marginBottom: 12 }} />
          <Select placeholder='状态筛选' allowClear onChange={handleStatusFilter} style={{ width: '100%' }}>
            <Option value='online'>在线</Option>
            <Option value='offline'>离线</Option>
            <Option value='unknown'>未知</Option>
          </Select>
        </div>

        <div className='modal-content'>
          <Spin spinning={loading}>
            {devices.length === 0 ? (
              <Empty description='暂无设备' />
            ) : (
              <div className='device-list'>
                {devices.map((device) => (
                  <Card key={device.id} size='small' className={`device-card ${isDeviceAdded(device.id) ? 'added' : ''}`} hoverable onClick={() => handleSelectDevice(device)}>
                    <div className='device-card-content'>
                      <div className='device-icon'>
                        <DeviceIcon type={device.deviceType} size={24} />
                      </div>
                      <div className='device-info'>
                        <div className='device-name'>{device.name}</div>
                        <div className='device-ip'>{device.ip}</div>
                        <div className='device-status'>
                          <StatusIndicator status={device.status} type='device' size='small' />
                          <span className='status-text'>{device.status === 'online' ? '在线' : device.status === 'offline' ? '离线' : '未知'}</span>
                        </div>
                      </div>
                      {isDeviceAdded(device.id) && <div className='device-added-badge'>已添加</div>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Spin>
        </div>
      </div>
    </Modal>
  );
};

export default DeviceListModal;
