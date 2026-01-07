import React from 'react';
import _ from 'lodash';
// @ts-ignore
import { advancedCates } from 'plus:/constants';

export interface Cate {
  value: string;
  label: string;
  desc: string;
  type: string[];
  alertRule: boolean; // 是否支持告警规则
  dashboard: boolean; // 是否支持仪表盘
  dashboardVariable: boolean; // 是否支持仪表盘变量
  graphPro: boolean; // Pro版本
  alertPro: boolean; // Pro版本
  logo?: string;
}

export const baseCates: Cate[] = [
  {
    value: 'prometheus',
    label: 'Prometheus',
    type: ['metric', 'anomaly'],
    alertRule: true,
    dashboard: true,
    dashboardVariable: true,
    graphPro: false,
    alertPro: false,
    desc: '指标',
    logo: '/image/logos/prometheus.png',
  },
  {
    value: 'elasticsearch',
    label: 'Elasticsearch',
    type: ['logging'],
    desc: '日志',
    alertRule: true,
    dashboard: true,
    dashboardVariable: true,
    graphPro: false,
    alertPro: false,
    logo: '/image/logos/elasticsearch.png',
  },
  {
    value: 'tdengine',
    label: 'TDengine',
    type: ['metric'],
    alertRule: true,
    desc: 'tdengine',
    dashboard: true,
    dashboardVariable: false,
    graphPro: false,
    alertPro: false,
    logo: '/image/logos/tdengine.png',
  },
  {
    value: 'sls',
    label: 'sls',
    type: ['sls', 'logging'],
    alertRule: true,
    desc: '日志',
    dashboard: false,
    dashboardVariable: false,
    graphPro: false,
    alertPro: false,
    logo: '/image/logos/aliyun-sls.png',
  },
  {
    value: 'loki',
    label: 'Loki',
    type: ['loki', 'logging'], // loki 是历史版本里一个过度的分类，后续会废弃
    alertRule: true,
    dashboard: false,
    desc: '日志',
    dashboardVariable: false,
    graphPro: false,
    alertPro: false,
    logo: '/image/logos/loki.png',
  },
  {
    value: 'jaeger',
    label: 'Jaeger',
    type: ['tracing'],
    alertRule: false,
    dashboard: false,
    dashboardVariable: false,
    desc: '链路追踪',
    graphPro: false,
    alertPro: false,
    logo: '/image/logos/jaeger.png',
  },
  {
    value: 'ck',
    label: 'ClickHouse',
    type: ['metric', 'logging'],
    alertRule: true,
    dashboard: true,
    desc: 'ClickHouse',
    dashboardVariable: false,
    graphPro: false,
    alertPro: false,
    logo: '/image/logos/ck.png',
  },
];

export const allCates = [...baseCates, ...advancedCates];

export const getAuthorizedDatasourceCates = (feats, isPlus, filter?: (cate: any) => boolean) => {
  console.log('advancedCates:', advancedCates);
  let cates = baseCates;
  if (feats && isPlus) {
    cates = _.filter(feats.plugins, (plugin) => {
      return _.find(allCates, { value: plugin.value });
    });
  }
  if (filter) {
    cates = _.filter(cates, filter);
  }
  return cates;
};
