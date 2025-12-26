// 拓扑数据 mock
export interface TopologyNode {
  id: string;
  name: string;
  type?: 'host_phy' | 'rack' | 'room' | 'software' | 'net_switch' | 'net_router' | 'net_firewall' | 'host_storage';
  position?: { x: number; y: number };
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  type: 'location' | 'deployment';
}

export interface TopologyData {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

// Mock 拓扑数据
export function getMockTopologyData(ident: string): TopologyData {
  return {
    nodes: [
      // 位置关系节点
      { id: 'room-1', name: '北京机房', type: 'room' },
      { id: 'rack-1', name: '机柜A', type: 'rack' },
      { id: 'rack-2', name: '机柜B', type: 'rack' },
      { id: 'host_phy-1', name: 'host_phy-01', type: 'host_phy' },
      { id: 'host_phy-2', name: 'host_phy-02', type: 'host_phy' },
      { id: 'host_phy-3', name: 'host_phy-03', type: 'host_phy' },
      { id: 'net_switch-1', name: '核心交换机', type: 'net_switch' },
      { id: 'net_router-1', name: '核心路由器', type: 'net_router' },
      // 部署关系节点
      { id: 'software-1', name: 'MySQL', type: 'software' },
      { id: 'software-2', name: 'Redis', type: 'software' },
      { id: 'software-3', name: 'Nginx', type: 'software' },
      { id: 'software-4', name: 'Tomcat', type: 'software' },
    ],
    edges: [
      // 位置关系
      { id: 'edge-1', source: 'room-1', target: 'rack-1', type: 'location' },
      { id: 'edge-2', source: 'room-1', target: 'rack-2', type: 'location' },
      { id: 'edge-3', source: 'rack-1', target: 'host_phy-1', type: 'location' },
      { id: 'edge-4', source: 'rack-1', target: 'host_phy-2', type: 'location' },
      { id: 'edge-5', source: 'rack-2', target: 'host_phy-3', type: 'location' },
      { id: 'edge-6', source: 'rack-1', target: 'net_switch-1', type: 'location' },
      { id: 'edge-7', source: 'rack-1', target: 'net_router-1', type: 'location' },
      // 部署关系
      { id: 'edge-8', source: 'host_phy-1', target: 'software-1', type: 'deployment' },
      { id: 'edge-9', source: 'host_phy-1', target: 'software-2', type: 'deployment' },
      { id: 'edge-10', source: 'host_phy-2', target: 'software-3', type: 'deployment' },
      { id: 'edge-11', source: 'host_phy-2', target: 'software-4', type: 'deployment' },
      { id: 'edge-12', source: 'host_phy-3', target: 'software-1', type: 'deployment' },
    ],
  };
}
