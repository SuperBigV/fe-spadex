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
import { Table, Input, Select, Button, Space, message, Popconfirm, Tag, DatePicker, Modal } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, ExportOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { getMaintenanceList, deleteMaintenance, batchDeleteMaintenance } from '@/services/partner';
import { Maintenance, MaintenanceType } from '../types';
import MaintenanceForm from '../components/MaintenanceForm';
import './index.less';

const { Option } = Select;
const { RangePicker } = DatePicker;

const MaintenanceList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Maintenance[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<MaintenanceType | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[string, string] | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        keyword: keyword || undefined,
        type: typeFilter,
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
      };
      const response = await getMaintenanceList(params);
      setDataSource(response.dat.list);
      setTotal(response.dat.total);
    } catch (error: any) {
      message.error(error.message || '获取维保单位列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, keyword, typeFilter, dateRange]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  const handleTypeFilterChange = (value: MaintenanceType | undefined) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
    } else {
      setDateRange(undefined);
    }
    setPage(1);
  };

  const handleCreate = () => {
    setEditingMaintenance(null);
    setFormVisible(true);
  };

  const handleEdit = (record: Maintenance) => {
    setEditingMaintenance(record);
    setFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMaintenance(id);
      message.success('删除成功');
      fetchData();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的记录');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`,
      onOk: async () => {
        try {
          await batchDeleteMaintenance(selectedRowKeys as number[]);
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          fetchData();
        } catch (error: any) {
          message.error(error.message || '批量删除失败');
        }
      },
    });
  };

  const handleFormSuccess = () => {
    setFormVisible(false);
    setEditingMaintenance(null);
    fetchData();
  };

  const handleFormCancel = () => {
    setFormVisible(false);
    setEditingMaintenance(null);
  };

  const getTypeTag = (type: MaintenanceType) => {
    const colorMap = {
      硬件维保: 'blue',
      软件维保: 'green',
      综合维保: 'orange',
      应急响应: 'red',
    };
    return <Tag color={colorMap[type]}>{type}</Tag>;
  };

  const formatDuration = (months: number) => {
    if (months < 12) {
      return `${months} 个月`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} 年`;
    }
    return `${years} 年 ${remainingMonths} 个月`;
  };

  const columns: ColumnsType<Maintenance> = [
    {
      title: '单位名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      sorter: true,
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (text) => (
        <a href={`tel:${text}`} onClick={(e) => e.stopPropagation()}>
          {text}
        </a>
      ),
    },
    {
      title: '联系邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      render: (text) =>
        text ? (
          <a href={`mailto:${text}`} onClick={(e) => e.stopPropagation()}>
            {text}
          </a>
        ) : (
          '-'
        ),
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: true,
    },
    {
      title: '维保类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => getTypeTag(type),
    },
    {
      title: '合作日期',
      dataIndex: 'cooperationDate',
      key: 'cooperationDate',
      width: 120,
      sorter: true,
    },
    {
      title: '维保时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: (duration) => formatDuration(duration),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size='middle'>
          <Button type='link' size='small' icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title='确定要删除这条记录吗？' onConfirm={() => handleDelete(record.id)} okText='确定' cancelText='取消'>
            <Button type='link' size='small' danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <div className='maintenance-list-page'>
      <div className='maintenance-list-toolbar'>
        <Space>
          <Input
            placeholder='搜索单位名称、联系人、电话、邮箱'
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
          <Select placeholder='维保类型' allowClear style={{ width: 150 }} value={typeFilter} onChange={handleTypeFilterChange}>
            <Option value='硬件维保'>硬件维保</Option>
            <Option value='软件维保'>软件维保</Option>
            <Option value='综合维保'>综合维保</Option>
            <Option value='应急响应'>应急响应</Option>
          </Select>
          <RangePicker
            placeholder={['合作日期开始', '合作日期结束']}
            style={{ width: 240 }}
            value={dateRange ? [moment(dateRange[0]), moment(dateRange[1])] : undefined}
            onChange={handleDateRangeChange}
          />
          <Button type='primary' icon={<PlusOutlined />} onClick={handleCreate}>
            新建维保单位
          </Button>
          <Button danger disabled={selectedRowKeys.length === 0} onClick={handleBatchDelete}>
            批量删除
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            刷新
          </Button>
          <Button icon={<ExportOutlined />}>导出</Button>
        </Space>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey='id'
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          },
        }}
        scroll={{ x: 1200 }}
      />

      <MaintenanceForm visible={formVisible} initialValues={editingMaintenance || undefined} onCancel={handleFormCancel} onOk={handleFormSuccess} />
    </div>
  );
};

export default MaintenanceList;
