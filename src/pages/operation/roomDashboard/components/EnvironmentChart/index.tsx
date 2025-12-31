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
import moment from 'moment';
import { EnvironmentData } from '../../types';
import { Skeleton } from 'antd';
import './index.less';

interface EnvironmentChartProps {
  data: EnvironmentData[];
  loading?: boolean;
}

const EnvironmentChart: React.FC<EnvironmentChartProps> = ({ data, loading }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current && !loading) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      chartInstance.current = echarts.init(chartRef.current, 'dark');

      const timeList = data.map((item) => moment(item.timestamp).format('HH:mm'));
      const temperatureList = data.map((item) => item.temperature);
      const humidityList = data.map((item) => item.humidity);

      const option = {
        backgroundColor: 'transparent',
        grid: {
          left: '0%',
          right: '0%',
          top: '10%',
          bottom: '10%',
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(26, 35, 70, 0.9)',
          borderColor: 'rgba(64, 128, 255, 0.5)',
          textStyle: { color: '#ffffff' },
        },
        legend: {
          data: ['温度', '湿度'],
          top: 10,
          textStyle: { color: '#a0aec0' },
        },
        xAxis: {
          type: 'category',
          data: timeList,
          axisLine: { lineStyle: { color: '#4a5568' } },
          axisLabel: { color: '#a0aec0', fontSize: 12 },
        },
        yAxis: [
          {
            type: 'value',
            name: '温度(℃)',
            position: 'left',
            axisLine: { lineStyle: { color: '#fc8181' } },
            axisLabel: { color: '#fc8181' },
            splitLine: { lineStyle: { color: '#2d3748', type: 'dashed' } },
          },
          {
            type: 'value',
            name: '湿度(%)',
            position: 'right',
            axisLine: { lineStyle: { color: '#4299e1' } },
            axisLabel: { color: '#4299e1' },
            splitLine: { show: false },
          },
        ],
        series: [
          {
            name: '温度',
            type: 'line',
            yAxisIndex: 0,
            data: temperatureList,
            smooth: true,
            lineStyle: { color: '#fc8181', width: 2 },
            itemStyle: { color: '#fc8181' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(252, 129, 129, 0.3)' },
                { offset: 1, color: 'rgba(252, 129, 129, 0.1)' },
              ]),
            },
          },
          {
            name: '湿度',
            type: 'line',
            yAxisIndex: 1,
            data: humidityList,
            smooth: true,
            lineStyle: { color: '#4299e1', width: 2 },
            itemStyle: { color: '#4299e1' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(66, 153, 225, 0.3)' },
                { offset: 1, color: 'rgba(66, 153, 225, 0.1)' },
              ]),
            },
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
      <div className='environment-chart-card dashboard-card'>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className='environment-chart-card dashboard-card'>
      <div className='card-header'>
        <span className='card-title'>环境监控</span>
      </div>
      <div className='chart-container' ref={chartRef} />
    </div>
  );
};

export default EnvironmentChart;
