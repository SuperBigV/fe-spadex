import React, { useState } from 'react';
import { Card, Form, Button, Space, InputNumber, message, Spin, Alert, Table, Tag, Select, Input, Tooltip, Radio } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import HostSelector from './HostSelector';
import { postNetToolHostDiscovery } from '../services';
import type { Host, HostDiscoveryResponse } from '../types';

interface HostDiscoveryToolProps {
  hosts: Host[];
}

const HostDiscoveryTool: React.FC<HostDiscoveryToolProps> = ({ hosts }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HostDiscoveryResponse | null>(null);
  const [execMode, setExecMode] = useState<'local' | 'remote'>('local');

  const handleSubmit = async (values: any) => {
    if (!values.network) {
      message.warning('请输入网段');
      return;
    }

    if (execMode === 'remote' && !values.agentIdent) {
      message.warning('远程执行需要选择 Agent');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await postNetToolHostDiscovery({
        network: values.network,
        scanType: values.scanType || 'ping',
        timeout: values.timeout || 1000,
        execMode,
        agentIdent: values.agentIdent,
      });

      if (res.err) {
        message.error(res.err);
        setResult({
          success: false,
          network: values.network,
          scanType: values.scanType || 'ping',
          hosts: [],
          summary: { total: 0, alive: 0, dead: 0 },
          checkTime: new Date().toISOString(),
        });
      } else {
        setResult(res.dat);
      }
    } catch (err: any) {
      message.error('执行失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'IP 地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 150,
    },
    {
      title: '主机名',
      dataIndex: 'hostname',
      key: 'hostname',
      width: 200,
    },
    {
      title: 'MAC 地址',
      dataIndex: 'mac',
      key: 'mac',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <Tag color={status === 'alive' ? 'success' : 'default'}>{status}</Tag>,
    },
    {
      title: '延迟 (ms)',
      dataIndex: 'rtt',
      key: 'rtt',
      width: 100,
      render: (rtt?: number) => (rtt ? rtt.toFixed(2) : '-'),
    },
  ];

  return (
    <div className='tool-container'>
      <Card
        title='主机发现'
        extra={
          <Tooltip title='扫描网段内活跃的主机。用于网络拓扑发现和资产管理。'>
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        }
      >
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          initialValues={{
            scanType: 'ping',
            timeout: 1000,
          }}
        >
          <Form.Item label='执行模式'>
            <Radio.Group value={execMode} onChange={(e) => setExecMode(e.target.value)} optionType='button' buttonStyle='solid'>
              <Radio.Button value='local'>本地模式</Radio.Button>
              <Radio.Button value='remote'>远程模式</Radio.Button>
            </Radio.Group>
            <div style={{ marginTop: 4, color: '#8c8c8c', fontSize: 12 }}>{execMode === 'local' ? '在当前浏览器所在环境执行扫描' : '在选定的 Agent 主机上执行扫描'}</div>
          </Form.Item>

          {execMode === 'remote' && (
            <Form.Item label='Agent' name='agentIdent' rules={[{ required: true, message: '请选择 Agent' }]}>
              <HostSelector
                hosts={hosts}
                allowInput={false}
                placeholder='选择执行 Agent'
                onChange={(value) => {
                  const host = hosts.find((h) => h.ip === value);
                  form.setFieldsValue({ agentIdent: host?.ident });
                }}
              />
            </Form.Item>
          )}

          <Form.Item label='网段' name='network' rules={[{ required: true, message: '请输入网段' }]} extra='例如: 192.168.1.0/24'>
            <Input placeholder='例如: 192.168.1.0/24' style={{ width: 400 }} />
          </Form.Item>

          <Form.Item label='高级参数'>
            <Space>
              <Form.Item name='scanType' noStyle>
                <Select style={{ width: 120 }}>
                  <Select.Option value='ping'>Ping</Select.Option>
                  <Select.Option value='arp'>ARP</Select.Option>
                  <Select.Option value='syn'>SYN</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name='timeout' noStyle>
                <InputNumber min={100} max={10000} placeholder='超时(ms)' addonBefore='超时' />
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit' loading={loading} icon={<PlayCircleOutlined />}>
              开始扫描
            </Button>
          </Form.Item>
        </Form>

        <Spin spinning={loading} tip='扫描中，请稍候...'>
          {result && result.success && (
            <Card title='扫描结果' style={{ marginTop: 16 }}>
              <Alert
                message='扫描摘要'
                description={`总计: ${result.summary.total} | 活跃: ${result.summary.alive} | 离线: ${result.summary.dead}`}
                type='info'
                style={{ marginBottom: 16 }}
              />
              <Table
                columns={columns}
                dataSource={result.hosts.map((host, index) => ({
                  key: index,
                  ...host,
                }))}
                pagination={{ pageSize: 20 }}
                size='small'
              />
            </Card>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default HostDiscoveryTool;
