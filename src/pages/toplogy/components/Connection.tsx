import React from 'react';
import './Connection.less';

const Connection = ({ connection, sourceDevice, targetDevice, isSelected, onSelect }) => {
  console.log('@@@', connection, sourceDevice, targetDevice);
  // 计算连接线的起点和终点
  const calculatePortPosition = (device, portId) => {
    if (!device.ports) return { x: device.x + device.width / 2, y: device.y + device.height / 2 };

    const portIndex = device.ports.findIndex((p) => p.id === portId);
    if (portIndex === -1) return { x: device.x + device.width / 2, y: device.y + device.height / 2 };

    const port = device.ports[portIndex];
    const isLeft = portIndex % 2 === 0;
    const row = Math.floor(portIndex / 2);

    return {
      x: device.x + (isLeft ? 0 : device.width),
      y: device.y + 20 + row * 20,
    };
  };

  const sourcePos = calculatePortPosition(sourceDevice, connection.source.portId);
  const targetPos = calculatePortPosition(targetDevice, connection.target.portId);

  // 计算贝塞尔曲线控制点
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const controlPointOffset = Math.min(100, distance / 2);

  const control1 = {
    x: sourcePos.x + controlPointOffset,
    y: sourcePos.y,
  };

  const control2 = {
    x: targetPos.x - controlPointOffset,
    y: targetPos.y,
  };

  // 创建路径数据
  const pathData = `M ${sourcePos.x} ${sourcePos.y} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${targetPos.x} ${targetPos.y}`;

  return (
    <svg className='connection-svg'>
      <path
        d={pathData}
        stroke={isSelected ? '#4d8cff' : '#666'}
        strokeWidth={isSelected ? '3' : '2'}
        fill='none'
        className='connection-line'
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      />
      <circle cx={sourcePos.x} cy={sourcePos.y} r='4' fill='#4d8cff' />
      <circle cx={targetPos.x} cy={targetPos.y} r='4' fill='#4d8cff' />
    </svg>
  );
};

export default Connection;
