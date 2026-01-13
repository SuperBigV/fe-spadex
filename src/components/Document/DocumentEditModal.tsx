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
import { Modal, Form, Input, Select, message } from 'antd';
import { Document, DocumentStatus } from '@/pages/knowledgeBase/types';
import { documentApi } from '@/pages/knowledgeBase/services';

const { Option } = Select;

interface DocumentEditModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  document: Document | null;
}

const DocumentEditModal: React.FC<DocumentEditModalProps> = ({ visible, onCancel, onOk, document }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && document) {
      form.setFieldsValue({
        name: document.name,
        status: document.status,
      });
    }
  }, [visible, document, form]);

  const handleOk = async () => {
    if (!document) return;
    try {
      const values = await form.validateFields();
      await documentApi.update(document.knowledge_base_id, document.id, values);
      message.success('更新成功');
      onOk();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || '更新失败');
    }
  };

  return (
    <Modal title='编辑文档' visible={visible} onOk={handleOk} onCancel={onCancel} destroyOnClose>
      <Form form={form} layout='vertical'>
        <Form.Item name='name' label='文档名称' rules={[{ required: true, message: '请输入文档名称' }]}>
          <Input placeholder='请输入文档名称' />
        </Form.Item>
        <Form.Item name='status' label='状态' rules={[{ required: true, message: '请选择状态' }]}>
          <Select placeholder='请选择状态'>
            <Option value='enabled'>启用</Option>
            <Option value='disabled'>禁用</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DocumentEditModal;
