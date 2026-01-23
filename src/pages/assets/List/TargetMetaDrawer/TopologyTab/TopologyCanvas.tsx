import React, { useEffect, useRef, useContext, useState } from 'react';
import { Graph, Shape } from '@antv/x6';
import { Empty, Spin } from 'antd';
import { CommonStateContext } from '@/App';
import { TopologyData, TopologyNode, TopologyEdge } from '../mockData';
import { TopologyType } from './TopologyTypeSelector';
import './style.less';

interface IProps {
  data: TopologyData | null;
  topologyType: TopologyType;
  loading?: boolean;
}

// 注册自定义节点（全局注册，避免重复注册）
let nodeRegistered = false;
const registerTopologyNode = (darkMode: boolean) => {
  if (!nodeRegistered) {
    Graph.registerNode(
      'topology-node',
      {
        inherit: 'rect',
        width: 120,
        height: 40,
        attrs: {
          body: {
            strokeWidth: 1,
            stroke: darkMode ? '#434343' : '#d9d9d9',
            fill: darkMode ? '#1f1f1f' : '#fff',
            rx: 4,
            ry: 4,
          },
          text: {
            fontSize: 12,
            fill: darkMode ? '#fff' : '#000',
          },
        },
      },
      true,
    );
    nodeRegistered = true;
  }
};

