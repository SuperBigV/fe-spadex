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

import React, { useState, useEffect } from 'react';
import { PageHeader, Input, Select, Button, Card, Badge, Row, Col, Pagination, message, Space } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { getRoomList, deleteRoom } from '@/pages/room/services';
import { Room, RoomListParams, RoomStatus, RoomType, RoomLevel } from '@/pages/room/types';
import RoomCard from '../components/RoomCard';
import RoomCreateModal from '../components/RoomCreateModal';
import RoomEditModal from '../components/RoomEditModal';
import './index.less';

const { Option } = Select;

const RoomListPage: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<RoomType | undefined>(undefined);
  const [levelFilter, setLevelFilter] = useState<RoomLevel | undefined>(undefined);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params: RoomListParams = {
        page,
        pageSize,
        keyword: keyword || undefined,
        status: statusFilter,
        type: typeFilter,
        level: levelFilter,
      };
      const response = await getRoomList(params);
      setRooms(response.list);
      setTotal(response.total);
    } catch (error) {
      message.error('获取机房列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [page, pageSize, keyword, statusFilter, typeFilter, levelFilter]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: RoomStatus | undefined) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleTypeFilterChange = (value: RoomType | undefined) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleLevelFilterChange = (value: RoomLevel | undefined) => {
    setLevelFilter(value);
    setPage(1);
  };

  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setEditModalVisible(true);
  };

  const handleDelete = async (room: Room) => {
    try {
      await deleteRoom(room.id);
      message.success('删除成功');
      fetchRooms();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const handleView = (room: Room) => {
    history.push(`/idc/rooms/${room.id}`);
  };

  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    fetchRooms();
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setEditingRoom(null);
    fetchRooms();
  };

  const getStatusBadge = (status: RoomStatus) => {
    const statusMap = {
      active: { status: 'success', text: '正常' },
      maintenance: { status: 'warning', text: '维护' },
      inactive: { status: 'default', text: '停用' },
    };
    const config = statusMap[status];
    return <Badge status={config.status as any} text={config.text} />;
  };

  return (
    <div className='room-list-page'>
      {/* <PageHeader title='IDC机房管理' /> */}
      <div className='room-list-toolbar'>
        <Space>
          <Input
            placeholder='搜索机房名称、编号、地址'
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 300 }}
            onPressEnter={(e) => handleSearch(e.currentTarget.value)}
            onChange={(e) => {
              if (!e.target.value) {
                handleSearch('');
              }
            }}
          />
          <Select placeholder='状态筛选' allowClear style={{ width: 120 }} value={statusFilter} onChange={handleStatusFilterChange}>
            <Option value='active'>活跃</Option>
            <Option value='maintenance'>维护</Option>
            <Option value='inactive'>停用</Option>
          </Select>
          <Select placeholder='类型筛选' allowClear style={{ width: 120 }} value={typeFilter} onChange={handleTypeFilterChange}>
            <Option value='自建'>自建</Option>
            <Option value='租赁'>租赁</Option>
            <Option value='托管'>托管</Option>
          </Select>
          <Select placeholder='等级筛选' allowClear style={{ width: 120 }} value={levelFilter} onChange={handleLevelFilterChange}>
            <Option value='T1'>T1</Option>
            <Option value='T2'>T2</Option>
            <Option value='T3'>T3</Option>
            <Option value='T4'>T4</Option>
          </Select>
          <Button type='primary' icon={<PlusOutlined />} onClick={handleCreate}>
            新建机房
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchRooms}>
            刷新
          </Button>
          {/* <Button icon={<ExportOutlined />}>导出</Button> */}
        </Space>
      </div>

      <div className='room-list-content'>
        {loading ? (
          <div className='empty-state'>加载中...</div>
        ) : rooms.length === 0 ? (
          <div className='empty-state'>暂无数据</div>
        ) : (
          <Row gutter={[16, 16]}>
            {rooms.map((room) => (
              <Col key={room.id} xs={24} sm={12} md={8} lg={6}>
                <RoomCard room={room} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} getStatusBadge={getStatusBadge} />
              </Col>
            ))}
          </Row>
        )}
      </div>

      {total > 0 && (
        <div className='room-list-pagination'>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
            onChange={(page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            }}
          />
        </div>
      )}

      <RoomCreateModal visible={createModalVisible} onCancel={() => setCreateModalVisible(false)} onSuccess={handleCreateSuccess} />
      {editingRoom && (
        <RoomEditModal
          visible={editModalVisible}
          room={editingRoom}
          onCancel={() => {
            setEditModalVisible(false);
            setEditingRoom(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default RoomListPage;
