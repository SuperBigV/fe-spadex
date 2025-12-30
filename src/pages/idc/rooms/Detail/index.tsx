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

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader, Button, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, BarChartOutlined, SettingOutlined } from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import { getRoomDetail, getRoomLayout } from '@/pages/room/services';
import { Room, RoomLayout } from '@/pages/room/types';
import RoomToolbar from '../components/RoomToolbar';
import RoomRackGrid from '../components/RoomRackGrid';
import RoomInfoPanel from '../components/RoomInfoPanel';
import RackSelectModal from '../components/RackSelectModal';
import RackDetailDrawer from '../components/RackDetailDrawer';
import { DatabaseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import { RoomRackGridRef } from '../components/RoomRackGrid';
import './index.less';

const RoomDetailPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const roomId = parseInt(id, 10);

  const [loading, setLoading] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [layout, setLayout] = useState<RoomLayout | null>(null);
  const [selectedRackId, setSelectedRackId] = useState<number | null>(null);
  const [rackSelectModalVisible, setRackSelectModalVisible] = useState(false);
  const [rackDetailDrawerVisible, setRackDetailDrawerVisible] = useState(false);
  const [viewingRackId, setViewingRackId] = useState<number | null>(null);
  const gridRef = useRef<RoomRackGridRef>(null);

  useEffect(() => {
    if (roomId) {
      fetchRoomData();
    }
  }, [roomId]);

  const fetchRoomData = async () => {
    setLoading(true);
    try {
      const [roomData, layoutData] = await Promise.all([getRoomDetail(roomId), getRoomLayout(roomId)]);
      setRoom(roomData);
      setLayout(layoutData);
    } catch (error) {
      message.error('获取机房信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRackSelect = (rackId: number) => {
    setSelectedRackId(rackId);
  };

  const handleRackDoubleClick = (rackId: number) => {
    setViewingRackId(rackId);
    setRackDetailDrawerVisible(true);
  };

  const handleAddRack = () => {
    setRackSelectModalVisible(true);
  };

  const handleRackSelectSuccess = () => {
    setRackSelectModalVisible(false);
    // 刷新网格和房间数据
    if (gridRef.current) {
      gridRef.current.refresh();
    }
    fetchRoomData();
  };

  const handleRefresh = () => {
    fetchRoomData();
  };

  if (loading || !room) {
    return <div className='loading-state'>加载中...</div>;
  }

  return (
    <PageLayout icon={<DatabaseOutlined />} title={'数据中心管理'}>
      <div className='room-detail-page'>
        <PageHeader
          title={room.name}
          onBack={() => history.push('/rooms')}
          // extra={[
          //   <Button key='edit' icon={<EditOutlined />}>
          //     编辑
          //   </Button>,
          //   <Button key='statistics' icon={<BarChartOutlined />}>
          //     统计
          //   </Button>,
          //   <Button key='settings' icon={<SettingOutlined />}>
          //     设置
          //   </Button>,
          // ]}
        />

        <div className='room-detail-content'>
          <div className='room-detail-left'>
            <RoomToolbar onAddRack={handleAddRack} onRefresh={handleRefresh} gridRef={gridRef} />
          </div>
          <div className='room-detail-center'>
            <RoomRackGrid
              ref={gridRef}
              roomId={roomId}
              layout={layout}
              selectedRackId={selectedRackId}
              onRackSelect={handleRackSelect}
              onRackDoubleClick={handleRackDoubleClick}
              onLayoutChange={setLayout}
              onRefresh={handleRefresh}
            />
          </div>
          <div className='room-detail-right'>
            <RoomInfoPanel room={room} selectedRackId={selectedRackId} onRackSelect={handleRackSelect} onRackDoubleClick={handleRackDoubleClick} />
          </div>
        </div>

        <RackSelectModal visible={rackSelectModalVisible} roomId={roomId} onCancel={() => setRackSelectModalVisible(false)} onSuccess={handleRackSelectSuccess} />

        {viewingRackId && (
          <RackDetailDrawer
            visible={rackDetailDrawerVisible}
            rackId={viewingRackId}
            onClose={() => {
              setRackDetailDrawerVisible(false);
              setViewingRackId(null);
            }}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default RoomDetailPage;
