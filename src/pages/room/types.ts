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

// 机房状态
export type RoomStatus = 'active' | 'inactive' | 'maintenance';

// 机房类型
export type RoomType = '自建' | '租赁' | '托管';

// 机房等级
export type RoomLevel = 'T1' | 'T2' | 'T3' | 'T4';

// 机柜状态
export type RackStatus = 'active' | 'inactive' | 'maintenance';

// 设备状态
export type DeviceStatus = 'online' | 'offline' | 'maintenance';

// 机房
export interface Room {
  id: number;
  name: string;
  code: string;
  address?: string;
  area?: number;
  type?: RoomType;
  level?: RoomLevel;
  status: RoomStatus;
  contact?: string;
  contactPhone?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  // 关联数据
  rackCount?: number;
  deviceCount?: number;
  uUsageRate?: number;
  powerUsageRate?: number;
}

// 机柜
export interface Rack {
  id: number;
  roomId?: number;
  name: string;
  code: string;
  positionX?: number;
  positionY?: number;
  rotation?: number;
  totalU: number;
  usedU?: number;
  powerCapacity?: number;
  powerUsed?: number;
  networkPorts?: number;
  networkPortsUsed?: number;
  status: RackStatus;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  // 关联数据
  roomName?: string;
  deviceCount?: number;
}

// 机柜设备
export interface RackDevice {
  id: number;
  rackId: number;
  deviceId: number;
  deviceName: string;
  startU: number;
  heightU: number;
  deviceType?: string;
  status: DeviceStatus;
  installDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 机房布局
export interface RoomLayout {
  id: number;
  roomId: number;
  canvasScale: number;
  canvasX: number;
  canvasY: number;
  rackLayouts: RackLayoutItem[];
  updatedAt?: string;
}

// 机柜布局项
export interface RackLayoutItem {
  rackId: number;
  x: number;
  y: number;
  rotation: number;
}

// 机房统计
export interface RoomStatistics {
  rackTotal: number;
  rackUsed: number;
  rackAvailable: number;
  deviceTotal: number;
  uTotal: number;
  uUsed: number;
  uUsageRate: number;
  powerTotal: number;
  powerUsed: number;
  powerUsageRate: number;
  alarmCount?: number;
}

// 机柜统计
export interface RackStatistics {
  deviceCount: number;
  uUsed: number;
  uAvailable: number;
  uUsageRate: number;
  powerUsed: number;
  powerAvailable: number;
  powerUsageRate: number;
  networkPortsUsed: number;
  networkPortsAvailable: number;
}

// CMDB 设备资产
export interface CMDBAsset {
  id: number;
  gid: number;
  status: string;
  tags?: string[];
  tags_maps?: Record<string, string>;
  data: {
    name: string;
    ip?: string;
    category?: string;
    belong_room?: number;
    belong_rack?: number;
    model?: number;
    manufacturer?: string;
    model_name?: string;
    spec?: any;
  };
  asset_type?: string;
  belong_room?: string;
  belong_rack?: string;
  create_at?: number;
  update_at?: number;
}

// 列表查询参数
export interface RoomListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: RoomStatus;
  type?: RoomType;
  level?: RoomLevel;
}

export interface RackListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: RackStatus;
  roomId?: number;
  uUsageRate?: string; // <50, 50-80, 80-95, >95
  powerUsageRate?: string;
}

export interface CMDBDeviceListParams {
  gids?: number[];
  query?: string;
  limit?: number;
  offset?: number;
  order?: string;
  desc?: boolean;
}

// 列表响应
export interface RoomListResponse {
  list: Room[];
  total: number;
}

export interface RackListResponse {
  list: Rack[];
  total: number;
}

export interface CMDBDeviceListResponse {
  list: CMDBAsset[];
  total: number;
}

// 创建/更新数据
export interface RoomCreateData {
  name: string;
  code: string;
  address?: string;
  area?: number;
  type?: RoomType;
  level?: RoomLevel;
  status: RoomStatus;
  contact?: string;
  contactPhone?: string;
  description?: string;
}

export interface RoomUpdateData extends RoomCreateData {}

export interface RackCreateData {
  name: string;
  code: string;
  roomId?: number;
  totalU: number;
  powerCapacity?: number;
  networkPorts?: number;
  status: RackStatus;
  description?: string;
  positionX?: number;
  positionY?: number;
  rotation?: number;
}

export interface RackUpdateData extends RackCreateData {}

export interface DeviceAddData {
  deviceId: number;
  startU: number;
  heightU: number;
}

export interface DevicePositionData {
  startU: number;
  heightU: number;
}

export interface UPositionCheckData {
  startU: number;
  heightU: number;
  excludeDeviceId?: number;
}

export interface UPositionCheckResult {
  available: boolean;
  conflicts: RackDevice[];
}

export interface RoomLayoutData {
  canvasScale: number;
  canvasX: number;
  canvasY: number;
  rackLayouts: RackLayoutItem[];
}

