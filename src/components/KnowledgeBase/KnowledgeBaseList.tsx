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
import { Card, Input, Button, List, Badge, Dropdown, Menu, message, Spin } from 'antd';
import { SearchOutlined, PlusOutlined, FolderOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { KnowledgeBase } from '@/pages/knowledgeBase/types';
import { knowledgeBaseApi } from '@/pages/knowledgeBase/services';
import KnowledgeBaseModal from './KnowledgeBaseModal';
import './KnowledgeBaseList.less';

interface KnowledgeBaseListProps {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

const KnowledgeBaseList: React.FC<KnowledgeBaseListProps> = ({ selectedId, onSelect }) => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<KnowledgeBase | null>(null);

  const fetchKnowledgeBases = async () => {
    setLoading(true);
    try {
      const response = await knowledgeBaseApi.getList({
        page: 1,
        pageSize: 100,
        keyword: searchKeyword || undefined,
      });
      setKnowledgeBases(response.list);
    } catch (error: any) {
      message.error(error.message || '获取知识库列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeBases();
  }, [searchKeyword]);

  // 当知识库列表加载完成时，处理选中状态
  useEffect(() => {
    if (!loading && knowledgeBases.length > 0) {
      // 过滤知识库列表
      const filtered = knowledgeBases.filter((kb) => {
        if (!searchKeyword) return true;
        const keyword = searchKeyword.toLowerCase();
        return kb.name.toLowerCase().includes(keyword) || kb.description?.toLowerCase().includes(keyword);
      });

      if (filtered.length > 0) {
        // 如果当前没有选中项，自动选中第一个
        if (selectedId === null) {
          const firstKB = filtered[0];
          if (firstKB) {
            onSelect(firstKB.id);
          }
        } else {
          // 如果当前选中的知识库不在过滤后的列表中，选中第一个
          const isSelectedInList = filtered.some((kb) => kb.id === selectedId);
          if (!isSelectedInList) {
            const firstKB = filtered[0];
            if (firstKB) {
              onSelect(firstKB.id);
            }
          }
        }
      } else if (selectedId !== null) {
        // 如果过滤后列表为空，清空选中状态
        onSelect(null);
      }
    } else if (!loading && knowledgeBases.length === 0 && selectedId !== null) {
      // 如果列表为空，清空选中状态
      onSelect(null);
    }
  }, [loading, knowledgeBases, searchKeyword, selectedId, onSelect]);

  const handleCreate = () => {
    setEditItem(null);
    setModalVisible(true);
  };

  const handleEdit = (item: KnowledgeBase) => {
    setEditItem(item);
    setModalVisible(true);
  };

  const handleDelete = async (item: KnowledgeBase) => {
    try {
      await knowledgeBaseApi.delete(item.id);
      message.success('删除成功');
      if (selectedId === item.id) {
        // 清空选中状态
        onSelect(null);
      }
      fetchKnowledgeBases();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const handleToggleStatus = async (item: KnowledgeBase) => {
    try {
      const newStatus = item.status === 'enabled' ? 'disabled' : 'enabled';
      await knowledgeBaseApi.update(item.id, { status: newStatus });
      message.success('操作成功');
      fetchKnowledgeBases();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const handleModalOk = () => {
    setModalVisible(false);
    setEditItem(null);
    fetchKnowledgeBases();
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditItem(null);
  };

  const getMenuItems = (item: KnowledgeBase) => (
    <Menu>
      <Menu.Item key='edit' icon={<EditOutlined />} onClick={() => handleEdit(item)}>
        编辑
      </Menu.Item>
      <Menu.Item key='status' onClick={() => handleToggleStatus(item)}>
        {item.status === 'enabled' ? '禁用' : '启用'}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key='delete' danger icon={<DeleteOutlined />} onClick={() => handleDelete(item)}>
        删除
      </Menu.Item>
    </Menu>
  );

  // 当知识库列表加载完成时，处理选中状态
  useEffect(() => {
    if (!loading && knowledgeBases.length > 0) {
      // 过滤知识库列表
      const filtered = knowledgeBases.filter((kb) => {
        if (!searchKeyword) return true;
        const keyword = searchKeyword.toLowerCase();
        return kb.name.toLowerCase().includes(keyword) || kb.description?.toLowerCase().includes(keyword);
      });

      if (filtered.length > 0) {
        // 如果当前没有选中项，自动选中第一个
        if (selectedId === null) {
          const firstKB = filtered[0];
          if (firstKB) {
            onSelect(firstKB.id);
          }
        } else {
          // 如果当前选中的知识库不在过滤后的列表中，选中第一个
          const isSelectedInList = filtered.some((kb) => kb.id === selectedId);
          if (!isSelectedInList) {
            const firstKB = filtered[0];
            if (firstKB) {
              onSelect(firstKB.id);
            }
          }
        }
      } else if (selectedId !== null) {
        // 如果过滤后列表为空，清空选中状态
        onSelect(null);
      }
    } else if (!loading && knowledgeBases.length === 0 && selectedId !== null) {
      // 如果列表为空，清空选中状态
      onSelect(null);
    }
  }, [loading, knowledgeBases, searchKeyword, selectedId, onSelect]);

  const filteredBases = knowledgeBases.filter((kb) => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return kb.name.toLowerCase().includes(keyword) || kb.description?.toLowerCase().includes(keyword);
  });

  return (
    <div className='knowledge-base-list'>
      <Card title='知识库管理' size='small' style={{ height: '100%' }}>
        <div className='knowledge-base-list-header'>
          <Input
            placeholder='搜索知识库'
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
            style={{ marginBottom: 12 }}
          />
          <Button type='primary' icon={<PlusOutlined />} block onClick={handleCreate}>
            新建知识库
          </Button>
        </div>
        <Spin spinning={loading}>
          <List
            dataSource={filteredBases}
            renderItem={(item) => (
              <List.Item
                className={`knowledge-base-item ${selectedId === item.id ? 'selected' : ''}`}
                onClick={() => onSelect(item.id)}
                actions={[
                  <Dropdown overlay={getMenuItems(item)} trigger={['click']} key='more'>
                    <Button type='text' icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                  </Dropdown>,
                ]}
              >
                <List.Item.Meta
                  avatar={<FolderOutlined style={{ fontSize: 20 }} />}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{item.name}</span>
                      <Badge status={item.status === 'enabled' ? 'success' : 'default'} />
                    </div>
                  }
                  description={
                    <div>
                      <div>{item.description || '无描述'}</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {item.document_count || 0} 个文档
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Spin>
      </Card>
      <KnowledgeBaseModal visible={modalVisible} onCancel={handleModalCancel} onOk={handleModalOk} initialValues={editItem || undefined} />
    </div>
  );
};

export default KnowledgeBaseList;
