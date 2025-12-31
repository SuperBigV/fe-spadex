/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import _ from 'lodash';
import request from '@/utils/request';
import {
  Room,
  Rack,
  RackDevice,
  RoomLayout,
  CMDBAsset,
  RoomStatistics,
  RackStatistics,
  RoomListParams,
  RackListParams,
  CMDBDeviceListParams,
  RoomListResponse,
  RackListResponse,
  CMDBDeviceListResponse,
  RoomCreateData,
  RoomUpdateData,
  RackCreateData,
  RackUpdateData,
  DeviceAddData,
  DevicePositionData,
  UPositionCheckData,
  UPositionCheckResult,
  RoomLayoutData,
} from './types';
import { mockRooms, mockRacks, mockRackDevices, mockRoomLayouts, mockCMDBAssets, mockRoomStatistics, mockRackStatistics } from './mockData';

// API 前缀
const API_PREFIX = '/cmdb';

// 是否使用 mock 数据（开发阶段可切换）
const USE_MOCK = false;

// 模拟 API 延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 处理响应数据：从 dat 字段提取数据，检查错误
const handleResponse = <T>(response: any): T => {
  if (response.err && response.err !== '') {
    throw new Error(response.err);
  }
  return response.dat as T;
};

// 处理时间字段：如果是时间戳，转换为 ISO 字符串
const formatTime = (time: any): string | undefined => {
  if (!time) return undefined;
  if (typeof time === 'string') return time;
  if (typeof time === 'number') {
    // 时间戳（秒或毫秒）
    const timestamp = time < 10000000000 ? time * 1000 : time;
    return new Date(timestamp).toISOString();
  }
  return undefined;
};

// 机房相关 API
export const getRoomList = async (params: RoomListParams = {}): Promise<RoomListResponse> => {
  if (USE_MOCK) {
    await delay(300);
    let filtered = [...mockRooms];

    // 关键词搜索
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filtered = filtered.filter((room) => room.name.toLowerCase().includes(keyword) || room.code.toLowerCase().includes(keyword) || room.address?.toLowerCase().includes(keyword));
    }

    // 状态筛选
    if (params.status) {
      filtered = filtered.filter((room) => room.status === params.status);
    }

    // 类型筛选
    if (params.type) {
      filtered = filtered.filter((room) => room.type === params.type);
    }

    // 等级筛选
    if (params.level) {
      filtered = filtered.filter((room) => room.level === params.level);
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      list: filtered.slice(start, end),
      total: filtered.length,
    };
  }

  // 真实 API 调用
  const response = await request.get(`${API_PREFIX}/rooms`, { params });
  const data = handleResponse<RoomListResponse>(response);

  // 处理时间字段
  if (data.list) {
    data.list = data.list.map((room) => ({
      ...room,
      createdAt: formatTime(room.createdAt),
      updatedAt: formatTime(room.updatedAt),
    }));
  }

  return data;
};

export const getRoomDetail = async (id: number): Promise<Room> => {
  if (USE_MOCK) {
    await delay(200);
    const room = mockRooms.find((r) => r.id === id);
    if (!room) {
      throw new Error('机房不存在');
    }
    return { ...room };
  }

  // 真实 API 调用
  const response = await request.get(`${API_PREFIX}/rooms/${id}`);
  const room = handleResponse<Room>(response);

  // 处理时间字段
  return {
    ...room,
    createdAt: formatTime(room.createdAt),
    updatedAt: formatTime(room.updatedAt),
  };
};

