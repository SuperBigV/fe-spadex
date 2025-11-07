import React, { useState, useEffect } from 'react';
import { Input, Select, Switch, Button, Form, Typography, Divider, Space } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import './PropertyPanel.less';

const { Title, Text } = Typography;
const { Option } = Select;

const PropertyPanel = ({ selectedItem, devices, connections, groups, onUpdateDevice, onUpdateGroup, onUpdateConnection, onDeleteDevice, onDeleteGroup, onDeleteConnection }) => {
  const [form] = Form.useForm();
  const [devicePorts, setDevicePorts] = useState([]);

  useEffect(() => {
    if (selectedItem) {
      form.setFieldsValue(selectedItem);
      if (selectedItem.ports) {
        setDevicePorts(selectedItem.ports);
      }
    } else {
      form.resetFields();
      setDevicePorts([]);
    }
  }, [selectedItem, form]);

  const handleFinish = (values) => {
    if (!selectedItem) return;

    if (selectedItem.type === 'connection') {
      onUpdateConnection(selectedItem.id, values);
    } else if (selectedItem.type === 'group') {
      onUpdateGroup(selectedItem.id, values);
    } else {
      // 设备
      onUpdateDevice(selectedItem.id, { ...values, ports: devicePorts });
    }
  };

  const handlePortChange = (index, field, value) => {
    const newPorts = [...devicePorts];
    newPorts[index] = { ...newPorts[index], [field]: value };
    setDevicePorts(newPorts);
  };

  const addPort = () => {
    const newPort = {
      id: `p${devicePorts.length + 1}`,
      name: `Port${devicePorts.length + 1}`,
      status: 'up',
      bandwidth: 1000,
    };
    setDevicePorts([...devicePorts, newPort]);
  };

  const removePort = (index) => {
    const newPorts = [...devicePorts];
    newPorts.splice(index, 1);
    setDevicePorts(newPorts);
  };

  if (!selectedItem) {
    return (
      <div className='property-panel'>
        <Text type='secondary'>请选择设备、连接或机房查看属性</Text>
      </div>
    );
  }

  return (
    <div className='property-panel'>
      <Title level={4}>{selectedItem.type === 'connection' ? '连接属性' : selectedItem.type === 'group' ? '机房属性' : '设备属性'}</Title>

      <Form
        form={form}
        layout='vertical'
        onFinish={handleFinish}
        onValuesChange={(changedValues) => {
          if (selectedItem.type === 'connection') {
            onUpdateConnection(selectedItem.id, changedValues);
          } else if (selectedItem.type === 'group') {
            onUpdateGroup(selectedItem.id, changedValues);
          } else {
            onUpdateDevice(selectedItem.id, changedValues);
          }
        }}
      >
        {selectedItem.type === 'connection' ? (
          <>
            <Form.Item label='连接ID' name='id'>
              <Input disabled />
            </Form.Item>

            <Form.Item label='源设备'>
              <Input value={devices.find((d) => d.id === selectedItem.source.deviceId)?.name || selectedItem.source.deviceId} disabled />
            </Form.Item>

            <Form.Item label='源端口'>
              <Input
                value={devices.find((d) => d.id === selectedItem.source.deviceId)?.ports?.find((p) => p.id === selectedItem.source.portId)?.name || selectedItem.source.portId}
                disabled
              />
            </Form.Item>

            <Form.Item label='目标设备'>
              <Input value={devices.find((d) => d.id === selectedItem.target.deviceId)?.name || selectedItem.target.deviceId} disabled />
            </Form.Item>

            <Form.Item label='目标端口'>
              <Input
                value={devices.find((d) => d.id === selectedItem.target.deviceId)?.ports?.find((p) => p.id === selectedItem.target.portId)?.name || selectedItem.target.portId}
                disabled
              />
            </Form.Item>

            <Form.Item label='带宽 (Mbps)' name='bandwidth'>
              <Select>
                <Option value={100}>100</Option>
                <Option value={1000}>1000</Option>
                <Option value={10000}>10000</Option>
              </Select>
            </Form.Item>

            <Divider />
            <Button danger block onClick={() => onDeleteConnection(selectedItem.id)}>
              删除连接
            </Button>
          </>
        ) : selectedItem.type === 'group' ? (
          <>
            <Form.Item label='机房名称' name='name'>
              <Input />
            </Form.Item>

            <Form.Item label='设备统计'>
              <Text>{groups.find((g) => g.id === selectedItem.id)?.devices?.length || 0} 台设备</Text>
            </Form.Item>

            <Form.Item label='嵌套机房'>
              <Text>0 个机房</Text>
            </Form.Item>

            <Divider />
            <Button danger block onClick={() => onDeleteGroup(selectedItem.id)}>
              删除机房
            </Button>
          </>
        ) : (
          <>
            <Form.Item label='设备名称' name='name'>
              <Input />
            </Form.Item>

            <Form.Item label='设备类型' name='type'>
              <Select disabled>
                <Option value='router'>路由器</Option>
                <Option value='switch'>交换机</Option>
                <Option value='firewall'>防火墙</Option>
                <Option value='server'>服务器</Option>
                <Option value='wireless'>无线AP</Option>
              </Select>
            </Form.Item>

            <Form.Item label='IP地址' name='ip'>
              <Input placeholder='192.168.1.1' />
            </Form.Item>

            <Form.Item label='报警状态' name='alarm' valuePropName='checked'>
              <Switch />
            </Form.Item>

            <Divider>端口配置</Divider>

            {devicePorts.map((port, index) => (
              <div key={port.id} className='port-config-item'>
                <Space>
                  <Form.Item label='端口名称' initialValue={port.name}>
                    <Input value={port.name} onChange={(e) => handlePortChange(index, 'name', e.target.value)} style={{ width: 120 }} />
                  </Form.Item>

                  <Form.Item label='状态' initialValue={port.status}>
                    <Select value={port.status} onChange={(value) => handlePortChange(index, 'status', value)} style={{ width: 100 }}>
                      <Option value='up'>启用</Option>
                      <Option value='down'>禁用</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label='带宽' initialValue={port.bandwidth}>
                    <Select value={port.bandwidth} onChange={(value) => handlePortChange(index, 'bandwidth', value)} style={{ width: 100 }}>
                      <Option value={100}>100M</Option>
                      <Option value={1000}>1G</Option>
                      <Option value={10000}>10G</Option>
                    </Select>
                  </Form.Item>

                  <Button icon={<MinusOutlined />} onClick={() => removePort(index)} danger />
                </Space>
              </div>
            ))}

            <Button type='dashed' onClick={addPort} block icon={<PlusOutlined />} style={{ marginBottom: 20 }}>
              添加端口
            </Button>

            <Divider />
            <Button danger block onClick={() => onDeleteDevice(selectedItem.id)}>
              删除设备
            </Button>
          </>
        )}
      </Form>
    </div>
  );
};

export default PropertyPanel;
