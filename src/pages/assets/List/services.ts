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
import { RASConfig } from '../types';
import { addTarget, editTarget } from '@/services/manage';
export const getColumnsByGid = (id: string) => {
  return request(`/cmdb/${id}/columns`, {
    method: RequestMethod.Get,
    silence: true,
  }).then((res) => res.dat);
};

export const getModelOptions = (id) => {
  return request(`/cmdb/asset-model/${id}/data`, {
    method: RequestMethod.Get,
    silence: true,
  }).then((res) => res.dat);
};
export function changeNetworkMonitor(data) {
  return request(`/cmdb/targets/scrape`, {
    method: RequestMethod.Post,
    data,
  });
}
export const getGidDetail = (id: string) => {
  return request(`/cmdb/asset-model/${id}`, {
    method: RequestMethod.Get,
    silence: true,
  }).then((res) => res.dat);
};

export const getAssetDetail = (id: string) => {
  return request(`/cmdb/asset/${id}`, {
    method: RequestMethod.Get,
    silence: true,
  }).then((res) => res.dat);
};

export const getByGidAssetsList = (params) => {
  return request(`/cmdb/assets`, {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
};

export const getRacks = () => {
  return request(`/cmdb/assets/racks`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};
export const getRacksByRoomId = (id) => {
  return request(`/cmdb/asset-racks/${id}`, {
    method: RequestMethod.Get,
  });
};
export const addAssetToN9e = function (id, grp, data) {
  const n9eData = {
    ident: data.data.name,
    host_ip: data.data.ip,
    group_ids: data.data.busi,
    ident_type: grp,
    asset_id: id,
    attr: {
      device_model_id: data.data.model,
    },
  };
  console.log('n9eData:', n9eData);
  return addTarget(n9eData);
};
export const addAsset = function (gid, data) {
  return request(`/cmdb/asset/${gid}`, {
    method: RequestMethod.Post,
    data,
  });
};
export function getTargetPassword(id) {
  return request(`/cmdb/target/${id}/password`, {
    method: RequestMethod.Get,
  });
}

// export const postControl = function (data) {
//   return request(`/cmdb/asset/control`, {
//     method: RequestMethod.Post,
//     data,
//   });
// };

export const targetControlPost = function (data) {
  return request(`/cmdb/target/control`, {
    method: RequestMethod.Post,
    data,
  });
};
export const editAsset = function (id, data) {
  const n9eData = {
    ident: data.data.name,
    host_ip: data.data.ip,
    group_ids: data.data.busi,
    tags: data.data.tags?.split(','),
    asset_id: id,
    attr: {
      device_model_id: data.data.model,
    },
  };
  console.log('n9eData:', n9eData, 'data:', data);
  editTarget(n9eData);
  return request(`/cmdb/asset/${id}`, {
    method: RequestMethod.Put,
    data,
  });
};

export function getTargetInformationByIdent(ident: string) {
  return request('/api/n9e/target/extra-meta', {
    method: RequestMethod.Get,
    params: {
      ident,
    },
  }).then((res) => {
    const dat = res?.dat?.extend_info;
    try {
      return JSON.parse(dat);
    } catch (e) {
      return {};
    }
  });
}
