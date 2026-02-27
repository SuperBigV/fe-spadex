import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export const getspadexConfig = function (key: string) {
  return request('/api/spadex/site-info', {
    method: RequestMethod.Get,
    params: { key },
    silence: true,
  }).then((res) => res.dat || '');
};

export const putspadexConfig = function (data: { ckey: string; cval: string }) {
  return request('/api/spadex/config', {
    method: RequestMethod.Put,
    data,
  });
};
