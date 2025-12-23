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

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { Supplier, GetSuppliersParams, GetSuppliersResponse } from '@/pages/partner/suppliers/types';
import { Maintenance, GetMaintenanceParams, GetMaintenanceResponse } from '@/pages/partner/maintenance/types';

// ==================== 采购供应商接口 ====================

/**
 * 获取供应商列表
 */
export function getSuppliers(params: GetSuppliersParams) {
  return request(`/cmdb/partner/suppliers`, {
    method: RequestMethod.Get,
    params,
  });
}

/**
 * 获取供应商详情
 */
export function getSupplierById(id: number): Promise<Supplier> {
  return request(`/cmdb/partner/suppliers/${id}`, {
    method: RequestMethod.Get,
  });
}

/**
 * 创建供应商
 */
export function createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
  return request(`/cmdb/partner/suppliers`, {
    method: RequestMethod.Post,
    data,
  });
}

/**
 * 更新供应商
 */
export function updateSupplier(id: number, data: Partial<Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Supplier> {
  return request(`/cmdb/partner/suppliers/${id}`, {
    method: RequestMethod.Put,
    data,
  });
}

/**
 * 删除供应商
 */
export function deleteSupplier(id: number): Promise<void> {
  return request(`/cmdb/partner/suppliers/${id}`, {
    method: RequestMethod.Delete,
  });
}

/**
 * 批量删除供应商
 */
export function batchDeleteSuppliers(ids: number[]): Promise<void> {
  return request(`/cmdb/partner/suppliers/batch`, {
    method: RequestMethod.Delete,
    data: { ids },
  });
}

// ==================== 维保单位接口 ====================

/**
 * 获取维保单位列表
 */
export function getMaintenanceList(params: GetMaintenanceParams) {
  return request(`/cmdb/partner/maintenance`, {
    method: RequestMethod.Get,
    params,
  });
}

/**
 * 获取维保单位详情
 */
export function getMaintenanceById(id: number): Promise<Maintenance> {
  return request(`/cmdb/partner/maintenance/${id}`, {
    method: RequestMethod.Get,
  });
}

/**
 * 创建维保单位
 */
export function createMaintenance(data: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Maintenance> {
  return request(`/cmdb/partner/maintenance`, {
    method: RequestMethod.Post,
    data,
  });
}

/**
 * 更新维保单位
 */
export function updateMaintenance(id: number, data: Partial<Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Maintenance> {
  return request(`/cmdb/partner/maintenance/${id}`, {
    method: RequestMethod.Put,
    data,
  });
}

/**
 * 删除维保单位
 */
export function deleteMaintenance(id: number): Promise<void> {
  return request(`/cmdb/partner/maintenance/${id}`, {
    method: RequestMethod.Delete,
  });
}

/**
 * 批量删除维保单位
 */
export function batchDeleteMaintenance(ids: number[]): Promise<void> {
  return request(`/cmdb/partner/maintenance/batch`, {
    method: RequestMethod.Delete,
    data: { ids },
  });
}
