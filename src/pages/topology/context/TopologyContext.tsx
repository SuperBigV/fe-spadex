/*
 * 网络拓扑管理 - Context 状态管理
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import {
  TopologyView,
  TopologyNode,
  TopologyConnection,
  MonitoredAsset,
  Port,
  DeviceStatus,
  PortStatus,
  ConnectionStatus,
  NodeCreateData,
  ConnectionCreateData,
} from '../types';
import {
  getTopologyView,
  getTopologyNodes,
  addTopologyNode,
  updateTopologyNode,
  deleteTopologyNode,
  updateNodePositions,
  getTopologyConnections,
  addTopologyConnection,
  updateTopologyConnection,
  deleteTopologyConnection,
  getAssetPorts,
  getDeviceStatus,
  getPortStatus,
  getConnectionStatus,
} from '@/services/topology';

interface TopologyContextValue {
  currentView: TopologyView | null;
  nodes: TopologyNode[];
  connections: TopologyConnection[];
  selectedItem: TopologyNode | TopologyConnection | null;
  loading: boolean;
  deviceStatusMap: { [assetId: number]: DeviceStatus };
  portStatusMap: { [assetId: number]: PortStatus };
  connectionStatusMap: { [connectionId: string]: ConnectionStatus };
  nodePortsMap: { [assetId: number]: Port[] };
  setSelectedItem: (item: TopologyNode | TopologyConnection | null) => void;
  refreshTopology: () => Promise<void>;
  addNode: (data: NodeCreateData) => Promise<void>;
  updateNode: (nodeId: string, updates: Partial<TopologyNode>) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  updateNodesPosition: (positions: Array<{ nodeId: string; x: number; y: number }>) => Promise<void>;
  addConnection: (data: ConnectionCreateData) => Promise<void>;
  updateConnection: (connectionId: string, updates: Partial<TopologyConnection>) => Promise<void>;
  deleteConnection: (connectionId: string) => Promise<void>;
  loadView: (viewId: number) => Promise<void>;
  refreshStatus: () => Promise<void>;
  loadNodePorts: (assetId: number) => Promise<void>;
}

const TopologyContext = createContext<TopologyContextValue | null>(null);

interface TopologyProviderProps {
  children: ReactNode;
  viewId: number;
}

export function TopologyProvider({ children, viewId }: TopologyProviderProps) {
  const [currentView, setCurrentView] = useState<TopologyView | null>(null);
  const [nodes, setNodes] = useState<TopologyNode[]>([]);
  const [connections, setConnections] = useState<TopologyConnection[]>([]);
  const [selectedItem, setSelectedItem] = useState<TopologyNode | TopologyConnection | null>(null);
  
  // 使用 ref 存储最新的 nodes 和 connections，避免闭包问题
  const nodesRef = useRef<TopologyNode[]>([]);
  const connectionsRef = useRef<TopologyConnection[]>([]);
  
  // 同步 ref 和 state
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  
  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);
  const [loading, setLoading] = useState(false);
  const [deviceStatusMap, setDeviceStatusMap] = useState<{ [assetId: number]: DeviceStatus }>({});
  const [portStatusMap, setPortStatusMap] = useState<{ [assetId: number]: PortStatus }>({});
  const [connectionStatusMap, setConnectionStatusMap] = useState<{ [connectionId: string]: ConnectionStatus }>({});
  const [nodePortsMap, setNodePortsMap] = useState<{ [assetId: number]: Port[] }>({});

  // 加载视图
  const loadView = useCallback(async () => {
    if (!viewId) return;
    setLoading(true);
    try {
      const view = await getTopologyView(viewId);
      setCurrentView(view);
    } catch (error) {
      console.error('加载视图失败:', error);
    } finally {
      setLoading(false);
    }
  }, [viewId]);

  // 刷新拓扑数据（只在初始化时调用，避免覆盖本地状态）
  const refreshTopology = useCallback(async () => {
    if (!viewId) return;
    setLoading(true);
    try {
      const [nodesData, connectionsData] = await Promise.all([
        getTopologyNodes(viewId),
        getTopologyConnections(viewId),
      ]);
      
      // 安全地更新节点数据，确保节点不会消失
      setNodes((prevNodes) => {
        // 如果服务器返回空数组，保留现有节点（避免节点消失）
        if (!nodesData || nodesData.length === 0) {
          if (prevNodes.length > 0) {
            console.warn('服务器返回空节点列表，保留现有节点');
            return prevNodes;
          }
          return [];
        }

        // 如果有本地节点，合并逻辑：以服务器数据为主，但保留本地节点的位置等信息
        // 重要：如果服务器数据中缺少某些本地节点，保留这些本地节点（避免节点消失）
        if (prevNodes.length > 0) {
          const serverNodeMap = new Map(nodesData.map((n) => [n.id, n]));
          const localNodeMap = new Map(prevNodes.map((n) => [n.id, n]));
          
          // 1. 先处理服务器返回的节点（更新服务器数据，但保留本地位置等信息）
          const updatedNodes = nodesData.map((serverNode) => {
            const localNode = localNodeMap.get(serverNode.id);
            if (localNode) {
              // 保留本地节点的位置和选中端口信息
              return {
                ...serverNode,
                position: localNode.position || serverNode.position || { x: 0, y: 0 },
                selectedPorts: localNode.selectedPorts || serverNode.selectedPorts,
              };
            }
            // 新节点，确保有位置信息
            return {
              ...serverNode,
              position: serverNode.position || { x: 0, y: 0 },
            };
          });
          
          // 2. 添加服务器数据中没有但本地存在的节点（避免节点消失）
          const missingNodes = prevNodes.filter((localNode) => !serverNodeMap.has(localNode.id));
          if (missingNodes.length > 0) {
            console.warn(`服务器数据中缺少 ${missingNodes.length} 个本地节点，保留这些节点`, missingNodes.map(n => n.id));
            return [...updatedNodes, ...missingNodes];
          }
          
          return updatedNodes;
        }

        // 首次加载，确保所有节点都有位置信息
        return nodesData.map((node) => ({
          ...node,
          position: node.position || { x: 0, y: 0 },
        }));
      });
      
      setConnections(connectionsData || []);
    } catch (error) {
      console.error('刷新拓扑数据失败:', error);
      // 错误时不清空节点，避免节点消失
    } finally {
      setLoading(false);
    }
  }, [viewId]);

  // 刷新状态监控（只更新状态，不改变节点位置或其他属性）
  const refreshStatus = useCallback(async () => {
    if (!viewId) return;

    try {
      // 使用 ref 获取最新的 nodes 和 connections，避免闭包问题
      const currentNodes = nodesRef.current;
      const currentConnections = connectionsRef.current;

      if (currentNodes.length === 0) return;

      const assetIds = currentNodes.map((n) => n.assetId);
      const connectionIds = currentConnections.map((c) => c.id);

      // 批量获取设备状态
      if (assetIds.length > 0) {
        const deviceStatuses = await getDeviceStatus(assetIds);
        setDeviceStatusMap(deviceStatuses);

        // 更新节点状态（确保保留所有现有属性，包括 position）
        // 只在 status 真正变化时才更新节点，避免不必要的引用变化
        setNodes((prevNodes) => {
          let hasChanges = false;
          const updatedNodes = prevNodes.map((node) => {
            const status = deviceStatuses[node.assetId];
            if (status && node.status !== status.status) {
              hasChanges = true;
              // 只更新 status，保留所有其他属性（包括 position）
              return { ...node, status: status.status };
            }
            return node; // 保持原引用，避免不必要的重新渲染
          });
          // 如果没有变化，返回原数组引用
          return hasChanges ? updatedNodes : prevNodes;
        });
      }

      // 批量获取连接状态
      if (connectionIds.length > 0) {
        const connStatuses = await getConnectionStatus(connectionIds);
        setConnectionStatusMap(connStatuses);

        // 更新连接状态
        setConnections((prevConns) =>
          prevConns.map((conn) => {
            const status = connStatuses[conn.id];
            return status ? { ...conn, status: status.status } : conn;
          }),
        );
      }

      // 获取端口状态（逐个获取）
      for (const node of currentNodes) {
        try {
          const portStatus = await getPortStatus(node.assetId);
          setPortStatusMap((prev) => ({
            ...prev,
            [node.assetId]: portStatus,
          }));
        } catch (error) {
          console.error(`获取端口状态失败 (assetId: ${node.assetId}):`, error);
        }
      }
    } catch (error) {
      console.error('刷新状态监控失败:', error);
    }
  }, [viewId]);

  // 加载节点端口信息
  const loadNodePorts = useCallback(async (assetId: number) => {
    if (nodePortsMap[assetId]) return;

    try {
      const ports = await getAssetPorts(assetId);
      setNodePortsMap((prev) => ({
        ...prev,
        [assetId]: ports,
      }));
    } catch (error) {
      console.error(`加载端口信息失败 (assetId: ${assetId}):`, error);
    }
  }, [nodePortsMap]);

  // 添加节点
  const addNode = useCallback(
    async (data: NodeCreateData) => {
      if (!viewId) return;
      try {
        const newNode = await addTopologyNode(viewId, data);
        setNodes((prev) => [...prev, newNode]);
        // 自动加载端口信息
        await loadNodePorts(newNode.assetId);
        // 不立即刷新状态，避免与节点添加操作冲突导致节点消失
        // 状态会在定时刷新时自动更新
      } catch (error) {
        console.error('添加节点失败:', error);
        throw error;
      }
    },
    [viewId, loadNodePorts],
  );

  // 更新节点
  const updateNode = useCallback(
    async (nodeId: string, updates: Partial<TopologyNode>) => {
      try {
        await updateTopologyNode(nodeId, updates);
        setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)));
      } catch (error) {
        console.error('更新节点失败:', error);
        throw error;
      }
    },
    [],
  );

  // 删除节点
  const deleteNode = useCallback(
    async (nodeId: string) => {
      try {
        await deleteTopologyNode(nodeId);
        setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        setConnections((prev) => prev.filter((c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId));
        if (selectedItem && (selectedItem as TopologyNode).id === nodeId) {
          setSelectedItem(null);
        }
      } catch (error) {
        console.error('删除节点失败:', error);
        throw error;
      }
    },
    [selectedItem],
  );

  // 批量更新节点位置（先更新本地状态，再异步保存到服务器，确保状态一致）
  const updateNodesPosition = useCallback(
    async (positions: Array<{ nodeId: string; x: number; y: number }>) => {
      if (!viewId) return;
      
      // 1. 先立即更新本地状态（同步操作，立即反映在UI，确保 ReactFlow 和 Context 状态同步）
      setNodes((prev) =>
        prev.map((node) => {
          const pos = positions.find((p) => p.nodeId === node.id);
          if (pos) {
            return { ...node, position: { x: pos.x, y: pos.y } };
          }
          return node;
        }),
      );

      // 2. 然后异步保存到服务器（不阻塞UI，失败也不影响本地状态）
      updateNodePositions(viewId, positions.map((p) => ({ nodeId: p.nodeId, x: p.x, y: p.y }))).catch(
        (error) => {
          console.error('保存节点位置到服务器失败:', error);
          // 注意：这里不抛出错误，因为本地状态已经更新
          // 如果需要在失败时回滚，可以在这里实现
        },
      );
    },
    [viewId],
  );

  // 添加连接
  const addConnection = useCallback(
    async (data: ConnectionCreateData) => {
      if (!viewId) return;
      try {
        const newConnection = await addTopologyConnection(viewId, data);
        setConnections((prev) => [...prev, newConnection]);
        // 不立即刷新状态，避免与连接添加操作冲突
        // 状态会在定时刷新时自动更新
      } catch (error) {
        console.error('添加连接失败:', error);
        throw error;
      }
    },
    [viewId],
  );

  // 更新连接
  const updateConnection = useCallback(
    async (connectionId: string, updates: Partial<TopologyConnection>) => {
      try {
        await updateTopologyConnection(connectionId, updates);
        setConnections((prev) => prev.map((c) => (c.id === connectionId ? { ...c, ...updates } : c)));
      } catch (error) {
        console.error('更新连接失败:', error);
        throw error;
      }
    },
    [],
  );

  // 删除连接
  const deleteConnection = useCallback(
    async (connectionId: string) => {
      try {
        await deleteTopologyConnection(connectionId);
        setConnections((prev) => prev.filter((c) => c.id !== connectionId));
        if (selectedItem && (selectedItem as TopologyConnection).id === connectionId) {
          setSelectedItem(null);
        }
      } catch (error) {
        console.error('删除连接失败:', error);
        throw error;
      }
    },
    [selectedItem],
  );

  // 初始化加载
  useEffect(() => {
    loadView();
  }, [loadView]);

  // 只在 viewId 变化时刷新拓扑数据，避免频繁刷新导致节点消失
  useEffect(() => {
    refreshTopology();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewId]); // 只依赖 viewId，不依赖 refreshTopology，避免不必要的刷新

  // 定时刷新状态（60秒）
  useEffect(() => {
    if (nodes.length === 0) return;

    refreshStatus();
    const interval = setInterval(() => {
      refreshStatus();
    }, 60000); // 60秒

    return () => clearInterval(interval);
  }, [nodes.length, refreshStatus]);

  const value: TopologyContextValue = {
    currentView,
    nodes,
    connections,
    selectedItem,
    loading,
    deviceStatusMap,
    portStatusMap,
    connectionStatusMap,
    nodePortsMap,
    setSelectedItem,
    refreshTopology,
    addNode,
    updateNode,
    deleteNode,
    updateNodesPosition,
    addConnection,
    updateConnection,
    deleteConnection,
    loadView,
    refreshStatus,
    loadNodePorts,
  };

  return <TopologyContext.Provider value={value}>{children}</TopologyContext.Provider>;
}

export function useTopology() {
  const context = useContext(TopologyContext);
  if (!context) {
    throw new Error('useTopology must be used within TopologyProvider');
  }
  return context;
}

