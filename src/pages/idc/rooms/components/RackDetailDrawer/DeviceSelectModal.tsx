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
import { Modal, Table, Input, Button, Space, InputNumber, message, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import { getCMDBDevices, addDeviceToRack, checkUPosition } from '@/pages/room/services';
import { CMDBAsset } from '@/pages/room/types';

interface DeviceSelectModalProps {
  visible: boolean;
  selectedU: number | null;
  rackId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

const DeviceSelectModal: React.FC<DeviceSelectModalProps> = ({ visible, selectedU, rackId, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<CMDBAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<CMDBAsset | null>(null);
  const [startU, setStartU] = useState<number>(selectedU || 1);
  const [heightU, setHeightU] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  const fetchDevices = async (searchKeyword?: string, currentPage?: number) => {
    const currentKeyword = searchKeyword !== undefined ? searchKeyword : keyword;
    const currentPageNum = currentPage !== undefined ? currentPage : page;

    setLoading(true);
    try {
      // 如果有关键词，获取更多数据以确保设备类型搜索的准确性
      // 后端API的query参数主要支持名称和IP搜索，设备类型需要前端过滤
      const limit = currentKeyword ? 1000 : pageSize;
      const response = await getCMDBDevices({
        query: currentKeyword || undefined,
        limit,
        offset: currentKeyword ? 0 : (currentPageNum - 1) * pageSize,
      });

      // 如果有关键词，在前端进行额外的设备类型过滤,过滤掉belong_rack不位空的数据
      let filteredList = response.list.filter((asset) => asset.belong_rack === '' || asset.belong_rack === null);
      let filteredTotal = filteredList.length;

      if (currentKeyword) {
        const keywordLower = currentKeyword.toLowerCase();
        const allFiltered = response.list.filter((asset) => {
          const name = asset.data?.name?.toLowerCase() || '';
          const ip = asset.data?.ip?.toLowerCase() || '';
          const assetType = asset.asset_type || '';
          const deviceType = getDeviceType(assetType).toLowerCase();

          return name.includes(keywordLower) || ip.includes(keywordLower) || deviceType.includes(keywordLower) || assetType.toLowerCase().includes(keywordLower);
        });

        filteredTotal = allFiltered.length;

        // 前端分页
        const start = (currentPageNum - 1) * pageSize;
        const end = start + pageSize;
        filteredList = allFiltered.slice(start, end);
      }

      setDevices(filteredList);
      setTotal(filteredTotal);
    } catch (error) {
      message.error('获取设备列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 使用防抖优化搜索
  const { run: debouncedSearch } = useDebounceFn(
    () => {
      setPage(1);
      fetchDevices(keyword, 1);
    },
    {
      wait: 300,
    },
  );

  useEffect(() => {
    if (visible) {
      setStartU(selectedU || 1);
      setKeyword('');
      setPage(1);
      fetchDevices('', 1);
    }
  }, [visible, selectedU]);

  // 监听分页变化
  useEffect(() => {
    if (visible) {
      fetchDevices();
    }
  }, [page, pageSize]);

  const handleSubmit = async () => {
    if (!selectedDevice) {
      message.warning('请选择设备');
      return;
    }

    if (!startU || startU < 1) {
      message.warning('请输入有效的起始U位');
      return;
    }

    if (!heightU || heightU < 1) {
      message.warning('请输入有效的U数');
      return;
    }

    try {
      // 检查U位冲突
      const checkResult = await checkUPosition(rackId, {
        startU,
        heightU,
      });

      if (!checkResult.available) {
        message.error('U位冲突，请选择其他位置');
        return;
      }

      setSubmitting(true);
      await addDeviceToRack(rackId, {
        deviceId: selectedDevice.id,
        startU,
        heightU,
      });
      message.success('添加成功');
      onSuccess();
    } catch (error: any) {
      message.error(error.message || '添加失败');
    } finally {
      setSubmitting(false);
    }
  };
  const getDeviceType = (text: string) => {
    return text === 'host_phy'
      ? '服务器'
      : text == 'host_storage'
      ? '存储'
      : text === 'net_switch'
      ? '交换机'
      : text === 'net_router'
      ? '路由器'
      : text === 'net_firewall'
      ? '防火墙'
      : text === 'net_wireless'
      ? '无线AP'
      : text;
  };

  const columns = [
    {
      title: '设备名称',
      dataIndex: ['data', 'name'],
      key: 'name',
    },
    {
      title: 'IP地址',
      dataIndex: ['data', 'ip'],
      key: 'ip',
    },
    {
      title: '设备类型',
      dataIndex: 'asset_type',
      key: 'asset_type',
      render: (text) => {
        return getDeviceType(text);
      },
    },
    {
      title: '状态',
      dataIndex: 'target_up',
      key: 'target_up',
      render: (text) => {
        // target_up > 0 在线0 离线，在线状态添加绿色背景
        if (text > 0) {
          return <Tag color='green'>在线</Tag>;
        } else {
          return <Tag color='red'>离线</Tag>;
        }
      },
    },
  ];

  return (
    <Modal
      title='选择设备'
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key='cancel' onClick={onCancel}>
          取消
        </Button>,
        <Button key='submit' type='primary' loading={submitting} onClick={handleSubmit}>
          确定
        </Button>,
      ]}
    >
      <Space direction='vertical' style={{ width: '100%' }} size='large'>
        <Space>
          <Input
            placeholder='搜索设备名称、IP、设备类型'
            prefix={<SearchOutlined />}
            allowClear
            value={keyword}
            style={{ width: 300 }}
            onPressEnter={(e) => {
              const value = e.currentTarget.value;
              setKeyword(value);
              setPage(1);
              fetchDevices(value, 1);
            }}
            onChange={(e) => {
              const value = e.target.value;
              setKeyword(value);
              if (value) {
                debouncedSearch();
              } else {
                setPage(1);
                fetchDevices('', 1);
              }
            }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={devices}
          loading={loading}
          rowKey='id'
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedDevice ? [selectedDevice.id] : [],
            onSelect: (record) => {
              setSelectedDevice(record);
            },
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

        <Space>
          <span>起始U位:</span>
          <InputNumber min={1} max={42} value={startU} onChange={(value) => setStartU(value || 1)} />
          <span>占用U数:</span>
          <InputNumber min={1} max={42} value={heightU} onChange={(value) => setHeightU(value || 1)} />
        </Space>
      </Space>
    </Modal>
  );
};

export default DeviceSelectModal;
