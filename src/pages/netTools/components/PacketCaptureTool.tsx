import React, { useState } from 'react';
import { Card, Form, Button, Space, InputNumber, message, Spin, Alert, Input, Select, Tooltip } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import HostSelector from './HostSelector';
import { postNetToolPacketCapture } from '../services';
import type { Host, PacketCaptureResponse } from '../types';

const { TextArea } = Input;

interface PacketCaptureToolProps {
  hosts: Host[];
}

const PacketCaptureTool: React.FC<PacketCaptureToolProps> = ({ hosts }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PacketCaptureResponse | null>(null);

  const handleSubmit = async (values: any) => {
    if (!values.agentIdent) {
      message.warning('请选择 Agent');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await postNetToolPacketCapture({
        agentIdent: values.agentIdent,
        interface: values.interface || 'eth0',
        filter: values.filter,
        count: values.count || 100,
        duration: values.duration || 10,
        outputFormat: values.outputFormat || 'text',
      });

      if (res.err) {
        message.error(res.err);
        setResult({
          success: false,
          agentIdent: values.agentIdent,
          interface: values.interface || 'eth0',
          error: res.err,
          checkTime: new Date().toISOString(),
        });
      } else if (res.dat) {
        // 如果 res.dat 存在，直接使用（可能包含 success: false 和 error 字段）
        setResult(res.dat);
        if (!res.dat.success && res.dat.error) {
          message.error(res.dat.error);
        }
      } else {
        setResult({
          success: false,
          agentIdent: values.agentIdent,
          interface: values.interface || 'eth0',
          error: '未知错误',
          checkTime: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      message.error('执行失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='tool-container'>
      <Card
        title='数据包抓包'
        extra={
          <Tooltip title='捕获网络数据包并进行分析。用于协议分析和故障诊断。注意：此功能仅支持远程执行。'>
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        }
      >
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          initialValues={{
            interface: 'eth0',
            count: 100,
            duration: 10,
            outputFormat: 'text',
          }}
        >
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

          <Form.Item label='网卡名称' name='interface'>
            <Input placeholder='例如: eth0' style={{ width: 200 }} />
          </Form.Item>

          <Form.Item label='过滤条件' name='filter' extra='BPF 过滤表达式，例如: tcp port 80'>
            <Input placeholder='例如: tcp port 80' style={{ width: 400 }} />
          </Form.Item>

          <Form.Item label='高级参数'>
            <Space>
              <Form.Item name='count' noStyle>
                <InputNumber min={1} max={10000} placeholder='抓包数量' addonBefore='数量' />
              </Form.Item>
              <Form.Item name='duration' noStyle>
                <InputNumber min={1} max={300} placeholder='时长(秒)' addonBefore='时长' />
              </Form.Item>
              <Form.Item name='outputFormat' noStyle>
                <Select style={{ width: 120 }}>
                  <Select.Option value='text'>文本</Select.Option>
                  <Select.Option value='json'>JSON</Select.Option>
                </Select>
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit' loading={loading} icon={<PlayCircleOutlined />}>
              开始抓包
            </Button>
          </Form.Item>
        </Form>

        <Spin spinning={loading} tip='抓包中，请稍候...'>
          {result && result.success && (
            <Card title='抓包结果' style={{ marginTop: 16 }}>
              <Alert
                message={`Agent: ${result.agentIdent} | 网卡: ${result.interface}`}
                description={`执行时间: ${new Date(result.checkTime).toLocaleString()}`}
                type='info'
                showIcon
                style={{ marginBottom: 16 }}
              />

              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>原始数据：</div>
                <TextArea
                  value={result.result || JSON.stringify(result, null, 2)}
                  rows={18}
                  readOnly
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    whiteSpace: 'pre',
                  }}
                />
              </div>
            </Card>
          )}
          {result && !result.success && (
            <Card title='抓包结果' style={{ marginTop: 16 }}>
              <Alert
                message='抓包失败'
                description={
                  <div>
                    {result.error && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>错误信息：</div>
                        <div
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #ffccc7',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {result.error.trim()}
                        </div>
                      </div>
                    )}
                    {result.checkTime && <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: '12px' }}>执行时间: {new Date(result.checkTime).toLocaleString()}</div>}
                    {!result.error && <div>请检查 Agent 连接和网络接口配置</div>}
                  </div>
                }
                type='error'
                showIcon
              />
            </Card>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default PacketCaptureTool;
