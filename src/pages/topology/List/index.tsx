/*
 * 拓扑视图列表页面
 */

import React, { useState, useEffect } from 'react';
import { Input, Select, Button, Row, Col, Pagination, message, Empty, Space, Spin } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import { getTopologyViews, deleteTopologyView, getTopologyNodes, getTopologyConnections } from '@/services/topology';
import { TopologyView, ViewListParams } from '../types';
import TopologyViewCard from '../components/TopologyViewCard';
import TopologyViewFormModal from '../components/TopologyViewFormModal';
import './index.less';

const { Option } = Select;

const TopologyListPage: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [views, setViews] = useState<TopologyView[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingView, setEditingView] = useState<TopologyView | null>(null);
  const [viewStats, setViewStats] = useState<{ [viewId: number]: { nodes: number; connections: number } }>({});

  // 加载视图列表
  const fetchViews = async () => {
    setLoading(true);
    try {
      const params: ViewListParams = {
        page,
        pageSize,
        keyword: keyword || undefined,
        type: typeFilter,
      };
      const response = await getTopologyViews(params);
      setViews(response.list);
      setTotal(response.total);

      // 加载每个视图的统计信息
      const stats: { [viewId: number]: { nodes: number; connections: number } } = {};
      for (const view of response.list) {
        try {
          const [nodes, connections] = await Promise.all([getTopologyNodes(view.id), getTopologyConnections(view.id)]);
          stats[view.id] = {
            nodes: nodes.length,
            connections: connections.length,
          };
        } catch (error) {
          stats[view.id] = { nodes: 0, connections: 0 };
        }
      }
      setViewStats(stats);
    } catch (error: any) {
      message.error(error.message || '获取拓扑视图列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViews();
  }, [page, pageSize, keyword, typeFilter]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  const handleTypeFilterChange = (value: string | undefined) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleCreate = () => {
    setEditingView(null);
    setFormModalVisible(true);
  };

  const handleEdit = (view: TopologyView) => {
    setEditingView(view);
    setFormModalVisible(true);
  };

  const handleDelete = async (view: TopologyView) => {
    try {
      await deleteTopologyView(view.id);
      message.success('删除成功');
      fetchViews();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const handleView = (view: TopologyView) => {
    history.push(`/topology/${view.id}`);
  };

  const handleFormSuccess = () => {
    setFormModalVisible(false);
    setEditingView(null);
    fetchViews();
  };

  const handleRefresh = () => {
    fetchViews();
  };

  return (
    <PageLayout icon={<DatabaseOutlined />} title='网络拓扑管理'>
      <div className='topology-list-page'>
        {/* 工具栏 */}
        <div className='topology-list-toolbar'>
          <Space>
            <Input
              placeholder='搜索视图名称'
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 300 }}
              onPressEnter={(e) => handleSearch(e.currentTarget.value)}
              onBlur={(e) => handleSearch(e.target.value)}
            />
            <Select placeholder='视图类型' allowClear style={{ width: 150 }} value={typeFilter} onChange={handleTypeFilterChange}>
              <Option value='room'>机房拓扑</Option>
              <Option value='cross-room'>跨机房拓扑</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
            <Button type='primary' icon={<PlusOutlined />} onClick={handleCreate}>
              新建视图
            </Button>
          </Space>
        </div>

        {/* 视图列表 */}
        <div className='topology-list-content'>
          <Spin spinning={loading}>
            {views.length === 0 ? (
              <Empty description='暂无拓扑视图' />
            ) : (
              <Row gutter={[16, 16]}>
                {views.map((view) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={view.id}>
                    <TopologyViewCard
                      view={view}
                      nodeCount={viewStats[view.id]?.nodes || 0}
                      connectionCount={viewStats[view.id]?.connections || 0}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Spin>
        </div>

        {/* 分页 */}
        {total > 0 && (
          <div className='topology-list-pagination'>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 个视图`}
              pageSizeOptions={['12', '24', '48', '96']}
              onChange={(newPage, newPageSize) => {
                setPage(newPage);
                setPageSize(newPageSize);
              }}
            />
          </div>
        )}

        {/* 创建/编辑弹窗 */}
        <TopologyViewFormModal
          visible={formModalVisible}
          editingView={editingView}
          onCancel={() => {
            setFormModalVisible(false);
            setEditingView(null);
          }}
          onSuccess={handleFormSuccess}
        />
      </div>
    </PageLayout>
  );
};

export default TopologyListPage;
