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

// 匿名获取数据源列表
export function getDatasourceBriefList(): Promise<{ name: string; id: number; plugin_type: string }[]> {
  const url = '/api/spadex/datasource/brief';
  return request(url, {
    method: RequestMethod.Get,
  })
    .then((res) => {
      return res.dat || [];
    })
    .catch(() => {
      return [];
    });
}

export function getBusiGroups(query = '', limit: number = 5000, typ: string = 'busi') {
  return request(`/api/spadex/busi-groups`, {
    method: RequestMethod.Get,
    params: Object.assign(
      {
        limit,
      },
      query ? { query } : {},
      typ ? { typ } : {},
    ),
  }).then((res) => {
    return {
      // dat: _.sortBy(res.dat, (item) => _.lowerCase(item.name)),
      dat: res.dat,
    };
  });
}

export function getAssetModels(query = '', limit: number = 5000) {
  return request(`/cmdb/asset-models`, {
    method: RequestMethod.Get,
    params: Object.assign(
      {
        limit,
      },
      query ? { query } : {},
    ),
  }).then((res) => {
    // let defaultModel = {
    //   name: '设备型号',
    //   id: -1,
    // };
    // res.dat.unshift(defaultModel);
    return {
      // dat: _.sortBy(res.dat, (item) => _.lowerCase(item.name)),
      dat: res.dat,
    };
  });
}

export function getBusiGroupsForChBusi(query = '', limit: number = 5000, gtp: string = '') {
  return request(`/api/spadex/busi-groups/ch-busi`, {
    method: RequestMethod.Get,
    params: Object.assign(
      {
        limit,
      },
      query ? { query } : {},
      gtp ? { gtp } : {},
    ),
  }).then((res) => {
    return {
      // dat: _.sortBy(res.dat, (item) => _.lowerCase(item.name)),
      dat: res.dat,
    };
  });
}

export function getModelGroups(query = '', limit: number = 5000, gtp: string = '') {
  return request(`/api/spadex/device-models`, {
    method: RequestMethod.Get,
    params: Object.assign(
      {
        limit,
      },
      query ? { query } : {},
      gtp ? { gtp } : {},
    ),
  }).then((res) => {
    return {
      dat: _.sortBy(res.dat, (item) => _.lowerCase(item.name)),
    };
  });
}

export function getPerm(busiGroup: string, perm: 'ro' | 'rw') {
  return request(`/api/spadex/busi-group/${busiGroup}/perm/${perm}`, {
    method: RequestMethod.Get,
  });
}

export function getMenuPerm() {
  return request(`/api/spadex/self/perms`, {
    method: RequestMethod.Get,
  });
}
