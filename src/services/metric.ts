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

// 获取节点key
export const GetTagPairs = function (data: object) {
  return request(`/api/spadex/tag-pairs`, {
    method: RequestMethod.Post,
    data,
  });
};

// 查询 Metrics
export const GetMetrics = function (data: object) {
  return request(`/api/spadex/tag-metrics`, {
    method: RequestMethod.Post,
    data,
  });
};

// 查询 上报数据
export const GetData = function (data: object) {
  return request(`/api/spadex/query`, {
    method: RequestMethod.Post,
    data,
  });
};

export const getQueryBench = function (data?: { series_num: number; point_num: number }) {
  return request(`/api/spadex/query-bench`, {
    method: RequestMethod.Post,
    params: data,
  });
};

// 分享图表 存临时数据
export const SetTmpChartData = function (data: { configs: string }[]) {
  return request(`/api/spadex/share-charts`, {
    method: RequestMethod.Post,
    data,
  });
};
// 分享图表 读临时数据
export const GetTmpChartData = function (ids: string) {
  return request(`/api/spadex/share-charts?ids=${ids}`, {
    method: RequestMethod.Get,
  });
};

export const prometheusAPI = function (path: string, params, options) {
  return request(`/api/spadex/prometheus/api/v1/${path}`, {
    method: RequestMethod.Get,
    params,
    ...options,
  });
};
