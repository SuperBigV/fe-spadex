import React, { useState, useRef, useCallback } from 'react';
import { Layout } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
// import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import PropertyPanel from './components/PropertyPanel';
import './style.less';

const { Header, Sider, Content } = Layout;

const Topology = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [connections, setConnections] = useState<any>([]);
  const [groups, setGroups] = useState<any>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<any>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef();
  // 保存当前状态到历史记录
  const saveToHistory = useCallback(() => {
    const newState = {
      devices: JSON.parse(JSON.stringify(devices)),
      connections: JSON.parse(JSON.stringify(connections)),
      groups: JSON.parse(JSON.stringify(groups)),
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [devices, connections, groups, history, historyIndex]);

  // 撤销操作
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setDevices(prevState.devices);
      setConnections(prevState.connections);
      setGroups(prevState.groups);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // 重做操作
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setDevices(nextState.devices);
      setConnections(nextState.connections);
      setGroups(nextState.groups);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // 添加设备
  const addDevice = useCallback(
    (device) => {
      // console.log('@@@', device);
      const postList = device.ports.map((port, index) => {
        // 解析 JSON 字符串为对象
        const portObject = JSON.parse(port);

        return {
          id: portObject.metric.index, // 提取 index
          name: portObject.metric.ifDescr, // 提取 ifDescr
          bandwidth: portObject.value[1], // 提取 bandwidth
        };
      });
      const newDevice = {
        ...device,
        id: `device-${Date.now()}`,
        x: device.x || 100,
        y: device.y || 100,
        width: 80,
        height: 60,
        ports: postList,
        alarm: false,
      };
      setDevices((prev) => [...prev, newDevice]);
      saveToHistory();
    },
    [saveToHistory],
  );

  // 添加机房组
  const addGroup = useCallback(
    (group) => {
      const newGroup = {
        ...group,
        id: `group-${Date.now()}`,
        x: group.x || 100,
        y: group.y || 100,
        width: 300,
        height: 200,
        devices: [],
        groups: [],
        name: '新机房',
      };
      setGroups((prev) => [...prev, newGroup]);
      saveToHistory();
    },
    [saveToHistory],
  );

  // 更新设备属性
  const updateDevice = useCallback(
    (id, updates) => {
      setDevices((prev) => prev.map((device) => (device.id === id ? { ...device, ...updates } : device)));
      saveToHistory();
    },
    [saveToHistory],
  );

  // 更新机房属性
  const updateGroup = useCallback(
    (id, updates) => {
      setGroups((prev) => prev.map((group) => (group.id === id ? { ...group, ...updates } : group)));
      saveToHistory();
    },
    [saveToHistory],
  );

  // 删除设备
  const deleteDevice = useCallback(
    (id) => {
      setDevices((prev) => prev.filter((device) => device.id !== id));
      setConnections((prev) => prev.filter((conn) => conn.source.deviceId !== id && conn.target.deviceId !== id));
      saveToHistory();
    },
    [saveToHistory],
  );

  // 删除机房
  const deleteGroup = useCallback(
    (id) => {
      setGroups((prev) => prev.filter((group) => group.id !== id));
      saveToHistory();
    },
    [saveToHistory],
  );

  // 在 Topology 组件中修改 addConnection 函数
  // 在 Topology 组件中修改 addConnection 函数
  const addConnection = useCallback(
    (connection) => {
      console.log('@@@addConnection:', connection);

      // 查找源设备和目标设备
      const sourceDevice = devices.find((d) => d.id === connection.source.deviceId);
      const targetDevice = devices.find((d) => d.id === connection.target.deviceId);

      if (!sourceDevice || !targetDevice) {
        console.error('无法找到连接中的设备:', {
          sourceDeviceId: connection.source.deviceId,
          targetDeviceId: connection.target.deviceId,
          availableDevices: devices.map((d) => ({ id: d.id, name: d.deviceName })),
        });
        return;
      }

      const newConnection = {
        ...connection,
        id: `conn-${Date.now()}`,
        // 移除设备位置信息，因为连接线会根据实时设备位置计算
      };

      console.log('成功添加连接:', newConnection);
      setConnections((prev) => [...prev, newConnection]);
      saveToHistory();
    },
    [saveToHistory, devices], // 添加 devices 到依赖项
  );

  // 更新连接
  const updateConnection = useCallback(
    (id, updates) => {
      setConnections((prev) => prev.map((conn) => (conn.id === id ? { ...conn, ...updates } : conn)));
      saveToHistory();
    },
    [saveToHistory],
  );

  // 删除连接
  const deleteConnection = useCallback(
    (id) => {
      setConnections((prev) => prev.filter((conn) => conn.id !== id));
      saveToHistory();
    },
    [saveToHistory],
  );

  // 清空画布
  const clearCanvas = useCallback(() => {
    setDevices([]);
    setConnections([]);
    setGroups([]);
    setSelectedItem(null);
    saveToHistory();
  }, [saveToHistory]);

  // 将设备添加到机房
  const addDeviceToGroup = useCallback(
    (deviceId, groupId) => {
      setGroups((prev) =>
        prev.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              devices: [...group.devices, deviceId],
            };
          }
          return group;
        }),
      );

      setDevices((prev) =>
        prev.map((device) => {
          if (device.id === deviceId) {
            return {
              ...device,
              groupId,
            };
          }
          return device;
        }),
      );
      saveToHistory();
    },
    [saveToHistory],
  );

  // 从机房移除设备
  const removeDeviceFromGroup = useCallback(
    (deviceId, groupId) => {
      setGroups((prev) =>
        prev.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              devices: group.devices.filter((id) => id !== deviceId),
            };
          }
          return group;
        }),
      );

      setDevices((prev) =>
        prev.map((device) => {
          if (device.id === deviceId) {
            const { groupId, ...rest } = device;
            return rest;
          }
          return device;
        }),
      );
      saveToHistory();
    },
    [saveToHistory],
  );
  const onSelectConnection = useCallback((connection) => {
    console.log('选中连接线:', connection);
    setSelectedItem(connection);
  }, []);
  // 移动设备
  // 确保 moveDevice 能够触发连接线更新
  const moveDevice = useCallback((id, x, y) => {
    console.log('Moving device:', id, 'to:', x, y);
    setDevices((prev) => prev.map((device) => (device.id === id ? { ...device, x, y } : device)));
  }, []);

  const moveGroup = useCallback(
    (id, x, y) => {
      console.log('Moving group:', id, 'to:', x, y);
      const group = groups.find((g) => g.id === id);
      if (group) {
        const deltaX = x - group.x;
        const deltaY = y - group.y;

        setDevices((prev) =>
          prev.map((device) => {
            if (device.groupId === id) {
              return {
                ...device,
                x: device.x + deltaX,
                y: device.y + deltaY,
              };
            }
            return device;
          }),
        );
      }

      setGroups((prev) => prev.map((group) => (group.id === id ? { ...group, x, y } : group)));
    },
    [groups],
  );
  // 调整机房大小
  const resizeGroup = useCallback((id, width, height) => {
    setGroups((prev) => prev.map((group) => (group.id === id ? { ...group, width, height } : group)));
  }, []);

  // 导出图片
  const exportImage = useCallback(() => {
    alert('导出图片功能已触发');
  }, []);

  // 全屏显示
  const toggleFullscreen = useCallback(() => {
    alert('全屏显示功能已触发');
  }, []);

  // 缩放画布
  const zoomCanvas = useCallback((delta) => {
    setCanvasScale((prev) => Math.min(Math.max(0.5, prev + delta), 2));
  }, []);

  // 重置画布缩放
  const resetCanvas = useCallback(() => {
    setCanvasScale(1);
    setCanvasPosition({ x: 0, y: 0 });
  }, []);

  return (
    <PageLayout icon={<DatabaseOutlined />} title={'网络拓扑'}>
      <Layout className='net-topology'>
        <Sider width={100} className='net-sidebar'>
          <Sidebar
            onAddDevice={addDevice}
            onAddGroup={addGroup}
            onClearCanvas={clearCanvas}
            onZoomIn={() => zoomCanvas(0.1)}
            onZoomOut={() => zoomCanvas(-0.1)}
            onResetCanvas={resetCanvas}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onExportImage={exportImage}
            onFullscreen={toggleFullscreen}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
          />
        </Sider>
        <Content className='net-content'>
          <Canvas
            ref={canvasRef}
            devices={devices}
            connections={connections}
            groups={groups}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            canvasScale={canvasScale}
            canvasPosition={canvasPosition}
            onSelectConnection={onSelectConnection}
            setCanvasPosition={setCanvasPosition}
            onAddDevice={addDevice}
            onAddConnection={addConnection}
            onUpdateDevice={updateDevice}
            onDeleteDevice={deleteDevice}
            onMoveDevice={moveDevice}
            onMoveGroup={moveGroup}
            onResizeGroup={resizeGroup}
            onAddDeviceToGroup={addDeviceToGroup}
            onRemoveDeviceFromGroup={removeDeviceFromGroup}
            onAddGroup={addGroup}
          />
        </Content>
        {/* <Sider width={300} className='app-property-panel'>
          <PropertyPanel
            selectedItem={selectedItem}
            devices={devices}
            connections={connections}
            groups={groups}
            onUpdateDevice={updateDevice}
            onUpdateGroup={updateGroup}
            onUpdateConnection={updateConnection}
            onDeleteDevice={deleteDevice}
            onDeleteGroup={deleteGroup}
            onDeleteConnection={deleteConnection}
          />
        </Sider> */}
      </Layout>
    </PageLayout>
  );
};

export default Topology;
