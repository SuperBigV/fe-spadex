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
import { AuthConfig, RASConfig } from './types';

export const getAuthConfigs = function (): Promise<AuthConfig[]> {
  return request('/cmdb/auth-configs', {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const getAuthConfig = function (id: number) {
  return request(`/cmdb/auth-config/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const postAuthConfigs = function (data: AuthConfig) {
  return request('/cmdb/auth-config', {
    method: RequestMethod.Post,
    data,
  });
};

export const putAuthConfigs = function (id: number, data: AuthConfig) {
  return request(`/cmdb/auth-config/${id}`, {
    method: RequestMethod.Put,
    data,
  });
};

export const deleteAuthConfigs = function (id: number) {
  return request(`/cmdb/auth-config/${id}`, {
    method: RequestMethod.Delete,
  });
};
