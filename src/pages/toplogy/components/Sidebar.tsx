import React from 'react';
import { Button, Tooltip } from 'antd';
import {
  SwitcherOutlined,
  WifiOutlined,
  HomeOutlined,
  ClearOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  CompressOutlined,
  UndoOutlined,
  RedoOutlined,
  FullscreenOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import './Sidebar.less';

const TopologySidebar = ({ onAddDevice, onAddGroup, onClearCanvas, onZoomIn, onZoomOut, onResetCanvas, onUndo, onRedo, onExportImage, onFullscreen, canUndo, canRedo }) => {
  const deviceTypes = [
    { type: 'router', name: '路由器', icon: <SwitcherOutlined /> },
    { type: 'switch', name: '交换机', icon: <SwitcherOutlined /> },
    { type: 'firewall', name: '防火墙', icon: <SwitcherOutlined /> },
    { type: 'server', name: '服务器', icon: <SwitcherOutlined /> },
    { type: 'wireless', name: '无线AP', icon: <WifiOutlined /> },
    { type: 'group', name: '机房', icon: <HomeOutlined /> },
  ];

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('deviceType', type);
  };

  return (
    <div className='sidebar-device'>
      <div className='device-palette'>
        <h3>设备库</h3>
        <div className='device-list'>
          {deviceTypes.map((device) => (
            <Tooltip title={device.name} key={device.type}>
              <div className='device-item' draggable onDragStart={(e) => handleDragStart(e, device.type)}>
                <Button
                  icon={device.icon}
                  size='large'
                  shape='circle'
                  onClick={() => {
                    if (device.type === 'group') {
                      onAddGroup({ type: device.type });
                    } else {
                      onAddDevice({ type: device.type });
                    }
                  }}
                />
              </div>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className='canvas-tools'>
        <h3>画布工具</h3>
        <div className='tool-list'>
          <Tooltip title='清空画布'>
            <Button icon={<ClearOutlined />} size='large' shape='circle' onClick={onClearCanvas} />
          </Tooltip>
          <Tooltip title='放大'>
            <Button icon={<ZoomInOutlined />} size='large' shape='circle' onClick={onZoomIn} />
          </Tooltip>
          <Tooltip title='缩小'>
            <Button icon={<ZoomOutOutlined />} size='large' shape='circle' onClick={onZoomOut} />
          </Tooltip>
          <Tooltip title='适应屏幕'>
            <Button icon={<CompressOutlined />} size='large' shape='circle' onClick={onResetCanvas} />
          </Tooltip>
          <Tooltip title='撤销'>
            <Button icon={<UndoOutlined />} size='large' shape='circle' onClick={onUndo} disabled={!canUndo} />
          </Tooltip>
          <Tooltip title='重做'>
            <Button icon={<RedoOutlined />} size='large' shape='circle' onClick={onRedo} disabled={!canRedo} />
          </Tooltip>
          <Tooltip title='全屏显示'>
            <Button icon={<FullscreenOutlined />} size='large' shape='circle' onClick={onFullscreen} />
          </Tooltip>
          <Tooltip title='导出图片'>
            <Button icon={<DownloadOutlined />} size='large' shape='circle' onClick={onExportImage} />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default TopologySidebar;
