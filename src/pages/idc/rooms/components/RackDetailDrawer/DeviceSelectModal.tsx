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
import { Modal, Table, Input, Button, Space, InputNumber, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getCMDBDevices, addDeviceToRack, checkUPosition } from '@/pages/room/services';
import { CMDBAsset } from '@/pages/room/types';

interface DeviceSelectModalProps {
  visible: boolean;
  selectedU: number | null;
  rackId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

const DeviceSelectModal: React.FC<DeviceSelectModalProps> = ({
  visible,
  selectedU,
  rackId,
  onCancel,
  onSuccess,
}) => {
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

  useEffect(() => {
    if (visible) {
      setStartU(selectedU || 1);
      fetchDevices();
    }
  }, [visible, selectedU]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await getCMDBDevices({
        query: keyword || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      setDevices(response.list);
      setTotal(response.total);
    } catch (error) {
      message.error('获取设备列表失败');
    } finally {
      setLoading(false);
    }
  };

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
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  return (
    <Modal
      title='选择设备'
      visible={visible}
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
            placeholder='搜索设备名称、IP'
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
          <InputNumber
            min={1}
            max={42}
            value={startU}
            onChange={(value) => setStartU(value || 1)}
          />
          <span>占用U数:</span>
          <InputNumber
            min={1}
            max={42}
            value={heightU}
            onChange={(value) => setHeightU(value || 1)}
          />
        </Space>
      </Space>
    </Modal>
  );
};

export default DeviceSelectModal;
