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

// 获取黑名单列表
export const getBlacklistList = (params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  enabled?: string;
}) => {
  return request('/cmdb/ssh/blacklist', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
};

// 获取单个黑名单
export const getBlacklistDetail = (id: number) => {
  return request(`/cmdb/ssh/blacklist/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

// 添加黑名单
export const addBlacklist = (data: {
  command: string;
  pattern?: string;
  match_type?: 'exact' | 'regex';
  enabled?: boolean;
  remark?: string;
}) => {
  return request('/cmdb/ssh/blacklist', {
    method: RequestMethod.Post,
    data,
  });
};

// 更新黑名单
export const updateBlacklist = (
  id: number,
  data: {
    command?: string;
    pattern?: string;
    match_type?: 'exact' | 'regex';
    enabled?: boolean;
    remark?: string;
  }
) => {
  return request(`/cmdb/ssh/blacklist/${id}`, {
    method: RequestMethod.Put,
    data,
  });
};

// 删除黑名单
export const deleteBlacklist = (id: number) => {
  return request(`/cmdb/ssh/blacklist/${id}`, {
    method: RequestMethod.Delete,
  });
};

