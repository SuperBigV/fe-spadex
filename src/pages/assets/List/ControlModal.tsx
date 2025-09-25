import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';

const ControlModal = ({ visible, onClose, asset, action, onOk }) => {
  const [hostname, setHostname] = useState('');
  const [newHostname, setNewHostname] = useState('');

  useEffect(() => {
    console.log('asset:', asset);
    setHostname(asset?.name || asset?.ident);
  }, [action, asset]);

  const handleOk = () => {
    if (action === 'rename') {
      // 处理修改主机名的逻辑
      onOk({
        current_hostname: hostname,
        hostname: newHostname,
        id: asset.id,
        action: 'rename',
      });
    } else {
      // 处理重启、关机、开机的逻辑
      console.log(`执行动作: ${action}，主机名: ${hostname}`);
      onOk({
        id: asset.id,
        action,
      });
    }
    onClose(); // 关闭弹框
  };

  const renderContent = () => {
    switch (action) {
      case 'restart':
        return (
          <div>
            <p>是否确认重启主机: {hostname}?</p>
          </div>
        );
      case 'stop':
        return (
          <div>
            <p>是否确认关闭主机: {hostname}?</p>
          </div>
        );
      case 'start':
        return (
          <div>
            <p>是否确认启动主机: {hostname}?</p>
          </div>
        );
      case 'rename':
        return (
          <Form layout='vertical'>
            <Form.Item label='当前主机名'>
              <Input value={hostname} disabled />
            </Form.Item>
            <Form.Item label='新主机名'>
              <Input value={newHostname} onChange={(e) => setNewHostname(e.target.value)} />
            </Form.Item>
          </Form>
        );
      default:
        return null;
    }
  };

  return (
    <Modal title='资产管控' open={visible} onOk={handleOk} onCancel={onClose}>
      {renderContent()}
    </Modal>
  );
};

export default ControlModal;
