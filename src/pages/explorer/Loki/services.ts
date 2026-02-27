import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { spadex_PATHNAME } from '@/utils/constant';
import _ from 'lodash';

export function getLogsQuery(datasourceValue: number, params) {
  return request(`/api/${spadex_PATHNAME}/proxy/${datasourceValue}/api/v1/query_range`, {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.data);
}
