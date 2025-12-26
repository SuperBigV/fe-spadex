/*
 * 拓扑画布组件
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  NodeTypes,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTopology } from '../../context/TopologyContext';
import { TopologyConnection } from '../../types';
import TopologyNode from '../TopologyNode';
import RoomNode from '../RoomNode';
import PortSelectModal from '../PortSelectModal';
import './index.less';

const nodeTypes: NodeTypes = {
  topologyNode: TopologyNode,
  roomNode: RoomNode,
};

interface TopologyCanvasInnerProps {
  onInit?: (instance: ReturnType<typeof useReactFlow>) => void;
}

const TopologyCanvasInner: React.FC<TopologyCanvasInnerProps> = ({ onInit: onInitCallback }) => {
  const { nodes: topologyNodes, connections: topologyConnections, selectedItem, setSelectedItem, updateNodesPosition, addConnection } = useTopology();
  const reactFlowInstance = useReactFlow();
  const hasInitializedFitView = useRef(false);

  // 端口选择模态框状态
  const [portSelectVisible, setPortSelectVisible] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);

  // 使用内部状态管理 ReactFlow 的节点和边，但数据源来自 Context
  // 这样可以正确处理 ReactFlow 的内部状态变化，同时保持数据同步
  const [reactFlowNodes, setReactFlowNodes] = useState<Node[]>([]);
  const [reactFlowEdges, setReactFlowEdges] = useState<Edge[]>([]);

  // 同步 Context 中的节点数据到 ReactFlow 内部状态
  useEffect(() => {
    if (!topologyNodes || topologyNodes.length === 0) {
      setReactFlowNodes([]);
      return;
    }
    const newNodes = topologyNodes.map((node) => {
      // 根据设备类型选择节点类型
      const nodeType = node.deviceType === 'topology_room' ? 'roomNode' : 'topologyNode';
      return {
        id: node.id,
        type: nodeType,
        position: node.position || { x: 0, y: 0 },
        data: { node },
        selected: selectedItem && (selectedItem as any).id === node.id ? true : undefined,
        // 对于机房节点，设置宽度和高度
        ...(node.deviceType === 'topology_room' && {
          style: {
            width: node.width || 200,
            height: node.height || 150,
          },
        }),
      };
    });
    setReactFlowNodes(newNodes);
  }, [topologyNodes, selectedItem]);

  // 同步 Context 中的连接数据到 ReactFlow 内部状态
  useEffect(() => {
    const newEdges = topologyConnections.map((conn) => {
      const isSelected = selectedItem && (selectedItem as TopologyConnection).id === conn.id;
      const edgeColor = conn.status === 'up' ? 'var(--fc-green-6-color)' : conn.status === 'down' ? 'var(--fc-red-6-color)' : 'var(--fc-text-4)';

      // 获取源节点和目标节点，用于显示端口名称
      const sourceNode = topologyNodes.find((n) => n.id === conn.sourceNodeId);
      const targetNode = topologyNodes.find((n) => n.id === conn.targetNodeId);

      return {
        id: conn.id,
        source: conn.sourceNodeId,
        target: conn.targetNodeId,
        // 使用默认 Handle，不需要指定 sourceHandle 和 targetHandle
        type: 'smoothstep',
        animated: conn.status === 'up',
        style: {
          stroke: edgeColor,
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor,
        },
        // 在连接线上显示端口信息
        label: `${conn.sourcePort} → ${conn.targetPort}`,
        labelStyle: {
          fill: edgeColor,
          fontWeight: 500,
          fontSize: 12,
        },
        labelBgStyle: {
          fill: 'rgba(255, 255, 255, 0.9)',
          fillOpacity: 0.9,
        },
        selected: isSelected ? true : undefined,
      };
    });
    setReactFlowEdges(newEdges);
  }, [topologyConnections, selectedItem, topologyNodes]);

  // 传递实例给父组件，并在首次加载节点时执行fitView
  useEffect(() => {
    if (reactFlowInstance && onInitCallback) {
      onInitCallback(reactFlowInstance);
    }
  }, [reactFlowInstance, onInitCallback]);

  // 首次加载节点时执行fitView（设置合适的缩放比例）
  useEffect(() => {
    if (reactFlowNodes.length > 0 && !hasInitializedFitView.current && reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400, maxZoom: 1.2 });
        hasInitializedFitView.current = true;
      }, 200);
    }
  }, [reactFlowNodes.length, reactFlowInstance]);

  // 节点位置变化处理
  // 使用 applyNodeChanges 来正确处理 ReactFlow 的内部状态变化
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setReactFlowNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  // 节点拖动结束处理（保存位置到服务器）
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.position) {
        // 拖动结束后保存位置（会先更新本地状态，再异步保存到服务器）
        updateNodesPosition([
          {
            nodeId: node.id,
            x: node.position.x,
            y: node.position.y,
          },
        ]).catch((error) => {
          console.error('保存节点位置失败:', error);
        });
      }
    },
    [updateNodesPosition],
  );

  // 边变化处理
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setReactFlowEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  // 连接创建处理 - 先显示端口选择模态框
  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      // 防止连接到自身
      if (connection.source === connection.target) {
        return;
      }

      // 保存待处理的连接，显示端口选择模态框
      setPendingConnection(connection);
      setPortSelectVisible(true);
    }
  }, []);

  // 确认端口选择
  const handlePortSelectConfirm = useCallback(
    (sourcePort: string, targetPort: string) => {
      if (pendingConnection) {
        addConnection({
          sourceNodeId: pendingConnection.source!,
          sourcePort: sourcePort,
          targetNodeId: pendingConnection.target!,
          targetPort: targetPort,
        }).catch((error) => {
          console.error('添加连接失败:', error);
        });
      }
      setPortSelectVisible(false);
      setPendingConnection(null);
    },
    [pendingConnection, addConnection],
  );

  // 取消端口选择
  const handlePortSelectCancel = useCallback(() => {
    setPortSelectVisible(false);
    setPendingConnection(null);
  }, []);

  // 节点点击处理
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // 阻止事件冒泡，避免触发其他副作用
      event.stopPropagation();
      const topologyNode = topologyNodes.find((n) => n.id === node.id);
      if (topologyNode) {
        setSelectedItem(topologyNode);
      }
    },
    [topologyNodes, setSelectedItem],
  );

  // 边点击处理
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      const connection = topologyConnections.find((c) => c.id === edge.id);
      if (connection) {
        setSelectedItem(connection);
      }
    },
    [topologyConnections, setSelectedItem],
  );

  return (
    <div className='topology-canvas'>
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeDragStop={onNodeDragStop}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        panOnDrag={[1, 2]}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        minZoom={0.1}
        maxZoom={4}
        attributionPosition='bottom-left'
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        deleteKeyCode={null}
        multiSelectionKeyCode={null}
      >
        <Background gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data?.node;
            if (data?.status === 'online') return 'var(--fc-green-6-color)';
            if (data?.status === 'offline') return 'var(--fc-red-6-color)';
            return 'var(--fc-text-4)';
          }}
          maskColor='rgba(0, 0, 0, 0.1)'
        />
      </ReactFlow>

      {/* 端口选择模态框 */}
      {pendingConnection && (
        <PortSelectModal
          visible={portSelectVisible}
          sourceNodeId={pendingConnection.source!}
          targetNodeId={pendingConnection.target!}
          sourceNodeName={topologyNodes.find((n) => n.id === pendingConnection.source)?.name || ''}
          targetNodeName={topologyNodes.find((n) => n.id === pendingConnection.target)?.name || ''}
          sourceAssetId={topologyNodes.find((n) => n.id === pendingConnection.source)?.assetId || 0}
          targetAssetId={topologyNodes.find((n) => n.id === pendingConnection.target)?.assetId || 0}
          onConfirm={handlePortSelectConfirm}
          onCancel={handlePortSelectCancel}
        />
      )}
    </div>
  );
};

// 外层包装组件
interface TopologyCanvasProps {
  onInit?: (instance: ReturnType<typeof useReactFlow>) => void;
}

const TopologyCanvas: React.FC<TopologyCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <TopologyCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default TopologyCanvas;
