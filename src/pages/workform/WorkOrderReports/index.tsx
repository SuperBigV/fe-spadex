import React, { useState, useEffect, useRef, useContext } from 'react';
import moment from 'moment';
import { Card, Row, Col, Statistic, DatePicker, Spin, Empty } from 'antd';
import { BarChartOutlined, FileTextOutlined, ClockCircleOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, TeamOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { CommonStateContext } from '@/App';
import PageLayout from '@/components/pageLayout';
import { getReportOverview, getReportByType, getReportTopAssignees } from '@/services/workform';
import './index.less';

const { RangePicker } = DatePicker;

interface ByTypeItem {
  work_order_type_id: number;
  work_order_type_name: string;
  count: number;
}

interface TopAssigneeItem {
  assignee_id: string;
  assignee_name: string;
  closed_count: number;
  avg_duration_seconds?: number;
}

const WorkOrderReports: React.FC = () => {
  const { darkMode } = useContext(CommonStateContext);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>({});
  const [byType, setByType] = useState<ByTypeItem[]>([]);
  const [topAssignees, setTopAssignees] = useState<TopAssigneeItem[]>([]);
  const [range, setRange] = useState<[moment.Moment, moment.Moment]>([moment().subtract(30, 'days'), moment()]);

  const typeChartRef = useRef<HTMLDivElement>(null);
  const assigneeChartRef = useRef<HTMLDivElement>(null);
  const typeChartInstance = useRef<echarts.ECharts | null>(null);
  const assigneeChartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    setLoading(true);
    const start = range[0]?.unix();
    const end = range[1]?.unix();
    Promise.all([
      getReportOverview({ start_time: start, end_time: end }),
      getReportByType({ start_time: start, end_time: end }),
      getReportTopAssignees({ start_time: start, end_time: end, limit: 10 }),
    ])
      .then(([ov, bt, ta]: [any, any, any]) => {
        setOverview(ov || {});
        setByType(Array.isArray(bt?.list) ? bt.list : Array.isArray(bt) ? bt : []);
        setTopAssignees(Array.isArray(ta?.list) ? ta.list : Array.isArray(ta) ? ta : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range]);

  // 深色主题下的 ECharts 颜色
  const textColor = darkMode ? 'rgba(255,255,255,0.85)' : '#333';
  const subTextColor = darkMode ? 'rgba(255,255,255,0.65)' : '#666';
  const axisLineColor = darkMode ? 'rgba(255,255,255,0.15)' : '#e8e8e8';
  const splitLineColor = darkMode ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const pieBorderColor = darkMode ? 'rgba(0,0,0,0.3)' : '#fff';

  // 工单类型分布 - 饼图
  useEffect(() => {
    if (!typeChartRef.current || loading) return;
    if (typeChartInstance.current) typeChartInstance.current.dispose();
    typeChartInstance.current = echarts.init(typeChartRef.current);

    const list = Array.isArray(byType) ? byType : [];
    const hasData = list.length > 0;
    const pieData = list.map((item) => ({
      value: item.count,
      name: item.work_order_type_name || `类型${item.work_order_type_id}`,
    }));

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: darkMode ? 'rgba(30,30,30,0.95)' : undefined,
        borderColor: darkMode ? 'rgba(255,255,255,0.12)' : undefined,
        textStyle: { color: darkMode ? 'rgba(255,255,255,0.85)' : undefined },
      },
      legend: {
        orient: 'vertical',
        right: 16,
        top: 'center',
        type: 'scroll',
        textStyle: { fontSize: 12, color: textColor },
      },
      series: [
        {
          name: '工单类型',
          type: 'pie',
          radius: ['42%', '72%'],
          center: ['38%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: pieBorderColor,
            borderWidth: 2,
          },
          label: {
            show: hasData,
            formatter: '{b}\n{c}',
            fontSize: 11,
            color: textColor,
          },
          emphasis: {
            label: { show: true, fontWeight: 'bold', color: textColor },
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: darkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)' },
          },
          data: hasData ? pieData : [],
        },
      ],
    };
    typeChartInstance.current.setOption(option);
  }, [byType, loading, darkMode, textColor, subTextColor, pieBorderColor]);

  // TOP 处理人 - 横向柱状图
  useEffect(() => {
    if (!assigneeChartRef.current || loading) return;
    if (assigneeChartInstance.current) assigneeChartInstance.current.dispose();
    assigneeChartInstance.current = echarts.init(assigneeChartRef.current);

    const list = Array.isArray(topAssignees) ? topAssignees : [];
    const hasData = list.length > 0;
    const names = list.map((item) => item.assignee_name || item.assignee_id || '-').reverse();
    const values = list.map((item) => item.closed_count ?? 0).reverse();

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = params?.[0];
          if (!p) return '';
          const idx = p.dataIndex;
          const item = list[list.length - 1 - idx];
          const avg = item?.avg_duration_seconds != null ? (item.avg_duration_seconds / 3600).toFixed(1) : '-';
          return `${p.name}<br/>关闭数: ${p.value}<br/>平均解决时长: ${avg} 小时`;
        },
        backgroundColor: darkMode ? 'rgba(30,30,30,0.95)' : undefined,
        borderColor: darkMode ? 'rgba(255,255,255,0.12)' : undefined,
        textStyle: { color: darkMode ? 'rgba(255,255,255,0.85)' : undefined },
      },
      grid: {
        left: 80,
        right: 24,
        top: 16,
        bottom: 16,
        containLabel: false,
      },
      xAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: subTextColor, fontSize: 11 },
        splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } },
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textColor, fontSize: 12 },
      },
      series: [
        {
          name: '关闭数',
          type: 'bar',
          data: values,
          barMaxWidth: 28,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: '#69c0ff' },
            ]),
            borderRadius: [0, 4, 4, 0],
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#40a9ff' },
                { offset: 1, color: '#91d5ff' },
              ]),
            },
          },
        },
      ],
    };
    assigneeChartInstance.current.setOption(option);
  }, [topAssignees, loading, darkMode, textColor, subTextColor, axisLineColor, splitLineColor]);

  useEffect(() => {
    const onResize = () => {
      typeChartInstance.current?.resize();
      assigneeChartInstance.current?.resize();
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      typeChartInstance.current?.dispose();
      assigneeChartInstance.current?.dispose();
    };
  }, []);

  const avgHours = overview.avg_resolve_duration_seconds != null ? (overview.avg_resolve_duration_seconds / 3600).toFixed(1) : '-';

  const statCards = [
    { key: 'total', title: '总工单数', value: overview.total_count ?? 0, icon: <FileTextOutlined />, color: '#1890ff' },
    { key: 'pending', title: '待处理', value: overview.pending_count ?? 0, icon: <ClockCircleOutlined />, color: '#faad14' },
    { key: 'processing', title: '处理中', value: overview.processing_count ?? 0, icon: <SyncOutlined spin />, color: '#722ed1' },
    { key: 'resolved', title: '已解决', value: overview.resolved_count ?? 0, icon: <CheckCircleOutlined />, color: '#52c41a' },
    { key: 'closed', title: '已关闭', value: overview.closed_count ?? 0, icon: <CloseCircleOutlined />, color: '#8c8c8c' },
    { key: 'avg', title: '平均解决时长(小时)', value: avgHours, icon: <ClockCircleOutlined />, color: '#13c2c2' },
  ];

  return (
    <PageLayout title='报表分析' icon={<BarChartOutlined />}>
      <Spin spinning={loading}>
        <div className='workorder-reports'>
          <div className='workorder-reports-filter'>
            <span className='filter-label'>统计周期：</span>
            <RangePicker value={range} onChange={(v) => v && setRange(v as [moment.Moment, moment.Moment])} allowClear={false} className='filter-range' />
          </div>

          <Row gutter={[16, 16]} className='workorder-reports-stats'>
            {statCards.map((item) => (
              <Col key={item.key} xs={24} sm={12} md={8} lg={4}>
                <Card size='small' className='stat-card' bordered={false}>
                  <Statistic
                    title={
                      <span className='stat-title'>
                        {item.icon}
                        <span>{item.title}</span>
                      </span>
                    }
                    value={item.value}
                    valueStyle={{ color: item.color, fontSize: item.key === 'avg' ? undefined : '22px' }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]} className='workorder-reports-charts'>
            <Col xs={24} lg={12}>
              <Card
                size='small'
                title={
                  <span>
                    <FileTextOutlined style={{ marginRight: 8 }} />
                    工单类型分布
                  </span>
                }
                className='chart-card type-chart-card'
              >
                <div ref={typeChartRef} className='chart-container chart-pie' />
                {(!byType || byType.length === 0) && !loading && (
                  <div className='chart-empty'>
                    <Empty description='该周期暂无类型分布数据' />
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                size='small'
                title={
                  <span>
                    <TeamOutlined style={{ marginRight: 8 }} />
                    TOP 处理人
                  </span>
                }
                className='chart-card assignee-chart-card'
              >
                <div ref={assigneeChartRef} className='chart-container chart-bar' />
                {(!topAssignees || topAssignees.length === 0) && !loading && (
                  <div className='chart-empty'>
                    <Empty description='该周期暂无处理人数据' />
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </Spin>
    </PageLayout>
  );
};

export default WorkOrderReports;
