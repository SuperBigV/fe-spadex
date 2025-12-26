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

import React, { useState } from 'react';
import { Tooltip, Dropdown, Menu } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Rack, RackDevice } from '@/pages/room/types';
import './UUnitVisualization.less';

interface UUnitVisualizationProps {
  rack: Rack;
  devices: RackDevice[];
  onUClick: (u: number) => void;
  onDeviceClick: (device: RackDevice) => void;
  onDeviceEdit?: (device: RackDevice) => void;
  onDeviceDelete?: (device: RackDevice) => void;
}

const UUnitVisualization: React.FC<UUnitVisualizationProps> = ({ rack, devices, onUClick, onDeviceClick, onDeviceEdit, onDeviceDelete }) => {
  const [contextMenuVisible, setContextMenuVisible] = useState<number | null>(null);
  const [contextMenuDeviceId, setContextMenuDeviceId] = useState<number | null>(null);
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

  const handleDeviceContextMenu = (e: React.MouseEvent, device: RackDevice) => {
    e.preventDefault();
    e.stopPropagation();
    // 使用设备ID来控制菜单显示，确保同一设备的所有U位共享同一个菜单
    setContextMenuDeviceId(device.id);
    setContextMenuVisible(device.id);
  };

  const handleMenuClick = (e: any, device: RackDevice) => {
    // 阻止事件冒泡
    if (e?.domEvent) {
      e.domEvent.stopPropagation();
      e.domEvent.preventDefault();
    }
    setContextMenuVisible(null);
    setContextMenuDeviceId(null);
    const key = e.key;
    if (key === 'edit' && onDeviceEdit) {
      onDeviceEdit(device);
    } else if (key === 'delete' && onDeviceDelete) {
      onDeviceDelete(device);
    }
  };

  const getDeviceMenu = (device: RackDevice) => (
    <Menu onClick={(e) => handleMenuClick(e, device)}>
      <Menu.Item key='edit' icon={<EditOutlined />}>
        编辑U位
      </Menu.Item>
      <Menu.Item key='delete' icon={<DeleteOutlined />} danger>
        删除设备
      </Menu.Item>
    </Menu>
  );

  return (
    <div className='u-unit-visualization'>
      <div className='u-unit-list'>
        {Array.from({ length: rack.totalU }, (_, i) => rack.totalU - i).map((u) => {
          const device = getDeviceAtU(u);
          const isStart = device && isDeviceStart(u, device);

          return (
            <div
              key={u}
              className={`u-unit-item ${device ? 'occupied' : 'empty'}`}
              onClick={(e) => {
                // 如果U位已被占用，阻止点击事件
                if (device) {
                  e.stopPropagation();
                  return;
                }
                onUClick(u);
              }}
              style={
                device
                  ? {
                      backgroundColor: getDeviceStatusColor(device.status),
                      cursor: 'default',
                    }
                  : {}
              }
            >
              <div className='u-unit-number'>{u}U</div>
              {device && (
                <div
                  className='device-block-wrapper'
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onContextMenu={(e) => {
                    e.stopPropagation();
                    // 所有被占用的U位都触发同一个菜单
                    handleDeviceContextMenu(e, device);
                  }}
                >
                  {isStart ? (
                    // 只在起始U位渲染Dropdown，确保同一设备只有一个菜单实例
                    <Dropdown
                      overlay={getDeviceMenu(device)}
                      trigger={['contextMenu']}
                      visible={contextMenuDeviceId === device.id}
                      onVisibleChange={(visible) => {
                        if (!visible) {
                          setContextMenuVisible(null);
                          setContextMenuDeviceId(null);
                        } else {
                          // 当菜单显示时，确保只显示当前设备的菜单
                          setContextMenuDeviceId(device.id);
                          setContextMenuVisible(device.id);
                        }
                      }}
                      getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
                      overlayClassName='device-context-menu'
                    >
                      <Tooltip
                        title={
                          <div>
                            <div>设备名称: {device.deviceName}</div>
                            <div>
                              U位范围: {device.startU}-{device.startU + device.heightU - 1}U
                            </div>
                            <div>状态: {device.status}</div>
                            <div style={{ marginTop: 8, fontSize: '11px', opacity: 0.8 }}>右键点击可编辑或删除</div>
                          </div>
                        }
                      >
                        <div
                          className='device-block'
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeviceClick(device);
                          }}
                          onContextMenu={(e) => handleDeviceContextMenu(e, device)}
                        >
                          <div className='device-name'>{device.deviceName}</div>
                          <div className='device-u-range'>
                            {device.startU}-{device.startU + device.heightU - 1}U
                          </div>
                        </div>
                      </Tooltip>
                    </Dropdown>
                  ) : (
                    // 非起始U位不渲染Dropdown，但支持右键触发菜单（通过状态更新）
                    <Tooltip
                      title={
                        <div>
                          <div>设备名称: {device.deviceName}</div>
                          <div>
                            U位范围: {device.startU}-{device.startU + device.heightU - 1}U
                          </div>
                          <div>状态: {device.status}</div>
                          <div style={{ marginTop: 8, fontSize: '11px', opacity: 0.8 }}>右键点击可编辑或删除</div>
                        </div>
                      }
                    >
                      <div
                        className='device-block'
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeviceClick(device);
                        }}
                        onContextMenu={(e) => handleDeviceContextMenu(e, device)}
                      >
                        <div className='device-name'>{device.deviceName}</div>
                        <div className='device-u-range'>
                          {device.startU}-{device.startU + device.heightU - 1}U
                        </div>
                      </div>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UUnitVisualization;
