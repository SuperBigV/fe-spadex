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

export const createAssetModel = function (data: object) {
  return request(`/cmdb/asset-model`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};

export function getAssetModelList(params) {
  let url = '/cmdb/asset-model-fields';
  return request(url, {
    method: RequestMethod.Get,
    params,
  });
}
export const getAssetModelInfoDetail = function (id: any) {
  return request(`/cmdb/asset-model/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

export const createAssetModelField = function (data: object) {
  return request(`/cmdb/asset-model-field`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};

export const updateAssetModelField = function (id: number | undefined, data: object) {
  return request(`/cmdb/asset-model-field/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const deleteAssetModelField = function (id: number) {
  return request(`/cmdb/asset-model-field/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res && res.dat);
};
export const createFieldGroup = function (id, data: object) {
  return request(`/cmdb/asset-field-group/${id}`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};

export const updateFieldGroup = function (id: number, data: object) {
  return request(`/cmdb/asset-field-group/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const deleteFieldGroup = function (id: number) {
  return request(`/cmdb/asset-field-group/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res && res.dat);
};

export const getAssetModelFieldDetail = function (id: any) {
  return request(`/cmdb/asset-model-field/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};
