/*
 * 状态指示器组件
 */

import React from 'react';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'unknown' | 'up' | 'down';
  type?: 'device' | 'port' | 'connection';
  size?: 'small' | 'default' | 'large';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  type = 'device',
  size = 'default',
}) => {
  const getStatusColor = () => {
    if (type === 'device') {
      switch (status) {
        case 'online':
          return 'var(--fc-green-6-color)';
        case 'offline':
          return 'var(--fc-red-6-color)';
        default:
          return 'var(--fc-text-4)';
      }
    } else if (type === 'port' || type === 'connection') {
      switch (status) {
        case 'up':
        case 'online':
          return 'var(--fc-green-6-color)';
        case 'down':
        case 'offline':
          return 'var(--fc-red-6-color)';
        default:
          return 'var(--fc-text-4)';
      }
    }
    return 'var(--fc-text-4)';
  };

  const sizeMap = {
    small: 6,
    default: 8,
    large: 10,
  };

  const dotSize = sizeMap[size];

  return (
    <span
      className="status-indicator"
      style={{
        display: 'inline-block',
        width: dotSize,
        height: dotSize,
        borderRadius: '50%',
        backgroundColor: getStatusColor(),
        marginRight: 4,
      }}
    />
  );
};

export default StatusIndicator;

