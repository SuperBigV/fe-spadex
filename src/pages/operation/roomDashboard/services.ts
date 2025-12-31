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
 */

import request from '@/utils/request';
import { Room, RoomStatistics, Rack, RoomListResponse, RackListResponse } from '@/pages/room/types';
import {
  DeviceUsage,
  DeviceTypeStatisticsResponse,
  EnvironmentDataResponse,
  AlarmResponse,
} from './types';
import {
  mockRooms,
  mockRacks,
  mockRoomStatistics,
  mockDeviceUsage,
  mockDeviceTypeStatistics,
  generateMockEnvironmentData,
  mockAlarms,
} from './mockData';

// API 前缀
const API_PREFIX = '/cmdb';

// Mock 开关，默认开启
const USE_MOCK = true;

// 模拟 API 延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 处理响应数据
const handleResponse = <T>(response: any): T => {
  if (response.err && response.err !== '') {
    throw new Error(response.err);
  }
  return response.dat as T;
};

// 机房列表
export const getRoomList = async (params?: any): Promise<RoomListResponse> => {
  if (USE_MOCK) {
    await delay(300);
    let filtered = [...mockRooms];

    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      filtered = filtered.filter(
        (room) =>
          room.name.toLowerCase().includes(keyword) ||
          room.code.toLowerCase().includes(keyword) ||
          room.address?.toLowerCase().includes(keyword),
      );
    }

    if (params?.status) {
      filtered = filtered.filter((room) => room.status === params.status);
    }

    return {
      list: filtered,
      total: filtered.length,
    };
  }

  const response = await request.get(`${API_PREFIX}/rooms`, { params });
  return handleResponse<RoomListResponse>(response);
};

// 机房统计
export const getRoomStatistics = async (roomId: number): Promise<RoomStatistics> => {
  if (USE_MOCK) {
    await delay(200);
    return (
      mockRoomStatistics[roomId] || {
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

  const response = await request.get(`${API_PREFIX}/rooms/${roomId}/statistics`);
  return handleResponse<RoomStatistics>(response);
};

// 机柜列表（用于U数统计）
export const getRackList = async (params?: any): Promise<RackListResponse> => {
  if (USE_MOCK) {
    await delay(300);
    let filtered = [...mockRacks];

    if (params?.roomId) {
      filtered = filtered.filter((rack) => rack.roomId === params.roomId);
    }

    return {
      list: filtered,
      total: filtered.length,
    };
  }

  const response = await request.get(`${API_PREFIX}/racks`, { params });
  return handleResponse<RackListResponse>(response);
};

// 设备使用率列表
export const getDeviceUsageList = async (roomId: number): Promise<DeviceUsage[]> => {
  if (USE_MOCK) {
    await delay(300);
    return mockDeviceUsage;
  }

  return [];
};

// 设备类型统计
export const getDeviceTypeStatistics = async (roomId: number): Promise<DeviceTypeStatisticsResponse> => {
  if (USE_MOCK) {
    await delay(300);
    return mockDeviceTypeStatistics;
  }

  const response = await request.get(`${API_PREFIX}/rooms/${roomId}/devices/type-statistics`);
  return handleResponse<DeviceTypeStatisticsResponse>(response);
};

// 环境监控数据
export const getEnvironmentData = async (
  roomId: number,
  params?: { startTime?: string; endTime?: string; interval?: string },
): Promise<EnvironmentDataResponse> => {
  if (USE_MOCK) {
    await delay(300);
    return generateMockEnvironmentData();
  }

  const response = await request.get(`${API_PREFIX}/rooms/${roomId}/environment`, { params });
  return handleResponse<EnvironmentDataResponse>(response);
};

// 告警列表
export const getAlarmList = async (roomId: number, params?: { limit?: number; level?: string }): Promise<AlarmResponse> => {
  if (USE_MOCK) {
    await delay(300);
    const filtered = {
      ...mockAlarms,
      list: mockAlarms.list.filter((alarm) => {
        const rack = mockRacks.find((r) => r.id === alarm.rackId);
        return rack?.roomId === roomId;
      }),
    };
    return filtered;
  }

  const response = await request.get(`${API_PREFIX}/rooms/${roomId}/alarms`, { params });
  return handleResponse<AlarmResponse>(response);
};
