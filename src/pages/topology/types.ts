/*
 * 网络拓扑管理 - 类型定义
 */

// 拓扑视图
export interface TopologyView {
  id: number;
  name: string;
  type: 'room' | 'rack' | 'cross-room' | 'business';
  roomId?: number;
  rackId?: number;
  config: {
    canvasScale: number;
    canvasX: number;
    canvasY: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 拓扑节点
export interface TopologyNode {
  id: string;
  viewId: number;
  assetId: number; // CMDB资产ID
  name: string;
  deviceType: string;
  deviceIcon: string;
  ip: string;
  roomId?: number;
  roomName?: string;
  rackId?: number;
  rackName?: string;
  position: {
    x: number;
    y: number;
  };
  width?: number; // 节点宽度（用于机房等可调整大小的节点）
  height?: number; // 节点高度（用于机房等可调整大小的节点）
  status: 'online' | 'offline' | 'unknown';
  alarmCount: number;
  selectedPorts?: string[]; // 选中的端口编号列表，用于连线
  createdAt: string;
  updatedAt: string;
}

// 连接关系
export interface TopologyConnection {
  id: string;
  viewId: number;
  sourceNodeId: string;
  sourcePort: string; // 端口编号
  sourcePortIfIn: number; // 端口入流量 单位：Mbps
  sourcePortIfOut: number; // 端口出流量 单位：Mbps
  targetNodeId: string;
  targetPort: string; // 端口编号
  targetPortIfIn: number; // 端口入流量 单位：Mbps
  targetPortIfOut: number; // 端口出流量 单位：Mbps
  status: 'up' | 'down' | 'unknown';
  createdAt: string;
  updatedAt: string;
}

// 已监控资产设备
export interface MonitoredAsset {
  id: number;
  name: string;
  ip: string;
  deviceType: string;
  gid: number; // 资产模型ID
  roomId?: number;
  roomName?: string;
  rackId?: number;
  rackName?: string;
  status: 'online' | 'offline' | 'unknown';
}

// 端口信息
export interface Port {
  portNumber: string; // 端口编号
  portName: string; // 端口名称
  status: 'up' | 'down' | 'unknown';
}

// 设备状态
export interface DeviceStatus {
  assetId: number;
  status: 'online' | 'offline' | 'unknown';
  lastUpdateTime: string;
}

// 端口状态
export interface PortStatus {
  assetId: number;
  ports: {
    [portNumber: string]: 'up' | 'down' | 'unknown';
  };
  lastUpdateTime: string;
}

// 连接状态
export interface ConnectionStatus {
  connectionId: string;
  status: 'up' | 'down' | 'unknown';
  lastUpdateTime: string;
}

// API 请求参数类型
export interface ViewListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
}

export interface ViewListResponse {
  list: TopologyView[];
  total: number;
}

export interface ViewCreateData {
  name: string;
  type: string;
  roomId?: number;
  rackId?: number;
  config?: {
    canvasScale: number;
    canvasX: number;
    canvasY: number;
  };
}

export interface ViewUpdateData extends ViewCreateData {}

export interface NodeCreateData {
  assetId: number;
  deviceIcon?: string;
  deviceType?: string;
  position: {
    x: number;
    y: number;
  };
  selectedPorts?: string[]; // 选中的端口编号列表，用于连线
  name?: string; // 节点名称（用于机房等特殊节点）
  width?: number; // 节点宽度（用于机房等可调整大小的节点）
  height?: number; // 节点高度（用于机房等可调整大小的节点）
}

export interface NodeUpdateData {
  name?: string;
  position?: {
    x: number;
    y: number;
  };
  width?: number; // 节点宽度（用于机房等可调整大小的节点）
  height?: number; // 节点高度（用于机房等可调整大小的节点）
}

export interface ConnectionCreateData {
  sourceNodeId: string;
  sourcePort: string;
  targetNodeId: string;
  targetPort: string;
}

export interface ConnectionUpdateData {
  sourcePort?: string;
  targetPort?: string;
}

export interface AssetListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  roomId?: number;
  rackId?: number;
  deviceType?: string;
  status?: string;
}

export interface MonitoredAssetListResponse {
  list: MonitoredAsset[];
  total: number;
}

export interface PositionUpdate {
  nodeId: string;
  x: number;
  y: number;
}
