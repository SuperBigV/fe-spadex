import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export function getDsQuery(params, silence = true) {
  return request('/api/spadex/ds-query', {
    method: RequestMethod.Post,
    data: params,
    headers: {
      'X-Cluster': 'Default',
    },
    silence,
  });
}

export function getLogsQuery(params) {
  return request('/api/spadex/logs-query', {
    method: RequestMethod.Post,
    data: params,
    headers: {
      'X-Cluster': 'Default',
    },
    silence: true,
  }).then((res) => res.dat);
}

export function getBusiScrapeInfo(datasourceValue, bgid) {
  return request('/api/spadex/busi-scrape/sls', {
    method: RequestMethod.Get,
    params: {
      gid: bgid,
      dsid: datasourceValue,
    },
  }).then((res) => res.dat);
}
