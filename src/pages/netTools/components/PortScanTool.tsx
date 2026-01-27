import React, { useState } from 'react';
import { Card, Form, Button, Space, InputNumber, message, Spin, Alert, Table, Tag, Select, Input, Tooltip } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import HostSelector from './HostSelector';
import { postNetToolPortScan } from '../services';
import type { Host, PortScanResponse } from '../types';

interface PortScanToolProps {
  hosts: Host[];
}

const PortScanTool: React.FC<PortScanToolProps> = ({ hosts }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PortScanResponse | null>(null);
  const [execMode, setExecMode] = useState<'local' | 'remote'>('local');

  const handleSubmit = async (values: any) => {
    if (!values.target || !values.ports) {
      message.warning('请输入目标地址和端口范围');
      return;
    }

    if (execMode === 'remote' && !values.agentIdent) {
      message.warning('远程执行需要选择 Agent');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await postNetToolPortScan({
        target: values.target,
        ports: values.ports,
        scanType: values.scanType || 'tcp',
        timeout: values.timeout || 1000,
        execMode,
        agentIdent: values.agentIdent,
      });

      if (res.err) {
        message.error(res.err);
        setResult({
          success: false,
          target: values.target,
          scanType: values.scanType || 'tcp',
          ports: [],
          summary: { total: 0, open: 0, closed: 0, filtered: 0 },
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
      title: '端口',
      dataIndex: 'port',
      key: 'port',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          open: 'success',
          closed: 'default',
          filtered: 'warning',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: '服务',
      dataIndex: 'service',
      key: 'service',
      width: 150,
    },
  ];

  return (
    <div className='tool-container'>
      <Card
        title='端口扫描'
        extra={
          <Tooltip title='扫描目标主机的端口开放情况。用于安全审计和服务发现。'>
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        }
      >
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          initialValues={{
            scanType: 'tcp',
            timeout: 1000,
          }}
        >
          <Form.Item label='目标地址' name='target' rules={[{ required: true, message: '请输入目标 IP 或域名' }]}>
            <HostSelector hosts={hosts} allowInput placeholder='输入 IP 或域名，或从列表选择' />
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

          <Form.Item label='端口范围' name='ports' rules={[{ required: true, message: '请输入端口范围' }]} extra='例如: 80,443,8080-8090 或 1-1000'>
            <Input placeholder='例如: 80,443,8080-8090' style={{ width: 400 }} />
          </Form.Item>

          <Form.Item label='高级参数'>
            <Space>
              <Form.Item name='scanType' noStyle>
                <Select style={{ width: 120 }}>
                  <Select.Option value='tcp'>TCP</Select.Option>
                  <Select.Option value='udp'>UDP</Select.Option>
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
                description={`总计: ${result.summary.total} | 开放: ${result.summary.open} | 关闭: ${result.summary.closed} `}
                type='info'
                style={{ marginBottom: 16 }}
              />
              <Table
                columns={columns}
                dataSource={result.ports.map((port, index) => ({
                  key: index,
                  ...port,
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

export default PortScanTool;
