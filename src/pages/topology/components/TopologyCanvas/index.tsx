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
  EdgeLabelRenderer,
  getBezierPath,
  Position,
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

/**
 * 简化端口名称
 * 例如: GigabitEthernet0/0/5 -> G0/0/5
 * 只保留第一个字母和后面的接口编号
 */
const simplifyPortName = (portName: string): string => {
  if (!portName) return portName;
  // 匹配第一个字母和后面的数字/斜杠部分
  // 支持多种格式：GigabitEthernet0/0/5, FastEthernet0/1, Ethernet1, etc.
  const match = portName.match(/^([A-Za-z])[A-Za-z]*([0-9/.:-]+.*)$/);
  if (match) {
    return `${match[1]}${match[2]}`;
  }
  // 如果无法匹配，返回原名称
  return portName;
};

/**
 * 格式化流量显示，保留2位小数
 */
const formatTraffic = (traffic: number): string => {
  if (traffic === undefined || traffic === null) return '0.00Mbps';
  return `${traffic.toFixed(2)}Mbps`;
};

/**
 * 源端口标签组件
 */
interface SourcePortLabelProps {
  port: string;
  portIfIn: number;
  portIfOut: number;
  edgeColor: string;
  labelX: number;
  labelY: number;
}

const SourcePortLabel: React.FC<SourcePortLabelProps> = ({ port, portIfIn, portIfOut, edgeColor, labelX, labelY }) => {
  const simplifiedPort = simplifyPortName(port);

  return (
    <div
      className='edge-label source-port-label'
      style={{
        position: 'absolute',
        left: labelX,
        top: labelY,
        transform: 'translate(0, -50%)',
        marginLeft: '8px',
        pointerEvents: 'all',
        background: 'var(--fc-fill-2)', //透明背景
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 500,
        color: edgeColor,
        textAlign: 'center',
        lineHeight: '1.5',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        zIndex: 10,
      }}
    >
      <div style={{ marginBottom: '4px', fontWeight: 600, fontSize: '11px' }}>{simplifiedPort}</div>
      <div
        style={{
          fontSize: '10px',
          color: 'var(--fc-text-2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        <div>入: {formatTraffic(portIfIn)}</div>
        <div>出: {formatTraffic(portIfOut)}</div>
      </div>
    </div>
  );
};

/**
 * 目标端口标签组件
 */
interface TargetPortLabelProps {
  port: string;
  portIfIn: number;
  portIfOut: number;
  edgeColor: string;
  labelX: number;
  labelY: number;
}

const TargetPortLabel: React.FC<TargetPortLabelProps> = ({ port, portIfIn, portIfOut, edgeColor, labelX, labelY }) => {
  const simplifiedPort = simplifyPortName(port);

  return (
    <div
      className='edge-label target-port-label'
      style={{
        position: 'absolute',
        left: labelX,
        top: labelY,
        transform: 'translate(-100%, -50%)',
        marginRight: '8px',
        pointerEvents: 'all',
        background: 'var(--fc-fill-2)', //透明背景
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 500,
        color: edgeColor,
        textAlign: 'center',
        lineHeight: '1.5',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        zIndex: 10,
      }}
    >
      <div style={{ marginBottom: '4px', fontWeight: 600, fontSize: '11px' }}>{simplifiedPort}</div>
      <div
        style={{
          fontSize: '10px',
          color: 'var(--fc-text-2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        <div>入: {formatTraffic(portIfIn)}</div>
        <div>出: {formatTraffic(portIfOut)}</div>
      </div>
    </div>
  );
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
        // 存储连接数据，用于 EdgeLabelRenderer 渲染
        data: {
          connection: conn,
          edgeColor,
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
        <EdgeLabelRenderer>
          {reactFlowEdges.map((edge) => {
            const connection = edge.data?.connection;
            const edgeColor = edge.data?.edgeColor || 'var(--fc-text-4)';
            if (!connection) return null;

            const sourceNode = reactFlowInstance.getNode(edge.source);
            const targetNode = reactFlowInstance.getNode(edge.target);

            if (!sourceNode || !targetNode) return null;

            // 获取节点尺寸，使用默认值
            const sourceWidth = sourceNode.width || 150;
            const sourceHeight = sourceNode.height || 50;
            const targetWidth = targetNode.width || 150;
            const targetHeight = targetNode.height || 50;

            // 计算节点中心点位置
            const sourceCenterX = sourceNode.position.x + sourceWidth / 2;
            const sourceCenterY = sourceNode.position.y + sourceHeight / 2;
            const targetCenterX = targetNode.position.x + targetWidth / 2;
            const targetCenterY = targetNode.position.y + targetHeight / 2;

            // 计算连接线的起点和终点（节点边缘位置）
            // 源端口在节点右侧边缘，标签显示在连接线起点附近
            const sourceX = sourceNode.position.x + sourceWidth;
            const sourceY = sourceCenterY;
            // 目标端口在节点左侧边缘，标签显示在连接线终点附近
            const targetX = targetNode.position.x;
            const targetY = targetCenterY;

            // 计算连接线路径（用于获取中间点，虽然这里不需要）
            const [edgePath] = getBezierPath({
              sourceX: sourceCenterX,
              sourceY: sourceCenterY,
              targetX: targetCenterX,
              targetY: targetCenterY,
              sourcePosition: Position.Right,
              targetPosition: Position.Left,
            });

            return (
              <React.Fragment key={edge.id}>
                {/* 源端口标签 - 显示在源节点右侧，端口位置右侧 */}
                <SourcePortLabel
                  port={connection.sourcePort}
                  portIfIn={connection.sourcePortIfIn}
                  portIfOut={connection.sourcePortIfOut}
                  edgeColor={edgeColor}
                  labelX={sourceX}
                  labelY={sourceY}
                />
                {/* 目标端口标签 - 显示在目标节点左侧，端口位置左侧 */}
                <TargetPortLabel
                  port={connection.targetPort}
                  portIfIn={connection.targetPortIfIn}
                  portIfOut={connection.targetPortIfOut}
                  edgeColor={edgeColor}
                  labelX={targetX}
                  labelY={targetY}
                />
              </React.Fragment>
            );
          })}
        </EdgeLabelRenderer>
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
