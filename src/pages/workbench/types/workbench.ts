// 工作台概览参数
export interface WorkbenchOverviewParams {
  // 目前暂无参数，保留接口以便后续扩展
}

// 工作台概览数据
export interface WorkbenchOverviewResponse {
  alerts: {
    critical: number;
    warning: number;
    info: number;
    todayNew: number;
    todayResolved: number;
  };
  assets: {
    total: number;
    online: number;
    offline: number;
    abnormal: number;
    healthRate: number;
  };
  busiGroups: {
    total: number;
    healthy: number;
    abnormal: number;
    healthRate: number;
  };
  resources: {
    cpu: {
      avg: number;
      max: number;
      trend: 'up' | 'down' | 'stable';
    };
    memory: {
      avg: number;
      max: number;
      trend: 'up' | 'down' | 'stable';
    };
    disk: {
      avg: number;
      max: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
}

// 我的资产
export interface MyAssetsParams {
  page?: number;
  pageSize?: number;
  status?: 'all' | 'online' | 'offline' | 'abnormal';
  assetType?: string;
  busiGroupId?: number;
  keyword?: string;
}

export interface MyAssetsResponse {
  total: number;
  list: Array<{
    id: number;
    name: string;
    ip: string;
    assetType: string;
    status: 'online' | 'offline' | 'abnormal';
    busiGroupId: number;
    busiGroupName: string;
    cpuUsage?: number;
    memoryUsage?: number;
    lastUpdateTime: string;
  }>;
}

// 我的告警
export interface MyAlertsParams {
  page?: number;
  pageSize?: number;
  severity?: 'all' | 'critical' | 'warning' | 'info';
  timeRange?: '1h' | '6h' | '24h' | '7d';
  status?: 'all' | 'unhandled' | 'handling' | 'resolved';
}

export interface MyAlertsResponse {
  total: number;
  list: Array<{
    id: number;
    title: string;
    severity: 'critical' | 'warning' | 'info';
    assetId: number;
    assetName: string;
    busiGroupId: number;
    busiGroupName: string;
    triggerTime: string;
    duration: string;
    status: 'unhandled' | 'handling' | 'resolved';
    currentValue?: number;
    threshold?: number;
  }>;
}

// 我的业务组
export interface MyBusiGroupsParams {
  keyword?: string;
}

export interface MyBusiGroupsResponse {
  list: Array<{
    id: number;
    name: string;
    icon?: string;
    healthStatus: 'healthy' | 'warning' | 'abnormal';
    assetCount: number;
    onlineAssetCount: number;
    offlineAssetCount: number;
    alertCount: {
      critical: number;
      warning: number;
      info: number;
    };
    lastUpdateTime: string;
  }>;
}

// 监控指标
export interface MetricsParams {
  metric: 'cpu_usage' | 'memory_usage' | 'disk_usage' | 'network_flow';
  timeRange: '1h' | '6h' | '24h' | '7d';
  busiGroupId?: number;
  assetId?: number;
}

export interface MetricsResponse {
  metric: string;
  unit: string;
  data: Array<{
    time: string;
    value: number;
    assetId?: number;
    assetName?: string;
  }>;
  statistics: {
    current: number;
    avg: number;
    max: number;
    min: number;
  };
}

// 统计数据
export interface StatisticsParams {
  type: 'alert_trend' | 'asset_distribution' | 'resource_trend' | 'busi_health';
  timeRange: '7d' | '30d';
}

export type StatisticsResponse =
  | { type: 'alert_trend'; data: Array<{ date: string; critical: number; warning: number; info: number }> }
  | {
      type: 'asset_distribution';
      data: { status: Array<{ name: string; value: number }>; type: Array<{ name: string; value: number }>; busiGroup: Array<{ name: string; value: number }> };
    }
  | { type: 'resource_trend'; data: Array<{ date: string; cpu: number; memory: number; disk: number; networkIn?: number; networkOut?: number }> }
  | { type: 'busi_health'; data: Array<{ busiGroupId: number; busiGroupName: string; healthScore: number; assetCount: number; alertCount: number }> };
