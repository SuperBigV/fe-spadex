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
import { PageHeader, Input, Select, Button, Table, Badge, Progress, Space, message, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, ExportOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { getRackList, deleteRack, getRoomList } from '@/pages/room/services';
import { Rack, RackListParams, RackStatus, Room } from '@/pages/room/types';
import RackCreateModal from '../components/RackCreateModal';
import RackEditModal from '../components/RackEditModal';
import RackDetailModal from '../components/RackDetailModal';
import './index.less';

const { Option } = Select;

const RackListPage: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<RackStatus | undefined>(undefined);
  const [roomIdFilter, setRoomIdFilter] = useState<number | undefined>(undefined);
  const [uUsageRateFilter, setUUsageRateFilter] = useState<string | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRack, setEditingRack] = useState<Rack | null>(null);
  const [viewingRack, setViewingRack] = useState<Rack | null>(null);

  // 获取机房列表（用于筛选）
  useEffect(() => {
    getRoomList({ page: 1, pageSize: 1000 }).then((res) => {
      setRooms(res.list);
    });
  }, []);

  const fetchRacks = async () => {
    setLoading(true);
    try {
      const params: RackListParams = {
        page,
        pageSize,
        keyword: keyword || undefined,
        status: statusFilter,
        roomId: roomIdFilter,
        uUsageRate: uUsageRateFilter,
      };
      const response = await getRackList(params);
      setRacks(response.list);
      setTotal(response.total);
    } catch (error) {
      message.error('获取机柜列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRacks();
  }, [page, pageSize, keyword, statusFilter, roomIdFilter, uUsageRateFilter]);

  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  const handleEdit = (rack: Rack) => {
    setEditingRack(rack);
    setEditModalVisible(true);
  };

  const handleDelete = async (rack: Rack) => {
    try {
      await deleteRack(rack.id);
      message.success('删除成功');
      fetchRacks();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const handleView = (rack: Rack) => {
    setViewingRack(rack);
    setDetailModalVisible(true);
  };

  const handleViewUUnits = (rack: Rack) => {
    if (rack.roomId) {
      history.push(`/idc/rooms/${rack.roomId}/racks/${rack.id}`);
    } else {
      message.warning('该机柜未分配到机房，无法查看U位管理');
    }
  };

  const getUsageColor = (rate: number) => {
    if (rate < 0.5) return '#52c41a';
    if (rate < 0.8) return '#1890ff';
    if (rate < 0.95) return '#faad14';
    return '#ff4d4f';
  };

  const getStatusBadge = (status: RackStatus) => {
    const statusMap = {
      active: { status: 'success', text: '活跃' },
      maintenance: { status: 'warning', text: '维护' },
      inactive: { status: 'default', text: '停用' },
    };
    const config = statusMap[status];
    return <Badge status={config.status as any} text={config.text} />;
  };

  const columns = [
    {
      title: '机柜编号',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text: string, record: Rack) => (
        <Button type='link' onClick={() => handleView(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: '机柜名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '所属机房',
      dataIndex: 'roomName',
      key: 'roomName',
      width: 150,
      render: (text: string, record: Rack) => {
        if (!text) {
          return <span className='text-secondary'>未分配</span>;
        }
        return (
          <Button
            type='link'
            onClick={() => {
              if (record.roomId) {
                history.push(`/idc/rooms/${record.roomId}`);
              }
            }}
          >
            {text}
          </Button>
        );
      },
    },
    {
      title: 'U位信息',
      key: 'uInfo',
      width: 200,
      render: (_: any, record: Rack) => {
        const usedU = record.usedU || 0;
        const totalU = record.totalU;
        const rate = usedU / totalU;
        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <span>
                {usedU}/{totalU}
              </span>
              <span className='text-secondary' style={{ marginLeft: 8 }}>
                {(rate * 100).toFixed(1)}%
              </span>
            </div>
            <Progress percent={rate * 100} strokeColor={getUsageColor(rate)} size='small' showInfo={false} />
          </div>
        );
      },
    },
    {
      title: '功率信息',
      key: 'powerInfo',
      width: 200,
      render: (_: any, record: Rack) => {
        const used = record.powerUsed || 0;
        const capacity = record.powerCapacity || 0;
        const rate = capacity > 0 ? used / capacity : 0;
        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <span>
                {used.toFixed(1)}/{capacity.toFixed(1)} KW
              </span>
              <span className='text-secondary' style={{ marginLeft: 8 }}>
                {(rate * 100).toFixed(1)}%
              </span>
            </div>
            <Progress percent={rate * 100} strokeColor={getUsageColor(rate)} size='small' showInfo={false} />
          </div>
        );
      },
    },
    {
      title: '网络端口',
      key: 'networkPorts',
      width: 120,
      render: (_: any, record: Rack) => {
        const used = record.networkPortsUsed || 0;
        const total = record.networkPorts || 0;
        return `${used}/${total}`;
      },
    },
    {
      title: '设备数量',
      dataIndex: 'deviceCount',
      key: 'deviceCount',
      width: 100,
      render: (count: number) => count || 0,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: RackStatus) => getStatusBadge(status),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Rack) => (
        <Space>
          <Button type='link' size='small' icon={<EyeOutlined />} onClick={() => handleView(record)}>
            详情
          </Button>
          <Button type='link' size='small' icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title='确定要删除这个机柜吗？' onConfirm={() => handleDelete(record)} okText='确定' cancelText='取消'>
            <Button type='link' size='small' danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className='rack-list-page'>
      {/* <PageHeader title='机柜管理' /> */}
      <div className='rack-list-toolbar'>
        <Space>
          <Input
            placeholder='搜索机柜编号、名称、所属机房'
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 300 }}
            onPressEnter={(e) => {
              setKeyword(e.currentTarget.value);
              setPage(1);
            }}
            onChange={(e) => {
              if (!e.target.value) {
                setKeyword('');
                setPage(1);
              }
            }}
          />
          <Select
            placeholder='状态筛选'
            allowClear
            style={{ width: 120 }}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <Option value='active'>活跃</Option>
            <Option value='maintenance'>维护</Option>
            <Option value='inactive'>停用</Option>
          </Select>
          <Select
            placeholder='所属机房'
            allowClear
            style={{ width: 150 }}
            value={roomIdFilter}
            onChange={(value) => {
              setRoomIdFilter(value);
              setPage(1);
            }}
          >
            {rooms.map((room) => (
              <Option key={room.id} value={room.id}>
                {room.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder='U位使用率'
            allowClear
            style={{ width: 120 }}
            value={uUsageRateFilter}
            onChange={(value) => {
              setUUsageRateFilter(value);
              setPage(1);
            }}
          >
            <Option value='<50'>&lt;50%</Option>
            <Option value='50-80'>50-80%</Option>
            <Option value='80-95'>80-95%</Option>
            <Option value='>95'>&gt;95%</Option>
          </Select>
          <Button type='primary' icon={<PlusOutlined />} onClick={handleCreate}>
            新建机柜
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchRacks}>
            刷新
          </Button>
          {/* <Button icon={<ExportOutlined />}>导出</Button> */}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={racks}
        loading={loading}
        rowKey='id'
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          },
        }}
        scroll={{ x: 1400 }}
      />

      <RackCreateModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={() => {
          setCreateModalVisible(false);
          fetchRacks();
        }}
      />
      {editingRack && (
        <RackEditModal
          visible={editModalVisible}
          rack={editingRack}
          onCancel={() => {
            setEditModalVisible(false);
            setEditingRack(null);
          }}
          onSuccess={() => {
            setEditModalVisible(false);
            setEditingRack(null);
            fetchRacks();
          }}
        />
      )}
      {viewingRack && (
        <RackDetailModal
          visible={detailModalVisible}
          rack={viewingRack}
          onCancel={() => {
            setDetailModalVisible(false);
            setViewingRack(null);
          }}
          onEdit={() => {
            setDetailModalVisible(false);
            handleEdit(viewingRack);
          }}
          onDelete={() => {
            setDetailModalVisible(false);
            handleDelete(viewingRack);
          }}
          onViewUUnits={() => {
            setDetailModalVisible(false);
            handleViewUUnits(viewingRack);
          }}
        />
      )}
    </div>
  );
};

export default RackListPage;
