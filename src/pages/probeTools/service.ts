import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export const postProbePing = function (data) {
  return request('/api/spadex/probe/ping', {
    method: RequestMethod.Post,
    data,
  });
};

export const postProbeTelnet = function (data) {
  return request('/api/spadex/probe/telnet', {
    method: RequestMethod.Post,
    data,
  });
};

export const postProbeHttp = function (data) {
  return request('/api/spadex/probe/http', {
    method: RequestMethod.Post,
    data,
  });
};

export const postProbeTraceroute = function (data) {
  return request('/api/spadex/probe/traceroute', {
    method: RequestMethod.Post,
    data,
  });
};
