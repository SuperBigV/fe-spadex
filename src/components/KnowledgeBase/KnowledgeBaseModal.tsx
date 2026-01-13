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
import { Modal, Form, Input, message } from 'antd';
import { KnowledgeBase, KnowledgeBaseFormValues } from '@/pages/knowledgeBase/types';
import { knowledgeBaseApi } from '@/pages/knowledgeBase/services';

interface KnowledgeBaseModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  initialValues?: KnowledgeBase;
}

const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ visible, onCancel, onOk, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          description: initialValues.description,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (initialValues) {
        await knowledgeBaseApi.update(initialValues.id, values);
        message.success('更新成功');
      } else {
        await knowledgeBaseApi.create(values);
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
      title={initialValues ? '编辑知识库' : '新建知识库'}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          name='name'
          label='知识库名称'
          rules={[{ required: true, message: '请输入知识库名称' }]}
        >
          <Input placeholder='请输入知识库名称' />
        </Form.Item>
        <Form.Item name='description' label='描述'>
          <Input.TextArea rows={4} placeholder='请输入描述（可选）' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default KnowledgeBaseModal;
