import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import {
  WorkbenchOverviewParams,
  WorkbenchOverviewResponse,
  MyAssetsParams,
  MyAssetsResponse,
  MyAlertsParams,
  MyAlertsResponse,
  MyBusiGroupsParams,
  MyBusiGroupsResponse,
  MetricsParams,
  MetricsResponse,
  StatisticsParams,
  StatisticsResponse,
} from './types/workbench';

// 导出类型供其他组件使用
export type {
  WorkbenchOverviewParams,
  WorkbenchOverviewResponse,
  MyAssetsParams,
  MyAssetsResponse,
  MyAlertsParams,
  MyAlertsResponse,
  MyBusiGroupsParams,
  MyBusiGroupsResponse,
  MetricsParams,
  MetricsResponse,
  StatisticsParams,
  StatisticsResponse,
};

// 保留旧接口以保持兼容性
export function getWorkbenchDetail() {
  return request('/api/n9e/workbench/detail', {
    method: RequestMethod.Get,
  });
}

export function getMyHosts() {
  return request('/api/n9e/targets/me', {
    method: RequestMethod.Get,
  });
}

export function getMyBusiGroups() {
  return request('/api/n9e/busi-groups', {
    method: RequestMethod.Get,
  });
}

// 新的工作台API接口
export function getWorkbenchOverview(params?: WorkbenchOverviewParams): Promise<WorkbenchOverviewResponse> {
  return request('/api/n9e/workbench/overview', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
}

export function getMyAssets(params: MyAssetsParams): Promise<MyAssetsResponse> {
  return request('/api/n9e/workbench/my-assets', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
}

export function getMyAlerts(params: MyAlertsParams): Promise<MyAlertsResponse> {
  // 转换severity参数：前端使用字符串，后端使用int
  const backendParams: any = { ...params };
  if (params.severity && params.severity !== 'all') {
    const severityMap: Record<string, number> = {
      critical: 1,
      warning: 2,
      info: 3,
    };
    backendParams.severity = severityMap[params.severity] || -1;
  } else {
    backendParams.severity = -1;
  }

  return request('/api/n9e/workbench/my-alerts', {
    method: RequestMethod.Get,
    params: backendParams,
  }).then((res) => res.dat);
}

export function getMyBusiGroupsNew(params?: MyBusiGroupsParams): Promise<MyBusiGroupsResponse> {
  return request('/api/n9e/workbench/my-busi-groups', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
}

export function getMetrics(params: MetricsParams): Promise<MetricsResponse> {
  return request('/api/n9e/workbench/metrics', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
}

export function getStatistics(params: StatisticsParams): Promise<StatisticsResponse> {
  return request('/api/n9e/workbench/statistics', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
}
