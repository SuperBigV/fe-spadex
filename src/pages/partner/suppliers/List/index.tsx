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
import { SearchOutlined, PlusOutlined, ReloadOutlined, ExportOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { getSuppliers, deleteSupplier, batchDeleteSuppliers } from '@/services/partner';
import { Supplier, SupplierType } from '../types';
import SupplierForm from '../components/SupplierForm';
import './index.less';

const { Option } = Select;
const { RangePicker } = DatePicker;

const SupplierList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<SupplierType | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[string, string] | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

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
      const response = await getSuppliers(params);
      console.log('response:', response);
      setDataSource(response.dat.list);
      setTotal(response.total);
    } catch (error: any) {
      message.error(error.message || '获取供应商列表失败');
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

  const handleTypeFilterChange = (value: SupplierType | undefined) => {
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
    setEditingSupplier(null);
    setFormVisible(true);
  };

  const handleEdit = (record: Supplier) => {
    setEditingSupplier(record);
    setFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSupplier(id);
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
          await batchDeleteSuppliers(selectedRowKeys as number[]);
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
    setEditingSupplier(null);
    fetchData();
  };

  const handleFormCancel = () => {
    setFormVisible(false);
    setEditingSupplier(null);
  };

  const getTypeTag = (type: SupplierType) => {
    const colorMap = {
      设备供应商: 'blue',
      服务供应商: 'green',
      综合供应商: 'orange',
    };
    return <Tag color={colorMap[type]}>{type}</Tag>;
  };

  const columns: ColumnsType<Supplier> = [
    {
      title: '供应商名称',
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
      title: '供应商类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => getTypeTag(type),
    },
    {
      title: '合作日期',
      dataIndex: 'cooperation_date',
      key: 'cooperationDate',
      width: 120,
      sorter: true,
      render: (text) => moment(text).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
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
    <div className='supplier-list-page'>
      <div className='supplier-list-toolbar'>
        <Space>
          <Input
            placeholder='搜索供应商名称、联系人、电话、邮箱'
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
          <Select placeholder='供应商类型' allowClear style={{ width: 150 }} value={typeFilter} onChange={handleTypeFilterChange}>
            <Option value='设备供应商'>设备供应商</Option>
            <Option value='服务供应商'>服务供应商</Option>
            <Option value='综合供应商'>综合供应商</Option>
          </Select>
          <RangePicker
            placeholder={['合作日期开始', '合作日期结束']}
            style={{ width: 240 }}
            value={dateRange ? [moment(dateRange[0]), moment(dateRange[1])] : undefined}
            onChange={handleDateRangeChange}
          />
          <Button type='primary' icon={<PlusOutlined />} onClick={handleCreate}>
            新建供应商
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

      <SupplierForm visible={formVisible} initialValues={editingSupplier || undefined} onCancel={handleFormCancel} onOk={handleFormSuccess} />
    </div>
  );
};

export default SupplierList;
