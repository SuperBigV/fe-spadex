import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
  Handle,
  Position,
  EdgeProps,
  BaseEdge,
  type OnConnect,
  type Node,
  type Edge,
  ConnectionMode,
  getStraightPath,
  NodeProps,
  Connection,
  ReactFlowInstance,
} from '@xyflow/react';
import { Layout, Menu, Card, Typography, Button, Tooltip, message } from 'antd';
import { CloudOutlined, FireOutlined, GatewayOutlined, SwapOutlined, DesktopOutlined, DatabaseOutlined, QuestionCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import '@xyflow/react/dist/style.css';
import PageLayout from '@/components/pageLayout';
import CustomEdge from './customEdge';
import CustomNode from './customNode';
const { Sider, Content } = Layout;
const { Title } = Typography;

// 节点数据类型定义
interface NodeData {
  label: string;
  icon: string;
  type: string;
}

// 设备类型定义
interface DeviceType {
  key: string;
  label: string;
  icon: string;
  type: string;
  children?: DeviceType[];
}

// 自定义边组件
// const CustomEdge: React.FC<EdgeProps> = ({ id, sourceX, sourceY, targetX, targetY, selected, markerEnd }) => {
//   const [edgeHovered, setEdgeHovered] = useState(false);
//   const { setEdges } = useReactFlow();

//   // 删除边
//   const onEdgeClick = useCallback(
//     (event: React.MouseEvent, edgeId: string) => {
//       event.stopPropagation();
//       setEdges((edges) => edges.filter((edge) => edge.id !== edgeId));
//       message.success('连线已删除');
//     },
//     [setEdges],
//   );

//   const [edgePath] = getStraightPath({
//     sourceX,
//     sourceY,
//     targetX,
//     targetY,
//   });

//   const centerX = (sourceX + targetX) / 2;
//   const centerY = (sourceY + targetY) / 2;

//   return (
//     <>
//       <BaseEdge
//         id={id}
//         path={edgePath}
//         style={{
//           stroke: selected ? '#1890ff' : '#999',
//           strokeWidth: selected ? 3 : 2,
//         }}
//         markerEnd={markerEnd}
//       />
//       {(edgeHovered || selected) && (
//         <g transform={`translate(${centerX}, ${centerY})`} onMouseEnter={() => setEdgeHovered(true)} onMouseLeave={() => setEdgeHovered(false)}>
//           <circle
//             r={10}
//             fill={selected ? '#1890ff' : 'red'}
//             onClick={(event) => onEdgeClick(event, id)}
//             style={{
//               cursor: 'pointer',
//               opacity: 0.8,
//             }}
//           />
//           <text dy='0.3em' textAnchor='middle' fill='white' fontSize={10} fontWeight='bold' style={{ pointerEvents: 'none' }}>
//             ×
//           </text>
//         </g>
//       )}
//     </>
//   );
// };

// 定义节点和边类型
const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

// 设备类型数据
const deviceTypes: DeviceType[] = [
  {
    key: 'cloud',
    label: '云',
    icon: '/image/topology_cloud.png',
    type: 'cloud',
  },
  {
    key: 'firewall',
    label: '防火墙',
    icon: '/image/topology_fireware.png',
    type: 'firewall',
  },
  {
    key: 'router',
    label: '路由器',
    icon: '/image/topology_router.png',
    type: 'router',
  },
  {
    key: 'switch',
    label: '交换机',
    icon: '',
    type: 'switch',
    children: [
      {
        key: 'three_switch',
        label: '三层交换机',
        icon: '/image/topology_three_switch.png',
        type: 'switch',
      },
      {
        key: 'core_switch',
        label: '核心交换机',
        icon: '/image/topology_core_switch.png',
        type: 'switch',
      },
      {
        key: 'aggr_switch',
        label: '汇聚交换机',
        icon: '/image/topology_aggr_switch.png',
        type: 'switch',
      },
      {
        key: 'access_switch',
        label: '接入交换机',
        icon: '/image/topology_arcess_switch.png',
        type: 'switch',
      },
    ],
  },
  {
    key: 'server',
    label: '服务器',
    icon: '/image/topology_host.png',
    type: 'server',
  },
];

// 主组件
const TopologyEditor: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const { screenToFlowPosition } = useReactFlow();

  // 处理拖拽开始
  const onDragStart = (event: React.DragEvent, nodeType: string, icon: string, label: string) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({
        type: nodeType,
        icon,
        label,
      }),
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  // 处理拖拽放置
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;

      const { type, icon, label } = JSON.parse(data);

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label,
          icon,
          type,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      message.success(`已添加 ${label}`);
    },
    [screenToFlowPosition, setNodes],
  );

  // 处理连线
  const onConnect: OnConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  // 删除选中节点和边
  const deleteSelected = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    const selectedEdges = edges.filter((edge) => edge.selected);

    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      message.warning('请先选择要删除的节点或连线');
      return;
    }

    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
    message.success(`已删除 ${selectedNodes.length} 个节点和 ${selectedEdges.length} 条连线`);
  }, [nodes, edges, setNodes, setEdges]);

  // 删除所有
  const deleteAll = useCallback(() => {
    if (nodes.length === 0 && edges.length === 0) {
      message.warning('画布已经是空的');
      return;
    }

    setNodes([]);
    setEdges([]);
    message.success('已清空画布');
  }, [nodes, edges, setNodes, setEdges]);

  // 获取设备类型的图标
  const getIconForType = (type: string) => {
    switch (type) {
      case 'cloud':
        return <CloudOutlined />;
      case 'firewall':
        return <FireOutlined />;
      case 'router':
        return <GatewayOutlined />;
      case 'switch':
        return <SwapOutlined />;
      case 'server':
        return <DesktopOutlined />;
      default:
        return <DesktopOutlined />;
    }
  };

  // 渲染设备菜单项
  const renderMenuItem = (item: DeviceType) => {
    if (item.children) {
      return (
        <Menu.SubMenu key={item.key} icon={getIconForType(item.type)} title={item.label}>
          {item.children.map((child) => (
            <Menu.Item key={child.key}>
              <div
                className='device-menu-item'
                draggable
                onDragStart={(e) => onDragStart(e, child.type, child.icon, child.label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 0',
                  cursor: 'grab',
                }}
              >
                <img src={child.icon} alt={child.label} width={24} height={24} />
                <span>{child.label}</span>
              </div>
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      );
    }

    return (
      <Menu.Item key={item.key}>
        <div
          className='device-menu-item'
          draggable
          onDragStart={(e) => onDragStart(e, item.type, item.icon, item.label)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 0',
            cursor: 'grab',
          }}
        >
          <img src={item.icon} alt={item.label} width={24} height={24} />
          <span>{item.label}</span>
        </div>
      </Menu.Item>
    );
  };

  return (
    <PageLayout icon={<DatabaseOutlined />} title={'网络拓扑'}>
      <Layout style={{ height: '100vh' }}>
        <Sider width={180}>
          <div style={{ padding: '0 16px' }}>
            <Title level={4}>设备类型</Title>
            <p style={{ color: '#666', fontSize: '12px', marginTop: '-8px' }}>拖拽设备到画布，悬停节点显示连接点</p>
          </div>
          <Menu mode='inline' style={{ border: 'none' }}>
            {deviceTypes.map((device) => renderMenuItem(device))}
          </Menu>
        </Sider>

        <Layout>
          <Content>
            <div className='topology-container' ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                onInit={(instance: ReactFlowInstance) => setReactFlowInstance(instance)}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                connectionMode={ConnectionMode.Loose}
              >
                <Background />
                <Controls />
                {/* <MiniMap
                  style={{
                    backgroundColor: '#C6C6C6',
                    border: '1px solid #d9d9d9',
                  }}
                /> */}
                <Panel position='top-right'>
                  <Card size='small' title='操作面板' style={{ width: 220 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Button icon={<DeleteOutlined />} onClick={deleteSelected} type='primary' danger block>
                        删除选中项
                      </Button>
                      <Button onClick={deleteAll} danger style={{ marginTop: '8px' }} block>
                        清空画布
                      </Button>
                      <Button type='primary' onClick={() => reactFlowInstance?.fitView()}>
                        适应视图
                      </Button>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                        <QuestionCircleOutlined /> 提示：悬停节点显示连接点
                      </div>
                    </div>
                  </Card>
                </Panel>
              </ReactFlow>
            </div>
          </Content>
        </Layout>
      </Layout>
    </PageLayout>
  );
};

// 包装组件以提供React Flow上下文
const TopologyEditorWrapper = () => (
  <ReactFlowProvider>
    <TopologyEditor />
  </ReactFlowProvider>
);

// 样式
const styles = `
.topology-container {
  width: 100%;
  height: 100%;
}

.custom-node {
  text-align: center;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  position: relative;
}

.custom-node .node-icon {
  margin-bottom: 5px;
}

.custom-node .node-label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #2c3e50;
}

.connection-handle {
  width: 8px;
  height: 8px;
  background: white;
  border: 2px solid #fff;
  border-radius: 50%;
}

.connection-handle:hover {
  background: #1890ff;
}

.device-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.ant-menu-item .device-menu-item {
  margin: -8px 0;
}

.ant-layout-sider {
  box-shadow: 2px 0 6px rgba(0,0,0,0.05);
}

.ant-menu-inline {
  border-inline-end: none !important;
}
  
`;

// 添加样式到文档
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default TopologyEditorWrapper;
