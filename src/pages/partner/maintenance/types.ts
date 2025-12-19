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

export type MaintenanceType = '硬件维保' | '软件维保' | '综合维保' | '应急响应';

export interface Maintenance {
  id: number;
  name: string; // 单位名称
  contact: string; // 联系人
  phone: string; // 联系电话
  email?: string; // 联系邮箱
  address?: string; // 地址
  type: MaintenanceType; // 维保类型
  cooperationDate: string; // 合作日期 (YYYY-MM-DD)
  duration: number; // 维保时长（月）
  createdAt: string;
  updatedAt: string;
}

export interface GetMaintenanceParams {
  page?: number; // 页码，默认 1
  pageSize?: number; // 每页数量，默认 20
  keyword?: string; // 搜索关键词
  type?: MaintenanceType; // 维保类型筛选
  startDate?: string; // 合作日期开始（YYYY-MM-DD）
  endDate?: string; // 合作日期结束（YYYY-MM-DD）
}

export interface GetMaintenanceResponse {
  list: Maintenance[];
  total: number;
  page: number;
  pageSize: number;
}

