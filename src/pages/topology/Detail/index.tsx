/*
 * 拓扑视图详情页面
 */

import React, { useMemo, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Layout, message, Button } from 'antd';
import { ArrowLeftOutlined, DatabaseOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import { TopologyProvider, useTopology } from '../context/TopologyContext';
import TopologyCanvas from '../components/TopologyCanvas';
import DeviceSelectPanel from '../components/DeviceSelectPanel';
import PropertyPanel from '../components/PropertyPanel';
import TopologyToolbar from '../components/TopologyToolbar';
import '../index.less';

const { Sider, Content } = Layout;

// 拓扑视图详情页内容
const TopologyViewContent: React.FC = () => {
  const { nodes, currentView, refreshTopology } = useTopology();
  const history = useHistory();
  const reactFlowInstance = React.useRef<any>(null);

  // 左侧设备面板折叠状态（默认展开）
  const [leftSiderCollapsed, setLeftSiderCollapsed] = useState(false);
  // 右侧属性面板折叠状态（默认折叠）
  const [rightSiderCollapsed, setRightSiderCollapsed] = useState(true);

  // 已添加的设备ID列表
  const addedDeviceIds = useMemo(() => nodes.map((n) => n.assetId), [nodes]);

  // 画布操作处理
  const handleZoomIn = () => {
    reactFlowInstance.current?.zoomIn?.();
  };

  const handleZoomOut = () => {
    reactFlowInstance.current?.zoomOut?.();
  };

  const handleFitView = () => {
    reactFlowInstance.current?.fitView?.();
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const handleRefresh = async () => {
    await refreshTopology();
    message.success('刷新成功');
  };

  const handleSave = async () => {
    if (!currentView) return;
    try {
      // TODO: 实现保存逻辑
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleExport = () => {
    // TODO: 实现导出逻辑
    message.info('导出功能开发中');
  };

  const handleBack = () => {
    history.push('/topology');
  };

  return (
    <PageLayout
      icon={<DatabaseOutlined />}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button type='text' icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ padding: 0, height: 'auto' }}>
            返回
          </Button>
          <span>{currentView?.name || '网络拓扑'}</span>
        </div>
      }
    >
      <Layout className='topology-page'>
        {/* 顶部工具栏 */}
        <TopologyToolbar
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitView={handleFitView}
          onFullscreen={handleFullscreen}
          onRefresh={handleRefresh}
          onSave={handleSave}
          onExport={handleExport}
        />

        <Layout style={{ height: 'calc(100vh - 64px)' }}>
          {/* 左侧设备选择面板 */}
          <Sider width={100} collapsedWidth={0} collapsible collapsed={leftSiderCollapsed} onCollapse={setLeftSiderCollapsed} className='topology-sider-left' trigger={null}>
            <DeviceSelectPanel addedDeviceIds={addedDeviceIds} />
          </Sider>

          {/* 中间拓扑画布 */}
          <Content className='topology-content' style={{ position: 'relative' }}>
            {/* 左侧面板折叠/展开按钮 - 始终跟随画布左侧边框 */}
            <Button
              type='text'
              icon={leftSiderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setLeftSiderCollapsed(!leftSiderCollapsed)}
              className='topology-toggle-btn-left'
              style={{
                position: 'absolute',
                left: 0,
                top: 16,
                zIndex: 10,
              }}
            />
            {/* 右侧面板折叠/展开按钮 - 始终跟随画布右侧边框 */}
            <Button
              type='text'
              icon={rightSiderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setRightSiderCollapsed(!rightSiderCollapsed)}
              className='topology-toggle-btn-right'
              style={{
                position: 'absolute',
                right: 0,
                top: 16,
                zIndex: 10,
              }}
            />
            <TopologyCanvas
              onInit={(instance) => {
                reactFlowInstance.current = instance;
              }}
            />
          </Content>

          {/* 右侧属性面板 */}
          <Sider
            width={250}
            collapsedWidth={0}
            collapsible
            collapsed={rightSiderCollapsed}
            onCollapse={setRightSiderCollapsed}
            className='topology-sider-right'
            trigger={null}
            reverseArrow
          >
            <PropertyPanel />
          </Sider>
        </Layout>
      </Layout>
    </PageLayout>
  );
};

// 详情页组件
const TopologyDetailPage: React.FC = () => {
  const { viewId } = useParams<{ viewId: string }>();

  if (!viewId) {
    return null;
  }

  const currentViewId = parseInt(viewId, 10);

  return (
    <TopologyProvider viewId={currentViewId}>
      <TopologyViewContent />
    </TopologyProvider>
  );
};

export default TopologyDetailPage;
