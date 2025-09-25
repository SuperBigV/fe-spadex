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
import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export function getBusiGroups(params?: { query?: string; limit?: number; all?: boolean }) {
  return request(`/api/n9e/busi-groups`, {
    method: RequestMethod.Get,
    params: {
      ...(params || {}),
      limit: params?.limit || 5000,
    },
  }).then((res) => {
    return _.sortBy(res.dat, 'name');
  });
}

export function getAssetModels(params?: { query?: string; limit?: number; all?: boolean }) {
  return request(`/cmdb/asset-models`, {
    method: RequestMethod.Get,
    params: {
      ...(params || {}),
      limit: params?.limit || 5000,
    },
  }).then((res) => {
    return _.sortBy(res.dat, 'name');
  });
}

export const getAssetModelInfoDetail = function (id: any) {
  return request(`/cmdb/asset-model/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

export const deleteAssetModel = function (id: number) {
  return request(`/cmdb/asset-model/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res && res.dat);
};

export const changeAssetModel = function (id: number, data: object) {
  return request(`/cmdb/asset-model/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
