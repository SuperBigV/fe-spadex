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
 *
 */

import React from 'react';
import { Tooltip } from 'antd';
import { Rack, RackDevice } from '@/pages/room/types';
import './UUnitVisualization.less';

interface UUnitVisualizationProps {
  rack: Rack;
  devices: RackDevice[];
  onUClick: (u: number) => void;
  onDeviceClick: (device: RackDevice) => void;
}

const UUnitVisualization: React.FC<UUnitVisualizationProps> = ({
  rack,
  devices,
  onUClick,
  onDeviceClick,
}) => {
  const getDeviceAtU = (u: number): RackDevice | undefined => {
    return devices.find((device) => {
      const endU = device.startU + device.heightU - 1;
      return u >= device.startU && u <= endU;
    });
  };

  const getDeviceStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      online: 'var(--fc-green-6-color)',
      offline: 'var(--fc-text-5)',
      maintenance: 'var(--fc-gold-6-color)',
    };
    return colorMap[status] || 'var(--fc-geekblue-5-color)';
  };

  const getDeviceStartU = (device: RackDevice) => {
    return device.startU;
  };

  const isDeviceStart = (u: number, device: RackDevice) => {
    return u === device.startU;
  };

  return (
    <div className='u-unit-visualization'>
      <div className='u-unit-list'>
        {Array.from({ length: rack.totalU }, (_, i) => rack.totalU - i).map((u) => {
          const device = getDeviceAtU(u);
          const isStart = device && isDeviceStart(u, device);
          const deviceStartU = device ? getDeviceStartU(device) : null;

          return (
            <div
              key={u}
              className={`u-unit-item ${device ? 'occupied' : 'empty'} ${isStart ? 'device-start' : ''}`}
              onClick={() => onUClick(u)}
            >
              <div className='u-unit-number'>{u}U</div>
              {device && isStart && (
                <Tooltip
                  title={
                    <div>
                      <div>设备名称: {device.deviceName}</div>
                      <div>U位范围: {device.startU}-{device.startU + device.heightU - 1}U</div>
                      <div>状态: {device.status}</div>
                    </div>
                  }
                >
                  <div
                    className='device-block'
                    style={{
                      height: `${device.heightU * 25}px`,
                      backgroundColor: getDeviceStatusColor(device.status),
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeviceClick(device);
                    }}
                  >
                    <div className='device-name'>{device.deviceName}</div>
                    <div className='device-u-range'>
                      {device.startU}-{device.startU + device.heightU - 1}U
                    </div>
                  </div>
                </Tooltip>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UUnitVisualization;

