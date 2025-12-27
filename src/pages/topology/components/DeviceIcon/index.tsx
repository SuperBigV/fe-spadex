/*
 * 设备图标组件
 */

import React from 'react';
import { DatabaseOutlined } from '@ant-design/icons';

interface DeviceIconProps {
  type: string;
  size?: number;
}

const DeviceIcon: React.FC<DeviceIconProps> = ({ type, size = 20 }) => {
  // 根据设备类型返回对应图标路径
  const getIconPath = (): string => {
    if (type.includes('router')) {
      return '/image/topology_router.png';
    }
    if (type.includes('switch_core')) {
      return '/image/topology_core_switch.png';
    }
    if (type.includes('switch_access')) {
      return '/image/topology_arcess_switch.png';
    }
    if (type.includes('switch_aggr')) {
      return '/image/topology_aggr_switch.png';
    }
    if (type.includes('fireware') || type.includes('firewall')) {
      return '/image/topology_fireware.png';
    }
    if (type.includes('ap')) {
      return '/image/topology_ap.png';
    }
    if (type.includes('server') || type.includes('host')) {
      return '/image/topology_host.png';
    }
    if (type.includes('room')) {
      return '/image/topology_room.png';
    }
    if (type.includes('cloud')) {
      return '/image/topology_cloud.png';
    }
    // 默认图标
    return '/image/topology_host.png';
  };

  const iconPath = getIconPath();
  const iconStyle: React.CSSProperties = { width: size, height: size, objectFit: 'contain' };

  return (
    <div className='device-icon'>
      <img src={iconPath} alt={type} style={iconStyle} />
    </div>
  );
};

export default DeviceIcon;
