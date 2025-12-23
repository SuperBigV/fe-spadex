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

// 获取命令记录列表
export const getCommandRecordsList = (params: {
  page?: number;
  pageSize?: number;
  sessionId?: string;
  assetId?: number;
  blocked?: string;
  keyword?: string;
  startTime?: number;
  endTime?: number;
}) => {
  return request('/cmdb/ssh/command-records', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
};

// 根据会话ID获取命令记录
export const getCommandRecordsBySession = (sessionId: string) => {
  return request(`/cmdb/ssh/command-records/session/${sessionId}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

// 根据资产ID获取命令记录
export const getCommandRecordsByAsset = (assetId: number) => {
  return request(`/cmdb/ssh/command-records/asset/${assetId}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

// 获取统计信息
export const getCommandRecordsStatistics = (params?: {
  assetId?: number;
  startTime?: number;
  endTime?: number;
}) => {
  return request('/cmdb/ssh/command-records/statistics', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
};

