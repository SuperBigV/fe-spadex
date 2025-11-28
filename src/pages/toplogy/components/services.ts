import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
export const getAssetOfCategoryList = function (type: any) {
  return request(`/cmdb/asset/list/${type}`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

// http://127.0.0.1:8765/api/n9e/proxy/1/api/v1/query?time=1763677407&query=snmp_interface_admin_state
export const getTopology = function () {
  return request(`/api/n9e/topology`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

// 保存拓扑数据
export const saveTopology = function (topologyData) {
  request(`/api/n9e/topology`, {
    method: RequestMethod.Post,
    data: JSON.stringify(topologyData),
  }).then((res) => res && res.dat);
  // try {
  //   const response = await fetch('/api/n9e/topology', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(topologyData),
  //   });

  //   if (!response.ok) {
  //     throw new Error(`保存拓扑数据失败: ${response.statusText}`);
  //   }

  //   const data = await response.json();
  //   return data;
  // } catch (error) {
  //   console.error('保存拓扑数据错误:', error);
  //   message.error('保存拓扑数据失败');
  //   throw error;
  // }
};
