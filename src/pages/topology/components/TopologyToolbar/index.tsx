/*
 * 拓扑工具栏
 */

import React from 'react';
import { Button, Space, Divider } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  SaveOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { useTopology } from '../../context/TopologyContext';
import './index.less';

interface TopologyToolbarProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onFullscreen?: () => void;
  onRefresh?: () => void;
  onSave?: () => void;
  onExport?: () => void;
}

const TopologyToolbar: React.FC<TopologyToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  onFullscreen,
  onRefresh,
  onSave,
  onExport,
}) => {
  const { loading, refreshTopology, refreshStatus } = useTopology();

  const handleRefresh = async () => {
    await refreshTopology();
    await refreshStatus();
    onRefresh?.();
  };

  return (
    <div className="topology-toolbar">
      <Space>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
          刷新
        </Button>
        <Divider type="vertical" />
        <Button icon={<ZoomInOutlined />} onClick={onZoomIn}>
          放大
        </Button>
        <Button icon={<ZoomOutOutlined />} onClick={onZoomOut}>
          缩小
        </Button>
        <Button onClick={onFitView}>适应窗口</Button>
        <Divider type="vertical" />
        <Button icon={<SaveOutlined />} onClick={onSave}>
          保存
        </Button>
        <Button icon={<ExportOutlined />} onClick={onExport}>
          导出
        </Button>
        <Button icon={<FullscreenOutlined />} onClick={onFullscreen}>
          全屏
        </Button>
      </Space>
    </div>
  );
};

export default TopologyToolbar;

