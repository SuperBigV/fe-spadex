/*
 * 端口选择模态框 - 用于连接创建时选择端口
 */

import React, { useState, useEffect } from 'react';
import { Modal, Radio, Space, message } from 'antd';
import { Port } from '../../types';
import { getAssetPorts } from '@/services/topology';
import StatusIndicator from '../StatusIndicator';

interface PortSelectModalProps {
  visible: boolean;
  sourceNodeId: string;
  targetNodeId: string;
  sourceNodeName: string;
  targetNodeName: string;
  sourceAssetId: number;
  targetAssetId: number;
  onConfirm: (sourcePort: string, targetPort: string) => void;
  onCancel: () => void;
}

const PortSelectModal: React.FC<PortSelectModalProps> = ({
  visible,
  sourceNodeId,
  targetNodeId,
  sourceNodeName,
  targetNodeName,
  sourceAssetId,
  targetAssetId,
  onConfirm,
  onCancel,
}) => {
  const [sourcePorts, setSourcePorts] = useState<Port[]>([]);
  const [targetPorts, setTargetPorts] = useState<Port[]>([]);
  const [selectedSourcePort, setSelectedSourcePort] = useState<string>('');
  const [selectedTargetPort, setSelectedTargetPort] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 加载端口信息
  useEffect(() => {
    if (visible) {
      loadPorts();
    } else {
      // 关闭时重置选择
      setSelectedSourcePort('');
      setSelectedTargetPort('');
    }
  }, [visible, sourceAssetId, targetAssetId]);

  const loadPorts = async () => {
    setLoading(true);
    try {
      const [sourcePortsData, targetPortsData] = await Promise.all([
        getAssetPorts(sourceAssetId),
        getAssetPorts(targetAssetId),
      ]);
      setSourcePorts(sourcePortsData);
      setTargetPorts(targetPortsData);
      
      // 如果有端口，默认选择第一个
      if (sourcePortsData.length > 0) {
        setSelectedSourcePort(sourcePortsData[0].portNumber);
      }
      if (targetPortsData.length > 0) {
        setSelectedTargetPort(targetPortsData[0].portNumber);
      }
    } catch (error) {
      console.error('加载端口信息失败:', error);
      message.error('加载端口信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedSourcePort || !selectedTargetPort) {
      message.warning('请选择源端口和目标端口');
      return;
    }
    onConfirm(selectedSourcePort, selectedTargetPort);
  };

  return (
    <Modal
      title='选择连接端口'
      open={visible}
      onOk={handleConfirm}
      onCancel={onCancel}
      okText='确认'
      cancelText='取消'
      width={600}
      confirmLoading={loading}
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>源设备: {sourceNodeName}</div>
          <Radio.Group
            value={selectedSourcePort}
            onChange={(e) => setSelectedSourcePort(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction='vertical' style={{ width: '100%' }}>
              {sourcePorts.map((port) => (
                <Radio key={port.portNumber} value={port.portNumber}>
                  <Space>
                    <span>{port.portName}</span>
                    <span style={{ color: '#999', fontSize: '12px' }}>({port.portNumber})</span>
                    <StatusIndicator status={port.status} type='port' size='small' />
                  </Space>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>

        <div>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>目标设备: {targetNodeName}</div>
          <Radio.Group
            value={selectedTargetPort}
            onChange={(e) => setSelectedTargetPort(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction='vertical' style={{ width: '100%' }}>
              {targetPorts.map((port) => (
                <Radio key={port.portNumber} value={port.portNumber}>
                  <Space>
                    <span>{port.portName}</span>
                    <span style={{ color: '#999', fontSize: '12px' }}>({port.portNumber})</span>
                    <StatusIndicator status={port.status} type='port' size='small' />
                  </Space>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>
      </div>
    </Modal>
  );
};

export default PortSelectModal;

