import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export const postProbePing = function (data) {
  return request('/api/n9e/probe/ping', {
    method: RequestMethod.Post,
    data,
  });
};

export const postProbeTelnet = function (data) {
  return request('/api/n9e/probe/telnet', {
    method: RequestMethod.Post,
    data,
  });
};

export const postProbeHttp = function (data) {
  return request('/api/n9e/probe/http', {
    method: RequestMethod.Post,
    data,
  });
};

export const postProbeTraceroute = function (data) {
  return request('/api/n9e/probe/traceroute', {
    method: RequestMethod.Post,
    data,
  });
};
