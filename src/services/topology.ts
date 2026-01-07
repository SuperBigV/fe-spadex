/*
 * 网络拓扑管理 - API 服务
 */

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import {
  TopologyView,
  TopologyNode,
  TopologyConnection,
  MonitoredAsset,
  Port,
  DeviceStatus,
  PortStatus,
  ConnectionStatus,
  ViewListParams,
  ViewListResponse,
  ViewCreateData,
  ViewUpdateData,
  NodeCreateData,
  NodeUpdateData,
  ConnectionCreateData,
  ConnectionUpdateData,
  AssetListParams,
  MonitoredAssetListResponse,
  PositionUpdate,
  SetNodeParentData,
  BatchSetNodeParentData,
} from '@/pages/topology/types';

// ==================== 拓扑视图相关API ====================

/**
 * 获取拓扑视图列表
 * GET /cmdb/topology/views
 */
export function getTopologyViews(params: ViewListParams = {}): Promise<ViewListResponse> {
  return request('/cmdb/topology/views', {
    method: RequestMethod.Get,
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      keyword: params.keyword,
      type: params.type,
    },
  }).then((res) => {
    if (res.dat) {
      return res.dat;
    }
    throw new Error(res.err || '获取拓扑视图列表失败');
  });
}

/**
 * 获取拓扑视图详情
 * GET /cmdb/topology/views/:viewId
 */
export function getTopologyView(viewId: number): Promise<TopologyView> {
  return request(`/cmdb/topology/views/${viewId}`, {
    method: RequestMethod.Get,
  }).then((res) => {
    if (res.dat) {
      // 转换后端返回的数据格式
      const view = res.dat;
      return {
        ...view,
        config: view.config || { canvasScale: 1, canvasX: 0, canvasY: 0 },
      };
    }
    throw new Error(res.err || '获取拓扑视图详情失败');
  });
}

/**
 * 创建拓扑视图
 * POST /cmdb/topology/views
 */
export function createTopologyView(data: ViewCreateData): Promise<TopologyView> {
  return request('/cmdb/topology/views', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    if (res.dat) {
      const view = res.dat;
      return {
        ...view,
        config: view.config || { canvasScale: 1, canvasX: 0, canvasY: 0 },
      };
    }
    throw new Error(res.err || '创建拓扑视图失败');
  });
}

/**
 * 更新拓扑视图
 * PUT /cmdb/topology/views/:viewId
 */
