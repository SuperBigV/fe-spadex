import React, { useState, useEffect, useRef } from 'react';
import { Card, Tabs, Spin, Empty } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { getStatistics, StatisticsResponse } from '../../services';
import moment from 'moment';
import './index.less';

const { TabPane } = Tabs;

interface StatisticsChartsProps {
  timeRange?: '7d' | '30d';
}

const StatisticsCharts: React.FC<StatisticsChartsProps> = ({ timeRange = '7d' }) => {
  const [activeTab, setActiveTab] = useState<'alert_trend' | 'asset_distribution' | 'resource_trend' | 'busi_health'>('alert_trend');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StatisticsResponse | null>(null);

  const alertTrendChartRef = useRef<HTMLDivElement>(null);
  const assetDistributionChartRef = useRef<HTMLDivElement>(null);
  const resourceTrendChartRef = useRef<HTMLDivElement>(null);
  const busiHealthChartRef = useRef<HTMLDivElement>(null);

  const alertTrendChartInstance = useRef<echarts.ECharts | null>(null);
  const assetDistributionChartInstance = useRef<echarts.ECharts | null>(null);
  const resourceTrendChartInstance = useRef<echarts.ECharts | null>(null);
  const busiHealthChartInstance = useRef<echarts.ECharts | null>(null);

  // 获取统计数据
  const fetchStatistics = async (type: 'alert_trend' | 'asset_distribution' | 'resource_trend' | 'busi_health') => {
    setLoading(true);
    try {
      const result = await getStatistics({ type, timeRange });
      setData(result);
    } catch (error) {
      console.error('获取统计数据失败:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics(activeTab);
  }, [activeTab, timeRange]);

  // 渲染告警趋势图
  useEffect(() => {
    if (activeTab !== 'alert_trend' || !data || data.type !== 'alert_trend' || !alertTrendChartRef.current) return;

    if (alertTrendChartInstance.current) {
      alertTrendChartInstance.current.dispose();
    }
    alertTrendChartInstance.current = echarts.init(alertTrendChartRef.current);

    const dateList = data.data.map((item) => moment(item.date).format('MM-DD'));
    const criticalList = data.data.map((item) => item.critical);
    const warningList = data.data.map((item) => item.warning);
    const infoList = data.data.map((item) => item.info);

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['严重', '警告', '通知'],
        top: 10,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dateList,
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#666', fontSize: 12 },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#666' },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
      },
      series: [
        {
          name: '严重',
          type: 'line',
          data: criticalList,
          smooth: true,
          lineStyle: { color: '#ff4d4f', width: 2 },
          itemStyle: { color: '#ff4d4f' },
        },
        {
          name: '警告',
          type: 'line',
          data: warningList,
          smooth: true,
          lineStyle: { color: '#faad14', width: 2 },
          itemStyle: { color: '#faad14' },
        },
        {
          name: '通知',
          type: 'line',
          data: infoList,
          smooth: true,
          lineStyle: { color: '#1890ff', width: 2 },
          itemStyle: { color: '#1890ff' },
        },
      ],
    };

    alertTrendChartInstance.current.setOption(option);
  }, [activeTab, data]);

  // 渲染资产分布图
  useEffect(() => {
    if (activeTab !== 'asset_distribution' || !data || data.type !== 'asset_distribution' || !assetDistributionChartRef.current) return;

    if (assetDistributionChartInstance.current) {
      assetDistributionChartInstance.current.dispose();
    }
    assetDistributionChartInstance.current = echarts.init(assetDistributionChartRef.current);

    // 状态分布饼图
    const statusData = data.data.status.map((item) => ({
      value: item.value,
      name: item.name,
    }));

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
      },
      series: [
        {
          name: '资产状态分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}: {c}\n({d}%)',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          data: statusData,
        },
      ],
    };

    assetDistributionChartInstance.current.setOption(option);
  }, [activeTab, data]);

  // 渲染资源趋势图
  useEffect(() => {
    if (activeTab !== 'resource_trend' || !data || data.type !== 'resource_trend' || !resourceTrendChartRef.current) return;

    if (resourceTrendChartInstance.current) {
      resourceTrendChartInstance.current.dispose();
    }
    resourceTrendChartInstance.current = echarts.init(resourceTrendChartRef.current);

    const dateList = data.data.map((item) => moment(item.date).format('MM-DD'));
    const cpuList = data.data.map((item) => item.cpu);
    const memoryList = data.data.map((item) => item.memory);
    const diskList = data.data.map((item) => item.disk);

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['CPU', '内存', '磁盘'],
        top: 10,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dateList,
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#666', fontSize: 12 },
      },
      yAxis: {
        type: 'value',
        name: '使用率(%)',
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#666', formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
      },
      series: [
        {
          name: 'CPU',
          type: 'line',
          data: cpuList,
          smooth: true,
          lineStyle: { color: '#1890ff', width: 2 },
          itemStyle: { color: '#1890ff' },
        },
        {
          name: '内存',
          type: 'line',
          data: memoryList,
          smooth: true,
          lineStyle: { color: '#52c41a', width: 2 },
          itemStyle: { color: '#52c41a' },
        },
        {
          name: '磁盘',
          type: 'line',
          data: diskList,
          smooth: true,
          lineStyle: { color: '#faad14', width: 2 },
          itemStyle: { color: '#faad14' },
        },
      ],
    };

    resourceTrendChartInstance.current.setOption(option);
  }, [activeTab, data]);

  // 渲染业务组健康度图
  useEffect(() => {
    if (activeTab !== 'busi_health' || !data || data.type !== 'busi_health' || !busiHealthChartRef.current) return;

    if (busiHealthChartInstance.current) {
      busiHealthChartInstance.current.dispose();
    }
    busiHealthChartInstance.current = echarts.init(busiHealthChartRef.current);

    const busiGroupList = data.data.slice(0, 10); // 最多显示10个业务组
    const nameList = busiGroupList.map((item) => item.busiGroupName);
    const healthScoreList = busiGroupList.map((item) => item.healthScore);

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const param = params[0];
          const item = busiGroupList[param.dataIndex];
          return `${param.name}<br/>健康度: ${param.value}分<br/>资产数: ${item.assetCount}<br/>告警数: ${item.alertCount}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: nameList,
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#666', fontSize: 12, rotate: 45 },
      },
      yAxis: {
        type: 'value',
        name: '健康度评分',
        max: 100,
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#666' },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
      },
      series: [
        {
          name: '健康度',
          type: 'bar',
          data: healthScoreList.map((score, index) => ({
            value: score,
            itemStyle: {
              color: score >= 80 ? '#52c41a' : score >= 60 ? '#faad14' : '#ff4d4f',
            },
          })),
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
          },
        },
      ],
    };

    busiHealthChartInstance.current.setOption(option);
  }, [activeTab, data]);

  // 窗口大小变化时调整图表
  useEffect(() => {
    const handleResize = () => {
      alertTrendChartInstance.current?.resize();
      assetDistributionChartInstance.current?.resize();
      resourceTrendChartInstance.current?.resize();
      busiHealthChartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 清理图表实例
  useEffect(() => {
    return () => {
      alertTrendChartInstance.current?.dispose();
      assetDistributionChartInstance.current?.dispose();
      resourceTrendChartInstance.current?.dispose();
      busiHealthChartInstance.current?.dispose();
    };
  }, []);

  return (
    <Card title="数据统计图表" extra={<BarChartOutlined />}>
      <Spin spinning={loading}>
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as any)}>
          <TabPane tab="告警趋势" key="alert_trend">
            {data && data.type === 'alert_trend' && data.data.length > 0 ? (
              <div ref={alertTrendChartRef} style={{ width: '100%', height: '400px' }} />
            ) : (
              <Empty description="暂无数据" />
            )}
          </TabPane>
          <TabPane tab="资产状态分布" key="asset_distribution">
            {data && data.type === 'asset_distribution' && data.data.status.length > 0 ? (
              <div ref={assetDistributionChartRef} style={{ width: '100%', height: '400px' }} />
            ) : (
              <Empty description="暂无数据" />
            )}
          </TabPane>
          <TabPane tab="资源使用趋势" key="resource_trend">
            {data && data.type === 'resource_trend' && data.data.length > 0 ? (
              <div ref={resourceTrendChartRef} style={{ width: '100%', height: '400px' }} />
            ) : (
              <Empty description="暂无数据" />
            )}
          </TabPane>
          <TabPane tab="业务组健康度" key="busi_health">
            {data && data.type === 'busi_health' && data.data.length > 0 ? (
              <div ref={busiHealthChartRef} style={{ width: '100%', height: '400px' }} />
            ) : (
              <Empty description="暂无数据" />
            )}
          </TabPane>
        </Tabs>
      </Spin>
    </Card>
  );
};

export default StatisticsCharts;
