/*
 * 设备图标工具栏
 */

import React, { useState } from 'react';
import { Tooltip } from 'antd';
import './index.less';

export interface DeviceType {
  type: string;
  name: string;
  icon: string;
}

const deviceTypes: DeviceType[] = [
  { type: 'net_router', name: '路由器', icon: '/image/topology_router.png' },
  { type: 'net_switch_core', name: '核心交换机', icon: '/image/topology_core_switch.png' },
  { type: 'net_switch_access', name: '接入交换机', icon: '/image/topology_arcess_switch.png' },
  { type: 'net_switch_aggr', name: '汇聚交换机', icon: '/image/topology_aggr_switch.png' },
  { type: 'net_fireware', name: '防火墙', icon: '/image/topology_fireware.png' },
  { type: 'net_ap', name: '无线AP', icon: '/image/topology_ap.png' },
  { type: 'host_phy', name: '服务器', icon: '/image/topology_host.png' },
  // { type: 'host_storage', name: '存储设备', icon: '/image/topology_storage.png' },
  { type: 'topology_room', name: '机房', icon: '/image/topology_room.png' },
  { type: 'topology_cloud', name: '互联网', icon: '/image/topology_cloud.png' },
];

interface DeviceIconToolbarProps {
  onDeviceTypeSelect: (deviceType: string) => void;
}

const DeviceIconToolbar: React.FC<DeviceIconToolbarProps> = ({ onDeviceTypeSelect }) => {
  return (
    <div className='device-icon-toolbar'>
      {deviceTypes.map((device) => (
        <Tooltip key={device.type} title={device.name} placement='right'>
          <div className='device-icon-item' onClick={() => onDeviceTypeSelect(device.type)}>
            <img src={device.icon} alt={device.name} className='device-icon-img' />
          </div>
        </Tooltip>
      ))}
    </div>
  );
};

export default DeviceIconToolbar;