export const createRoom = async (data: RoomCreateData): Promise<Room> => {
  if (USE_MOCK) {
    await delay(500);
    const newRoom: Room = {
      id: mockRooms.length + 1,
      ...data,
      rackCount: 0,
      deviceCount: 0,
      uUsageRate: 0,
      powerUsageRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockRooms.push(newRoom);
    return { ...newRoom };
  }

  // 真实 API 调用
  const response = await request.post(`${API_PREFIX}/rooms`, { data });
  const room = handleResponse<Room>(response);

  // 处理时间字段
  return {
    ...room,
    createdAt: formatTime(room.createdAt),
    updatedAt: formatTime(room.updatedAt),
  };
};

export const updateRoom = async (id: number, data: RoomUpdateData): Promise<void> => {
  if (USE_MOCK) {
    await delay(500);
    const index = mockRooms.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('机房不存在');
    }
    mockRooms[index] = {
      ...mockRooms[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return;
  }

  // 真实 API 调用
  await request.put(`${API_PREFIX}/rooms/${id}`, { data });
};

export const deleteRoom = async (id: number): Promise<void> => {
  if (USE_MOCK) {
    await delay(500);
    const index = mockRooms.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('机房不存在');
    }
    mockRooms.splice(index, 1);
    return;
  }

  // 真实 API 调用
  await request.delete(`${API_PREFIX}/rooms/${id}`);
};

export const getRoomStatistics = async (id: number): Promise<RoomStatistics> => {
  if (USE_MOCK) {
    await delay(200);
    return (
      mockRoomStatistics[id] || {
        rackTotal: 0,
        rackUsed: 0,
        rackAvailable: 0,
        deviceTotal: 0,
        uTotal: 0,
        uUsed: 0,
        uUsageRate: 0,
        powerTotal: 0,
        powerUsed: 0,
        powerUsageRate: 0,
        alarmCount: 0,
      }
    );
  }

  // 真实 API 调用
  const response = await request.get(`${API_PREFIX}/rooms/${id}/statistics`);
  return handleResponse<RoomStatistics>(response);
};

export const updateRoomLayout = async (id: number, layout: RoomLayoutData): Promise<void> => {
  if (USE_MOCK) {
    await delay(500);
    mockRoomLayouts[id] = {
      id: mockRoomLayouts[id]?.id || id,
      roomId: id,
      ...layout,
      updatedAt: new Date().toISOString(),
    };
    return;
  }

  // 真实 API 调用：序列化 rackLayouts 为 JSON 字符串
  const payload = {
    ...layout,
    rackLayouts: layout.rackLayouts,
  };
  await request.put(`${API_PREFIX}/rooms/${id}/layout`, { data: payload });
};

export const getRoomLayout = async (id: number): Promise<RoomLayout | null> => {
  if (USE_MOCK) {
    await delay(200);
    return mockRoomLayouts[id] || null;
  }

  // 真实 API 调用：从机房详情中获取布局，或单独查询布局接口
  try {
    // 优先尝试单独布局接口
    const response = await request.get(`${API_PREFIX}/rooms/${id}/layout`);
    const layout = handleResponse<RoomLayout>(response);

    // 解析 rackLayouts JSON 字符串
    if (layout.rackLayouts && typeof layout.rackLayouts === 'string') {
      try {
        layout.rackLayouts = JSON.parse(layout.rackLayouts);
      } catch (e) {
        console.error('解析 rackLayouts 失败:', e);
        layout.rackLayouts = [];
      }
    }

    // 处理时间字段
    return {
      ...layout,
      updatedAt: formatTime(layout.updatedAt),
    };
  } catch (error: any) {
    // 如果布局接口不存在，尝试从机房详情获取
    if (error?.message?.includes('404') || error?.message?.includes('不存在')) {
      const room = await getRoomDetail(id);
      // 如果机房详情中包含 layout，返回它
      // 注意：这需要后端在机房详情中返回 layout 字段
      return null;
    }
    throw error;
  }
};

// 机柜相关 API
export const getRackList = async (params: RackListParams = {}): Promise<RackListResponse> => {
  if (USE_MOCK) {
    await delay(300);
    let filtered = [...mockRacks];

    // 关键词搜索
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filtered = filtered.filter(
        (rack) => rack.name.toLowerCase().includes(keyword) || rack.code.toLowerCase().includes(keyword) || rack.roomName?.toLowerCase().includes(keyword),
      );
    }

    // 状态筛选
    if (params.status) {
      filtered = filtered.filter((rack) => rack.status === params.status);
    }

    // 所属机房筛选
    if (params.roomId) {
      filtered = filtered.filter((rack) => rack.roomId === params.roomId);
    }

    // U位使用率筛选
    if (params.uUsageRate) {
      filtered = filtered.filter((rack) => {
        const rate = (rack.usedU || 0) / rack.totalU;
        switch (params.uUsageRate) {
          case '<50':
            return rate < 0.5;
          case '50-80':
            return rate >= 0.5 && rate < 0.8;
          case '80-95':
            return rate >= 0.8 && rate < 0.95;
          case '>95':
            return rate >= 0.95;
          default:
            return true;
        }
      });
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      list: filtered.slice(start, end),
      total: filtered.length,
    };
  }

  // 真实 API 调用
  const response = await request.get(`${API_PREFIX}/racks`, { params });
  const data = handleResponse<RackListResponse>(response);

  // 处理时间字段
  if (data.list) {
    data.list = data.list.map((rack) => ({
      ...rack,
      createdAt: formatTime(rack.createdAt),
      updatedAt: formatTime(rack.updatedAt),
    }));
  }
  return data;
};

