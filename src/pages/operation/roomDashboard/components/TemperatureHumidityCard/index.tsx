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
import { Skeleton } from 'antd';
import './index.less';

interface TemperatureHumidityCardProps {
  temperature: number;
  humidity: number;
  loading?: boolean;
}

const TemperatureHumidityCard: React.FC<TemperatureHumidityCardProps> = ({ temperature, humidity, loading }) => {
  const temperatureChartRef = useRef<HTMLDivElement>(null);
  const humidityChartRef = useRef<HTMLDivElement>(null);
  const temperatureChartInstance = useRef<echarts.ECharts | null>(null);
  const humidityChartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (temperatureChartRef.current && !loading) {
      if (temperatureChartInstance.current) {
        temperatureChartInstance.current.dispose();
      }
      temperatureChartInstance.current = echarts.init(temperatureChartRef.current, 'dark');

      const option = {
        backgroundColor: 'transparent',
        series: [
          {
            type: 'gauge',
            center: ['50%', '60%'],
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 50,
            splitNumber: 5,
            axisLine: {
              lineStyle: {
                width: 12,
                color: [
                  [0.4, '#48bb78'],
                  [0.6, '#f6ad55'],
                  [1, '#fc8181'],
                ],
              },
            },
            pointer: {
              itemStyle: { color: '#4fd1c7' },
            },
            detail: {
              fontSize: 16,
              offsetCenter: [0, '70%'],
              valueAnimation: true,
              formatter: '{value}℃',
              color: '#4fd1c7',
            },
            data: [
              {
                // 保留一位小数
                value: temperature.toFixed(1),
                name: '温度',
              },
            ],
          },
        ],
      };

      temperatureChartInstance.current.setOption(option);
    }

    return () => {
      temperatureChartInstance.current?.dispose();
    };
  }, [temperature, loading]);

  useEffect(() => {
    if (humidityChartRef.current && !loading) {
      if (humidityChartInstance.current) {
        humidityChartInstance.current.dispose();
      }
      humidityChartInstance.current = echarts.init(humidityChartRef.current, 'dark');

      const option = {
        backgroundColor: 'transparent',
        series: [
          {
            type: 'gauge',
            center: ['50%', '60%'],
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 100,
            splitNumber: 5,
            axisLine: {
              lineStyle: {
                width: 12,
                color: [
                  [0.3, '#4299e1'],
                  [0.6, '#f6ad55'],
                  [1, '#fc8181'],
                ],
              },
            },
            pointer: {
              itemStyle: { color: '#4fd1c7' },
            },
            detail: {
              fontSize: 16,
              offsetCenter: [0, '70%'],
              valueAnimation: true,
              formatter: '{value}℃',
              color: '#4fd1c7',
            },
            data: [
              {
                value: humidity.toFixed(1),
                name: '湿度',
              },
            ],
          },
        ],
      };

      humidityChartInstance.current.setOption(option);
    }

    return () => {
      humidityChartInstance.current?.dispose();
    };
  }, [humidity, loading]);

  // 响应式
  useEffect(() => {
    const handleResize = () => {
      temperatureChartInstance.current?.resize();
      humidityChartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getTemperatureStatus = (temp: number) => {
    if (temp < 20) return '偏低';
    if (temp > 30) return '偏高';
    return '正常';
  };

  const getHumidityStatus = (hum: number) => {
    if (hum < 30) return '偏低';
    if (hum > 60) return '偏高';
    return '正常';
  };

  if (loading) {
    return (
      <div className='temperature-humidity-card dashboard-card'>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className='temperature-humidity-card dashboard-card'>
      <div className='card-header'>
        <span className='card-title'>环境监控</span>
      </div>
      <div className='gauges-container'>
        <div className='gauge-item'>
          <div className='gauge-header'>
            <span className='gauge-title'>当前温度</span>
            <span className='gauge-unit'>℃</span>
          </div>
          <div className='gauge-chart' ref={temperatureChartRef} />
          <div className='gauge-footer'>
            <span className='gauge-value'>{temperature.toFixed(1)}℃</span>
            <span className='gauge-status'>{getTemperatureStatus(temperature)}</span>
          </div>
        </div>
        <div className='gauge-item'>
          <div className='gauge-header'>
            <span className='gauge-title'>当前湿度</span>
            <span className='gauge-unit'>℃</span>
          </div>
          <div className='gauge-chart' ref={humidityChartRef} />
          <div className='gauge-footer'>
            <span className='gauge-value'>{humidity.toFixed(1)}℃</span>
            <span className='gauge-status'>{getHumidityStatus(humidity)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemperatureHumidityCard;
