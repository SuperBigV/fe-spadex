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

export const createIconGroup = function (data: object) {
  return request(`/cmdb/icon-group`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};

export const getIconGroups = function (params = {}) {
  return request(`/cmdb/icon-groups`, {
    method: RequestMethod.Get,
    params,
  });
};

export const editIconGroup = function (id: number, data: object) {
  return request(`/cmdb/icon-group/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};

export const getIconGroupInfo = function (id: number) {
  return request(`/cmdb/icon-group/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

export const deleteIconGroup = function (id: string) {
  return request(`/cmdb/icon-group/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res && res.dat);
};
export const addIcon = function (id: number | undefined, data: object) {
  return request(`/cmdb/icon-group/${id}/icon`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res);
};
export const deleteIcon = function (id: string) {
  return request(`/cmdb/icon/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res && res.dat);
};

export const getIconsByGrpId = function (id: number) {
  return request(`/cmdb/icon-group/${id}/icons`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};
