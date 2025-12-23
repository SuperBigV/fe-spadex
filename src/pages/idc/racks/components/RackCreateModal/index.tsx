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
import { Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { createRack, getRoomList } from '@/pages/room/services';
import { RackCreateData, RackStatus, Room } from '@/pages/room/types';

const { Option } = Select;
const { TextArea } = Input;

interface RackCreateModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialRoomId?: number;
}

const RackCreateModal: React.FC<RackCreateModalProps> = ({ visible, onCancel, onSuccess, initialRoomId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (visible) {
      getRoomList({ page: 1, pageSize: 1000 }).then((res) => {
        setRooms(res.list);
      });
    }
  }, [visible]);

  useEffect(() => {
    if (visible && initialRoomId) {
      form.setFieldsValue({ roomId: initialRoomId });
    }
  }, [visible, initialRoomId, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const data: RackCreateData = {
        name: values.name,
        code: values.code,
        roomId: values.roomId,
        totalU: values.totalU,
        powerCapacity: values.powerCapacity,
        networkPorts: values.networkPorts,
        status: values.status || 'active',
        description: values.description,
        positionX: values.positionX,
        positionY: values.positionY,
        rotation: values.rotation,
      };
      await createRack(data);
      message.success('创建成功');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal title='新建机柜' visible={visible} onOk={handleSubmit} onCancel={handleCancel} confirmLoading={loading} width={600} destroyOnClose>
      <Form form={form} layout='vertical' initialValues={{ totalU: 42, status: 'active', rotation: 0 }}>
        <Form.Item label='机柜名称' name='name' rules={[{ required: true, message: '请输入机柜名称' }]}>
          <Input placeholder='请输入机柜名称，如：A01' />
        </Form.Item>
        <Form.Item label='机柜编号' name='code' rules={[{ required: true, message: '请输入机柜编号' }]}>
          <Input placeholder='请输入机柜编号，如：RACK-A01' />
        </Form.Item>
        <Form.Item label='所属机房' name='roomId'>
          <Select placeholder='请选择所属机房（可选）' allowClear>
            {rooms.map((room) => (
              <Option key={room.id} value={room.id}>
                {room.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label='状态' name='status' rules={[{ required: true, message: '请选择状态' }]}>
          <Select>
            <Option value='active'>活跃</Option>
            <Option value='maintenance'>维护</Option>
            <Option value='inactive'>停用</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label='总U数'
          name='totalU'
          rules={[
            { required: true, message: '请输入总U数' },
            { type: 'number', min: 1, max: 100, message: 'U数范围：1-100' },
          ]}
        >
          <InputNumber min={1} max={100} placeholder='标准机柜：42U' style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label='功率容量(KW)'
          name='powerCapacity'
          rules={[
            { required: true, message: '请输入功率容量' },
            { type: 'number', min: 0.1, message: '功率容量必须大于0' },
          ]}
        >
          <InputNumber min={0.1} placeholder='请输入功率容量' style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label='网络端口数' name='networkPorts'>
          <InputNumber min={0} placeholder='请输入网络端口数' style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label='描述' name='description'>
          <TextArea rows={3} placeholder='请输入描述信息' />
        </Form.Item>
        <Form.Item label='位置信息（可选，用于机房布局）'>
          <Input.Group compact>
            <Form.Item name='positionX' style={{ width: '33%', marginBottom: 0 }}>
              <InputNumber placeholder='X坐标(米)' style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name='positionY' style={{ width: '33%', marginBottom: 0 }}>
              <InputNumber placeholder='Y坐标(米)' style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name='rotation' style={{ width: '33%', marginBottom: 0 }}>
              <Select placeholder='旋转角度'>
                <Option value={0}>0°</Option>
                <Option value={90}>90°</Option>
              </Select>
            </Form.Item>
          </Input.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RackCreateModal;
