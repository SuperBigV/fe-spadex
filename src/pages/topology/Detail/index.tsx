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

  const handleExport = async () => {
    if (!reactFlowInstance.current) {
      message.warning('画布未初始化');
      return;
    }

    try {
      // 获取所有节点
      const nodes = reactFlowInstance.current.getNodes();

      if (nodes.length === 0) {
        message.warning('画布为空，无法导出');
        return;
      }

      // 计算所有节点的边界框
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      nodes.forEach((node) => {
        const width = node.width || 150;
        const height = node.height || 50;
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + width);
        maxY = Math.max(maxY, node.position.y + height);
      });

      // 添加边距
      const padding = 50;
      minX -= padding;
      minY -= padding;
      maxX += padding;
      maxY += padding;

      const width = maxX - minX;
      const height = maxY - minY;

      // 获取ReactFlow的DOM元素
      const reactFlowElement = document.querySelector('.topology-canvas .react-flow') as HTMLElement;
      if (!reactFlowElement) {
        message.error('未找到画布元素');
        return;
      }

      // 保存原始视口
      const originalViewport = reactFlowInstance.current.getViewport();

      // 使用fitView确保所有节点可见，并保持合适的缩放
      // 设置合适的padding和maxZoom，确保节点大小合适
      reactFlowInstance.current.fitView({
        padding: padding,
        duration: 0,
        maxZoom: 2, // 增加最大缩放，确保节点不会太小
        minZoom: 0.5,
      });

      // 等待视图更新，确保所有元素都已渲染
      await new Promise((resolve) => setTimeout(resolve, 400));

      // 动态导入html2canvas
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default || html2canvasModule;

      // 直接截取整个reactFlowElement，确保包含所有内容（节点、边、背景等）
      const canvas = await html2canvas(reactFlowElement, {
        backgroundColor: null, // 使用透明背景，保持原有背景
        scale: 3, // 提高导出图片的清晰度，使用更高的scale确保节点清晰可见
        useCORS: true, // 允许跨域图片
        logging: false, // 关闭日志
        allowTaint: true, // 允许跨域图片
        removeContainer: false, // 不移除容器
        ignoreElements: (element) => {
          // 忽略控制按钮和小地图，只保留主要内容
          return element.classList?.contains('react-flow__controls') || element.classList?.contains('react-flow__minimap');
        },
      });

      // 恢复原始视口
      reactFlowInstance.current.setViewport(originalViewport);

      // 将canvas转换为blob并下载
      canvas.toBlob((blob) => {
        if (!blob) {
          message.error('导出失败');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileName = `${currentView?.name || 'topology'}_${new Date().getTime()}.png`;
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        message.success('导出成功');
      }, 'image/png');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
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
