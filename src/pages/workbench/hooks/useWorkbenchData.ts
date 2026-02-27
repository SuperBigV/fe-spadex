import { useState, useEffect, useCallback } from 'react';
import { getWorkbenchOverview, getMyAssets, getMyAlerts, getMyBusiGroupsNew } from '../services';
import { WorkbenchOverviewResponse, MyAssetsResponse, MyAlertsResponse, MyBusiGroupsResponse } from '../types/workbench';

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
  refreshAssets: (page?: number, pageSize?: number) => Promise<void>;
  refreshAlerts: () => Promise<void>;
  refreshBusiGroups: () => Promise<void>;
  assetPage: number;
  assetPageSize: number;
}

const DEFAULT_ASSET_PAGE = 1;
const DEFAULT_ASSET_PAGE_SIZE = 10;

export const useWorkbenchData = (params: UseWorkbenchDataParams = {}): UseWorkbenchDataReturn => {
  const [overviewData, setOverviewData] = useState<WorkbenchOverviewResponse | null>(null);
  const [assetsData, setAssetsData] = useState<MyAssetsResponse | null>(null);
  const [alertsData, setAlertsData] = useState<MyAlertsResponse | null>(null);
  const [busiGroupsData, setBusiGroupsData] = useState<MyBusiGroupsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [assetPage, setAssetPage] = useState(DEFAULT_ASSET_PAGE);
  const [assetPageSize, setAssetPageSize] = useState(DEFAULT_ASSET_PAGE_SIZE);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setAssetPage(DEFAULT_ASSET_PAGE);
    setAssetPageSize(DEFAULT_ASSET_PAGE_SIZE);
    try {
      const [overview, assets, alerts, busiGroups] = await Promise.all([
        getWorkbenchOverview({
          timeRange: params.timeRange || '24h',
          busiGroupIds: params.busiGroupIds || [],
        }),
        getMyAssets({ page: DEFAULT_ASSET_PAGE, pageSize: DEFAULT_ASSET_PAGE_SIZE }),
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

  const refreshAssets = useCallback(
    async (page?: number, pageSize?: number) => {
      const nextPage = page ?? assetPage;
      const nextPageSize = pageSize ?? assetPageSize;
      if (page !== undefined) setAssetPage(page);
      if (pageSize !== undefined) setAssetPageSize(pageSize);
      try {
        const assets = await getMyAssets({ page: nextPage, pageSize: nextPageSize });
        setAssetsData(assets);
      } catch (error) {
        console.error('刷新资产数据失败:', error);
      }
    },
    [assetPage, assetPageSize],
  );

  const refreshAlerts = useCallback(async () => {
    try {
      const alerts = await getMyAlerts({
        page: 1,
        pageSize: 10,
        timeRange: params.timeRange || '24h',
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
    assetPage,
    assetPageSize,
  };
};