export const getRackDetail = async (id: number): Promise<Rack> => {
  if (USE_MOCK) {
    await delay(200);
    const rack = mockRacks.find((r) => r.id === id);
    if (!rack) {
      throw new Error('机柜不存在');
    }
    return { ...rack };
  }

  // 真实 API 调用
  const response = await request.get(`${API_PREFIX}/racks/${id}`);
  const rack = handleResponse<Rack>(response);

  // 处理时间字段
  return {
    ...rack,
    createdAt: formatTime(rack.createdAt),
    updatedAt: formatTime(rack.updatedAt),
  };
};

export const createRack = async (data: RackCreateData): Promise<Rack> => {
  if (USE_MOCK) {
    await delay(500);
    const newRack: Rack = {
      id: mockRacks.length + 1,
      ...data,
      usedU: 0,
      powerUsed: 0,
      networkPortsUsed: 0,
      deviceCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (data.roomId) {
      const room = mockRooms.find((r) => r.id === data.roomId);
      if (room) {
        newRack.roomName = room.name;
      }
    }
    mockRacks.push(newRack);
    return { ...newRack };
  }

  // 真实 API 调用
  const response = await request.post(`${API_PREFIX}/racks`, { data });
  const rack = handleResponse<Rack>(response);

  // 处理时间字段
  return {
    ...rack,
    createdAt: formatTime(rack.createdAt),
    updatedAt: formatTime(rack.updatedAt),
  };
};

export const updateRack = async (id: number, data: RackUpdateData): Promise<void> => {
  if (USE_MOCK) {
    await delay(500);
    const index = mockRacks.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('机柜不存在');
    }
    const oldRack = mockRacks[index];
    mockRacks[index] = {
      ...oldRack,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    if (data.roomId !== oldRack.roomId) {
      const room = mockRooms.find((r) => r.id === data.roomId);
      if (room) {
        mockRacks[index].roomName = room.name;
      } else {
        mockRacks[index].roomName = undefined;
      }
    }
    return;
  }

  // 真实 API 调用
  await request.put(`${API_PREFIX}/racks/${id}`, { data });
};

export const deleteRack = async (id: number): Promise<void> => {
  if (USE_MOCK) {
    await delay(500);
    const index = mockRacks.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('机柜不存在');
    }
    // 检查是否有设备
    const hasDevices = mockRackDevices.some((d) => d.rackId === id);
    if (hasDevices) {
      throw new Error('机柜内存在设备，请先移除设备');
    }
    mockRacks.splice(index, 1);
    return;
  }

  // 真实 API 调用
  await request.delete(`${API_PREFIX}/racks/${id}`);
};

export const getRackStatistics = async (id: number): Promise<RackStatistics> => {
  if (USE_MOCK) {
    await delay(200);
    return (
      mockRackStatistics[id] || {
        deviceCount: 0,
        uUsed: 0,
        uAvailable: 0,
        uUsageRate: 0,
        powerUsed: 0,
        powerAvailable: 0,
        powerUsageRate: 0,
        networkPortsUsed: 0,
        networkPortsAvailable: 0,
      }
    );
  }

  // 真实 API 调用
  const response = await request.get(`${API_PREFIX}/racks/${id}/statistics`);
  return handleResponse<RackStatistics>(response);
};

