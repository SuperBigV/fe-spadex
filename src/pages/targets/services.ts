import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export function getTargetInformationByIdent(ident: string) {
  return request('/api/spadex/target/extra-meta', {
    method: RequestMethod.Get,
    params: {
      ident,
    },
  }).then((res) => {
    const dat = res?.dat?.extend_info;
    try {
      return JSON.parse(dat);
    } catch (e) {
      return {};
    }
  });
}

export function putTargetsBgids(data: { bgids: number[]; idents: string[]; action: string }) {
  return request('/api/spadex/targets/bgids', {
    method: RequestMethod.Put,
    data,
  });
}

export function getBusiGroupsTags() {
  return request('/api/spadex/busi-groups/tags', {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
}

export function operateTargetLife(data) {
  return request('/api/spadex/targets/life', {
    method: RequestMethod.Put,
    data,
  });
}
