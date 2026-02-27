import React, { useState } from 'react';
import { Row, Col } from 'antd';
import PageLayout from '@/components/pageLayout';
import OverviewCards from './components/OverviewCards';
import MyAssets from './components/MyAssets';
import MyAlerts from './components/MyAlerts';
import MonitoringOverview from './components/MonitoringOverview';
import MyBusiGroups from './components/MyBusiGroups';
import QuickActions from './components/QuickActions';
import StatisticsCharts from './components/StatisticsCharts';
import { useWorkbenchData } from './hooks/useWorkbenchData';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import { GlobalOutlined } from '@ant-design/icons';
import './styles/workbench.less';

const Workbench: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [busiGroupIds, setBusiGroupIds] = useState<number[]>([]);

  const { overviewData, assetsData, alertsData, busiGroupsData, loading, refresh, refreshAssets, refreshAlerts, refreshBusiGroups, assetPage, assetPageSize } = useWorkbenchData({
    timeRange,
    busiGroupIds,
  });

  // 启用自动刷新（每30秒）
  useAutoRefresh({
    interval: 30000,
    enabled: true,
    onRefresh: refresh,
  });

  return (
    <PageLayout icon={<GlobalOutlined />} title='工作台'>
      <div className='workbench-container'>
        {/* 顶部概览卡片 */}
        <OverviewCards data={overviewData} loading={loading} onRefresh={refresh} />

        {/* 快捷操作 */}
        <QuickActions />

        {/* 主要内容区 */}
        <Row gutter={16} className='workbench-content'>
          {/* 左侧栏：我的资产 */}
          <Col xs={24} sm={24} md={8} lg={6} xl={6}>
            <div className='workbench-content-item'>
              <MyAssets data={assetsData} loading={loading} onRefresh={refreshAssets} externalPage={assetPage} externalPageSize={assetPageSize} />
            </div>
          </Col>

          {/* 中间区域：告警与监控 */}
          <Col xs={24} sm={24} md={16} lg={12} xl={12}>
            <div className='workbench-content-item'>
              <MyAlerts data={alertsData} loading={loading} timeRange={timeRange} onRefresh={refreshAlerts} />
            </div>
            {/* <MonitoringOverview timeRange={timeRange} busiGroupIds={busiGroupIds} /> */}
          </Col>

          {/* 右侧栏：业务组 */}
          <Col xs={24} sm={24} md={24} lg={6} xl={6}>
            <div className='workbench-content-item'>
              <MyBusiGroups data={busiGroupsData} loading={loading} onRefresh={refreshBusiGroups} />
            </div>
          </Col>
        </Row>

        {/* 底部统计图表 */}
        {/* <StatisticsCharts timeRange="7d" /> */}
      </div>
    </PageLayout>
  );
};

export default Workbench;
