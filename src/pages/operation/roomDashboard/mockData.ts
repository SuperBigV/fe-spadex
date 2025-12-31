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
import { DeviceUsage, DeviceTypeStatistics, EnvironmentData, EnvironmentDataResponse, Alarm, AlarmResponse, DeviceTypeStatisticsResponse } from './types';

// Mock 机房列表
export const mockRooms: Room[] = [
  {
    id: 1,
    name: '核心机房A',
    code: 'ROOM-A-001',
    address: '北京市朝阳区xxx',
    area: 500,
    type: '自建',
    level: 'T3',
    status: 'active',
    contact: '张三',
    contactPhone: '13800138000',
    description: '核心机房描述',
    rackCount: 50,
    deviceCount: 500,
    uUsageRate: 0.75,
    powerUsageRate: 0.65,
  },
  {
    id: 2,
    name: '核心机房B',
    code: 'ROOM-B-001',
    address: '北京市海淀区xxx',
    area: 300,
    type: '租赁',
    level: 'T2',
    status: 'active',
    contact: '李四',
    contactPhone: '13900139000',
    description: '核心机房B描述',
    rackCount: 30,
    deviceCount: 300,
    uUsageRate: 0.6,
    powerUsageRate: 0.5,
  },
  {
    id: 3,
    name: '备用机房',
    code: 'ROOM-C-001',
    address: '北京市丰台区xxx',
    area: 200,
    type: '托管',
    level: 'T2',
    status: 'maintenance',
    contact: '王五',
    contactPhone: '13700137000',
    description: '备用机房描述',
    rackCount: 20,
    deviceCount: 200,
    uUsageRate: 0.4,
    powerUsageRate: 0.35,
  },
];

// Mock 机柜列表（用于U数统计）
export const mockRacks: Rack[] = [
  {
    id: 1,
    roomId: 1,
    name: '机柜A01',
    code: 'RACK-A01',
    totalU: 42,
    usedU: 28,
    status: 'active',
    roomName: '核心机房A',
    deviceCount: 8,
  },
  {
    id: 2,
    roomId: 1,
    name: '机柜A02',
    code: 'RACK-A02',
    totalU: 42,
    usedU: 35,
    status: 'active',
    roomName: '核心机房A',
    deviceCount: 10,
  },
  {
    id: 3,
    roomId: 1,
    name: '机柜A03',
    code: 'RACK-A03',
    totalU: 42,
    usedU: 20,
    status: 'active',
    roomName: '核心机房A',
    deviceCount: 5,
  },
  {
    id: 4,
    roomId: 1,
    name: '机柜A04',
    code: 'RACK-A04',
    totalU: 45,
    usedU: 30,
    status: 'active',
    roomName: '核心机房A',
    deviceCount: 12,
  },
  {
    id: 5,
    roomId: 1,
    name: '机柜A05',
    code: 'RACK-A05',
    totalU: 42,
    usedU: 15,
    status: 'active',
    roomName: '核心机房A',
    deviceCount: 6,
  },
  {
    id: 6,
    roomId: 2,
    name: '机柜B01',
    code: 'RACK-B01',
    totalU: 42,
    usedU: 25,
    status: 'active',
    roomName: '核心机房B',
    deviceCount: 12,
  },
  {
    id: 7,
    roomId: 2,
    name: '机柜B02',
    code: 'RACK-B02',
    totalU: 42,
    usedU: 18,
    status: 'active',
    roomName: '核心机房B',
    deviceCount: 9,
  },
];

// Mock 机房统计
export const mockRoomStatistics: Record<number, RoomStatistics> = {
  1: {
    rackTotal: 50,
    rackUsed: 45,
    rackAvailable: 5,
    deviceTotal: 500,
    uTotal: 2100,
    uUsed: 1575,
    uUsageRate: 0.75,
    powerTotal: 500.0,
    powerUsed: 325.0,
    powerUsageRate: 0.65,
    alarmCount: 5,
  },
  2: {
    rackTotal: 30,
    rackUsed: 28,
    rackAvailable: 2,
    deviceTotal: 300,
    uTotal: 1260,
    uUsed: 756,
    uUsageRate: 0.6,
    powerTotal: 300.0,
    powerUsed: 165.0,
    powerUsageRate: 0.55,
    alarmCount: 2,
  },
};

