import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export const getAssetOfCategoryList = function (type: any) {
  return request(`/cmdb/asset/list/${type}`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

// http://127.0.0.1:8765/api/n9e/proxy/1/api/v1/query?time=1763677407&query=snmp_interface_admin_state
