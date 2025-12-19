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
import { Modal, Table, Input, Select, Button, Space, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getRackList, batchAddRacksToRoom } from '@/pages/room/services';
import { Rack, RackStatus } from '@/pages/room/types';

const { Option } = Select;

interface RackSelectModalProps {
  visible: boolean;
  roomId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

const RackSelectModal: React.FC<RackSelectModalProps> = ({ visible, roomId, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<RackStatus | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  useEffect(() => {
    if (visible) {
      fetchRacks();
    }
  }, [visible, page, pageSize, keyword, statusFilter]);

  const fetchRacks = async () => {
    setLoading(true);
    try {
      // 只显示未分配机房的机柜
      const response = await getRackList({
        page,
        pageSize,
        keyword: keyword || undefined,
        status: statusFilter,
        roomId: undefined, // 不限制机房
      });
      // 过滤掉已分配到其他机房的机柜（可选：也可以显示，但需要提示）
      const filtered = response.list.filter((rack) => !rack.roomId || rack.roomId === roomId);
      setRacks(filtered);
      setTotal(filtered.length);
    } catch (error) {
      message.error('获取机柜列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请至少选择一个机柜');
      return;
    }

    try {
      await batchAddRacksToRoom(roomId, selectedRowKeys);
      message.success('添加成功');
      setSelectedRowKeys([]);
      onSuccess();
    } catch (error: any) {
      message.error(error.message || '添加失败');
    }
  };

  const columns = [
    {
      title: '机柜编号',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '机柜名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '总U数',
      dataIndex: 'totalU',
      key: 'totalU',
    },
    {
      title: '功率容量',
      dataIndex: 'powerCapacity',
      key: 'powerCapacity',
      render: (value: number) => `${value} KW`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: RackStatus) => {
        const statusMap = {
          active: '活跃',
          maintenance: '维护',
          inactive: '停用',
        };
        return statusMap[status] || status;
      },
    },
  ];

  return (
    <Modal
      title='选择机柜'
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key='cancel' onClick={onCancel}>
          取消
        </Button>,
        <Button key='submit' type='primary' onClick={handleSubmit}>
          确定({selectedRowKeys.length})
        </Button>,
      ]}
    >
      <Space style={{ marginBottom: 16, width: '100%' }} direction='vertical'>
        <Space>
          <Input
            placeholder='搜索机柜编号、名称'
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
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={racks}
        loading={loading}
        rowKey='id'
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as number[]),
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
      />
    </Modal>
  );
};

export default RackSelectModal;
