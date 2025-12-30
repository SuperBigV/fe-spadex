/*
 * 设备选择面板 - 左侧栏
 */

import React, { useState, useCallback } from 'react';
import { message, Modal, Input } from 'antd';
import { MonitoredAsset } from '../../types';
import { useTopology } from '../../context/TopologyContext';
import DeviceIconToolbar from '../DeviceIconToolbar';
import DeviceListModal from '../DeviceListModal';
import './index.less';

interface DeviceSelectPanelProps {
  addedDeviceIds: number[];
}

const DeviceSelectPanel: React.FC<DeviceSelectPanelProps> = ({ addedDeviceIds }) => {
  const { addNode } = useTopology();
  const [deviceListModalVisible, setDeviceListModalVisible] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string | null>(null);
  const [roomNameModalVisible, setRoomNameModalVisible] = useState(false);
  const [roomName, setRoomName] = useState('');

  // 确认添加机房
  const handleRoomNameConfirm = useCallback(async () => {
    if (!roomName.trim()) {
      message.warning('请输入机房名称');
      return;
    }

    const centerX = window.innerWidth / 2 - 200;
    const centerY = window.innerHeight / 2 - 150;

    try {
      await addNode({
        assetId: 0, // 机房节点没有资产ID
        position: { x: centerX + Math.random() * 200, y: centerY + Math.random() * 200 },
        deviceType: 'topology_room',
        name: roomName.trim(),
        width: 200,
        height: 150,
      });
      message.success('机房已添加到画布');
      setRoomNameModalVisible(false);
      setRoomName('');
    } catch (error) {
      console.error('添加机房失败:', error);
      message.error('添加机房失败');
    }
  }, [roomName, addNode]);

  // 取消添加机房
  const handleRoomNameCancel = useCallback(() => {
    setRoomNameModalVisible(false);
    setRoomName('');
  }, []);

  // 点击设备图标
  const handleDeviceTypeSelect = useCallback(
    async (deviceType: string) => {
      // 机房是图形元素，弹出输入框让用户输入名称
      if (deviceType === 'topology_room') {
        setRoomNameModalVisible(true);
        return;
      }

      // 云是图形元素，暂时不支持直接添加
      if (deviceType === 'topology_cloud') {
        message.info('该类型暂不支持直接添加，请从资产列表中选择');
        return;
      }

      setSelectedDeviceType(deviceType);
      setDeviceListModalVisible(true);
    },
    [addNode],
  );

  // 选择设备后直接添加到画布（不选择端口，端口在连线时选择）
  const handleDeviceSelect = useCallback(
    async (device: MonitoredAsset) => {
      if (addedDeviceIds.includes(device.id)) {
        return; // 已添加的设备不再添加
      }

      // 在画布中心位置添加节点
      const centerX = window.innerWidth / 2 - 200;
      const centerY = window.innerHeight / 2 - 150;

      try {
        await addNode({
          assetId: device.id,
          position: { x: centerX + Math.random() * 200, y: centerY + Math.random() * 200 },
          // 不传递 selectedPorts，端口在连线时选择
        });
      } catch (error) {
        console.error('添加设备失败:', error);
        message.error('添加设备失败');
      }
    },
    [addNode, addedDeviceIds],
  );

  return (
    <div className='device-select-panel'>
      <div className='panel-header'>
        <h3>设备选择</h3>
      </div>

      <DeviceIconToolbar onDeviceTypeSelect={handleDeviceTypeSelect} />

      <DeviceListModal
        visible={deviceListModalVisible}
        deviceType={selectedDeviceType}
        onCancel={() => {
          setDeviceListModalVisible(false);
          setSelectedDeviceType(null);
        }}
        onSelect={handleDeviceSelect}
        addedDeviceIds={addedDeviceIds}
      />

      {/* 机房名称输入弹框 */}
      <Modal title='添加机房' open={roomNameModalVisible} onOk={handleRoomNameConfirm} onCancel={handleRoomNameCancel} okText='确定' cancelText='取消' destroyOnClose>
        <div style={{ marginTop: 16 }}>
          <Input placeholder='请输入机房名称' value={roomName} onChange={(e) => setRoomName(e.target.value)} onPressEnter={handleRoomNameConfirm} autoFocus maxLength={50} />
        </div>
      </Modal>
    </div>
  );
};

export default DeviceSelectPanel;
