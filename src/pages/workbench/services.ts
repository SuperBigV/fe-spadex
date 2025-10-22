import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export function getWorkbenchDetail() {
  return request('/api/n9e/workbench/detail', {
    method: RequestMethod.Get,
  });
}

export function getMyHosts() {
  return request('/api/n9e/targets/me', {
    method: RequestMethod.Get,
  });
}

export function getMyBusiGroups() {
  return request('/api/n9e/busi-groups', {
    method: RequestMethod.Get,
  });
}
