import React, { useEffect } from 'react';
import './Connection.less';
import { DeleteOutlined } from '@ant-design/icons';

const Connection = ({ connection, sourceDevice, targetDevice, isSelected, onSelect, onDeleteLine }) => {
  useEffect(() => {
    console.log('Connection rendered - Source:', sourceDevice, 'Target:', targetDevice);
  }, [sourceDevice, targetDevice]);

  // 检查设备是否存在
  if (!sourceDevice || !targetDevice) {
    console.error('连接线缺少设备信息:', {
      connection,
      sourceDevice,
      targetDevice,
    });
    return null; // 如果设备不存在，不渲染连接线
  }

  // 计算连接线位置
  const calculateConnectionPositions = () => {
    const sourcePos = calculatePortPosition(sourceDevice, connection.source.portId);
    const targetPos = calculatePortPosition(targetDevice, connection.target.portId);

    return { sourcePos, targetPos };
  };

  const calculatePortPosition = (device, portId) => {
    if (!device.ports) {
      return { x: device.x + device.width / 2, y: device.y + device.height / 2 };
    }

    const portIndex = device.ports.findIndex((p) => p.id === portId);
    if (portIndex === -1) {
      return { x: device.x + device.width / 2, y: device.y + device.height / 2 };
    }

    const isLeft = portIndex % 2 === 0;
    const row = Math.floor(portIndex / 2);

    const portX = device.x + (isLeft ? 0 : device.width + 10);
    const portY = device.y + 30 + row * 20;

    return {
      x: portX,
      y: portY,
    };
  };

  const { sourcePos, targetPos } = calculateConnectionPositions();

  // 计算中点位置用于删除按钮
  const midPoint = {
    x: (sourcePos.x + targetPos.x) / 2,
    y: (sourcePos.y + targetPos.y) / 2,
  };

  return (
    <>
      <svg className='connection-svg'>
        <line
          x1={sourcePos.x}
          y1={sourcePos.y}
          x2={targetPos.x}
          y2={targetPos.y}
          stroke={isSelected ? '#4d8cff' : '#666'}
          strokeWidth={isSelected ? '3' : '2'}
          fill='none'
          className='connection-line'
          onClick={(e) => {
            e.stopPropagation();
            onSelect(connection);
          }}
        />
        <circle cx={sourcePos.x} cy={sourcePos.y} r='4' fill='#4d8cff' />
        <circle cx={targetPos.x} cy={targetPos.y} r='4' fill='#4d8cff' />
      </svg>
      {isSelected && (
        <button
          className='delete-connection-btn'
          style={{
            position: 'absolute',
            left: midPoint.x,
            top: midPoint.y,
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteLine(connection.id);
          }}
        >
          <DeleteOutlined />
        </button>
      )}
    </>
  );
};

export default Connection;
