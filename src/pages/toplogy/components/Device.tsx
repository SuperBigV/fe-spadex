import React, { useState, useRef, useEffect } from 'react';
import { SwitcherOutlined, WifiOutlined, CloseOutlined, WarningOutlined } from '@ant-design/icons';
import './Device.less';
import DeviceDrawer from './DeviceDrawer';

const Device = ({ device, isSelected, onDragStart, onSelect, onConnectionStart, onConnectionEnd, onDelete }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isRightClick, setIsRightClick] = useState(false);
  const portRefs = useRef({});

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'net_router':
        return <img src='/image/topology_router.png' alt='' style={{ width: '30px', height: '30px' }} />;
      case 'net_switch_access':
        return <img src='/image/topology_arcess_switch.png' alt='' style={{ width: '30px', height: '30px' }} />;
      case 'net_switch_three':
        return <img src='/image/topology_three_switch.png' alt='' style={{ width: '30px', height: '30px' }} />;
      case 'net_switch_core':
        return <img src='/image/topology_core_switch.png' alt='' style={{ width: '30px', height: '30px' }} />;
      case 'net_firewall':
        return <img src='/image/topology_fireware.png' alt='' style={{ width: '20px', height: '20px' }} />;
      case 'host':
        return <img src='/image/topology_host.png' alt='' style={{ width: '20px', height: '20px' }} />;
      case 'net_wireless':
        return <img src='/image/topology_arcess_switch.png' alt='' style={{ width: '20px', height: '20px' }} />;
      default:
        return <SwitcherOutlined className='device-icon' />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'up':
        return '#4caf50';
      case 'down':
        return '#f44336';
      default:
        return '#ffc107';
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      // 左键
      if (drawerVisible) return;
      onDragStart(e, device);
    }
  };

  const handlePortMouseDown = (e, portId) => {
    e.stopPropagation();

    // 获取端口的实际位置
    const portElement = portRefs.current[portId];
    if (portElement) {
      const rect = portElement.getBoundingClientRect();
      const portCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      console.log('Device端口点击坐标:', {
        portId,
        portCenter,
        devicePosition: { x: device.x, y: device.y },
        portRect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
      });

      // 传递端口位置信息
      onConnectionStart(device.id, portId, portCenter);
    } else {
      // 如果无法获取端口元素，使用计算的位置
      const portIndex = device.ports.findIndex((p) => p.id === portId);
      const isLeft = portIndex % 2 === 0;
      const row = Math.floor(portIndex / 2);

      const portX = device.x + (isLeft ? 0 : device.width + 10);
      const portY = device.y + 30 + row * 20;

      const calculatedPosition = { x: portX, y: portY };
      console.log('使用计算端口位置:', { portId, calculatedPosition });

      onConnectionStart(device.id, portId, calculatedPosition);
    }
  };

  const handlePortMouseUp = (e, portId) => {
    e.stopPropagation();

    // 获取端口的实际位置
    const portElement = portRefs.current[portId];
    if (portElement) {
      const rect = portElement.getBoundingClientRect();
      const portCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      console.log('Device端口释放坐标:', {
        portId,
        portCenter,
        devicePosition: { x: device.x, y: device.y },
      });

      onConnectionEnd(device.id, portId, portCenter);
    } else {
      // 如果无法获取端口元素，使用计算的位置
      const portIndex = device.ports.findIndex((p) => p.id === portId);
      const isLeft = portIndex % 2 === 0;
      const row = Math.floor(portIndex / 2);

      const portX = device.x + (isLeft ? 0 : device.width + 10);
      const portY = device.y + 30 + row * 20;

      const calculatedPosition = { x: portX, y: portY };
      console.log('使用计算端口位置(释放):', { portId, calculatedPosition });

      onConnectionEnd(device.id, portId, calculatedPosition);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
    setDrawerVisible(true);
  };

  const closeDrawer = (e) => {
    e.stopPropagation();
    setDrawerVisible(false);
    setSelectedDevice(null);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect();
    setContextMenuVisible(false);
  };

  const handleContextMenu = (e) => {
    setIsRightClick(true);
    e.preventDefault();
    e.stopPropagation();
    setSelectedDevice(device);
    onSelect();
    setContextMenuPosition({
      x: e.clientX / 2 + 60,
      y: e.clientY / 2 + 100,
    });
    setContextMenuVisible(true);
  };

  const closeContextMenu = () => {
    setContextMenuVisible(false);
  };

  const openDrawer = () => {
    setSelectedDevice(device);
    setDrawerVisible(true);
    closeContextMenu();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      const contextMenu = document.querySelector('.context-menu');
      if (contextMenu && contextMenu.contains(e.target)) {
        return;
      }
      if (contextMenuVisible) {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('contextmenu', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [contextMenuVisible]);

  return (
    <div
      className={`device ${isSelected ? 'selected' : ''} ${device.alarm ? 'alarm' : ''}`}
      style={{
        left: device.x,
        top: device.y,
        width: device.width + 10,
        height: device.height + 10,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {isSelected && (
        <div className='delete-button' onClick={handleDelete}>
          <CloseOutlined />
        </div>
      )}

      <div className='device-content'>
        {getDeviceIcon(device.iconType)}
        <div className='device-name'>{device.deviceName}</div>
      </div>

      <div className='status-indicator' style={{ backgroundColor: getStatusColor(device.status || 'up') }} />

      <div className='ports'>
        {device.ports &&
          device.ports.map((port, index) => (
            <div
              key={port.id}
              ref={(el) => (portRefs.current[port.id] = el)}
              className={`port ${port.status === 'up' ? 'active' : ''}`}
              style={{
                left: index % 2 === 0 ? -8 : 'auto',
                right: index % 2 === 1 ? -8 : 'auto',
                top: `${20 + Math.floor(index / 2) * 20}px`,
              }}
              onMouseDown={(e) => handlePortMouseDown(e, port.id)}
              onMouseUp={(e) => handlePortMouseUp(e, port.id)}
            >
              <div className='port-status' style={{ backgroundColor: getStatusColor(port.status) }} />
            </div>
          ))}
      </div>

      {contextMenuVisible && (
        <div
          className='context-menu'
          style={{
            position: 'fixed',
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
            zIndex: 1000,
          }}
        >
          <div className='context-menu-item' onClick={openDrawer} onMouseDown={(e) => e.stopPropagation()}>
            查看详情
          </div>
        </div>
      )}
      <DeviceDrawer visible={drawerVisible} onClose={closeDrawer} device={selectedDevice} />
      {device.alarm && (
        <div className='alarm-indicator'>
          <WarningOutlined />
        </div>
      )}
    </div>
  );
};

export default Device;
