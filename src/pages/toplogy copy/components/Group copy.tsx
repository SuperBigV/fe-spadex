import React, { useState, useRef, useEffect } from 'react';
import { CloseOutlined, SwitcherOutlined, WifiOutlined } from '@ant-design/icons';
import './Group.less';

const Group = ({ group, devices, isSelected, onDragStart, onResizeStart, onSelect, onDeviceSelect, onDeviceDragStart, onDeviceMove }) => {
  const [draggingDevice, setDraggingDevice] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const groupRef = useRef<any>(null);

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      // 左键
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
  const getDeviceIcon = (type) => {
    switch (type) {
      case 'net_router':
        return <img src='/public/image/topology_router.png' alt='' style={{ width: '30px', height: '30px' }} />;
      case 'net_switch_access':
        return <img src='/public/image/topology_arcess_switch.png' alt='' style={{ width: '30px', height: '30px' }} />;
      case 'net_switch_three':
        return <img src='/public/image/topology_three_switch.png' alt='' style={{ width: '30px', height: '30px' }} />;
      case 'net_switch_core':
        return <img src='/public/image/topology_core_switch.png' alt='' style={{ width: '30px', height: '30px' }} />;
      case 'net_firewall':
        return <img src='/public/image/topology_fireware.png' alt='' style={{ width: '20px', height: '20px' }} />;
      case 'host':
        return <img src='/public/image/topology_host.png' alt='' style={{ width: '20px', height: '20px' }} />;
      case 'net_wireless':
        return <img src='/public/image/topology_arcess_switch.png' alt='' style={{ width: '20px', height: '20px' }} />;
      default:
        return <SwitcherOutlined className='device-icon' />;
    }
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
    console.log('device:', device);
    e.stopPropagation();
    onDeviceSelect(device);
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
          <div
            key={device.id}
            className={`group-device ${device.id === draggingDevice ? 'dragging' : ''}`}
            style={{
              left: device.x - group.x,
              top: device.y - group.y,
              width: device.width,
              height: device.height,
            }}
            onMouseDown={(e) => handleDeviceMouseDown(e, device)}
            onClick={(e) => handleDeviceClick(e, device)}
          >
            {getDeviceIcon(device.iconType)}
            <div className='device-name'>{device.deviceName || device.type}</div>
          </div>
        ))}
      </div>

      {isSelected && <div className='resize-handle' onMouseDown={handleResizeMouseDown} />}
    </div>
  );
};

export default Group;
