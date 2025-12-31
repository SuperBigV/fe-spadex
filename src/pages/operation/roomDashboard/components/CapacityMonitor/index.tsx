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
import { RoomStatistics } from '@/pages/room/types';
import { Skeleton } from 'antd';
import './index.less';

interface CapacityMonitorProps {
  statistics: RoomStatistics | null;
  loading?: boolean;
}

const getUsageColor = (rate: number) => {
  if (rate <= 0.3) return '#48bb78';
  if (rate <= 0.7) return '#f6ad55';
  return '#fc8181';
};

const CapacityMonitor: React.FC<CapacityMonitorProps> = ({ statistics, loading }) => {
  const uUsageChartRef = useRef<HTMLDivElement>(null);
  const powerUsageChartRef = useRef<HTMLDivElement>(null);
  const uUsageChartInstance = useRef<echarts.ECharts | null>(null);
  const powerUsageChartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (uUsageChartRef.current && statistics && !loading) {
      if (uUsageChartInstance.current) {
        uUsageChartInstance.current.dispose();
      }
      uUsageChartInstance.current = echarts.init(uUsageChartRef.current, 'dark');

      const uUsageRate = statistics.uUsageRate * 100;
      const color = getUsageColor(statistics.uUsageRate);

      const option = {
        backgroundColor: 'transparent',
        grid: {
          left: '15%',
          right: '10%',
          top: '20%',
          bottom: '20%',
        },
        xAxis: {
          type: 'value',
          max: 100,
          show: false,
        },
        yAxis: {
          type: 'category',
          data: [''],
          axisLabel: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
        },
        series: [
          {
            type: 'bar',
            data: [uUsageRate],
            barWidth: '60%',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: color,
                  },
                  {
                    offset: 1,
                    color: color,
                  },
                ],
              },
              borderRadius: [0, 20, 20, 0],
            },
            label: {
              show: true,
              position: 'right',
              formatter: `{c}%`,
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 'bold',
              offset: [10, 0],
            },
            z: 2,
          },
          {
            type: 'bar',
            data: [100],
            barWidth: '60%',
            itemStyle: {
              color: '#2d3748',
              borderRadius: [0, 20, 20, 0],
            },
            barGap: '-100%',
            z: 1,
          },
        ],
      };

      uUsageChartInstance.current.setOption(option);
    }

    return () => {
      uUsageChartInstance.current?.dispose();
    };
  }, [statistics, loading]);

  useEffect(() => {
    if (powerUsageChartRef.current && statistics && !loading) {
      if (powerUsageChartInstance.current) {
        powerUsageChartInstance.current.dispose();
      }
      powerUsageChartInstance.current = echarts.init(powerUsageChartRef.current, 'dark');

      const powerUsageRate = statistics.powerUsageRate * 100;
      const color = getUsageColor(statistics.powerUsageRate);

      const option = {
        backgroundColor: 'transparent',
        grid: {
          left: '15%',
          right: '10%',
          top: '20%',
          bottom: '20%',
        },
        xAxis: {
          type: 'value',
          max: 100,
          show: false,
        },
        yAxis: {
          type: 'category',
          data: [''],
          axisLabel: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
        },
        series: [
          {
            type: 'bar',
            data: [powerUsageRate],
            barWidth: '60%',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: color,
                  },
                  {
                    offset: 1,
                    color: color,
                  },
                ],
              },
              borderRadius: [0, 20, 20, 0],
            },
            label: {
              show: true,
              position: 'right',
              formatter: `{c}%`,
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 'bold',
              offset: [10, 0],
            },
            z: 2,
          },
          {
            type: 'bar',
            data: [100],
            barWidth: '60%',
            itemStyle: {
              color: '#2d3748',
              borderRadius: [0, 20, 20, 0],
            },
            barGap: '-100%',
            z: 1,
          },
        ],
      };

      powerUsageChartInstance.current.setOption(option);
    }

    return () => {
      powerUsageChartInstance.current?.dispose();
    };
  }, [statistics, loading]);

  useEffect(() => {
    const handleResize = () => {
      uUsageChartInstance.current?.resize();
      powerUsageChartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className='capacity-monitor-card dashboard-card'>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className='capacity-monitor-card dashboard-card'>
        <div className='empty-placeholder'>暂无数据</div>
      </div>
    );
  }

  return (
    <div className='capacity-monitor-card dashboard-card'>
      <div className='card-header'>
        <span className='card-title'>容量监控</span>
      </div>
      <div className='capsules-container'>
        <div className='capsule-item'>
          <div className='capsule-header'>
            <span className='capsule-label'>U位使用率</span>
            <span className='capsule-value'>
              {statistics.uUsed} / {statistics.uTotal} U
            </span>
          </div>
          <div className='capsule-chart' ref={uUsageChartRef} />
        </div>
        <div className='capsule-item'>
          <div className='capsule-header'>
            <span className='capsule-label'>功率使用率</span>
            <span className='capsule-value'>
              {statistics.powerUsed.toFixed(1)} / {statistics.powerTotal.toFixed(1)} KW
            </span>
          </div>
          <div className='capsule-chart' ref={powerUsageChartRef} />
        </div>
      </div>
    </div>
  );
};

export default CapacityMonitor;
