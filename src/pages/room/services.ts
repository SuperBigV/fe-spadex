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
import { Room, Rack } from './types';

export const postRack = function (data: Rack) {
  return request('/api/n9e/rack', {
    method: RequestMethod.Post,
    data,
  });
};

export const putRack = function (id: number, data: Rack) {
  return request(`/api/n9e/rack/${id}`, {
    method: RequestMethod.Put,
    data,
  });
};

export const getRacks = function () {
  return request(`/api/n9e/racks`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const getRack = function (id: any) {
  return request(`/api/n9e/rack${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const deleteRack = function (id: number) {
  return request(`/api/n9e/rack/${id}`, {
    method: RequestMethod.Delete,
  });
};

export const postRoom = function (data: Room) {
  return request('/api/n9e/room', {
    method: RequestMethod.Post,
    data,
  });
};

export const putRoom = function (id: number, data: Room) {
  return request(`/api/n9e/room/${id}`, {
    method: RequestMethod.Put,
    data,
  });
};

export const getRoom = function (id: any) {
  return request(`/api/n9e/room/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const deleteRoom = function (id: number) {
  return request(`/api/n9e/room/${id}`, {
    method: RequestMethod.Delete,
  });
};
