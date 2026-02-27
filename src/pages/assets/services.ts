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
import { bindTags, unbindTags } from '@/services/targets';
export const getGidDetail = (id: string) => {
  return request(`/cmdb/asset-model/${id}`, {
    method: RequestMethod.Get,
    silence: true,
  }).then((res) => res.dat);
};

export const getAlertRulePure = (id: number) => {
  return request(`/api/spadex/alert-rule/${id}/pure`, {
    method: RequestMethod.Get,
    silence: true,
  }).then((res) => res.dat);
};
export function fetchInitLog(id) {
  return request(`/cmdb/init-log/${id}`, {
    method: RequestMethod.Get,
  });
}
export const rulesClone = (gid, data) => {
  return request(`/api/spadex/busi-group/${gid}/alert-rules/clone`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export function initTarget(data) {
  return request(`/cmdb/target/init`, {
    method: RequestMethod.Post,
    data,
  });
}

export function CmdbLifecycle(data) {
  return request(`/cmdb/targets/lifecycle`, {
    method: RequestMethod.Post,
    data,
  });
}

export function spadexLifecycle(data) {
  return request(`/api/spadex/targets/lifecycle`, {
    method: RequestMethod.Post,
    data,
  });
}

export function getJumpBusiGroups(params) {
  return request(`/cmdb/busi-group/jump`, {
    method: RequestMethod.Get,
    params,
  });
}

export function bindTargetsTags(data) {
  return bindTagsCMDB(data);
}

export function unbindTargetsTags(data) {
  return unbindTagsCMDB(data);
}
export function bindTagsCMDB(data) {
  bindTags(data);
  return bindOrUnbindTags(true, data);
}

export function unbindTagsCMDB(data) {
  unbindTags(data);
  return bindOrUnbindTags(false, data);
}
export function getTargetTags(params) {
  return request(`/api/spadex/targets/tags`, {
    method: RequestMethod.Get,
    params,
  });
}

export function bindOrUnbindTags(isBind, data) {
  return request(`/cmdb/targets/tags`, {
    method: isBind ? RequestMethod.Post : RequestMethod.Delete,
    data,
  });
}
