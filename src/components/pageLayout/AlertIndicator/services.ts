import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export const getCurrentAlertOfMy = () => {
  return request(`/api/spadex/alert-indicators`, {
    method: RequestMethod.Get,
    silence: true,
  }).then((res) => res.dat);
};
