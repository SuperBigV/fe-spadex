/*
 * 资产管理操作记录 API
 */
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import type { OperatorRecordListParams, OperatorRecordListResponse } from './types';

const API_PREFIX = '/cmdb/operator-records';

/** 获取操作记录列表（分页、筛选） */
export const getOperatorRecordList = (params: OperatorRecordListParams = {}): Promise<OperatorRecordListResponse> => {
  return request(API_PREFIX, {
    method: RequestMethod.Get,
    params,
  }).then((res: any) => {
    if (res?.err && res.err !== '') {
      throw new Error(res.err);
    }
    return res.dat as OperatorRecordListResponse;
  });
};
