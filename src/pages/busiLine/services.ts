import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export function getTargetInformationByIdent(ident: string) {
  return request('/api/n9e/target/extra-meta', {
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

export const postBusiScrape = function (data: any) {
  return request(`/api/n9e/busi-scrape`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};
export const putBusiScrape = function (id, data: any) {
  return request(`/api/n9e/busi-scrape/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};

export const putOpenBusiScrape = function (id) {
  return request(`/api/n9e/busi-scrape/open/${id}`, {
    method: RequestMethod.Put,
  });
};

export const putCloseBusiScrape = function (id) {
  return request(`/api/n9e/busi-scrape/close/${id}`, {
    method: RequestMethod.Put,
  });
};
const apiPrefix = '/api/n9e/datasource';
export const getDataSourceList = () => {
  return request(`${apiPrefix}/list`, {
    method: RequestMethod.Post,
    data: {},
  }).then((res) => res.data);
};
export const deleteScrape = function (id) {
  return request(`/api/n9e/busi-scrape/${id}`, {
    method: RequestMethod.Delete,
  });
};

export function getBusiScrapeList(params) {
  return request('/api/n9e/busi-scrapes', {
    params,
    method: RequestMethod.Get,
  });
}

export function GetAssetListByType(typ: string) {
  return request('/api/n9e/targets/typ', {
    method: RequestMethod.Get,
    params: {
      typ,
    },
  });
}

export const createBusiTopoloy = function (id: string | undefined, data: any) {
  return request(`/api/n9e/busi-group/${id}/topology`, {
    method: RequestMethod.Post,
    data: JSON.stringify(data),
  }).then((res) => res && res.dat);
};
export function putTargetsBgids(data: { bgids: number[]; idents: string[]; action: string }) {
  return request('/api/n9e/targets/bgids', {
    method: RequestMethod.Put,
    data,
  });
}

export function getBusiGroupsTags() {
  return request('/api/n9e/busi-groups/tags', {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
}