export function updateTopologyView(viewId: number, data: ViewUpdateData): Promise<void> {
  return request(`/cmdb/topology/views/${viewId}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => {
    if (res.dat === 'ok' || res.err === '') {
      return;
    }
    throw new Error(res.err || '更新拓扑视图失败');
  });
}

/**
 * 删除拓扑视图
 * DELETE /cmdb/topology/views/:viewId
 */
export function deleteTopologyView(viewId: number): Promise<void> {
  return request(`/cmdb/topology/views/${viewId}`, {
    method: RequestMethod.Delete,
  }).then((res) => {
    if (res.dat === 'ok' || res.err === '') {
      return;
    }
    throw new Error(res.err || '删除拓扑视图失败');
  });
}

// ==================== 拓扑节点相关API ====================

/**
 * 获取拓扑节点列表
 * GET /cmdb/topology/views/:viewId/nodes
 */
export function getTopologyNodes(viewId: number): Promise<TopologyNode[]> {
  return request(`/cmdb/topology/views/${viewId}/nodes`, {
    method: RequestMethod.Get,
  }).then((res) => {
    if (res.dat) {
      // 转换后端返回的数据格式：positionX/positionY -> position
      return res.dat.map((node: any) => ({
        ...node,
        position: node.position || (node.positionX !== undefined && node.positionY !== undefined ? { x: node.positionX, y: node.positionY } : { x: 0, y: 0 }),
        status: node.status || 'unknown',
        alarmCount: node.alarmCount || 0,
        parentNodeId: node.parentNodeId || undefined, // 支持 parentNodeId
      }));
    }
    throw new Error(res.err || '获取拓扑节点列表失败');
  });
}

/**
 * 添加拓扑节点
 * POST /cmdb/topology/views/:viewId/nodes
 */
export function addTopologyNode(viewId: number, data: NodeCreateData): Promise<TopologyNode> {
  // 转换数据格式：position -> positionX/positionY（如果后端需要）
  const requestData: any = {
    assetId: data.assetId,
    position: data.position,
    deviceType: data.deviceType,
    deviceIcon: data.deviceIcon,
  };

  // 如果是机房节点，添加特殊字段
  if (data.assetId === 0 && data.deviceType === 'topology_room') {
    requestData.deviceType = data.deviceType;
    requestData.name = data.name || '机房';
    requestData.width = data.width;
    requestData.height = data.height;
  }

  if (data.selectedPorts) {
    requestData.selectedPorts = data.selectedPorts;
  }

  // 支持 parentNodeId
  if (data.parentNodeId !== undefined) {
    requestData.parentNodeId = data.parentNodeId;
  }

  return request(`/cmdb/topology/views/${viewId}/nodes`, {
    method: RequestMethod.Post,
    data: requestData,
  }).then((res) => {
    if (res.dat) {
      const node = res.dat;
      return {
        ...node,
        position: node.position || (node.positionX !== undefined && node.positionY !== undefined ? { x: node.positionX, y: node.positionY } : { x: 0, y: 0 }),
        status: node.status || 'unknown',
        alarmCount: node.alarmCount || 0,
        parentNodeId: node.parentNodeId || undefined,
      };
    }
    throw new Error(res.err || '添加拓扑节点失败');
  });
}

/**
 * 更新拓扑节点
 * PUT /cmdb/topology/nodes/:nodeId
 */
export function updateTopologyNode(nodeId: string, data: NodeUpdateData): Promise<void> {
  const requestData: any = {};

  if (data.name !== undefined) {
    requestData.name = data.name;
  }

  if (data.position !== undefined) {
    requestData.position = data.position;
  }

  // 支持更新 width 和 height（用于机房节点）
  if ((data as any).width !== undefined) {
    requestData.width = (data as any).width;
  }
  if ((data as any).height !== undefined) {
    requestData.height = (data as any).height;
  }

  // 支持更新 parentNodeId
  if (data.parentNodeId !== undefined) {
    requestData.parentNodeId = data.parentNodeId;
  }

  return request(`/cmdb/topology/nodes/${nodeId}`, {
    method: RequestMethod.Put,
    data: requestData,
  }).then((res) => {
    if (res.dat === 'ok' || res.err === '') {
      return;
    }
    throw new Error(res.err || '更新拓扑节点失败');
  });
}

/**
 * 更新节点位置（批量）
 * PUT /cmdb/topology/views/:viewId/nodes/positions
 */
export function updateNodePositions(viewId: number, positions: PositionUpdate[]): Promise<void> {
  return request(`/cmdb/topology/views/${viewId}/nodes/positions`, {
    method: RequestMethod.Put,
    data: {
      positions: positions.map((pos) => ({
        nodeId: pos.nodeId,
        x: pos.x,
        y: pos.y,
        parentNodeId: pos.parentNodeId, // 支持 parentNodeId
      })),
    },
  }).then((res) => {
    if (res.dat === 'ok' || res.err === '') {
      return;
    }
    throw new Error(res.err || '更新节点位置失败');
  });
}

/**
 * 删除拓扑节点
 * DELETE /cmdb/topology/nodes/:nodeId
 */
export function deleteTopologyNode(nodeId: string): Promise<void> {
  return request(`/cmdb/topology/nodes/${nodeId}`, {
    method: RequestMethod.Delete,
  }).then((res) => {
    if (res.dat === 'ok' || res.err === '') {
      return;
    }
    throw new Error(res.err || '删除拓扑节点失败');
  });
}

// ==================== 连接关系相关API ====================

/**
 * 获取连接关系列表
 * GET /cmdb/topology/views/:viewId/connections
 */
export function getTopologyConnections(viewId: number): Promise<TopologyConnection[]> {
  return request(`/cmdb/topology/views/${viewId}/connections`, {
    method: RequestMethod.Get,
  }).then((res) => {
    if (res.dat) {
      return res.dat.map((conn: any) => ({
        ...conn,
        status: conn.status || 'unknown',
      }));
    }
    throw new Error(res.err || '获取连接关系列表失败');
  });
}

/**
 * 添加连接关系
 * POST /cmdb/topology/views/:viewId/connections
 */
export function addTopologyConnection(viewId: number, data: ConnectionCreateData): Promise<TopologyConnection> {
  return request(`/cmdb/topology/views/${viewId}/connections`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    if (res.dat) {
      return {
        ...res.dat,
        status: res.dat.status || 'unknown',
      };
    }
    throw new Error(res.err || '添加连接关系失败');
  });
}

/**
 * 更新连接关系
 * PUT /cmdb/topology/connections/:connectionId
 */
export function updateTopologyConnection(connectionId: string, data: ConnectionUpdateData): Promise<void> {
  return request(`/cmdb/topology/connections/${connectionId}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => {
    if (res.dat === 'ok' || res.err === '') {
      return;
    }
    throw new Error(res.err || '更新连接关系失败');
  });
}

