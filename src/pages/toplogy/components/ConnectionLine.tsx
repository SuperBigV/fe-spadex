import React from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import './ConnectionLine.less';

const ConnectionLine = ({ connection, sourceDevice, targetDevice, isSelected, onDelete, onSelect }) => {
  // 计算连线坐标
  const x1 = sourceDevice.x + 80; // 设备中心点
  const y1 = sourceDevice.y + 36;
  const x2 = targetDevice.x + 80;
  const y2 = targetDevice.y + 36;

  // 计算连线长度和角度
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

  // 计算中点位置
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <div
      className={`connection-line ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(connection);
      }}
    >
      <svg width='100%' height='100%' className='line-svg'>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isSelected ? '#1890ff' : '#bfbfbf'} strokeWidth={isSelected ? '3' : '2'} markerEnd='url(#arrowhead)' />
      </svg>
      <div className='connection-label' style={{ left: midX, top: midY }}>
        {connection.bandwidth}
      </div>
      {isSelected && (
        <button
          className='delete-connection-btn'
          style={{ left: midX + 20, top: midY }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(connection.id);
          }}
        >
          <DeleteOutlined />
        </button>
      )}
      <defs>
        <marker id='arrowhead' markerWidth='10' markerHeight='7' refX='9' refY='3.5' orient='auto'>
          <polygon points='0 0, 10 3.5, 0 7' fill={isSelected ? '#1890ff' : '#bfbfbf'} />
        </marker>
      </defs>
    </div>
  );
};

export default ConnectionLine;