export default function TopologyCanvas(props: IProps) {
  const { data, topologyType, loading = false } = props;
  const graphRef = useRef<HTMLDivElement>(null);
  const graphInstanceRef = useRef<Graph | null>(null);
  const { darkMode } = useContext(CommonStateContext);
  const [graphReady, setGraphReady] = useState(false);

  // 过滤数据
  const getFilteredData = (): TopologyData | null => {
    if (!data) return null;

    if (topologyType === 'all') {
      return data;
    }

    const filteredEdges = data.edges.filter((edge) => edge.type === topologyType);
    const edgeNodeIds = new Set<string>();
    filteredEdges.forEach((edge) => {
      edgeNodeIds.add(edge.source);
      edgeNodeIds.add(edge.target);
    });

    const filteredNodes = data.nodes.filter((node) => edgeNodeIds.has(node.id));

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  };

  // 计算布局
  const calculateLayout = (nodes: TopologyNode[], edges: TopologyEdge[]) => {
    if (nodes.length === 0) return {};

    const positions: Record<string, { x: number; y: number }> = {};

    if (topologyType === 'location') {
      // 层级布局：机房 -> 机柜 -> 设备
      const idcNodes = nodes.filter((n) => n.type === 'room');
      const rackNodes = nodes.filter((n) => n.type === 'rack');
      const deviceNodes = nodes.filter((n) => n.type !== 'room' && n.type !== 'rack');

      const startX = 100;
      const startY = 50;
      const levelHeight = 150;
      const nodeWidth = 140;
      const horizontalSpacing = 20;

      // 第一层：机房
      idcNodes.forEach((node, index) => {
        positions[node.id] = {
          x: startX + index * (nodeWidth + horizontalSpacing),
          y: startY,
        };
      });

      // 第二层：机柜
      const rackGroups = new Map<string, TopologyNode[]>();
      rackNodes.forEach((rack) => {
        const parentEdge = edges.find((e) => e.target === rack.id && e.type === 'location');
        if (parentEdge) {
          const parentId = parentEdge.source;
          if (!rackGroups.has(parentId)) {
            rackGroups.set(parentId, []);
          }
          rackGroups.get(parentId)!.push(rack);
        }
      });

      let rackY = startY + levelHeight;
      rackGroups.forEach((racks, parentId) => {
        racks.forEach((rack, index) => {
          const parentPos = positions[parentId];
          if (parentPos) {
            positions[rack.id] = {
              x: parentPos.x + (index - (racks.length - 1) / 2) * (nodeWidth + horizontalSpacing),
              y: rackY,
            };
          }
        });
      });

      // 第三层：设备
      const deviceGroups = new Map<string, TopologyNode[]>();
      deviceNodes.forEach((device) => {
        const parentEdge = edges.find((e) => e.target === device.id && e.type === 'location');
        if (parentEdge) {
          const parentId = parentEdge.source;
          if (!deviceGroups.has(parentId)) {
            deviceGroups.set(parentId, []);
          }
          deviceGroups.get(parentId)!.push(device);
        }
      });

      let deviceY = rackY + levelHeight;
      deviceGroups.forEach((devices, parentId) => {
        devices.forEach((device, index) => {
          const parentPos = positions[parentId];
          if (parentPos) {
            positions[device.id] = {
              x: parentPos.x + (index - (devices.length - 1) / 2) * (nodeWidth + horizontalSpacing),
              y: deviceY,
            };
          }
        });
      });
    } else if (topologyType === 'deployment') {
      // 力导向布局：设备在中心，软件围绕
      const deviceNodes = nodes.filter(
        (n) => n.type === 'host_phy' || n.type === 'net_switch' || n.type === 'net_router' || n.type === 'host_storage' || n.type === 'net_firewall',
      );
      const softwareNodes = nodes.filter((n) => n.type === 'software');

      const centerX = 400;
      const centerY = 300;
      const radius = 150;

      // 设备节点放在中心区域
      deviceNodes.forEach((node, index) => {
        const angle = (index * 2 * Math.PI) / Math.max(deviceNodes.length, 1);
        positions[node.id] = {
          x: centerX + Math.cos(angle) * (radius * 0.5),
          y: centerY + Math.sin(angle) * (radius * 0.5),
        };
      });

      // 软件节点围绕设备
      softwareNodes.forEach((node, index) => {
        const angle = (index * 2 * Math.PI) / Math.max(softwareNodes.length, 1);
        positions[node.id] = {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        };
      });
    } else {
      // 全部拓扑：结合两种布局
      const idcNodes = nodes.filter((n) => n.type === 'room');
      const rackNodes = nodes.filter((n) => n.type === 'rack');
      const deviceNodes = nodes.filter(
        (n) => n.type === 'host_phy' || n.type === 'net_switch' || n.type === 'net_router' || n.type === 'net_firewall' || n.type === 'host_storage',
      );
      const softwareNodes = nodes.filter((n) => n.type === 'software');

      const startX = 100;
      const startY = 50;
      const levelHeight = 120;

      // 位置关系部分（左侧）
      idcNodes.forEach((node, index) => {
        positions[node.id] = {
          x: startX + index * 160,
          y: startY,
        };
      });

      const rackGroups = new Map<string, TopologyNode[]>();
      rackNodes.forEach((rack) => {
        const parentEdge = edges.find((e) => e.target === rack.id && e.type === 'location');
        if (parentEdge) {
          const parentId = parentEdge.source;
          if (!rackGroups.has(parentId)) {
            rackGroups.set(parentId, []);
          }
          rackGroups.get(parentId)!.push(rack);
        }
      });

      let rackY = startY + levelHeight;
      rackGroups.forEach((racks, parentId) => {
        racks.forEach((rack, index) => {
          const parentPos = positions[parentId];
          if (parentPos) {
            positions[rack.id] = {
              x: parentPos.x + (index - (racks.length - 1) / 2) * 160,
              y: rackY,
            };
          }
        });
      });

      let deviceY = rackY + levelHeight;
      const deviceGroups = new Map<string, TopologyNode[]>();
      deviceNodes.forEach((device) => {
        const parentEdge = edges.find((e) => e.target === device.id && e.type === 'location');
        if (parentEdge) {
          const parentId = parentEdge.source;
          if (!deviceGroups.has(parentId)) {
            deviceGroups.set(parentId, []);
          }
          deviceGroups.get(parentId)!.push(device);
        }
      });

      deviceGroups.forEach((devices, parentId) => {
        devices.forEach((device, index) => {
          const parentPos = positions[parentId];
          if (parentPos) {
            positions[device.id] = {
              x: parentPos.x + (index - (devices.length - 1) / 2) * 160,
              y: deviceY,
            };
          }
        });
      });

      // 部署关系部分（右侧）
      const softwareStartX = 600;
      softwareNodes.forEach((node, index) => {
        positions[node.id] = {
          x: softwareStartX + (index % 3) * 160,
          y: startY + Math.floor(index / 3) * 80,
        };
      });

      // 处理没有通过位置关系连接的设备节点
      deviceNodes.forEach((device) => {
        if (!positions[device.id]) {
          const unplacedDevices = deviceNodes.filter((d) => !positions[d.id]);
          const index = unplacedDevices.indexOf(device);
          positions[device.id] = {
            x: softwareStartX + (index % 3) * 160,
            y: deviceY + 100 + Math.floor(index / 3) * 80,
          };
        }
      });
    }

    // 确保所有节点都有位置（兜底处理）
    nodes.forEach((node) => {
      if (!positions[node.id]) {
        const unplacedNodes = nodes.filter((n) => !positions[n.id]);
        const index = unplacedNodes.indexOf(node);
        positions[node.id] = {
          x: 100 + (index % 5) * 160,
          y: 100 + Math.floor(index / 5) * 80,
        };
      }
    });

    return positions;
  };

  // 初始化图形
  useEffect(() => {
    let mounted = true;
    let retryTimer: NodeJS.Timeout | null = null;

    const initGraph = () => {
      if (!mounted) return;

      if (!graphRef.current) {
        console.log('Graph ref not ready, retrying in 50ms...');
        retryTimer = setTimeout(initGraph, 50);
        return;
      }

      // 如果已经初始化，先清理
      if (graphInstanceRef.current) {
        console.log('Disposing existing graph');
        graphInstanceRef.current.dispose();
        graphInstanceRef.current = null;
      }

      console.log('Initializing X6 graph with container:', graphRef.current);
      const containerWidth = graphRef.current.clientWidth || 800;
      const containerHeight = graphRef.current.clientHeight || 600;
      console.log('Container size:', containerWidth, 'x', containerHeight);

      try {
        // 注册自定义节点
        registerTopologyNode(darkMode);

        const graph = new Graph({
          container: graphRef.current,
          width: containerWidth,
          height: containerHeight,
          grid: {
            visible: true,
            type: 'dot',
            size: 10,
            args: {
              color: darkMode ? '#434343' : '#e0e0e0',
              thickness: 1,
            },
          },
          mousewheel: {
            enabled: true,
            zoomAtMousePosition: true,
            modifiers: 'ctrl',
            minScale: 0.5,
            maxScale: 3,
          },
          panning: {
            enabled: true,
            eventTypes: ['leftMouseDown', 'mouseWheel'],
          },
          connecting: {
            router: 'manhattan',
            connector: {
              name: 'rounded',
              args: {
                radius: 8,
              },
            },
            anchor: 'center',
            connectionPoint: 'anchor',
            allowBlank: false,
          },
          background: {
            color: darkMode ? '#141414' : '#fafafa',
          },
        });

        if (mounted) {
          graphInstanceRef.current = graph;
          setGraphReady(true);
          console.log('X6 Graph initialized successfully, size:', containerWidth, 'x', containerHeight);
        } else {
          graph.dispose();
        }
      } catch (error) {
        console.error('Error initializing X6 graph:', error);
        if (mounted) {
          setGraphReady(false);
        }
      }
    };

    // 延迟初始化，确保 DOM 已渲染
    const initTimer = setTimeout(initGraph, 100);

    return () => {
      mounted = false;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      clearTimeout(initTimer);
      console.log('Disposing graph');
      if (graphInstanceRef.current) {
        graphInstanceRef.current.dispose();
        graphInstanceRef.current = null;
      }
      setGraphReady(false);
    };
  }, [darkMode]);

  // 渲染拓扑图
  useEffect(() => {
    if (!graphReady) {
      console.log('Graph not ready, skipping render');
      return;
    }

    const graph = graphInstanceRef.current;
    if (!graph) {
      console.log('Graph instance not found, skipping render');
      return;
    }

    console.log('Rendering topology, data:', data, 'topologyType:', topologyType);

    if (!data) {
      console.log('No data provided, clearing canvas');
      graph.clearCells();
      return;
    }

    const filteredData = getFilteredData();
    console.log('Filtered data:', filteredData, 'nodes:', filteredData?.nodes.length, 'edges:', filteredData?.edges.length);

    if (!filteredData || filteredData.nodes.length === 0) {
      console.log('No filtered data to render, clearing canvas');
      graph.clearCells();
      return;
    }

    // 清空画布
    graph.clearCells();

    // 计算布局
    const positions = calculateLayout(filteredData.nodes, filteredData.edges);
    console.log('Calculated positions for', Object.keys(positions).length, 'nodes');

    // 更新节点样式（根据主题）
    const nodeAttrs = {
      body: {
        stroke: darkMode ? '#434343' : '#d9d9d9',
        fill: darkMode ? '#1f1f1f' : '#fff',
      },
      text: {
        fill: darkMode ? '#fff' : '#000',
      },
    };

    // 添加节点
    let nodeCount = 0;
    filteredData.nodes.forEach((node) => {
      const position = positions[node.id];
      if (!position) {
        console.warn('No position for node:', node.id, node.name);
        return;
      }
      console.log('Adding node:', node.id, node.name, position);
      try {
        const addedNode = graph.addNode({
          shape: 'topology-node',
          id: String(node.id),
          x: position.x,
          y: position.y,
          label: node.name || node.id,
          attrs: nodeAttrs,
        });
        if (addedNode) {
          nodeCount++;
        }
      } catch (error) {
        console.error('Error adding node:', node.id, error);
      }
    });
    console.log('Added', nodeCount, 'nodes');

    // 添加边
    let edgeCount = 0;
    filteredData.edges.forEach((edge) => {
      const isDeployment = edge.type === 'deployment';
      console.log('Adding edge:', edge.id, edge.source, '->', edge.target, 'type:', edge.type);
      try {
        // 确保源节点和目标节点都存在
        const sourceNode = graph.getCellById(String(edge.source));
        const targetNode = graph.getCellById(String(edge.target));

        if (!sourceNode || !targetNode) {
          console.warn('Source or target node not found for edge:', edge.id, 'source:', edge.source, 'target:', edge.target);
          return;
        }

        const addedEdge = graph.addEdge({
          id: String(edge.id),
          source: String(edge.source),
          target: String(edge.target),
          attrs: {
            line: {
              stroke: isDeployment ? '#5F95FF' : '#A2B1C3',
              strokeWidth: 2,
              strokeDasharray: isDeployment ? '5 5' : '0',
              targetMarker: {
                name: 'block',
                width: 8,
                height: 6,
                fill: isDeployment ? '#5F95FF' : '#A2B1C3',
              },
            },
          },
          zIndex: 0,
        });
        if (addedEdge) {
          edgeCount++;
        }
      } catch (error) {
        console.error('Error adding edge:', edge.id, error);
      }
    });
    console.log('Added', edgeCount, 'edges');

    // 适应画布
    setTimeout(() => {
      try {
        const cells = graph.getCells();
        if (cells.length > 0) {
          graph.centerContent({ padding: 20 });
          console.log('Centered content, total cells:', cells.length);
        } else {
          console.warn('No cells to center');
        }
      } catch (error) {
        console.error('Error centering content:', error);
      }
    }, 100);
  }, [data, topologyType, darkMode, graphReady]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 600 }}>
        <Spin size='large' />
      </div>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 600 }}>
        <Empty description='暂无拓扑数据' />
      </div>
    );
  }

  return (
    <div
      ref={graphRef}
      className='topology-canvas'
      style={{
        width: '100%',
        height: '600px',
        minHeight: '600px',
      }}
    />
  );
}
