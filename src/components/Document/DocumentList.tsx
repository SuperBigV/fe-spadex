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
import { Card, Input, Button, Table, Select, Tag, Space, message, Popconfirm, Spin } from 'antd';
import { SearchOutlined, UploadOutlined, DownloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Document, DocumentStatus } from '@/pages/knowledgeBase/types';
import { documentApi, knowledgeBaseApi } from '@/pages/knowledgeBase/services';
import { formatFileSize, getFileFormatIcon } from '@/utils/file';
import { formatDateTime } from '@/utils/date';
import DocumentUploadModal from '@/components/Document/DocumentUploadModal';
import DocumentEditModal from '@/components/Document/DocumentEditModal';
import './DocumentList.less';

const { Option } = Select;

interface DocumentListProps {
  knowledgeBaseId: number;
}

const DocumentList: React.FC<DocumentListProps> = ({ knowledgeBaseId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [uploadVisible, setUploadVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [knowledgeBaseName, setKnowledgeBaseName] = useState('');

  useEffect(() => {
    fetchKnowledgeBaseName();
    fetchDocuments();
  }, [knowledgeBaseId, pagination.page, pagination.pageSize, searchKeyword, statusFilter]);

  const fetchKnowledgeBaseName = async () => {
    try {
      const kb = await knowledgeBaseApi.getDetail(knowledgeBaseId);
      setKnowledgeBaseName(kb.name);
    } catch (error: any) {
      console.error('获取知识库名称失败:', error);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentApi.getList(knowledgeBaseId, {
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchKeyword || undefined,
        status: statusFilter || undefined,
      });
      setDocuments(response.list);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error: any) {
      message.error(error.message || '获取文档列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = () => {
    setUploadVisible(true);
  };

  const handleDownload = async (doc: Document) => {
    try {
      const blob = await documentApi.download(knowledgeBaseId, doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('下载成功');
    } catch (error: any) {
      message.error(error.message || '下载失败');
    }
  };

  const handleEdit = (doc: Document) => {
    setEditDoc(doc);
    setEditVisible(true);
  };

  const handleDelete = async (doc: Document) => {
    try {
      await documentApi.delete(knowledgeBaseId, doc.id);
      message.success('删除成功');
      fetchDocuments();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const handleUploadSuccess = () => {
    setUploadVisible(false);
    fetchDocuments();
  };

  const handleEditSuccess = () => {
    setEditVisible(false);
    setEditDoc(null);
    fetchDocuments();
  };

  const getStatusTag = (status: DocumentStatus) => {
    const statusMap = {
      enabled: { color: 'success', text: '启用' },
      disabled: { color: 'default', text: '禁用' },
      processing: { color: 'processing', text: '处理中' },
      failed: { color: 'error', text: '失败' },
    };
    const config = statusMap[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: Document) => (
        <span>
          {getFileFormatIcon(record.file_format)} {text}
        </span>
      ),
    },
    {
      title: '格式',
      dataIndex: 'file_format',
      key: 'file_format',
      width: 80,
      render: (format: string) => format.toUpperCase(),
    },
    {
      title: '大小',
      dataIndex: 'file_size',
      key: 'file_size',
      width: 100,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '创建时间',
      dataIndex: 'create_at',
      key: 'create_at',
      width: 150,
      render: (timestamp: number) => formatDateTime(timestamp),
    },
    {
      title: '创建人',
      dataIndex: 'create_by',
      key: 'create_by',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: DocumentStatus) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Document) => (
        <Space>
          <Button type='link' size='small' icon={<DownloadOutlined />} onClick={() => handleDownload(record)}>
            下载
          </Button>
          <Button type='link' size='small' icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title='确定要删除这个文档吗？' onConfirm={() => handleDelete(record)}>
            <Button type='link' size='small' danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className='document-list'>
      <Card
        title={`知识库名称: ${knowledgeBaseName}`}
        extra={
          <Button type='primary' icon={<UploadOutlined />} onClick={handleUpload}>
            上传文档
          </Button>
        }
      >
        <div className='document-list-filters'>
          <Space>
            <Input
              placeholder='搜索文档'
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              allowClear
              style={{ width: 200 }}
            />
            <Select
              placeholder='状态筛选'
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              allowClear
              style={{ width: 120 }}
            >
              <Option value='enabled'>启用</Option>
              <Option value='disabled'>禁用</Option>
              <Option value='processing'>处理中</Option>
              <Option value='failed'>失败</Option>
            </Select>
          </Space>
        </div>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={documents}
            rowKey='id'
            pagination={{
              current: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, pageSize) => {
                setPagination((prev) => ({ ...prev, page, pageSize }));
              },
            }}
          />
        </Spin>
      </Card>
      <DocumentUploadModal visible={uploadVisible} onCancel={() => setUploadVisible(false)} onOk={handleUploadSuccess} knowledgeBaseId={knowledgeBaseId} />
      {editDoc && (
        <DocumentEditModal
          visible={editVisible}
          onCancel={() => {
            setEditVisible(false);
            setEditDoc(null);
          }}
          onOk={handleEditSuccess}
          document={editDoc}
        />
      )}
    </div>
  );
};

export default DocumentList;
