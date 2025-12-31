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

import { Room, RoomStatistics, Rack } from '@/pages/room/types';

// 设备使用率
export interface DeviceUsage {
  deviceId: number;
  deviceName: string;
  deviceType: string;
  cpuUsage: number; // CPU使用率（%）
  memoryUsage: number; // 内存使用率（%）
}

// 设备类型统计
export interface DeviceTypeStatistics {
  deviceType: string;
  deviceTypeName: string;
  count: number;
  percentage: number;
}

// 环境监控数据
export interface EnvironmentData {
  timestamp: string;
  temperature: number; // 温度（℃）
  humidity: number; // 湿度（%）
}

// 环境监控响应
export interface EnvironmentDataResponse {
  list: EnvironmentData[];
  current: {
    temperature: number;
    humidity: number;
    timestamp: string;
  };
}

// 告警数据
export interface Alarm {
  id: number;
  title: string;
  level: 'critical' | 'warning' | 'info';
  source: string;
  rackId?: number;
  rackName?: string;
  deviceId?: number;
  deviceName?: string;
  message: string;
  triggerTime: string;
  status: 'active' | 'resolved';
}

// 告警响应
export interface AlarmResponse {
  list: Alarm[];
  total: number;
}

// 设备类型统计响应
export interface DeviceTypeStatisticsResponse {
  list: DeviceTypeStatistics[];
  total: number;
}

// 大屏数据状态
export interface DashboardData {
  currentRoomId: number | null;
  roomList: Room[];
  statistics: RoomStatistics | null;
  rackList: Rack[];
  deviceUsageList: DeviceUsage[];
  deviceTypeStatistics: DeviceTypeStatistics[];
  environmentData: EnvironmentData[];
  currentEnvironment: EnvironmentData | null;
  alarmList: Alarm[];
  totalRooms: number;
}