export const batchAddRacksToRoom = async (roomId: number, rackIds: number[]): Promise<void> => {
  if (USE_MOCK) {
    await delay(500);
    const room = mockRooms.find((r) => r.id === roomId);
    if (!room) {
      throw new Error('机房不存在');
    }
    rackIds.forEach((rackId) => {
      const rack = mockRacks.find((r) => r.id === rackId);
      if (rack) {
        rack.roomId = roomId;
        rack.roomName = room.name;
      }
    });
    return;
  }

  // 真实 API 调用
  await request.post(`${API_PREFIX}/rooms/${roomId}/racks/batch`, {
    data: { rackIds },
  });
};

// 设备相关 API
export const getRackDevices = async (rackId: number): Promise<RackDevice[]> => {
  if (USE_MOCK) {
    await delay(200);
    return mockRackDevices.filter((d) => d.rackId === rackId);
  }

  // 真实 API 调用：优先尝试单独设备列表接口
  try {
    const response = await request.get(`${API_PREFIX}/racks/${rackId}/devices`);
    // const devices = handleResponse<RackDevice[]>(response);

    // 处理时间字段
    return response.dat.list.map((device) => ({
      ...device,
      installDate: formatTime(device.installDate),
      createdAt: formatTime(device.createdAt),
      updatedAt: formatTime(device.updatedAt),
    }));
  } catch (error: any) {
    // 如果设备列表接口不存在，从机柜详情中获取
    if (error?.message?.includes('404') || error?.message?.includes('不存在')) {
      const rack = await getRackDetail(rackId);
      // 注意：这需要后端在机柜详情中返回 devices 字段
      return [];
    }
    throw error;
  }
};

