import React, { useState } from 'react';
import { Card, Form, Button, Space, InputNumber, message, Spin, Alert, Descriptions, Tag, Select, Input, Table, Tooltip } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import HostSelector from './HostSelector';
import ExecutionModeSelector from './ExecutionModeSelector';
import { postNetToolDNS } from '../services';
import type { Host, DNSResponse } from '../types';

interface DNSToolProps {
  hosts: Host[];
}

const DNSTool: React.FC<DNSToolProps> = ({ hosts }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DNSResponse | null>(null);
  const [execMode, setExecMode] = useState<'local' | 'remote'>('local');

  const handleSubmit = async (values: any) => {
    if (!values.domain) {
      message.warning('请输入域名');
      return;
    }

    if (execMode === 'remote' && !values.agentIdent) {
      message.warning('远程执行需要选择 Agent');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await postNetToolDNS({
        domain: values.domain,
        dnsServer: values.dnsServer,
        recordType: values.recordType || 'A',
        timeout: values.timeout || 5,
        execMode,
        agentIdent: values.agentIdent,
      });

      if (res.err) {
        message.error(res.err);
        setResult({
          success: false,
          domain: values.domain,
          dnsServer: values.dnsServer || '',
          recordType: values.recordType || 'A',
          records: [],
          responseTime: 0,
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

  const recordColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'TTL',
      dataIndex: 'ttl',
      key: 'ttl',
      width: 100,
    },
  ];

  return (
    <div className='tool-container'>
      <Card
        title='DNS 测试'
        extra={
          <Tooltip title='测试 DNS 解析功能和性能。用于故障排查和性能测试。'>
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        }
      >
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          initialValues={{
            recordType: 'A',
            timeout: 5,
          }}
        >
          <Form.Item label='执行模式' name='execMode'>
            <ExecutionModeSelector value={execMode} onChange={setExecMode} />
          </Form.Item>

          <Form.Item label='域名' name='domain' rules={[{ required: true, message: '请输入域名' }]}>
            <Input placeholder='例如: www.example.com' style={{ width: 400 }} />
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

          <Form.Item label='高级参数'>
            <Space>
              <Form.Item name='dnsServer' noStyle>
                <Input placeholder='DNS服务器' style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name='recordType' noStyle>
                <Select style={{ width: 120 }}>
                  <Select.Option value='A'>A</Select.Option>
                  <Select.Option value='AAAA'>AAAA</Select.Option>
                  <Select.Option value='MX'>MX</Select.Option>
                  <Select.Option value='CNAME'>CNAME</Select.Option>
                  <Select.Option value='TXT'>TXT</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name='timeout' noStyle>
                <InputNumber min={1} max={30} placeholder='超时(秒)' addonBefore='超时' />
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit' loading={loading} icon={<PlayCircleOutlined />}>
              开始测试
            </Button>
          </Form.Item>
        </Form>

        <Spin spinning={loading} tip='测试中，请稍候...'>
          {result && result.success && (
            <Card title='测试结果' style={{ marginTop: 16 }}>
              <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
                <Descriptions.Item label='域名' span={2}>
                  {result.domain}
                </Descriptions.Item>
                <Descriptions.Item label='DNS 服务器'>{result.dnsServer || '系统默认'}</Descriptions.Item>
                <Descriptions.Item label='记录类型'>
                  <Tag>{result.recordType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label='响应时间'>{result.responseTime.toFixed(2)} ms</Descriptions.Item>
                <Descriptions.Item label='记录数量'>{result.records.length}</Descriptions.Item>
              </Descriptions>
              {result.records.length > 0 && (
                <Table
                  columns={recordColumns}
                  dataSource={result.records.map((record, index) => ({
                    key: index,
                    ...record,
                  }))}
                  pagination={false}
                  size='small'
                />
              )}
            </Card>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default DNSTool;
