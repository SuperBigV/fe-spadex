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

import React, { useState } from 'react';
import { Modal, Form, Input, Upload, message, Progress } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { documentApi } from '@/pages/knowledgeBase/services';
import { RcFile } from 'antd/lib/upload';

const { Dragger } = Upload;

interface DocumentUploadModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  knowledgeBaseId: number;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ visible, onCancel, onOk, knowledgeBaseId }) => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileList, setFileList] = useState<RcFile[]>([]);

  const handleOk = async () => {
    if (fileList.length === 0) {
      message.warning('请选择要上传的文件');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const file = fileList[0];
      const values = await form.validateFields();
      const name = values.name || file.name;

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await documentApi.upload(knowledgeBaseId, file, name);
      clearInterval(progressInterval);
      setUploadProgress(100);

      message.success('上传成功');
      form.resetFields();
      setFileList([]);
      setUploadProgress(0);
      onOk();
    } catch (error: any) {
      message.error(error.message || '上传失败');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setUploadProgress(0);
    onCancel();
  };

  const beforeUpload = (file: RcFile) => {
    // 文件大小限制：100MB
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error('文件大小不能超过 100MB');
      return false;
    }

    // 文件格式验证
    const allowedFormats = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'txt', 'md'];
    const fileFormat = file.name.split('.').pop()?.toLowerCase();
    if (!fileFormat || !allowedFormats.includes(fileFormat)) {
      message.error('不支持的文件格式，仅支持：PDF、DOCX、DOC、XLSX、XLS、PPTX、PPT、TXT、MD');
      return false;
    }

    setFileList([file]);
    form.setFieldsValue({ name: file.name.replace(/\.[^/.]+$/, '') });
    return false; // 阻止自动上传
  };

  return (
    <Modal
      title='上传文档'
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={uploading}
      destroyOnClose
    >
      <Form form={form} layout='vertical'>
        <Form.Item name='name' label='文档名称'>
          <Input placeholder='留空则使用文件名' />
        </Form.Item>
        <Form.Item label='文件' required>
          <Dragger
            beforeUpload={beforeUpload}
            fileList={fileList as any}
            onRemove={() => {
              setFileList([]);
              form.setFieldsValue({ name: '' });
            }}
            maxCount={1}
          >
            <p className='ant-upload-drag-icon'>
              <InboxOutlined />
            </p>
            <p className='ant-upload-text'>点击或拖拽文件到此区域上传</p>
            <p className='ant-upload-hint'>支持 PDF、DOCX、DOC、XLSX、XLS、PPTX、PPT、TXT、MD 格式，最大 100MB</p>
          </Dragger>
        </Form.Item>
        {uploading && (
          <Form.Item>
            <Progress percent={uploadProgress} status='active' />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default DocumentUploadModal;
