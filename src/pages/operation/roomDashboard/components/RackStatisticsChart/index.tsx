/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Rack } from '@/pages/room/types';
import { Skeleton } from 'antd';
import './index.less';

interface RackStatisticsChartProps {
  data: Rack[];
  loading?: boolean;
}

const RackStatisticsChart: React.FC<RackStatisticsChartProps> = ({ data, loading }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current && !loading) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      chartInstance.current = echarts.init(chartRef.current, 'dark');

      const rackList = data.slice(0, 10); // 最多显示10个机柜

      const option = {
        backgroundColor: 'transparent',
        grid: {
          left: '15%',
          right: '10%',
          top: '10%',
          bottom: '15%',
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(26, 35, 70, 0.9)',
          borderColor: 'rgba(64, 128, 255, 0.5)',
          textStyle: { color: '#ffffff' },
        },
        legend: {
          data: ['已用U', '可用U'],
          top: 10,
          textStyle: { color: '#a0aec0' },
        },
        xAxis: {
          type: 'category',
          data: rackList.map((r) => r.name),
          axisLine: { lineStyle: { color: '#4a5568' } },
          axisLabel: { color: '#a0aec0', fontSize: 12, rotate: 45 },
        },
        yAxis: {
          type: 'value',
          name: 'U数',
          axisLine: { lineStyle: { color: '#4a5568' } },
          axisLabel: { color: '#a0aec0' },
          splitLine: { lineStyle: { color: '#2d3748', type: 'dashed' } },
        },
        series: [
          {
            name: '已用U',
            type: 'bar',
            stack: 'total',
            data: rackList.map((r) => r.usedU || 0),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#4fd1c7' },
                { offset: 1, color: '#2c7a7b' },
              ]),
            },
          },
          {
            name: '可用U',
            type: 'bar',
            stack: 'total',
            data: rackList.map((r) => (r.totalU || 0) - (r.usedU || 0)),
            itemStyle: { color: '#4a5568' },
          },
        ],
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, loading]);

  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className='rack-statistics-chart-card dashboard-card'>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className='rack-statistics-chart-card dashboard-card'>
      <div className='card-header'>
        <span className='card-title'>机柜U数统计</span>
      </div>
      <div className='chart-container' ref={chartRef} />
    </div>
  );
};

export default RackStatisticsChart;