export const addDeviceToRack = async (rackId: number, data: DeviceAddData): Promise<RackDevice> => {
  if (USE_MOCK) {
    await delay(500);
    const rack = mockRacks.find((r) => r.id === rackId);
    if (!rack) {
      throw new Error('机柜不存在');
    }

    // 检查U位冲突
    const conflicts = mockRackDevices.filter((d) => {
      if (d.rackId !== rackId) return false;
      const deviceEndU = d.startU + d.heightU - 1;
      const newEndU = data.startU + data.heightU - 1;
      return !(newEndU < d.startU || data.startU > deviceEndU);
    });

    if (conflicts.length > 0) {
      throw new Error('U位冲突，请选择其他位置');
    }

    const cmdbAsset = mockCMDBAssets.find((a) => a.id === data.deviceId);
    const newDevice: RackDevice = {
      id: mockRackDevices.length + 1,
      rackId,
      deviceId: data.deviceId,
      deviceName: cmdbAsset?.data.name || `设备-${data.deviceId}`,
      startU: data.startU,
      heightU: data.heightU,
      deviceType: cmdbAsset?.asset_type || 'server',
      status: 'online',
      target_up: cmdbAsset?.target_up || 0,
      installDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockRackDevices.push(newDevice);

    // 更新机柜使用量
    rack.usedU = (rack.usedU || 0) + data.heightU;
    rack.deviceCount = (rack.deviceCount || 0) + 1;

    return { ...newDevice };
  }

  // 真实 API 调用
  const response = await request.post(`${API_PREFIX}/racks/${rackId}/devices`, { data });
  const device = handleResponse<RackDevice>(response);

  // 处理时间字段
  return {
    ...device,
    installDate: formatTime(device.installDate),
    createdAt: formatTime(device.createdAt),
    updatedAt: formatTime(device.updatedAt),
  };
};

export const updateDevicePosition = async (rackId: number, deviceId: number, data: DevicePositionData): Promise<void> => {
  if (USE_MOCK) {
    await delay(500);
    const device = mockRackDevices.find((d) => d.rackId === rackId && d.deviceId === deviceId);
    if (!device) {
      throw new Error('设备不存在');
    }

    // 检查U位冲突（排除当前设备）
    const conflicts = mockRackDevices.filter((d) => {
      if (d.rackId !== rackId || d.deviceId === deviceId) return false;
      const deviceEndU = d.startU + d.heightU - 1;
      const newEndU = data.startU + data.heightU - 1;
      return !(newEndU < d.startU || data.startU > deviceEndU);
    });

    if (conflicts.length > 0) {
      throw new Error('U位冲突，请选择其他位置');
    }

    device.startU = data.startU;
    device.heightU = data.heightU;
    device.updatedAt = new Date().toISOString();
    return;
  }

  // 真实 API 调用
  await request.put(`${API_PREFIX}/racks/devices/${rackId}/${deviceId}`, { data });
};

export const removeDeviceFromRack = async (rackId: number, deviceId: number): Promise<void> => {
  if (USE_MOCK) {
    await delay(500);
    const index = mockRackDevices.findIndex((d) => d.rackId === rackId && d.deviceId === deviceId);
    if (index === -1) {
      throw new Error('设备不存在');
    }
    const device = mockRackDevices[index];
    mockRackDevices.splice(index, 1);

    // 更新机柜使用量
    const rack = mockRacks.find((r) => r.id === rackId);
    if (rack) {
      rack.usedU = Math.max(0, (rack.usedU || 0) - device.heightU);
      rack.deviceCount = Math.max(0, (rack.deviceCount || 0) - 1);
    }
    return;
  }

  // 真实 API 调用
  await request.delete(`${API_PREFIX}/racks/devices/${rackId}/${deviceId}`);
};

export const checkUPosition = async (rackId: number, data: UPositionCheckData): Promise<UPositionCheckResult> => {
  if (USE_MOCK) {
    await delay(200);
    const conflicts = mockRackDevices.filter((d) => {
      if (d.rackId !== rackId) return false;
      if (data.excludeDeviceId && d.deviceId === data.excludeDeviceId) return false;
      const deviceEndU = d.startU + d.heightU - 1;
      const newEndU = data.startU + data.heightU - 1;
      return !(newEndU < d.startU || data.startU > deviceEndU);
    });

    return {
      available: conflicts.length === 0,
      conflicts,
    };
  }

  // 真实 API 调用
  const response = await request.post(`${API_PREFIX}/racks/${rackId}/check-u-position`, { data });
  return handleResponse<UPositionCheckResult>(response);
};

// CMDB 集成 API
export const getCMDBDevices = async (params: CMDBDeviceListParams = {}): Promise<CMDBDeviceListResponse> => {
  if (USE_MOCK) {
    await delay(300);
    let filtered = [...mockCMDBAssets];

    // 资产模型筛选
    if (params.gids && params.gids.length > 0) {
      filtered = filtered.filter((asset) => params.gids!.includes(asset.gid));
    }

    // 关键词搜索
    if (params.query) {
      const query = params.query.toLowerCase();
      filtered = filtered.filter(
        (asset) => asset.data.name.toLowerCase().includes(query) || asset.data.ip?.toLowerCase().includes(query) || asset.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    const limit = params.limit || 100;
    const offset = params.offset || 0;

    return {
      list: filtered.slice(offset, offset + limit),
      total: filtered.length,
    };
  }

  // 真实 API 调用
  // 修复 gids 参数：支持数组格式
  const requestParams: any = {
    query: params.query,
    limit: params.limit || 100,
    offset: params.offset || 0,
    order: params.order,
    desc: params.desc,
  };

  const response = await request.get(`${API_PREFIX}/assets/idc`, {});
  const data = handleResponse<CMDBDeviceListResponse>(response);

  // 注意：create_at 和 update_at 保持为 number 类型（时间戳），不转换
  // 如果需要显示，在组件层面转换

  return data;
};

export const getCMDBDeviceDetail = async (id: number): Promise<CMDBAsset> => {
  if (USE_MOCK) {
    await delay(200);
    const asset = mockCMDBAssets.find((a) => a.id === id);
    if (!asset) {
      throw new Error('设备不存在');
    }
    return { ...asset };
  }

  // 真实 API 调用
  const response = await request.get(`${API_PREFIX}/asset/${id}`);
  const asset = handleResponse<CMDBAsset>(response);

  // 注意：create_at 和 update_at 保持为 number 类型（时间戳），不转换
  // 如果需要显示，在组件层面转换

  return asset;
};
