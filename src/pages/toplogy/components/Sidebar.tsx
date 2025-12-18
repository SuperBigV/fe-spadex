import React from 'react';
import { Button, Tooltip, Spin } from 'antd';
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
  SaveOutlined,
  FullscreenOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import './Sidebar.less';

const TopologySidebar = ({
  onAddDevice,
  onAddGroup,
  onClearCanvas,
  onZoomIn,
  onZoomOut,
  onResetCanvas,
  onUndo,
  onRedo,
  onExportImage,
  onFullscreen,
  canUndo,
  canRedo,
  onSaveTopology,
  isSaving = false, // 新增保存状态
  isLoading = false,
}) => {
  const deviceTypes = [
    { id: 1, type: 'net_router', name: '路由器', iconType: 'net_router', icon: '/image/topology_router.png' },
    { id: 2, type: 'net_switch', name: '接入交换机', iconType: 'net_switch_access', icon: '/image/topology_arcess_switch.png' },
    { id: 3, type: 'net_switch', name: '汇聚交换机', iconType: 'net_switch_three', icon: '/image/topology_three_switch.png' },
    { id: 4, type: 'net_switch', name: '核心交换机', iconType: 'net_switch_core', icon: '/image/topology_core_switch.png' },
    { id: 5, type: 'net_firewall', name: '防火墙', iconType: 'net_firewall', icon: '/image/topology_fireware.png' },
    { id: 6, type: 'host', name: '服务器', iconType: 'host', icon: '/image/topology_host.png' },
    { id: 7, type: 'net_wireless', name: '无线AP', iconType: 'net_wireless', icon: '/image/topology_ap.png' },
    { id: 8, type: 'net_monitor', name: '摄像头', iconType: 'net_monitor', icon: '/image/topology_monitor.png' },
    { id: 9, type: 'group', name: '机房', icon: '/image/topology_room.png' },
  ];

  const handleDragStart = (e, device) => {
    e.dataTransfer.setData('deviceType', device.type);
    e.dataTransfer.setData('iconType', device.iconType);
  };
  // 渲染图标组件
  const renderIcon = (icon) => {
    if (typeof icon === 'string') {
      return <img src={icon} alt='' style={{ width: '20px', height: '20px' }} />;
    }
    return icon;
  };
  return (
    <div className='sidebar-device'>
      <div className='device-palette'>
        <h3>设备库</h3>
        <div className='device-list'>
          {deviceTypes.map((device) => (
            <Tooltip title={device.name} key={device.id}>
              <div className='device-item' draggable onDragStart={(e) => handleDragStart(e, device)}>
                <Button
                  icon={renderIcon(device.icon)}
                  size='large'
                  shape='circle'
                  onClick={() => {
                    if (device.type === 'group') {
                      onAddGroup({ type: device.type });
                    } else {
                      onAddDevice({ type: device.type, iconType: device.iconType });
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
          <Tooltip title='保存拓扑' placement='right'>
            <Button size='large' shape='circle' icon={isSaving ? <Spin size='small' /> : <SaveOutlined />} onClick={onSaveTopology} disabled={isSaving} className='action-btn' />
          </Tooltip>
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
