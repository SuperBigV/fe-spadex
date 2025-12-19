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

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, message } from 'antd';
import moment from 'moment';
import { createMaintenance, updateMaintenance } from '@/services/partner';
import { Maintenance, MaintenanceType } from '../../types';

const { Option } = Select;

interface MaintenanceFormProps {
  visible: boolean;
  initialValues?: Partial<Maintenance>;
  onCancel: () => void;
  onOk: () => void;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  visible,
  initialValues,
  onCancel,
  onOk,
}) => {
  const [form] = Form.useForm();
  const isEdit = !!initialValues?.id;

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          cooperationDate: initialValues.cooperationDate
            ? moment(initialValues.cooperationDate)
            : undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        cooperationDate: values.cooperationDate.format('YYYY-MM-DD'),
      };

      if (isEdit && initialValues?.id) {
        await updateMaintenance(initialValues.id, submitData);
        message.success('更新成功');
      } else {
        await createMaintenance(submitData);
        message.success('创建成功');
      }
      onOk();
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(error.message || '操作失败');
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑维保单位' : '新建维保单位'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          type: '硬件维保',
          duration: 12,
        }}
      >
        <Form.Item
          name='name'
          label='单位名称'
          rules={[
            { required: true, message: '请输入单位名称' },
            { max: 100, message: '单位名称不能超过100个字符' },
          ]}
        >
          <Input placeholder='请输入单位名称' />
        </Form.Item>

        <Form.Item
          name='contact'
          label='联系人'
          rules={[
            { required: true, message: '请输入联系人' },
            { max: 50, message: '联系人不能超过50个字符' },
          ]}
        >
          <Input placeholder='请输入联系人' />
        </Form.Item>

        <Form.Item
          name='phone'
          label='联系电话'
          rules={[
            { required: true, message: '请输入联系电话' },
            { max: 20, message: '联系电话不能超过20个字符' },
            {
              pattern: /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/,
              message: '请输入正确的电话号码格式',
            },
          ]}
        >
          <Input placeholder='请输入联系电话' />
        </Form.Item>

        <Form.Item
          name='email'
          label='联系邮箱'
          rules={[
            { type: 'email', message: '请输入正确的邮箱格式' },
            { max: 100, message: '邮箱不能超过100个字符' },
          ]}
        >
          <Input placeholder='请输入联系邮箱' />
        </Form.Item>

        <Form.Item
          name='address'
          label='地址'
          rules={[{ max: 200, message: '地址不能超过200个字符' }]}
        >
          <Input placeholder='请输入地址' />
        </Form.Item>

        <Form.Item
          name='type'
          label='维保类型'
          rules={[{ required: true, message: '请选择维保类型' }]}
        >
          <Select placeholder='请选择维保类型'>
            <Option value='硬件维保'>硬件维保</Option>
            <Option value='软件维保'>软件维保</Option>
            <Option value='综合维保'>综合维保</Option>
            <Option value='应急响应'>应急响应</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name='cooperationDate'
          label='合作日期'
          rules={[{ required: true, message: '请选择合作日期' }]}
        >
          <DatePicker style={{ width: '100%' }} placeholder='请选择合作日期' />
        </Form.Item>

        <Form.Item
          name='duration'
          label='维保时长'
          rules={[
            { required: true, message: '请输入维保时长' },
            { type: 'number', min: 1, max: 1200, message: '维保时长必须在1-1200个月之间' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder='请输入维保时长（月）'
            min={1}
            max={1200}
            addonAfter='个月'
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MaintenanceForm;

