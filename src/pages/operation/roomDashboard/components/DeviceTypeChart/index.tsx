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
import { DeviceTypeStatistics } from '../../types';
import { Skeleton } from 'antd';
import './index.less';

interface DeviceTypeChartProps {
  data: DeviceTypeStatistics[];
  loading?: boolean;
}

const getDeviceTypeColor = (deviceType: string) => {
  const colorMap: Record<string, string> = {
    server: '#4fd1c7',
    switch: '#4299e1',
    router: '#f6ad55',
    firewall: '#fc8181',
    storage: '#48bb78',
  };
  return colorMap[deviceType] || '#718096';
};

const DeviceTypeChart: React.FC<DeviceTypeChartProps> = ({ data, loading }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current && !loading) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      chartInstance.current = echarts.init(chartRef.current, 'dark');

      const categories = data.map((item) => item.deviceTypeName);
      const values = data.map((item) => ({
        value: item.count,
        itemStyle: { color: getDeviceTypeColor(item.deviceType) },
      }));

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter: (params: any) => {
            const param = params[0];
            return `${param.name}: ${param.value}`;
          },
          backgroundColor: 'rgba(26, 35, 70, 0.9)',
          borderColor: 'rgba(64, 128, 255, 0.5)',
          textStyle: { color: '#ffffff' },
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
          data: categories,
          axisLabel: {
            color: '#a0aec0',
            rotate: 0,
          },
          axisLine: {
            lineStyle: {
              color: '#2d3748',
            },
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#a0aec0',
          },
          axisLine: {
            lineStyle: {
              color: '#2d3748',
            },
          },
          splitLine: {
            lineStyle: {
              color: '#2d3748',
            },
          },
        },
        series: [
          {
            type: 'bar',
            data: values,
            barWidth: '60%',
            label: {
              show: true,
              position: 'top',
              color: '#ffffff',
              fontSize: 12,
            },
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
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
      <div className='device-type-chart-card dashboard-card'>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className='device-type-chart-card dashboard-card'>
      <div className='card-header'>
        <span className='card-title'>设备类型统计</span>
      </div>
      <div className='chart-container' ref={chartRef} />
    </div>
  );
};

export default DeviceTypeChart;
