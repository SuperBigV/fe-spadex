import React, { useState, useEffect, useRef } from 'react';
import { Card, Tabs, Spin, Empty } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { getMetrics, MetricsResponse } from '../../services';
import moment from 'moment';
import './index.less';

const { TabPane } = Tabs;

interface MonitoringOverviewProps {
  timeRange?: '1h' | '6h' | '24h' | '7d';
  busiGroupIds?: number[];
}

const MonitoringOverview: React.FC<MonitoringOverviewProps> = ({ timeRange = '24h', busiGroupIds }) => {
  const [activeTab, setActiveTab] = useState<'cpu_usage' | 'memory_usage' | 'disk_usage' | 'network_flow'>('cpu_usage');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MetricsResponse | null>(null);

  const cpuChartRef = useRef<HTMLDivElement>(null);
  const memoryChartRef = useRef<HTMLDivElement>(null);
  const diskChartRef = useRef<HTMLDivElement>(null);
  const networkChartRef = useRef<HTMLDivElement>(null);

  const cpuChartInstance = useRef<echarts.ECharts | null>(null);
  const memoryChartInstance = useRef<echarts.ECharts | null>(null);
  const diskChartInstance = useRef<echarts.ECharts | null>(null);
  const networkChartInstance = useRef<echarts.ECharts | null>(null);

  // 获取监控数据
  const fetchMetrics = async (metric: 'cpu_usage' | 'memory_usage' | 'disk_usage' | 'network_flow') => {
    setLoading(true);
    try {
      const result = await getMetrics({
        metric,
        timeRange,
        busiGroupId: busiGroupIds && busiGroupIds.length > 0 ? busiGroupIds[0] : undefined,
      });
      setData(result);
    } catch (error) {
      console.error('获取监控数据失败:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(activeTab);
  }, [activeTab, timeRange, busiGroupIds]);

  // 渲染图表
  useEffect(() => {
    if (!data || data.data.length === 0) return;

    let chartRef: React.RefObject<HTMLDivElement> | null = null;
    let chartInstance: React.MutableRefObject<echarts.ECharts | null> | null = null;
    let title = '';
    let color = '';

    switch (activeTab) {
      case 'cpu_usage':
        chartRef = cpuChartRef;
        chartInstance = cpuChartInstance;
        title = 'CPU使用率';
        color = '#1890ff';
        break;
      case 'memory_usage':
        chartRef = memoryChartRef;
        chartInstance = memoryChartInstance;
        title = '内存使用率';
        color = '#52c41a';
        break;
      case 'disk_usage':
        chartRef = diskChartRef;
        chartInstance = diskChartInstance;
        title = '磁盘使用率';
        color = '#faad14';
        break;
      case 'network_flow':
        chartRef = networkChartRef;
        chartInstance = networkChartInstance;
        title = '网络流量';
        color = '#722ed1';
        break;
    }

    if (!chartRef?.current || !chartInstance) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }
    chartInstance.current = echarts.init(chartRef.current);

    const timeList = data.data.map((item) => moment(item.time).format('HH:mm'));
    const valueList = data.data.map((item) => item.value);

    const unit = data.unit === 'percent' ? '%' : data.unit === 'bytes' ? 'B' : data.unit === 'bps' ? 'bps' : '';

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>${param.seriesName}: ${param.value.toFixed(2)}${unit}`;
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
        data: timeList,
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#666', fontSize: 12 },
      },
      yAxis: {
        type: 'value',
        name: unit,
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#666', formatter: `{value}${unit}` },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
      },
      series: [
        {
          name: title,
          type: 'line',
          data: valueList,
          smooth: true,
          lineStyle: { color, width: 2 },
          itemStyle: { color },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${color}40` },
              { offset: 1, color: `${color}10` },
            ]),
          },
        },
      ],
    };

    chartInstance.current.setOption(option);
  }, [activeTab, data]);

  // 窗口大小变化时调整图表
  useEffect(() => {
    const handleResize = () => {
      cpuChartInstance.current?.resize();
      memoryChartInstance.current?.resize();
      diskChartInstance.current?.resize();
      networkChartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 清理图表实例
  useEffect(() => {
    return () => {
      cpuChartInstance.current?.dispose();
      memoryChartInstance.current?.dispose();
      diskChartInstance.current?.dispose();
      networkChartInstance.current?.dispose();
    };
  }, []);

  return (
    <Card title="监控概览" extra={<DashboardOutlined />} style={{ marginBottom: 16 }}>
      <Spin spinning={loading}>
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as any)}>
          <TabPane tab="CPU使用率" key="cpu_usage">
            {data && data.data.length > 0 ? (
              <div className="monitoring-chart-container">
                <div ref={cpuChartRef} style={{ width: '100%', height: '300px' }} />
                {data.statistics && (
                  <div className="chart-statistics">
                    <span>当前: {data.statistics.current.toFixed(2)}%</span>
                    <span>平均: {data.statistics.avg.toFixed(2)}%</span>
                    <span>最大: {data.statistics.max.toFixed(2)}%</span>
                    <span>最小: {data.statistics.min.toFixed(2)}%</span>
                  </div>
                )}
              </div>
            ) : (
              <Empty description="暂无数据" />
            )}
          </TabPane>
          <TabPane tab="内存使用率" key="memory_usage">
            {data && data.data.length > 0 ? (
              <div className="monitoring-chart-container">
                <div ref={memoryChartRef} style={{ width: '100%', height: '300px' }} />
                {data.statistics && (
                  <div className="chart-statistics">
                    <span>当前: {data.statistics.current.toFixed(2)}%</span>
                    <span>平均: {data.statistics.avg.toFixed(2)}%</span>
                    <span>最大: {data.statistics.max.toFixed(2)}%</span>
                    <span>最小: {data.statistics.min.toFixed(2)}%</span>
                  </div>
                )}
              </div>
            ) : (
              <Empty description="暂无数据" />
            )}
          </TabPane>
          <TabPane tab="磁盘使用率" key="disk_usage">
            {data && data.data.length > 0 ? (
              <div className="monitoring-chart-container">
                <div ref={diskChartRef} style={{ width: '100%', height: '300px' }} />
                {data.statistics && (
                  <div className="chart-statistics">
                    <span>当前: {data.statistics.current.toFixed(2)}%</span>
                    <span>平均: {data.statistics.avg.toFixed(2)}%</span>
                    <span>最大: {data.statistics.max.toFixed(2)}%</span>
                    <span>最小: {data.statistics.min.toFixed(2)}%</span>
                  </div>
                )}
              </div>
            ) : (
              <Empty description="暂无数据" />
            )}
          </TabPane>
          <TabPane tab="网络流量" key="network_flow">
            {data && data.data.length > 0 ? (
              <div className="monitoring-chart-container">
                <div ref={networkChartRef} style={{ width: '100%', height: '300px' }} />
                {data.statistics && (
                  <div className="chart-statistics">
                    <span>当前: {data.statistics.current.toFixed(2)}{data.unit}</span>
                    <span>平均: {data.statistics.avg.toFixed(2)}{data.unit}</span>
                    <span>最大: {data.statistics.max.toFixed(2)}{data.unit}</span>
                    <span>最小: {data.statistics.min.toFixed(2)}{data.unit}</span>
                  </div>
                )}
              </div>
            ) : (
              <Empty description="暂无数据" />
            )}
          </TabPane>
        </Tabs>
      </Spin>
    </Card>
  );
};

export default MonitoringOverview;
