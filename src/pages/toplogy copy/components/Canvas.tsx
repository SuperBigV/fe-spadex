import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import Device from './Device';
import Connection from './Connection';
import Group from './Group';
import './Canvas.less';
import DeviceSelectionModal from './DeviceSelectionModal';
import { getAssetOfCategoryList } from './services';

const Canvas = forwardRef<any, any>(
  (
    {
      devices,
      connections,
      groups,
      selectedItem,
      setSelectedItem,
      canvasScale,
      canvasPosition,
      setCanvasPosition,
      onAddDevice,
      onAddConnection,
      onUpdateDevice,
      onDeleteDevice,
      onMoveDevice,
      onMoveGroup,
      onResizeGroup,
      onAddDeviceToGroup,
      onRemoveDeviceFromGroup,
      onAddGroup,
      onSelectConnection,
    },
    ref,
  ) => {
    const canvasRef = useRef<any>(null);
    const [isConnecting, setIsConnecting] = useState<any>(false);
    const [connectionStart, setConnectionStart] = useState<any>(null);
    const [tempConnection, setTempConnection] = useState<any>(null);
    const [draggingItem, setDraggingItem] = useState<any>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [resizingGroup, setResizingGroup] = useState(null);
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const isConnectingRef = useRef<any>(false);
    const connectionStartRef = useRef<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDeviceType, setSelectedDeviceType] = useState('');
    const [selectedDeviceIconType, setSelectedDeviceIconType] = useState('');
    const [roomOptions, setRoomOptions] = useState([]);
    const [dropPosition, setDropPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    // 添加一个强制重新渲染的状态
    const [forceRender, setForceRender] = useState(0);

    useImperativeHandle(ref, () => ({
      getCanvasRef: () => canvasRef,
      forceUpdate: () => setForceRender((prev) => prev + 1), // 暴露强制更新方法
    }));

    // 处理画布点击
    const handleCanvasClick = (e) => {
      if (e.target === canvasRef.current) {
        setSelectedItem(null);
      }
    };

    // 处理设备拖拽开始
    const handleDeviceDragStart = (e, device) => {
      const rect = canvasRef.current.getBoundingClientRect();
      setDraggingItem({ type: 'device', id: device.id });
      setDragOffset({
        x: e.clientX - rect.left - device.x,
        y: e.clientY - rect.top - device.y,
      });
      setSelectedItem(device);
    };

    // 处理连接选择
    const handleSelectConnectionInternal = (connection) => {
      console.log('handleSelectConnectionInternal', connection);
      setSelectedItem(connection);
      onSelectConnection(connection);
    };

    // 处理机房拖拽开始
    const handleGroupDragStart = (e, group) => {
      const rect = canvasRef.current.getBoundingClientRect();
      setDraggingItem({ type: 'group', id: group.id });
      setDragOffset({
        x: e.clientX - rect.left - group.x,
        y: e.clientY - rect.top - group.y,
      });
      setSelectedItem(group);
    };

    // 处理机房调整大小开始
    const handleGroupResizeStart = (e, group) => {
      e.stopPropagation();
      const rect = canvasRef.current.getBoundingClientRect();
      setResizingGroup(group.id);
      setResizeStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        width: group.width,
        height: group.height,
      });
      setSelectedItem(group);
    };

    // 处理拖拽 - 使用useCallback避免重复创建
    const handleDrag = useCallback(
      (e) => {
        if (!draggingItem) return;

        const rect = canvasRef.current.getBoundingClientRect();
        let x = e.clientX - rect.left - dragOffset.x;
        let y = e.clientY - rect.top - dragOffset.y;

        if (draggingItem.type === 'device') {
          // 检查设备是否在某个机房内
          const device = devices.find((d) => d.id === draggingItem.id);
          if (device && device.groupId) {
            // 设备在机房内，限制移动范围
            const group = groups.find((g) => g.id === device.groupId);
            if (group) {
              // 限制设备在机房范围内移动
              x = Math.max(group.x, Math.min(x, group.x + group.width - device.width));
              y = Math.max(group.y, Math.min(y, group.y + group.height - device.height));
            }
          }

          onMoveDevice(draggingItem.id, x, y);

          // 检查是否拖入机房
          let inGroup: any = null;
          groups.forEach((group) => {
            if (x >= group.x && x <= group.x + group.width && y >= group.y && y <= group.y + group.height) {
              inGroup = group;
            }
          });

          if (inGroup && (!device.groupId || device.groupId !== inGroup.id)) {
            // 添加到机房
            if (device.groupId) {
              onRemoveDeviceFromGroup(device.id, device.groupId);
            }
            onAddDeviceToGroup(device.id, inGroup.id);
          } else if (!inGroup && device.groupId) {
            // 从机房移除
            onRemoveDeviceFromGroup(device.id, device.groupId);
          }

          // 强制重新渲染连接线
          setForceRender((prev) => prev + 1);
          console.log('Device moved, forcing connection re-render');
        } else if (draggingItem.type === 'group') {
          onMoveGroup(draggingItem.id, x, y);
          // 机房移动时也更新连接线
          setForceRender((prev) => prev + 1);
          console.log('Group moved, forcing connection re-render');
        }
      },
      [draggingItem, dragOffset, devices, groups, onMoveDevice, onMoveGroup, onRemoveDeviceFromGroup, onAddDeviceToGroup],
    );

    // 处理调整大小
    const handleResize = (e) => {
      if (!resizingGroup) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = e.clientX - rect.left - resizeStart.x;
      const deltaY = e.clientY - rect.top - resizeStart.y;

      const newWidth = Math.max(150, resizeStart.width + deltaX);
      const newHeight = Math.max(100, resizeStart.height + deltaY);

      onResizeGroup(resizingGroup, newWidth, newHeight);
      // 机房大小改变时更新连接线
      setForceRender((prev) => prev + 1);
    };

    // 处理拖拽结束
    const handleDragEnd = () => {
      setDraggingItem(null);
      setDragOffset({ x: 0, y: 0 });
    };

    // 处理调整大小结束
    const handleResizeEnd = () => {
      setResizingGroup(null);
    };

    // 处理鼠标按下（用于画布平移）
    const handleMouseDown = (e) => {
      if (e.target === canvasRef.current) {
        setIsPanning(true);
        setPanStart({
          x: e.clientX,
          y: e.clientY,
        });
      }
    };

    // 处理鼠标移动
    const handleMouseMove = (e) => {
      if (isPanning) {
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        setCanvasPosition((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
        setPanStart({
          x: e.clientX,
          y: e.clientY,
        });
      }

      if (draggingItem) {
        handleDrag(e);
      }

      if (resizingGroup) {
        handleResize(e);
      }

      if (isConnecting && connectionStart) {
        const rect = canvasRef.current.getBoundingClientRect();
        setTempConnection((prev) => ({
          ...prev,
          target: {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          },
        }));
      }
    };

    // 处理鼠标抬起
    const handleMouseUp = () => {
      setIsPanning(false);
      if (draggingItem) {
        handleDragEnd();
      }

      if (resizingGroup) {
        handleResizeEnd();
      }

      // 处理连接结束
      if (isConnecting) {
        setIsConnecting(false);
        setConnectionStart(null);
        setTempConnection(null);
      }
    };

    const handleConnectionStart = (deviceId, portId, portPosition) => {
      console.log('=== Canvas: 开始连接 ===');
      console.log('设备:', deviceId, '端口:', portId, '端口位置:', portPosition);

      const newConnectionStart = { deviceId, portId, portPosition };

      setIsConnecting(true);
      setConnectionStart(newConnectionStart);

      // 立即更新 ref
      isConnectingRef.current = true;
      connectionStartRef.current = newConnectionStart;

      console.log('Canvas 状态已更新:', {
        isConnecting: isConnectingRef.current,
        connectionStart: connectionStartRef.current,
      });

      // 设置临时连接线的起点为实际端口位置
      if (portPosition) {
        const rect = canvasRef.current.getBoundingClientRect();
        setTempConnection({
          source: {
            x: portPosition.x - rect.left,
            y: portPosition.y - rect.top,
          },
          target: {
            x: portPosition.x - rect.left,
            y: portPosition.y - rect.top,
          },
        });
      }
    };

    // 在 Canvas 组件中修改 handleConnectionEnd 函数
    const handleConnectionEnd = (targetDeviceId, targetPortId, targetPortPosition) => {
      console.log('=== Canvas: 结束连接 ===');
      console.log('目标设备:', targetDeviceId, '目标端口:', targetPortId, '目标端口位置:', targetPortPosition);
      console.log('Canvas ref 状态:', {
        isConnecting: isConnectingRef.current,
        connectionStart: connectionStartRef.current,
      });

      if (isConnectingRef.current && connectionStartRef.current && targetDeviceId && targetPortId) {
        console.log('=== Canvas: 添加连接 ===');

        // 避免连接到自身
        if (connectionStartRef.current.deviceId !== targetDeviceId) {
          onAddConnection({
            source: {
              deviceId: connectionStartRef.current.deviceId,
              portId: connectionStartRef.current.portId,
              portPosition: connectionStartRef.current.portPosition, // 确保传递端口位置
            },
            target: {
              deviceId: targetDeviceId,
              portId: targetPortId,
              portPosition: targetPortPosition, // 确保传递端口位置
            },
          });
        }
      }

      setIsConnecting(false);
      setConnectionStart(null);
      setTempConnection(null);
    };
    const handleDeleteConnection = (connectionId) => {
      console.log('@删除线id:', connectionId);
    };

    // 处理画布拖拽放置
    const handleDrop = (e) => {
      e.preventDefault();
      const deviceType = e.dataTransfer.getData('deviceType');
      const iconType = e.dataTransfer.getData('iconType');
      setSelectedDeviceType(deviceType);
      setSelectedDeviceIconType(iconType);
      setModalVisible(true);
      if (deviceType && deviceType !== 'group') {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - canvasPosition.x) / canvasScale;
        const y = (e.clientY - rect.top - canvasPosition.y) / canvasScale;
        setDropPosition({ x, y });
      } else if (deviceType === 'group') {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - canvasPosition.x) / canvasScale;
        const y = (e.clientY - rect.top - canvasPosition.y) / canvasScale;
        onAddGroup({ type: deviceType, x, y });
      }
      setIsDragging(false);
    };

    const handleAddDevice = (deviceData) => {
      onAddDevice({
        type: deviceData.type,
        iconType: deviceData.iconType,
        deviceId: deviceData.deviceId,
        deviceName: deviceData.deviceName,
        ports: deviceData.ports,
        device: deviceData.device,
        x: dropPosition.x,
        y: dropPosition.y,
      });

      setModalVisible(false);
    };

    // 处理拖拽覆盖
    const handleDragOver = (e) => {
      e.preventDefault();
    };

    // 添加事件监听器
    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        return () => {
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [
      isPanning,
      panStart,
      draggingItem,
      dragOffset,
      resizingGroup,
      resizeStart,
      isConnecting,
      connectionStart,
      canvasPosition,
      canvasScale,
      setCanvasPosition,
      onAddGroup,
      onMoveGroup,
      onResizeGroup,
      handleDrag, // 添加handleDrag到依赖项
    ]);

    useEffect(() => {
      getAssetOfCategoryList('room').then((res) => {
        const options = res.map((item) => ({
          label: item.name,
          value: item.id,
        }));
        setRoomOptions(options);
      });
    }, []);

    // 添加调试信息
    useEffect(() => {
      console.log('Canvas force render triggered:', forceRender);
      console.log('Devices count:', devices.length);
      console.log('Connections count:', connections.length);
    }, [forceRender, devices, connections]);

    return (
      <div
        ref={canvasRef}
        className='canvas'
        style={{
          backgroundImage: 'radial-gradient(circle, #3d3d4d 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: `${canvasPosition.x}px ${canvasPosition.y}px`,
        }}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div
          className='canvas-content'
          style={{
            transform: `scale(${canvasScale}) translate(${canvasPosition.x / canvasScale}px, ${canvasPosition.y / canvasScale}px)`,
            transformOrigin: '0 0',
          }}
        >
          {/* 渲染机房组 */}
          {groups.map((group) => (
            <Group
              key={group.id}
              group={group}
              devices={devices.filter((d) => d.groupId === group.id)}
              isSelected={selectedItem && selectedItem.id === group.id}
              onDragStart={handleGroupDragStart}
              onResizeStart={handleGroupResizeStart}
              onSelect={() => setSelectedItem(group)}
              onDeviceSelect={setSelectedItem}
              onDeviceDragStart={handleDeviceDragStart}
              onDeviceMove={onMoveDevice}
              onConnectionStart={handleConnectionStart}
              onConnectionEnd={handleConnectionEnd}
              onDeleteDevice={onDeleteDevice}
            />
          ))}

          {/* 渲染连接线 - 使用forceRender强制重新渲染 */}
          {connections.map((connection) => {
            const sourceDevice = devices.find((d) => d.id === connection.source.deviceId);
            const targetDevice = devices.find((d) => d.id === connection.target.deviceId);

            // 如果找不到设备，跳过渲染并记录错误
            if (!sourceDevice || !targetDevice) {
              console.error('无法找到连接中的设备:', {
                connectionId: connection.id,
                sourceDeviceId: connection.source.deviceId,
                targetDeviceId: connection.target.deviceId,
                availableDevices: devices.map((d) => ({ id: d.id, name: d.deviceName })),
              });
              return null;
            }

            return (
              <Connection
                key={`${connection.id}-${forceRender}`} // 使用forceRender强制重新渲染
                connection={connection}
                sourceDevice={sourceDevice}
                targetDevice={targetDevice}
                isSelected={selectedItem && selectedItem.id === connection.id}
                onSelect={handleSelectConnectionInternal}
                onDeleteLine={handleDeleteConnection}
              />
            );
          })}

          {/* 渲染临时连接线 */}
          {tempConnection && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <line
                x1={tempConnection.source.x}
                y1={tempConnection.source.y}
                x2={tempConnection.target.x}
                y2={tempConnection.target.y}
                stroke='#1890ff'
                strokeWidth='2'
                strokeDasharray='5,5'
              />
            </svg>
          )}

          {/* 渲染设备 */}
          {devices
            .filter((device) => !device.groupId)
            .map((device) => (
              <Device
                key={device.id}
                device={device}
                isSelected={selectedItem && selectedItem.id === device.id}
                onDragStart={handleDeviceDragStart}
                onSelect={() => setSelectedItem(device)}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
                onDelete={() => onDeleteDevice(device.id)}
              />
            ))}
        </div>
        <DeviceSelectionModal
          visible={modalVisible}
          deviceType={selectedDeviceType}
          iconType={selectedDeviceIconType}
          onAddDevice={handleAddDevice}
          onOk={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
          roomOptions={roomOptions}
        />
      </div>
    );
  },
);

export default Canvas;
