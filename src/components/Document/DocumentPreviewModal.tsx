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
import { Modal, Button, message, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Document } from '@/pages/knowledgeBase/types';
import { documentApi } from '@/pages/knowledgeBase/services';

interface DocumentPreviewModalProps {
  visible: boolean;
  onCancel: () => void;
  document: Document | null;
  knowledgeBaseId: number;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ visible, onCancel, document, knowledgeBaseId }) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (visible && document) {
      const url = documentApi.getPreviewUrl(knowledgeBaseId, document.id);
      setPreviewUrl(url);
    }
  }, [visible, document, knowledgeBaseId]);

  const handleDownload = async () => {
    try {
      const blob = await documentApi.download(knowledgeBaseId, document.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('下载成功');
    } catch (error: any) {
      message.error(error.message || '下载失败');
    }
  };

  const renderPreview = () => {
    if (!document || !visible) return null;

    const format = document.file_format.toLowerCase();

    // PDF 文件：使用 iframe 嵌入预览
    if (format === 'pdf') {
      return (
        <iframe
          src={previewUrl}
          style={{ width: '100%', height: '600px', border: 'none' }}
          title={document.name}
        />
      );
    }

    // 文本文件：直接显示内容（需要后端支持）
    if (['txt', 'md'].includes(format)) {
      return (
        <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 4, maxHeight: '600px', overflow: 'auto' }}>
          <Spin spinning={loading}>
            <iframe
              src={previewUrl}
              style={{ width: '100%', height: '600px', border: 'none' }}
              title={document.name}
              onLoad={() => setLoading(false)}
            />
          </Spin>
        </div>
      );
    }

    // Office 文件：提示下载或使用在线预览服务
    if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(format)) {
      return (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>Office 文件暂不支持在线预览</p>
          <p style={{ color: '#999', fontSize: 12, marginTop: 8 }}>请下载后使用本地应用打开</p>
          <Button type='primary' icon={<DownloadOutlined />} onClick={handleDownload} style={{ marginTop: 16 }}>
            下载文件
          </Button>
        </div>
      );
    }

    // 其他格式：提示下载
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p>该文件格式暂不支持预览</p>
        <Button type='primary' icon={<DownloadOutlined />} onClick={handleDownload} style={{ marginTop: 16 }}>
          下载文件
        </Button>
      </div>
    );
  };

  return (
    <Modal
      title={document?.name || '文档预览'}
      visible={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key='download' icon={<DownloadOutlined />} onClick={handleDownload}>
          下载
        </Button>,
        <Button key='close' onClick={onCancel}>
          关闭
        </Button>,
      ]}
      destroyOnClose
    >
      {renderPreview()}
    </Modal>
  );
};

export default DocumentPreviewModal;
