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
import { Modal, Form, InputNumber, Button, Space, message, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { RackDevice, Rack } from '@/pages/room/types';
import { updateDevicePosition, removeDeviceFromRack, checkUPosition } from '@/pages/room/services';

interface DeviceEditModalProps {
  visible: boolean;
  device: RackDevice | null;
  rack: Rack | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const DeviceEditModal: React.FC<DeviceEditModalProps> = ({ visible, device, rack, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (visible && device) {
      form.setFieldsValue({
        startU: device.startU,
        heightU: device.heightU,
      });
    }
  }, [visible, device, form]);

  const handleSubmit = async () => {
    if (!device || !rack) return;

    try {
      const values = await form.validateFields();
      setLoading(true);

      // 检查 U 位是否冲突
      const checkResult = await checkUPosition(rack.id, {
        startU: values.startU,
        heightU: values.heightU,
        excludeDeviceId: device.deviceId,
      });

      if (!checkResult.available) {
        message.error('U位冲突，请选择其他位置');
        setLoading(false);
        return;
      }

      // 检查是否超出机柜范围
      if (values.startU + values.heightU - 1 > rack.totalU) {
        message.error(`U位超出机柜范围（最大${rack.totalU}U）`);
        setLoading(false);
        return;
      }

      if (values.startU < 1) {
        message.error('起始U位不能小于1');
        setLoading(false);
        return;
      }

      await updateDevicePosition(rack.id, device.deviceId, {
        startU: values.startU,
        heightU: values.heightU,
      });

      message.success('设备位置已更新');
      onSuccess();
    } catch (error: any) {
      if (error?.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(error?.message || '更新设备位置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!device || !rack) return;

    try {
      setDeleting(true);
      await removeDeviceFromRack(rack.id, device.deviceId);
      message.success('设备已删除');
      onSuccess();
    } catch (error: any) {
      message.error(error?.message || '删除设备失败');
    } finally {
      setDeleting(false);
    }
  };

  if (!device || !rack) {
    return null;
  }

  return (
    <Modal
      title={`编辑设备: ${device.deviceName}`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Popconfirm
          key='delete'
          title={
            <div>
              <div>确定要删除此设备吗？</div>
              <div style={{ fontSize: '12px', color: 'var(--fc-text-3)', marginTop: 4 }}>删除后设备将从机柜中移除</div>
            </div>
          }
          onConfirm={handleDelete}
          okText='确定'
          cancelText='取消'
          okButtonProps={{ danger: true, loading: deleting }}
        >
          <Button danger icon={<DeleteOutlined />} loading={deleting}>
            删除设备
          </Button>
        </Popconfirm>,
        <Space key='actions'>
          <Button onClick={onCancel}>取消</Button>
          <Button type='primary' onClick={handleSubmit} loading={loading}>
            保存
          </Button>
        </Space>,
      ]}
      width={500}
    >
      <Form form={form} layout='vertical'>
        <Form.Item label='设备名称'>{device.deviceName}</Form.Item>
        <Form.Item label='当前U位范围'>
          {device.startU}-{device.startU + device.heightU - 1}U
        </Form.Item>
        <Form.Item
          label='起始U位'
          name='startU'
          rules={[
            { required: true, message: '请输入起始U位' },
            { type: 'number', min: 1, message: '起始U位不能小于1' },
            {
              validator: (_, value) => {
                if (!value || !rack) return Promise.resolve();
                if (value > rack.totalU) {
                  return Promise.reject(new Error(`起始U位不能大于${rack.totalU}`));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber min={1} max={rack.totalU} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label='占用U数'
          name='heightU'
          rules={[
            { required: true, message: '请输入占用U数' },
            { type: 'number', min: 1, message: '占用U数不能小于1' },
            {
              validator: async (_, value) => {
                if (!value || !rack || !device) return Promise.resolve();
                const startU = form.getFieldValue('startU') || device.startU;
                if (startU + value - 1 > rack.totalU) {
                  return Promise.reject(new Error(`U位范围超出机柜范围（最大${rack.totalU}U）`));
                }
                // 检查冲突
                const checkResult = await checkUPosition(rack.id, {
                  startU,
                  heightU: value,
                  excludeDeviceId: device.deviceId,
                });
                if (!checkResult.available) {
                  return Promise.reject(new Error('U位冲突，请选择其他位置'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber min={1} max={rack.totalU} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label='机柜总U数'>{rack.totalU}U</Form.Item>
      </Form>
    </Modal>
  );
};

export default DeviceEditModal;
