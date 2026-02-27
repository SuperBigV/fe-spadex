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

// 修改个人信息
export const getUserInfoList = function (params = {}) {
  return request(`/api/spadex/users`, {
    method: RequestMethod.Get,
    params,
  });
};

export const getTeamInfoList = function (params?: { query: string; limit?: number }) {
  const data = params ? (params.limit ? params : { ...params, limit: 5000 }) : { limit: 5000 };
  return request(`/api/spadex/user-groups`, {
    method: RequestMethod.Get,
    params: data,
  });
};
export const getBusinessTeamList = function (params = {}) {
  return request(`/api/spadex/busi-groups`, {
    method: RequestMethod.Get,
    params,
  });
};
export const getModelTeamList = function (params) {
  return request(`/api/spadex/device-models`, {
    method: RequestMethod.Get,
    params,
  }).then((res) => res);
};

export const getBusinessTeamInfo = function (id: any) {
  return request(`/api/spadex/busi-group/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};
export const getModelInfo = function (id: number) {
  return request(`/api/spadex/device-model/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

export const getModelMetricInfoDetail = function (id: string) {
  return request(`/api/spadex/device-model/${id}/metric`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

export const createModel = function (data: object) {
  return request(`/api/spadex/device-models`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};

export const createModelMetric = function (id: number | undefined, data: object) {
  return request(`/api/spadex/device-model/${id}/metric`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};

export const editModelMetric = function (id: number, data: object) {
  return request(`/api/spadex/device-model/${id}/metric`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};

export const editModel = function (id: number, data: object) {
  return request(`/api/spadex/device-model/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};

export const deleteModel = function (id: string) {
  return request(`/api/spadex/device-model/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res && res.dat);
};

export const deleteModelMetric = function (id: string) {
  return request(`/api/spadex/device-model/${id}/metric`, {
    method: RequestMethod.Delete,
  }).then((res) => res && res.dat);
};

export const createBusinessTeam = function (data: object) {
  return request(`/api/spadex/busi-groups`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};
export const changeBusinessTeam = function (id: number, data: object) {
  return request(`/api/spadex/busi-group/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};

export const deleteBusinessTeamMember = function (id: string, data: object) {
  return request(`/api/spadex/busi-group/${id}/members`, {
    method: RequestMethod.Delete,
    data,
  }).then((res) => res && res.dat);
};

export const deleteBusinessTeam = function (id: string) {
  return request(`/api/spadex/busi-group/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res && res.dat);
};

export const addBusinessMember = function (id: number, data: object) {
  return request(`/api/spadex/busi-group/${id}/members`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};

export const createUser = function (data: object) {
  return request(`/api/spadex/users`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};
export const createTeam = function (data: object) {
  return request(`/api/spadex/user-groups`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};
export const getUserInfo = function (id: string) {
  return request(`/api/spadex/user/${id}/profile`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};
export const getTeamInfo = function (id: number) {
  return request(`/api/spadex/user-group/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

export const getBuiltinMetrics = function (params = {}) {
  return request('/api/spadex/builtin-metrics', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat?.list);
};

export const changeUserInfo = function (id: string, data: object) {
  return request(`/api/spadex/user/${id}/profile`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const changeStatus = function (id: string, data: object) {
  return request(`/api/spadex/user/${id}/status`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const changeTeamInfo = function (id: number, data: object) {
  return request(`/api/spadex/user-group/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const changeUserPassword = function (id: string, data: object) {
  return request(`/api/spadex/user/${id}/password`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const disabledUser = function (id: string, data: object) {
  return request(`/api/spadex/user/${id}/password`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const deleteUser = function (id: string) {
  return request(`/api/spadex/user/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res && res.dat);
};
export const deleteTeam = function (id: number) {
  return request(`/api/spadex/user-group/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res && res.dat);
};
export const deleteMember = function (id: number, data: object) {
  return request(`/api/spadex/user-group/${id}/members`, {
    method: RequestMethod.Delete,
    data,
  }).then((res) => res && res.dat);
};
export const addTeamUser = function (id: number, data: object) {
  return request(`/api/spadex/user-group/${id}/members`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};
export const getNotifiesList = function () {
  return request(`/api/spadex/notify-channels`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

export const getContactsList = function () {
  return request(`/api/spadex/contact-channels`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

export const getNotifyChannels = function () {
  return request(`/api/spadex/contact-keys`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

export const getRoles = function () {
  return request(`/api/spadex/roles`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

export const addTarget = function (data: object) {
  return request(`/api/spadex/target`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};

export const editTarget = function (data) {
  return request(`/api/spadex/target`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const getAuthConfigs = function (params: object) {
  return request('/api/spadex/auth-configs', {
    method: RequestMethod.Get,
    params: params,
  }).then((res) => res.dat);
};

export const getRooms = function () {
  return request(`/api/spadex/rooms`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};
