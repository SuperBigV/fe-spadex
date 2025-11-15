import React, { useState, useRef, useEffect } from 'react';
import { SwitcherOutlined, WifiOutlined, CloseOutlined, WarningOutlined } from '@ant-design/icons';
import './Device.less';

const Device = ({ device, isSelected, onDragStart, onSelect, onConnectionStart, onConnectionEnd, onDelete }) => {
  const getDeviceIcon = (type) => {
    switch (type) {
      case 'router':
        return <SwitcherOutlined className='device-icon router' />;
      case 'switch':
        return <SwitcherOutlined className='device-icon switch' />;
      case 'firewall':
        return <SwitcherOutlined className='device-icon firewall' />;
      case 'server':
        return <SwitcherOutlined className='device-icon server' />;
      case 'wireless':
        return <WifiOutlined className='device-icon wireless' />;
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
      onDragStart(e, device);
    }
  };

  const handlePortMouseDown = (e, portId) => {
    e.stopPropagation();
    onConnectionStart(device.id, portId);
  };

  const handlePortMouseUp = (e, portId) => {
    e.stopPropagation();
    onConnectionEnd(device.id, portId);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={`device ${isSelected ? 'selected' : ''} ${device.alarm ? 'alarm' : ''}`}
      style={{
        left: device.x,
        top: device.y,
        width: device.width,
        height: device.height,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {isSelected && (
        <div className='delete-button' onClick={handleDelete}>
          <CloseOutlined />
        </div>
      )}

      <div className='device-content'>
        {getDeviceIcon(device.type)}
        <div className='device-name'>{device.name || device.type}</div>
      </div>

      <div className='status-indicator' style={{ backgroundColor: getStatusColor(device.status || 'up') }} />

      <div className='ports'>
        {device.ports &&
          device.ports.map((port, index) => (
            <div
              key={port.id}
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

      {device.alarm && (
        <div className='alarm-indicator'>
          <WarningOutlined />
        </div>
      )}
    </div>
  );
};

export default Device;
