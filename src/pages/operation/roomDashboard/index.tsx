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

import React, { useState, useEffect } from 'react';
import { Select, Button, Space, message } from 'antd';
import { ReloadOutlined, FullscreenOutlined, FullscreenExitOutlined, SettingOutlined } from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { getRoomList, getRoomStatistics, getRackList, getDeviceUsageList, getDeviceTypeStatistics, getEnvironmentData, getAlarmList } from './services';
import { DashboardData } from './types';
import OverviewCards from './components/OverviewCards';
import RoomImage from './components/RoomImage';
import TemperatureHumidityCard from './components/TemperatureHumidityCard';
import DeviceUsageTable from './components/DeviceUsageTable';
import RackStatisticsChart from './components/RackStatisticsChart';
import DeviceTypeChart from './components/DeviceTypeChart';
import EnvironmentChart from './components/EnvironmentChart';
import CapacityMonitor from './components/CapacityMonitor';
import AlarmList from './components/AlarmList';
import './index.less';

const { Option } = Select;

const RoomDashboard: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const query = queryString.parse(location.search);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // 默认30秒刷新
  const [data, setData] = useState<DashboardData>({
    currentRoomId: null,
    roomList: [],
    statistics: null,
    rackList: [],
    deviceUsageList: [],
    deviceTypeStatistics: [],
    environmentData: [],
    currentEnvironment: null,
    alarmList: [],
    totalRooms: 0,
  });

  // 从URL参数获取初始机房ID
  useEffect(() => {
    const roomId = query.roomId ? Number(query.roomId) : null;
    if (roomId) {
      setData((prev) => ({ ...prev, currentRoomId: roomId }));
    }
  }, [query.roomId]);

  // 加载机房列表
  const loadRoomList = async () => {
    try {
      const response = await getRoomList({ page: 1, pageSize: 100, status: 'active' });
      setData((prev) => ({
        ...prev,
        roomList: response.list,
        totalRooms: response.total,
      }));
      // 如果没有选中机房，默认选择第一个
      if (!data.currentRoomId && response.list.length > 0) {
        setData((prev) => ({ ...prev, currentRoomId: response.list[0].id }));
      }
    } catch (error) {
      message.error('获取机房列表失败');
    }
  };

  // 加载所有数据
  const loadAllData = async () => {
    if (!data.currentRoomId) return;

    setLoading(true);
    try {
      const [statistics, rackList, deviceUsageList, deviceTypeStatistics, environmentData, alarmList] = await Promise.all([
        getRoomStatistics(data.currentRoomId),
        getRackList({ roomId: data.currentRoomId, pageSize: 1000 }),
        getDeviceUsageList(data.currentRoomId),
        getDeviceTypeStatistics(data.currentRoomId),
        getEnvironmentData(data.currentRoomId),
        getAlarmList(data.currentRoomId, { limit: 10 }),
      ]);

      setData((prev) => ({
        ...prev,
        statistics,
        rackList: rackList.list,
        deviceUsageList,
        deviceTypeStatistics: deviceTypeStatistics.list,
        environmentData: environmentData.list,
        currentEnvironment: environmentData.current,
        alarmList: alarmList.list,
      }));
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadRoomList();
  }, []);

  // 机房切换时加载数据
  useEffect(() => {
    if (data.currentRoomId) {
      loadAllData();
    }
  }, [data.currentRoomId]);

  // 自动刷新
  useEffect(() => {
    if (refreshInterval > 0 && data.currentRoomId) {
      const timer = setInterval(() => {
        loadAllData();
      }, refreshInterval * 60000);
      return () => clearInterval(timer);
    }
  }, [refreshInterval, data.currentRoomId]);

  // 机房切换
  const handleRoomChange = (roomId: number) => {
    setData((prev) => ({ ...prev, currentRoomId: roomId }));
    // 更新URL参数
    history.replace({
      pathname: location.pathname,
      search: queryString.stringify({ ...query, roomId }),
    });
  };

  // 全屏切换
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 手动刷新
  const handleRefresh = () => {
    loadAllData();
    message.success('刷新成功');
  };

  const currentRoom = data.roomList.find((r) => r.id === data.currentRoomId);

  return (
    <div className='room-dashboard-container'>
      {/* 顶部标题栏 */}
      <div className='dashboard-header'>
        <div className='header-left'>
          <Select
            value={data.currentRoomId}
            onChange={handleRoomChange}
            placeholder='选择机房'
            style={{ width: 200 }}
            showSearch
            filterOption={(input, option) =>
              String(option?.children ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {data.roomList.map((room) => (
              <Option key={room.id} value={room.id}>
                {room.name}
              </Option>
            ))}
          </Select>
        </div>
        <div className='header-center'>
          <div className='dashboard-title'>
            机房可视化大屏
            {currentRoom && <span className='room-name'>{currentRoom.name}</span>}
          </div>
        </div>
        <div className='header-right'>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              刷新
            </Button>
            <Button icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} onClick={handleFullscreen}>
              {isFullscreen ? '退出全屏' : '全屏'}
            </Button>
            {/* <Button icon={<SettingOutlined />}>设置</Button> */}
          </Space>
        </div>
      </div>

      {/* 主内容区 */}
      <div className='dashboard-content'>
        {/* 左侧栏 */}
        <div className='dashboard-left'>
          <TemperatureHumidityCard temperature={data.currentEnvironment?.temperature || 0} humidity={data.currentEnvironment?.humidity || 0} loading={loading} />
          <DeviceUsageTable data={data.deviceUsageList} loading={loading} />
          <RackStatisticsChart data={data.rackList} loading={loading} />
        </div>

        {/* 中间区域 */}
        <div className='dashboard-middle'>
          <OverviewCards totalRooms={data.totalRooms} statistics={data.statistics} loading={loading} />
          <RoomImage roomId={data.currentRoomId} loading={loading} />
          <AlarmList data={data.alarmList} loading={loading} />
        </div>

        {/* 右侧栏 */}
        <div className='dashboard-right'>
          <DeviceTypeChart data={data.deviceTypeStatistics} loading={loading} />
          <EnvironmentChart data={data.environmentData} loading={loading} />
          <CapacityMonitor statistics={data.statistics} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default RoomDashboard;