// Mock 设备使用率数据
export const mockDeviceUsage: DeviceUsage[] = [
  {
    deviceId: 101,
    deviceName: '核心交换机-01',
    deviceType: 'switch',
    cpuUsage: 85.5,
    memoryUsage: 72.3,
  },
  {
    deviceId: 102,
    deviceName: '核心交换机-02',
    deviceType: 'switch',
    cpuUsage: 78.2,
    memoryUsage: 68.5,
  },
  {
    deviceId: 103,
    deviceName: '路由器-01',
    deviceType: 'router',
    cpuUsage: 65.8,
    memoryUsage: 55.2,
  },
  {
    deviceId: 104,
    deviceName: '防火墙-01',
    deviceType: 'firewall',
    cpuUsage: 45.3,
    memoryUsage: 38.7,
  },
  {
    deviceId: 105,
    deviceName: '服务器-201',
    deviceType: 'server',
    cpuUsage: 92.1,
    memoryUsage: 88.5,
  },
];

// Mock 设备类型统计
export const mockDeviceTypeStatistics: DeviceTypeStatisticsResponse = {
  list: [
    {
      deviceType: 'server',
      deviceTypeName: '服务器',
      count: 120,
      percentage: 0.6,
    },
    {
      deviceType: 'switch',
      deviceTypeName: '交换机',
      count: 40,
      percentage: 0.2,
    },
    {
      deviceType: 'router',
      deviceTypeName: '路由器',
      count: 20,
      percentage: 0.1,
    },
    {
      deviceType: 'firewall',
      deviceTypeName: '防火墙',
      count: 10,
      percentage: 0.05,
    },
    {
      deviceType: 'storage',
      deviceTypeName: '存储设备',
      count: 10,
      percentage: 0.05,
    },
  ],
  total: 200,
};

// Mock 环境监控数据（最近24小时，每小时一个数据点）
export const generateMockEnvironmentData = (): EnvironmentDataResponse => {
  const now = new Date();
  const list: EnvironmentData[] = [];

  // 生成最近24小时的数据
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    list.push({
      timestamp: timestamp.toISOString(),
      temperature: 20 + Math.sin((i / 24) * Math.PI * 2) * 5 + Math.random() * 2, // 20-27℃之间波动
      humidity: 40 + Math.cos((i / 24) * Math.PI * 2) * 10 + Math.random() * 5, // 40-60%之间波动
    });
  }

  return {
    list,
    current: {
      temperature: list[list.length - 1].temperature,
      humidity: list[list.length - 1].humidity,
      timestamp: list[list.length - 1].timestamp,
    },
  };
};

// Mock 告警数据
export const mockAlarms: AlarmResponse = {
  list: [
    {
      id: 1001,
      title: '机柜A01温度过高',
      level: 'critical',
      source: 'rack',
      rackId: 1,
      rackName: '机柜A01',
      message: '机柜A01温度达到35℃，超过阈值30℃',
      triggerTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'active',
    },
    {
      id: 1002,
      title: '设备CPU使用率过高',
      level: 'warning',
      source: 'device',
      rackId: 2,
      rackName: '机柜A02',
      deviceId: 105,
      deviceName: '服务器-201',
      message: '服务器-201 CPU使用率达到85%',
      triggerTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      status: 'active',
    },
    {
      id: 1003,
      title: '机柜A03功率使用率过高',
      level: 'warning',
      source: 'rack',
      rackId: 3,
      rackName: '机柜A03',
      message: '机柜A03功率使用率达到90%',
      triggerTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'active',
    },
    {
      id: 1004,
      title: '网络设备内存使用率过高',
      level: 'info',
      source: 'device',
      rackId: 1,
      rackName: '机柜A01',
      deviceId: 101,
      deviceName: '核心交换机-01',
      message: '核心交换机-01 内存使用率达到72%',
      triggerTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      status: 'active',
    },
    {
      id: 1005,
      title: '机柜A05U位使用率过高',
      level: 'warning',
      source: 'rack',
      rackId: 5,
      rackName: '机柜A05',
      message: '机柜A05 U位使用率达到95%',
      triggerTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'active',
    },
  ],
  total: 5,
};
