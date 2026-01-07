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
  const { nodes: topologyNodes, connections: topologyConnections, selectedItem, setSelectedItem, updateNodesPosition, addConnection, updateNode } = useTopology();
  const reactFlowInstance = useReactFlow();
  const hasInitializedFitView = useRef(false);

  // 检测节点是否在机房组内（通过位置判断）
  const isNodeInsideRoom = useCallback((node: Node, roomNodes: Node[]): string | undefined => {
    if (!node.position) return undefined;

    for (const roomNode of roomNodes) {
      if (!roomNode.position || !roomNode.style) continue;

      const roomWidth = (roomNode.style as any).width || 200;
      const roomHeight = (roomNode.style as any).height || 150;

      let nodeX: number;
      let nodeY: number;
      let nodeWidth = (node.width as number) || 150;
      let nodeHeight = (node.height as number) || 50;

      // 如果节点已经有 parentId，说明是子节点，位置是相对坐标
      if (node.parentId === roomNode.id) {
        // 相对坐标：直接使用节点位置
        nodeX = node.position.x;
        nodeY = node.position.y;
      } else {
        // 绝对坐标：需要相对于机房组计算
        nodeX = node.position.x - roomNode.position.x;
        nodeY = node.position.y - roomNode.position.y;
      }

      // 检查节点是否在机房组范围内（留一些边距）
      const margin = 5;
      const nodeRight = nodeX + nodeWidth;
      const nodeBottom = nodeY + nodeHeight;

      // 检查节点是否完全在机房组内（考虑边距）
      if (nodeX >= margin && nodeY >= margin && nodeRight <= roomWidth - margin && nodeBottom <= roomHeight - margin) {
        return roomNode.id;
      }
    }

    return undefined;
  }, []);

  // 端口选择模态框状态
  const [portSelectVisible, setPortSelectVisible] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);

  // 使用内部状态管理 ReactFlow 的节点和边，但数据源来自 Context
  // 这样可以正确处理 ReactFlow 的内部状态变化，同时保持数据同步
  const [reactFlowNodes, setReactFlowNodes] = useState<Node[]>([]);
  const [reactFlowEdges, setReactFlowEdges] = useState<Edge[]>([]);

  // 使用 ref 存储当前的 React Flow 节点状态，避免在同步时丢失位置信息
  const reactFlowNodesRef = useRef<Node[]>([]);

  // 同步 ref
  useEffect(() => {
    reactFlowNodesRef.current = reactFlowNodes;
  }, [reactFlowNodes]);

  // 同步 Context 中的节点数据到 ReactFlow 内部状态
  useEffect(() => {
    if (!topologyNodes || topologyNodes.length === 0) {
      setReactFlowNodes([]);
      return;
    }

    // React Flow Sub-Flows 要求：父节点必须在子节点之前
    // 先分离出父节点（机房节点）和子节点（设备节点）
    const parentNodes = topologyNodes.filter((node) => node.deviceType === 'topology_room');
    const childNodes = topologyNodes.filter((node) => node.deviceType !== 'topology_room');
    // 合并：父节点在前，子节点在后
    const sortedNodes = [...parentNodes, ...childNodes];

    const newNodes = sortedNodes.map((node) => {
      // 先尝试从当前的 React Flow 状态中获取节点（保留位置等信息）
      const existingNode = reactFlowNodesRef.current.find((n) => n.id === node.id);

      // 根据设备类型选择节点类型
      const nodeType = node.deviceType === 'topology_room' ? 'roomNode' : 'topologyNode';

      // 如果有现有节点且位置存在，优先使用现有位置（避免点击时位置丢失）
      // 但只有在 parentId 匹配时才使用（避免使用错误的位置）
      let nodePosition = node.position || { x: 0, y: 0 };
      if (existingNode && existingNode.position) {
        if (node.parentNodeId) {
          // 对于子节点，如果现有节点有 parentId 且匹配，使用现有位置
          if (existingNode.parentId === node.parentNodeId) {
            nodePosition = existingNode.position;
          }
        } else {
          // 对于根节点，如果现有节点也没有 parentId，使用现有位置
          if (!existingNode.parentId) {
            nodePosition = existingNode.position;
          }
        }
      }

      const reactFlowNode: Node = {
        id: node.id,
        type: nodeType,
        position: nodePosition,
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

      // Sub-Flows 功能：设置父子关系
      if (node.parentNodeId) {
        // 子节点：设置 parentId，但不设置 extent，允许节点可以拖出组
        reactFlowNode.parentId = node.parentNodeId;
        // 注意：不设置 extent: 'parent'，允许节点可以自由拖出机房组范围

        // 确保子节点的位置是相对坐标
        // 如果后端返回的是绝对坐标，需要转换为相对坐标
        if (node.position) {
          // 查找父节点
          const parentNode = sortedNodes.find((n) => n.id === node.parentNodeId);
          if (parentNode && parentNode.position) {
            // 检查位置是否是相对坐标
            // 相对坐标应该小于父节点的宽高，且通常为正值
            const roomWidth = parentNode.width || 200;
            const roomHeight = parentNode.height || 150;

            // 判断：如果位置值明显大于父节点尺寸，或者位置值接近父节点的绝对坐标，可能是绝对坐标
            // 使用更严格的判断：如果位置值大于父节点尺寸的 1.5 倍，或者位置值大于 1000，可能是绝对坐标
            const isLikelyAbsolute = node.position.x > roomWidth * 1.5 || node.position.y > roomHeight * 1.5 || node.position.x > 1000 || node.position.y > 1000;

            if (isLikelyAbsolute) {
              const relativeX = node.position.x - parentNode.position.x;
              const relativeY = node.position.y - parentNode.position.y;
              // 确保相对坐标为正值（在父节点范围内）
              if (relativeX >= 0 && relativeY >= 0 && relativeX < roomWidth && relativeY < roomHeight) {
                reactFlowNode.position = { x: relativeX, y: relativeY };
              } else {
                // 如果转换后的坐标不合理，保持原位置（可能是数据问题）
                reactFlowNode.position = { x: node.position.x, y: node.position.y };
              }
            } else {
              // 已经是相对坐标，直接使用
              reactFlowNode.position = { x: node.position.x, y: node.position.y };
            }
          } else {
            // 找不到父节点，保持原位置
            reactFlowNode.position = { x: node.position.x, y: node.position.y };
          }
        }
      } else if (node.deviceType === 'topology_room') {
        // 机房节点作为组节点，不需要特殊设置，但确保没有 parentId
        reactFlowNode.parentId = undefined;
      }

      return reactFlowNode;
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
        type: 'straight',
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
        selectable: true, // 允许边被点击和选择
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

  // 初始化 previousNodeStates
  useEffect(() => {
    topologyNodes.forEach((node) => {
      if (node.deviceType !== 'topology_room') {
        previousNodeStates.current.set(node.id, { parentId: node.parentNodeId });
      }
    });
  }, [topologyNodes]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (parentUpdateTimer.current) {
        clearTimeout(parentUpdateTimer.current);
      }
    };
  }, []);

  // 使用 ref 存储待处理的 parentId 更新，避免重复调用
  const pendingParentUpdates = useRef<Map<string, { parentId: string | undefined; position?: { x: number; y: number } }>>(new Map());
  const parentUpdateTimer = useRef<NodeJS.Timeout | null>(null);
  const previousNodeStates = useRef<Map<string, { parentId?: string }>>(new Map());

  // 节点位置变化处理
  // 使用 applyNodeChanges 来正确处理 ReactFlow 的内部状态变化
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // 只应用变化，不在这里处理坐标转换，避免循环
    // 坐标转换和父子关系更新在 onNodeDragStop 中处理
    setReactFlowNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  // 节点拖动结束处理（保存位置到服务器）
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.position) {
        // 获取当前所有节点的最新状态
        const currentNode = reactFlowInstance.getNode(node.id);
        if (!currentNode) return;

        const topologyNode = topologyNodes.find((n) => n.id === node.id);
        if (!topologyNode) return;

        // 对于设备节点，检测是否在机房组内
        let newParentId: string | undefined = currentNode.parentId || undefined;
        if (topologyNode.deviceType !== 'topology_room') {
          // 获取所有机房节点（从 React Flow 实例获取最新状态）
          const allNodes = reactFlowInstance.getNodes();
          const roomNodes = allNodes.filter((n) => {
            const tn = topologyNodes.find((tn) => tn.id === n.id);
            return tn && tn.deviceType === 'topology_room';
          });

          // 检测节点是否在机房组内（支持相对坐标和绝对坐标）
          const detectedParentId = isNodeInsideRoom(currentNode, roomNodes);

          if (detectedParentId) {
            // 节点在机房组内
            const wasInsideGroup = !!currentNode.parentId || !!topologyNode.parentNodeId;
            newParentId = detectedParentId;

            if (!wasInsideGroup) {
              // 节点刚被拖入组，需要转换坐标
              console.log(`检测到节点 ${node.id} 被拖入机房组 ${detectedParentId}`);

              // 获取父节点（机房组）信息
              const parentRoomNode = roomNodes.find((n) => n.id === detectedParentId);
              if (parentRoomNode && parentRoomNode.position && currentNode.position) {
                // 将绝对坐标转换为相对坐标
                const relativeX = currentNode.position.x - parentRoomNode.position.x;
                const relativeY = currentNode.position.y - parentRoomNode.position.y;

                console.log(`节点位置转换: 绝对(${currentNode.position.x}, ${currentNode.position.y}) -> 相对(${relativeX}, ${relativeY})`);

                // 更新节点位置为相对坐标
                currentNode.position = { x: relativeX, y: relativeY };
                node.position = { x: relativeX, y: relativeY };
              }

              // 设置 parentId（不设置 extent，允许节点可以拖出组）
              currentNode.parentId = detectedParentId;
              // 注意：不设置 extent: 'parent'，允许节点可以自由拖出机房组范围
            } else if (currentNode.parentId !== detectedParentId) {
              // 节点从一个组移动到另一个组
              console.log(`节点 ${node.id} 从组 ${currentNode.parentId} 移动到组 ${detectedParentId}`);

              const parentRoomNode = roomNodes.find((n) => n.id === detectedParentId);
              if (parentRoomNode && parentRoomNode.position && currentNode.position) {
                // 如果之前有 parentId，需要先转换为绝对坐标，再转换为新组的相对坐标
                const oldParentNode = roomNodes.find((n) => n.id === currentNode.parentId);
                let absoluteX = currentNode.position.x;
                let absoluteY = currentNode.position.y;

                if (oldParentNode && oldParentNode.position) {
                  // 转换为绝对坐标
                  absoluteX = currentNode.position.x + oldParentNode.position.x;
                  absoluteY = currentNode.position.y + oldParentNode.position.y;
                }

                // 转换为新组的相对坐标
                const relativeX = absoluteX - parentRoomNode.position.x;
                const relativeY = absoluteY - parentRoomNode.position.y;

                currentNode.position = { x: relativeX, y: relativeY };
                node.position = { x: relativeX, y: relativeY };
              }

              currentNode.parentId = detectedParentId;
              // 注意：不设置 extent: 'parent'，允许节点可以自由拖出机房组范围
            } else {
              // 节点仍在组内，只是位置更新（相对坐标）
              // 注意：不限制位置范围，允许节点可以拖出组（在拖动结束时检测）
              console.log(`节点 ${node.id} 在机房组 ${detectedParentId} 内移动`);
            }
          } else {
            // 节点不在任何机房组内，需要解除关联
            const hadParentId = !!currentNode.parentId || !!topologyNode.parentNodeId;
            newParentId = undefined;

            if (hadParentId) {
              console.log(`节点 ${node.id} 被拖出机房组，解除关联关系`);

              // 如果之前有 parentId，需要将相对坐标转换为绝对坐标
              if (currentNode.parentId && currentNode.position) {
                const oldParentNode = roomNodes.find((n) => n.id === currentNode.parentId);
                if (oldParentNode && oldParentNode.position) {
                  // 转换为绝对坐标
                  const absoluteX = currentNode.position.x + oldParentNode.position.x;
                  const absoluteY = currentNode.position.y + oldParentNode.position.y;

                  console.log(`节点位置转换: 相对(${currentNode.position.x}, ${currentNode.position.y}) -> 绝对(${absoluteX}, ${absoluteY})`);

                  currentNode.position = { x: absoluteX, y: absoluteY };
                  node.position = { x: absoluteX, y: absoluteY };
                }
              }

              // 移除 React Flow 节点的 parentId 和 extent
              delete currentNode.parentId;
              delete currentNode.extent;

              // 更新内部状态（包含位置和 parentId 的移除）
              setReactFlowNodes((nds) =>
                nds.map((n) => {
                  if (n.id === node.id) {
                    return {
                      ...n,
                      position: currentNode.position || n.position,
                      parentId: undefined,
                      extent: undefined,
                    };
                  }
                  return n;
                }),
              );
            } else {
              console.log(`节点 ${node.id} 不在任何机房组内`);
            }
          }
        }

        const oldParentId = topologyNode.parentNodeId;
        const parentIdChanged = newParentId !== oldParentId;

        // 如果 parentId 发生变化，需要更新节点的父子关系
        if (parentIdChanged && topologyNode.deviceType !== 'topology_room') {
          const action = newParentId ? '拖入' : '拖出';
          console.log(`节点 ${node.id} 被${action}机房组:`, {
            old: oldParentId || '无',
            new: newParentId || '无',
          });

          // 设备节点被拖入或拖出组，需要调用更新接口
          // 注意：
          // 1. 当拖入组时，position 应该是相对坐标（已经在上面转换）
          // 2. 当拖出组时，使用 null 表示解除关联，后端会将相对坐标转换为绝对坐标
          const finalPosition = currentNode.position || node.position;
          updateNode(node.id, {
            parentNodeId: newParentId ? newParentId : (null as any), // 使用 null 表示从组内移除
            position: { x: finalPosition.x, y: finalPosition.y },
          })
            .then(() => {
              console.log(`节点 ${node.id} 父子关系更新成功（${action}机房组）`);
            })
            .catch((error) => {
              console.error(`更新节点 ${node.id} 父子关系失败:`, error);
            });
        }

        // 构建位置更新列表
        // 注意：如果节点被拖入组，使用转换后的相对坐标
        const finalNodePosition = currentNode.position || node.position;
        const positionUpdates: Array<{ nodeId: string; x: number; y: number; parentNodeId?: string }> = [
          {
            nodeId: node.id,
            x: finalNodePosition.x,
            y: finalNodePosition.y,
            parentNodeId: newParentId || topologyNode.parentNodeId, // 使用新的 parentId（如果变化了）
          },
        ];

        // 如果是父节点（机房组）被拖动，需要同步更新所有子节点的位置
        if (topologyNode.deviceType === 'topology_room') {
          // 获取所有节点的最新状态（从 React Flow 实例获取）
          const allNodes = reactFlowInstance.getNodes();
          const roomNode = allNodes.find((n) => n.id === node.id);

          // 查找所有子节点（通过 parentId 匹配）
          const childNodes = allNodes.filter((n) => n.parentId === node.id);

          console.log(`机房组 ${node.id} 被拖动，找到 ${childNodes.length} 个子节点`);

          childNodes.forEach((childNode) => {
            if (childNode.position) {
              positionUpdates.push({
                nodeId: childNode.id,
                x: childNode.position.x,
                y: childNode.position.y,
                parentNodeId: childNode.parentId,
              });
            }
          });
        }

        // 批量更新位置（会先更新本地状态，再异步保存到服务器）
        if (positionUpdates.length > 0) {
          updateNodesPosition(positionUpdates).catch((error) => {
            console.error('保存节点位置失败:', error);
          });
        }
      }
    },
    [updateNodesPosition, updateNode, reactFlowInstance, topologyNodes, reactFlowNodes, isNodeInsideRoom],
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
      // 阻止事件冒泡，避免触发其他副作用
      event.stopPropagation();
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
        panOnDrag={[0, 1, 2]}
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

            // 将节点的相对坐标转换为绝对坐标（如果节点有 parentId）
            // 辅助函数：将相对坐标转换为绝对坐标
            const getAbsolutePosition = (node: Node, visited = new Set<string>()): { x: number; y: number } => {
              // 防止循环引用
              if (visited.has(node.id)) {
                return { x: node.position.x, y: node.position.y };
              }
              visited.add(node.id);

              let absoluteX = node.position.x;
              let absoluteY = node.position.y;

              // 如果节点有 parentId，需要将相对坐标转换为绝对坐标
              if (node.parentId) {
                const allNodes = reactFlowInstance.getNodes();
                const parentNode = allNodes.find((n) => n.id === node.parentId);
                if (parentNode) {
                  // 递归处理：如果父节点也有父节点，需要继续向上查找
                  const parentAbsolutePos = getAbsolutePosition(parentNode, visited);
                  absoluteX = node.position.x + parentAbsolutePos.x;
                  absoluteY = node.position.y + parentAbsolutePos.y;
                }
              }

              return { x: absoluteX, y: absoluteY };
            };

            // 获取源节点和目标节点的绝对坐标
            const sourceAbsolutePos = getAbsolutePosition(sourceNode);
            const targetAbsolutePos = getAbsolutePosition(targetNode);

            // 计算节点中心点位置（使用绝对坐标）
            const sourceCenterX = sourceAbsolutePos.x + sourceWidth / 2;
            const sourceCenterY = sourceAbsolutePos.y + sourceHeight / 2;
            const targetCenterX = targetAbsolutePos.x + targetWidth / 2;
            const targetCenterY = targetAbsolutePos.y + targetHeight / 2;

            // 计算连接线的起点和终点（节点边缘位置，使用绝对坐标）
            // 源端口在节点右侧边缘，标签显示在连接线起点附近
            const sourceX = sourceAbsolutePos.x + sourceWidth;
            const sourceY = sourceCenterY;
            // 目标端口在节点左侧边缘，标签显示在连接线终点附近
            const targetX = targetAbsolutePos.x;
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
