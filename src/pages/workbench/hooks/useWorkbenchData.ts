import { useState, useEffect, useCallback } from 'react';
import {
  getWorkbenchOverview,
  getMyAssets,
  getMyAlerts,
  getMyBusiGroupsNew,
} from '../services';
import {
  WorkbenchOverviewResponse,
  MyAssetsResponse,
  MyAlertsResponse,
  MyBusiGroupsResponse,
} from '../types/workbench';

interface UseWorkbenchDataParams {
  timeRange?: '1h' | '6h' | '24h' | '7d';
  busiGroupIds?: number[];
}

interface UseWorkbenchDataReturn {
  overviewData: WorkbenchOverviewResponse | null;
  assetsData: MyAssetsResponse | null;
  alertsData: MyAlertsResponse | null;
  busiGroupsData: MyBusiGroupsResponse | null;
  loading: boolean;
  refresh: () => void;
  refreshAssets: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
  refreshBusiGroups: () => Promise<void>;
}

export const useWorkbenchData = (params: UseWorkbenchDataParams = {}): UseWorkbenchDataReturn => {
  const [overviewData, setOverviewData] = useState<WorkbenchOverviewResponse | null>(null);
  const [assetsData, setAssetsData] = useState<MyAssetsResponse | null>(null);
  const [alertsData, setAlertsData] = useState<MyAlertsResponse | null>(null);
  const [busiGroupsData, setBusiGroupsData] = useState<MyBusiGroupsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [overview, assets, alerts, busiGroups] = await Promise.all([
        getWorkbenchOverview({
          timeRange: params.timeRange || '24h',
          busiGroupIds: params.busiGroupIds || [],
        }),
        getMyAssets({ page: 1, pageSize: 10 }),
        getMyAlerts({ page: 1, pageSize: 10, timeRange: params.timeRange || '24h' }),
        getMyBusiGroupsNew(),
      ]);

      setOverviewData(overview);
      setAssetsData(assets);
      setAlertsData(alerts);
      setBusiGroupsData(busiGroups);
    } catch (error) {
      console.error('获取工作台数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [params.timeRange, params.busiGroupIds]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshAssets = useCallback(async () => {
    try {
      const assets = await getMyAssets({ page: 1, pageSize: 10 });
      setAssetsData(assets);
    } catch (error) {
      console.error('刷新资产数据失败:', error);
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    try {
      const alerts = await getMyAlerts({ 
        page: 1, 
        pageSize: 10, 
        timeRange: params.timeRange || '24h' 
      });
      setAlertsData(alerts);
    } catch (error) {
      console.error('刷新告警数据失败:', error);
    }
  }, [params.timeRange]);

  const refreshBusiGroups = useCallback(async () => {
    try {
      const busiGroups = await getMyBusiGroupsNew();
      setBusiGroupsData(busiGroups);
    } catch (error) {
      console.error('刷新业务组数据失败:', error);
    }
  }, []);

  return {
    overviewData,
    assetsData,
    alertsData,
    busiGroupsData,
    loading,
    refresh: fetchData,
    refreshAssets,
    refreshAlerts,
    refreshBusiGroups,
  };
};
