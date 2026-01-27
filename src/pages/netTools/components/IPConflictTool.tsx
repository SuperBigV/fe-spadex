import React, { useState } from 'react';
import { Card, Form, Button, Space, message, Spin, Alert, Table, Tag, Select, Input, Radio, InputNumber, Statistic, Row, Col, Tooltip } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import HostSelector from './HostSelector';
import { postNetToolIPConflict } from '../services';
import type { Host, IPConflictResponse } from '../types';

interface IPConflictToolProps {
  hosts: Host[];
}

const IPConflictTool: React.FC<IPConflictToolProps> = ({ hosts }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IPConflictResponse | null>(null);
  const [execMode, setExecMode] = useState<'local' | 'remote'>('local');
  const [scanMode, setScanMode] = useState<'single' | 'network'>('single');

  const handleSubmit = async (values: any) => {
    if (scanMode === 'single') {
      // 单IP检测模式
      if (!values.ip) {
        message.warning('请输入 IP 地址');
        return;
      }
    } else {
      // 网络扫描模式
      if (!values.network) {
        message.warning('请输入网段');
        return;
      }
    }

    if (execMode === 'remote' && !values.agentIdent) {
      message.warning('远程执行需要选择 Agent');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await postNetToolIPConflict({
        scanMode,
        ip: values.ip,
        network: values.network,
        detectionMethod: values.detectionMethod || 'both',
        timeout: values.timeout,
        concurrency: values.concurrency,
        execMode,
        agentIdent: values.agentIdent,
      });

      if (res.err) {
        message.error(res.err);
        setResult({
          success: false,
          scanMode,
          ip: values.ip,
          network: values.network || '',
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

  const conflictColumns = [
    {
      title: 'IP 地址',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: 'MAC 地址',
      dataIndex: 'mac',
      key: 'mac',
    },
    {
      title: '主机名',
      dataIndex: 'hostname',
      key: 'hostname',
      render: (text: string) => text || '-',
    },
    {
      title: '检测时间',
      dataIndex: 'detectedAt',
      key: 'detectedAt',
      render: (time: string) => (time ? new Date(time).toLocaleString() : '-'),
    },
  ];

  const networkConflictColumns = [
    {
      title: 'IP 地址',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: '冲突状态',
      dataIndex: 'conflict',
      key: 'conflict',
      render: (conflict: boolean) => <Tag color={conflict ? 'red' : 'green'}>{conflict ? '冲突' : '正常'}</Tag>,
    },
    {
      title: '冲突设备数',
      dataIndex: 'conflictDetails',
      key: 'conflictDetails',
      render: (details: any[]) => (details ? details.length : 0),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type='link'
          size='small'
          onClick={() => {
            // 可以展开显示详细信息
            message.info(`IP ${record.ip} 的冲突详情`);
          }}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div className='tool-container'>
      <Card
        title='IP 冲突检测'
        extra={
          <Tooltip
            title={
              scanMode === 'single'
                ? '检测指定 IP 地址是否在网络中存在冲突。用于地址管理和故障排查。'
                : '扫描整个网络，检测所有存在冲突的 IP 地址。用于全面排查网络中的 IP 冲突问题。'
            }
          >
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        }
      >

        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          initialValues={{
            scanMode: 'single',
            detectionMethod: 'both',
            timeout: 1000,
            concurrency: 50,
          }}
        >
          <Form.Item label='扫描模式' name='scanMode'>
            <Radio.Group
              value={scanMode}
              onChange={(e) => {
                setScanMode(e.target.value);
                form.setFieldsValue({ scanMode: e.target.value });
              }}
            >
              <Radio value='single'>单IP检测</Radio>
              <Radio value='network'>网络扫描</Radio>
            </Radio.Group>
          </Form.Item>

          {scanMode === 'single' ? (
            <>
              <Form.Item
                label='IP 地址'
                name='ip'
                rules={[
                  { required: true, message: '请输入 IP 地址' },
                  {
                    pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
                    message: '请输入有效的 IP 地址',
                  },
                ]}
              >
                <Input placeholder='例如: 192.168.1.100' style={{ width: 400 }} />
              </Form.Item>

              <Form.Item label='网段（可选）' name='network' extra='如果不提供则自动推断'>
                <Input placeholder='例如: 192.168.1.0/24' style={{ width: 400 }} />
              </Form.Item>
            </>
          ) : (
            <Form.Item
              label='网段'
              name='network'
              rules={[
                { required: true, message: '请输入网段' },
                {
                  pattern: /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/,
                  message: '请输入有效的 CIDR 格式，如 192.168.1.0/24',
                },
              ]}
              extra='最大支持 /24 网段（254个IP）'
            >
              <Input placeholder='例如: 192.168.1.0/24' style={{ width: 400 }} />
            </Form.Item>
          )}

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

          <Form.Item label='检测方法' name='detectionMethod'>
            <Select style={{ width: 200 }}>
              <Select.Option value='both'>ARP + Ping</Select.Option>
              <Select.Option value='arp'>ARP</Select.Option>
              <Select.Option value='ping'>Ping</Select.Option>
            </Select>
          </Form.Item>

          {scanMode === 'network' && (
            <>
              <Form.Item label='超时时间（毫秒）' name='timeout' extra='每个IP检测的超时时间，默认1000ms'>
                <InputNumber min={100} max={10000} step={100} style={{ width: 200 }} />
              </Form.Item>

              <Form.Item label='并发数' name='concurrency' extra='并发检测的IP数量，默认50，最大100'>
                <InputNumber min={1} max={100} step={10} style={{ width: 200 }} />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button type='primary' htmlType='submit' loading={loading} icon={<PlayCircleOutlined />}>
              {scanMode === 'single' ? '开始检测' : '开始扫描'}
            </Button>
          </Form.Item>
        </Form>

        <Spin spinning={loading} tip={scanMode === 'single' ? '检测中，请稍候...' : '扫描中，请稍候...'}>
          {result && result.success && (
            <Card title='检测结果' style={{ marginTop: 16 }}>
              {result.scanMode === 'single' ? (
                // 单IP检测结果
                <>
                  <Alert
                    message={result.conflict ? '检测到 IP 冲突' : '未检测到 IP 冲突'}
                    description={`IP: ${result.ip} | 网段: ${result.network}`}
                    type={result.conflict ? 'warning' : 'success'}
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  {result.conflict && result.conflictDetails && result.conflictDetails.length > 0 && (
                    <Table
                      columns={conflictColumns}
                      dataSource={result.conflictDetails.map((detail, index) => ({
                        key: index,
                        ...detail,
                      }))}
                      pagination={false}
                      size='small'
                    />
                  )}
                </>
              ) : (
                // 网络扫描结果
                <>
                  {result.summary && (
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                      <Col span={6}>
                        <Statistic title='总IP数' value={result.summary.totalIPs} />
                      </Col>
                      <Col span={6}>
                        <Statistic title='冲突IP数' value={result.summary.conflictIPs} valueStyle={{ color: '#cf1322' }} />
                      </Col>
                      <Col span={6}>
                        <Statistic title='正常IP数' value={result.summary.normalIPs} valueStyle={{ color: '#3f8600' }} />
                      </Col>
                      <Col span={6}>
                        <Statistic title='扫描耗时' value={result.duration || 0} precision={2} suffix='秒' />
                      </Col>
                    </Row>
                  )}

                  {result.conflicts && result.conflicts.length > 0 ? (
                    <>
                      <Alert message={`检测到 ${result.conflicts.length} 个IP存在冲突`} type='warning' showIcon style={{ marginBottom: 16 }} />
                      <Table
                        columns={networkConflictColumns}
                        dataSource={result.conflicts.map((conflict, index) => ({
                          key: index,
                          ...conflict,
                        }))}
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: true,
                          showTotal: (total) => `共 ${total} 个冲突IP`,
                        }}
                        size='small'
                        expandable={{
                          expandedRowRender: (record) => (
                            <Table
                              columns={conflictColumns}
                              dataSource={record.conflictDetails.map((detail, idx) => ({
                                key: idx,
                                ...detail,
                              }))}
                              pagination={false}
                              size='small'
                            />
                          ),
                        }}
                      />
                    </>
                  ) : (
                    <Alert message='未检测到IP冲突' description={`网段: ${result.network}`} type='success' showIcon />
                  )}
                </>
              )}
            </Card>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default IPConflictTool;
