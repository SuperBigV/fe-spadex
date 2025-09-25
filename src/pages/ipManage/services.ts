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
import { Subnet } from './types';

export const getSubnets = function (): Promise<Subnet[]> {
  return request('/cmdb/subnets', {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const getSubnetDetail = function (id: number): Promise<Subnet> {
  return request(`/cmdb/subnet/${id}/detail`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const postSubnet = function (data: Subnet) {
  return request('/cmdb/subnet', {
    method: RequestMethod.Post,
    data,
  });
};

export const putSubnet = function (id: number, data: Subnet) {
  return request(`/cmdb/subnet/${id}`, {
    method: RequestMethod.Put,
    data,
  });
};

export const deleteSubnet = function (id: number) {
  return request(`/cmdb/subnet/${id}`, {
    method: RequestMethod.Delete,
  });
};
