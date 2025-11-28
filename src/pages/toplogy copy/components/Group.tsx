import React, { useState, useRef, useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import Device from './Device'; // 引入设备组件
import './Group.less';

const Group = ({
  group,
  devices,
  isSelected,
  onDragStart,
  onResizeStart,
  onSelect,
  onDeviceSelect,
  onDeviceDragStart,
  onDeviceMove,
  onConnectionStart,
  onConnectionEnd,
  onDeleteDevice,
}) => {
  const [draggingDevice, setDraggingDevice] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const groupRef = useRef<any>(null);

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      onDragStart(e, group);
    }
  };

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    onResizeStart(e, group);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    // 删除逻辑由父组件处理
  };

  // 处理机房内设备拖拽开始
  const handleDeviceMouseDown = (e, device) => {
    e.stopPropagation();
    const rect = groupRef.current.getBoundingClientRect();
    setDraggingDevice(device.id);
    setDragOffset({
      x: e.clientX - rect.left - (device.x - group.x),
      y: e.clientY - rect.top - (device.y - group.y),
    });
    onDeviceSelect(device);
  };
  // 处理机房内设备拖拽
  const handleDeviceDrag = (e) => {
    if (!draggingDevice) return;

    const rect = groupRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left - dragOffset.x + group.x;
    let y = e.clientY - rect.top - dragOffset.y + group.y;

    // 限制设备在机房范围内移动
    x = Math.max(group.x, Math.min(x, group.x + group.width - 80));
    y = Math.max(group.y, Math.min(y, group.y + group.height - 60));

    onDeviceMove(draggingDevice, x, y);
  };

  // 处理机房内设备拖拽结束
  const handleDeviceDragEnd = () => {
    setDraggingDevice(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // 处理机房内设备点击
  const handleDeviceClick = (e, device) => {
    e.stopPropagation();
    onDeviceSelect(device);
  };

  // 处理机房内设备连接开始
  // 处理组内设备连接开始 - 修复坐标转换
  const handleGroupDeviceConnectionStart = (deviceId, portId, portPosition) => {
    console.log('Group连接开始:', { deviceId, portId, portPosition });

    if (onConnectionStart) {
      // 对于组内设备，端口位置已经是正确的绝对坐标
      // 因为 Device 组件计算的是相对于视口的坐标
      onConnectionStart(deviceId, portId, portPosition);
    }
  };

  // 处理机房内设备连接结束  // 处理组内设备连接结束 - 修复坐标转换
  const handleGroupDeviceConnectionEnd = (deviceId, portId, portPosition) => {
    console.log('Group连接结束:', { deviceId, portId, portPosition });

    if (onConnectionEnd) {
      // 对于组内设备，端口位置已经是正确的绝对坐标
      onConnectionEnd(deviceId, portId, portPosition);
    }
  };

  // 处理机房内设备删除
  const handleGroupDeviceDelete = (deviceId) => {
    // 传递设备删除事件到父组件
    if (onDeleteDevice) {
      onDeleteDevice(deviceId);
    }
  };

  // 添加事件监听器
  useEffect(() => {
    const groupElement: any = groupRef.current;
    if (groupElement && draggingDevice) {
      const handleMouseMove = (e) => handleDeviceDrag(e);
      const handleMouseUp = () => handleDeviceDragEnd();

      groupElement.addEventListener('mousemove', handleMouseMove);
      groupElement.addEventListener('mouseup', handleMouseUp);

      return () => {
        groupElement.removeEventListener('mousemove', handleMouseMove);
        groupElement.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingDevice, dragOffset, group]);

  return (
    <div
      ref={groupRef}
      className={`group-room ${isSelected ? 'selected' : ''}`}
      style={{
        left: group.x,
        top: group.y,
        width: group.width,
        height: group.height,
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

      <div className='group-header'>
        <div className='group-name'>{group.name || '机房'}</div>
        <div className='device-count'>{devices.length} 台设备</div>
      </div>

      <div className='group-content'>
        {devices.map((device) => (
          <Device
            key={device.id}
            device={device}
            isSelected={false}
            onDragStart={(e, device) => handleDeviceMouseDown(e, device)}
            onSelect={() => onDeviceSelect(device)}
            onConnectionStart={handleGroupDeviceConnectionStart}
            onConnectionEnd={handleGroupDeviceConnectionEnd}
            onDelete={() => handleGroupDeviceDelete(device.id)}
          />
        ))}
      </div>

      {isSelected && <div className='resize-handle' onMouseDown={handleResizeMouseDown} />}
    </div>
  );
};

export default Group;
