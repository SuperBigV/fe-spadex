// DeviceSelectionModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Select, Table, Button, message, Spin } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { getAssetOfCategoryList } from './services';
import { prometheusQuery } from '@/services/warning';
const { Option } = Select;

const DeviceSelectionModal = ({ visible, deviceType, iconType, position = { x: 0, y: 0 }, onOk, onCancel, onAddDevice, roomOptions }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedPorts, setSelectedPorts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ports, setPorts] = useState([]);

  // 列配置
  const columns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
    },
    // {
    //   title: '设备型号',
    //   dataIndex: 'model',
    //   key: 'model',
    // },
    {
      title: '所属机房',
      dataIndex: 'belong_room',
      key: 'belong_room',
      render: (text, record) => {
        const room = roomOptions.find((room) => room.value === record.belong_room);
        return <div>{(room && room.label) || '未配置机房'}</div>;
      },
    },

    // {
    //   title: '状态',
    //   dataIndex: 'status',
    //   key: 'status',
    //   render: (status) => <span style={{ color: status === 'online' ? '#52c41a' : '#ff4d4f' }}>{status === 'online' ? '在线' : '离线'}</span>,
    // },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type='link' onClick={() => handleSelectDevice(record)}>
          选择
        </Button>
      ),
    },
  ];

  // 获取设备列表
  const fetchDevices = async (type) => {
    setLoading(true);
    try {
      // 这里替换为您的实际API端点
      // const response = await fetch(`/api/devices?type=${type}`);
      // const data = await response.json();
      getAssetOfCategoryList(type).then((res) => {
        const data = res;
        setDevices(data);
      });
    } catch (error) {
      console.error('获取设备列表失败:', error);
      message.error('获取设备列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取设备端口信息
  const fetchDevicePorts = async (ident) => {
    // let timestamp = Date.now()
    const timestamp = Date.now();
    await prometheusQuery({ query: `snmp_interface_ifInOctets{device_name='${ident}'}` }, 1).then((res) => {
      const data = res;
      setPorts(data.data.result);
    });
  };

  // 选择设备
  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
    setSelectedPorts([]);
    fetchDevicePorts(device.name);
  };

  // 处理端口选择
  const handlePortChange = (value) => {
    setSelectedPorts(value);
  };

  // 确认绑定
  const handleConfirm = () => {
    if (!selectedDevice) {
      message.warning('请选择设备');
      return;
    }

    if (selectedPorts.length === 0) {
      message.warning('请至少选择一个端口');
      return;
    }

    // 调用父组件的添加设备方法
    onAddDevice({
      type: deviceType,
      iconType: iconType,
      device: selectedDevice,
      deviceId: selectedDevice.id,
      deviceName: selectedDevice.name,
      ports: selectedPorts,
      x: position.x,
      y: position.y,
    });

    // 重置状态
    setSelectedDevice(null);
    setSelectedPorts([]);
    setPorts([]);

    if (onOk) {
      onOk();
    }
  };

  // 取消
  const handleCancel = () => {
    setSelectedDevice(null);
    setSelectedPorts([]);
    setPorts([]);
    if (onCancel) {
      onCancel();
    }
  };

  // 当设备类型变化时重新获取设备列表
  useEffect(() => {
    if (visible && deviceType) {
      fetchDevices(deviceType);
    }
  }, [visible, deviceType]);

  return (
    <Modal title={`绑定${getDeviceTypeName(deviceType)}设备`} open={visible} onOk={handleConfirm} onCancel={handleCancel} width={800} okText='确认绑定' cancelText='取消'>
      <Spin spinning={loading}>
        <div style={{ marginBottom: 16 }}>
          <h4>选择设备:</h4>
          <Table columns={columns} dataSource={devices} rowKey='id' pagination={{ pageSize: 5 }} size='small' />
        </div>

        {selectedDevice && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h4>已选设备: {selectedDevice.name}</h4>
              <p>
                {/* 型号: {selectedDevice.model} | IP: {selectedDevice.ip} */}
                IP: {selectedDevice.ip}
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4>选择端口:</h4>
              <Select mode='multiple' placeholder='请选择要绑定的端口' value={selectedPorts} onChange={handlePortChange} style={{ width: '100%' }} optionFilterProp='children'>
                {ports.map((port) => (
                  <Option key={port.metric.index} value={JSON.stringify(port)}>
                    {port.metric.ifDescr}
                  </Option>
                ))}
              </Select>
              <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                <ExclamationCircleOutlined /> 请选择需要绑定的设备端口
              </div>
            </div>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

// 获取设备类型名称
const getDeviceTypeName = (type) => {
  const typeMap = {
    router: '路由器',
    switch: '交换机',
    firewall: '防火墙',
    server: '服务器',
    wireless: '无线AP',
  };
  return typeMap[type] || '设备';
};

export default DeviceSelectionModal;
