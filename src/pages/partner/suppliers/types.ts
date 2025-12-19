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

export type SupplierType = '设备供应商' | '服务供应商' | '综合供应商';

export interface Supplier {
  id: number;
  name: string; // 供应商名称
  contact: string; // 联系人
  phone: string; // 联系电话
  email?: string; // 联系邮箱
  address?: string; // 地址
  type: SupplierType; // 供应商类型
  cooperation_date: string; // 合作日期 (YYYY-MM-DD)
  remark?: string; // 备注
  createdAt: string;
  updatedAt: string;
}

export interface GetSuppliersParams {
  page?: number; // 页码，默认 1
  pageSize?: number; // 每页数量，默认 20
  keyword?: string; // 搜索关键词
  type?: SupplierType; // 供应商类型筛选
  startDate?: string; // 合作日期开始（YYYY-MM-DD）
  endDate?: string; // 合作日期结束（YYYY-MM-DD）
}

export interface GetSuppliersResponse {
  list: Supplier[];
  total: number;
  page: number;
  pageSize: number;
}