/**
 * 删除连接关系
 * DELETE /cmdb/topology/connections/:connectionId
 */
export function deleteTopologyConnection(connectionId: string): Promise<void> {
  return request(`/cmdb/topology/connections/${connectionId}`, {
    method: RequestMethod.Delete,
  }).then((res) => {
    if (res.dat === 'ok' || res.err === '') {
      return;
    }
    throw new Error(res.err || '删除连接关系失败');
  });
}

// ==================== 已监控资产设备相关API ====================

/**
 * 获取已监控资产设备列表
 * GET /cmdb/topology/assets/monitored
 */
export function getMonitoredAssets(params: AssetListParams = {}): Promise<MonitoredAssetListResponse> {
  return request('/cmdb/topology/assets/monitored', {
    method: RequestMethod.Get,
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      keyword: params.keyword,
      deviceType: params.deviceType,
      roomId: params.roomId,
      rackId: params.rackId,
      status: params.status,
    },
  }).then((res) => {
    if (res.dat) {
      return res.dat;
    }
    throw new Error(res.err || '获取已监控资产设备列表失败');
  });
}

/**
 * 获取设备端口信息
 * GET /cmdb/topology/devices/:assetId/ports
 */
export function getAssetPorts(assetId: number): Promise<Port[]> {
  return request(`/cmdb/topology/devices/${assetId}/ports`, {
    method: RequestMethod.Get,
  }).then((res) => {
    if (res.dat) {
      return res.dat;
    }
    throw new Error(res.err || '获取设备端口信息失败');
  });
}

// ==================== 状态监控相关API ====================

/**
 * 获取设备状态（批量）
 * POST /cmdb/topology/devices/status
 */
export function getDeviceStatus(assetIds: number[]): Promise<{ [assetId: number]: DeviceStatus }> {
  return request('/cmdb/topology/devices/status', {
    method: RequestMethod.Post,
    data: {
      assetIds,
    },
  }).then((res) => {
    if (res.dat) {
      return res.dat;
    }
    throw new Error(res.err || '获取设备状态失败');
  });
}

/**
 * 获取端口状态
 * GET /cmdb/topology/devices/:assetId/ports/status
 */
export function getPortStatus(assetId: number): Promise<PortStatus> {
  return request(`/cmdb/topology/devices/${assetId}/ports/status`, {
    method: RequestMethod.Get,
  }).then((res) => {
    if (res.dat) {
      return res.dat;
    }
    throw new Error(res.err || '获取端口状态失败');
  });
}

/**
 * 获取连接状态（批量）
 * POST /cmdb/topology/connections/status
 */
export function getConnectionStatus(connectionIds: string[]): Promise<{ [connectionId: string]: ConnectionStatus }> {
  return request('/cmdb/topology/connections/status', {
    method: RequestMethod.Post,
    data: {
      connectionIds,
    },
  }).then((res) => {
    if (res.dat) {
      return res.dat;
    }
    throw new Error(res.err || '获取连接状态失败');
  });
}

// ==================== Sub-Flows 相关API ====================

/**
 * 设置节点父子关系
 * POST /cmdb/topology/nodes/:nodeId/parent
 */
export function setNodeParent(nodeId: string, data: SetNodeParentData): Promise<void> {
  return request(`/cmdb/topology/nodes/${nodeId}/parent`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    if (res.dat === 'ok' || res.err === '') {
      return;
    }
    throw new Error(res.err || '设置节点父子关系失败');
  });
}

/**
 * 批量设置节点父子关系
 * POST /cmdb/topology/views/:viewId/nodes/parents
 */
export function batchSetNodeParents(viewId: number, data: BatchSetNodeParentData): Promise<void> {
  return request(`/cmdb/topology/views/${viewId}/nodes/parents`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    if (res.dat === 'ok' || res.err === '') {
      return;
    }
    throw new Error(res.err || '批量设置节点父子关系失败');
  });
}

/**
 * 获取节点的子节点列表
 * GET /cmdb/topology/nodes/:nodeId/children
 */
export function getNodeChildren(nodeId: string): Promise<TopologyNode[]> {
  return request(`/cmdb/topology/nodes/${nodeId}/children`, {
    method: RequestMethod.Get,
  }).then((res) => {
    if (res.dat) {
      return res.dat.map((node: any) => ({
        ...node,
        position: node.position || (node.positionX !== undefined && node.positionY !== undefined ? { x: node.positionX, y: node.positionY } : { x: 0, y: 0 }),
        status: node.status || 'unknown',
        alarmCount: node.alarmCount || 0,
        parentNodeId: node.parentNodeId || undefined,
      }));
    }
    throw new Error(res.err || '获取子节点列表失败');
  });
}
