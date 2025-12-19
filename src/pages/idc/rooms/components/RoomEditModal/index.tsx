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
import { updateRoom } from '@/pages/room/services';
import { Room, RoomUpdateData } from '@/pages/room/types';

const { Option } = Select;
const { TextArea } = Input;

interface RoomEditModalProps {
  visible: boolean;
  room: Room;
  onCancel: () => void;
  onSuccess: () => void;
}

const RoomEditModal: React.FC<RoomEditModalProps> = ({ visible, room, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && room) {
      form.setFieldsValue({
        name: room.name,
        code: room.code,
        address: room.address,
        area: room.area,
        type: room.type,
        level: room.level,
        status: room.status,
        contact: room.contact,
        contactPhone: room.contactPhone,
        description: room.description,
      });
    }
  }, [visible, room, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const data: RoomUpdateData = {
        name: values.name,
        code: values.code,
        address: values.address,
        area: values.area,
        type: values.type,
        level: values.level,
        status: values.status,
        contact: values.contact,
        contactPhone: values.contactPhone,
        description: values.description,
      };
      await updateRoom(room.id, data);
      message.success('更新成功');
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title='编辑机房'
      visible={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          label='机房名称'
          name='name'
          rules={[{ required: true, message: '请输入机房名称' }]}
        >
          <Input placeholder='请输入机房名称' />
        </Form.Item>
        <Form.Item
          label='机房编号'
          name='code'
          rules={[{ required: true, message: '请输入机房编号' }]}
        >
          <Input placeholder='请输入机房编号' />
        </Form.Item>
        <Form.Item label='机房地址' name='address'>
          <Input placeholder='请输入机房地址' />
        </Form.Item>
        <Form.Item label='机房面积(平方米)' name='area'>
          <InputNumber min={0} placeholder='请输入机房面积' style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label='机房类型' name='type'>
          <Select placeholder='请选择机房类型'>
            <Option value='自建'>自建</Option>
            <Option value='租赁'>租赁</Option>
            <Option value='托管'>托管</Option>
          </Select>
        </Form.Item>
        <Form.Item label='机房等级' name='level'>
          <Select placeholder='请选择机房等级'>
            <Option value='T1'>T1</Option>
            <Option value='T2'>T2</Option>
            <Option value='T3'>T3</Option>
            <Option value='T4'>T4</Option>
          </Select>
        </Form.Item>
        <Form.Item label='状态' name='status' rules={[{ required: true, message: '请选择状态' }]}>
          <Select>
            <Option value='active'>活跃</Option>
            <Option value='maintenance'>维护</Option>
            <Option value='inactive'>停用</Option>
          </Select>
        </Form.Item>
        <Form.Item label='联系人' name='contact'>
          <Input placeholder='请输入联系人' />
        </Form.Item>
        <Form.Item label='联系电话' name='contactPhone'>
          <Input placeholder='请输入联系电话' />
        </Form.Item>
        <Form.Item label='描述' name='description'>
          <TextArea rows={3} placeholder='请输入描述信息' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoomEditModal;

