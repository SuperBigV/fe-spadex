import React, { useState } from 'react';
import {
  Card,
  Form,
  Button,
  Space,
  InputNumber,
  message,
  Spin,
  Descriptions,
  Tag,
  Alert,
  Tooltip,
} from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import HostSelector from './HostSelector';
import ExecutionModeSelector from './ExecutionModeSelector';
import ToolResultDisplay from './ToolResultDisplay';
import { postNetToolPing } from '../services';
import type { Host, PingResponse } from '../types';

interface PingToolProps {
  hosts: Host[];
}

const PingTool: React.FC<PingToolProps> = ({ hosts }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PingResponse | null>(null);
  const [execMode, setExecMode] = useState<'local' | 'remote'>('local');

  const handleSubmit = async (values: any) => {
    if (!values.target) {
      message.warning('请输入目标地址');
      return;
    }

    if (execMode === 'remote' && !values.agentIdent) {
      message.warning('远程执行需要选择 Agent');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await postNetToolPing({
        target: values.target,
        count: values.count || 4,
        timeout: values.timeout || 30,
        interval: values.interval || 1000,
        execMode,
        agentIdent: values.agentIdent,
      });

      if (res.err) {
        message.error(res.err);
        setResult({
          success: false,
          target: values.target,
          sourceIp: '',
          sent: 0,
          received: 0,
          packetLoss: '0%',
          status: 'failed',
          error: res.err,
          checkTime: new Date().toISOString(),
          execMode,
        });
      } else {
        setResult(res.dat);
      }
    } catch (err: any) {
      message.error('执行失败: ' + err.message);
      setResult({
        success: false,
        target: values.target || '',
        sourceIp: '',
        sent: 0,
        received: 0,
        packetLoss: '0%',
        status: 'failed',
        error: err.message,
        checkTime: new Date().toISOString(),
        execMode,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-container">
      <Card
        title="Ping 测试"
        extra={
          <Tooltip title="测试到目标主机的网络连通性和延迟。用于快速检查网络连接状态和测量网络延迟。">
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        }
      >

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            count: 4,
            timeout: 30,
            interval: 1000,
          }}
        >
          <Form.Item label="执行模式" name="execMode">
            <ExecutionModeSelector value={execMode} onChange={setExecMode} />
          </Form.Item>

          <Form.Item
            label="目标地址"
            name="target"
            rules={[{ required: true, message: '请输入目标 IP 或域名' }]}
          >
            <HostSelector
              hosts={hosts}
              allowInput
              placeholder="输入 IP 或域名，或从列表选择"
            />
          </Form.Item>

          {execMode === 'remote' && (
            <Form.Item
              label="Agent"
              name="agentIdent"
              rules={[{ required: true, message: '请选择 Agent' }]}
            >
              <HostSelector
                hosts={hosts}
                allowInput={false}
                placeholder="选择执行 Agent"
                onChange={(value) => {
                  const host = hosts.find((h) => h.ip === value);
                  form.setFieldsValue({ agentIdent: host?.ident });
                }}
              />
            </Form.Item>
          )}

          <Form.Item label="高级参数">
            <Space>
              <Form.Item name="count" noStyle>
                <InputNumber
                  min={1}
                  max={100}
                  placeholder="Ping 次数"
                  addonBefore="次数"
                />
              </Form.Item>
              <Form.Item name="timeout" noStyle>
                <InputNumber
                  min={1}
                  max={300}
                  placeholder="超时(秒)"
                  addonBefore="超时"
                />
              </Form.Item>
              <Form.Item name="interval" noStyle>
                <InputNumber
                  min={100}
                  max={10000}
                  placeholder="间隔(ms)"
                  addonBefore="间隔"
                />
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<PlayCircleOutlined />}
            >
              开始测试
            </Button>
          </Form.Item>
        </Form>

        <Spin spinning={loading} tip="测试中，请稍候...">
          {result && (
            <Card title="测试结果" style={{ marginTop: 16 }}>
              {result.success ? (
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="目标地址" span={2}>
                    {result.target}
                  </Descriptions.Item>
                  <Descriptions.Item label="探测源 IP">
                    {result.sourceIp}
                  </Descriptions.Item>
                  <Descriptions.Item label="执行模式">
                    {result.execMode === 'local' ? '本地执行' : '远程执行'}
                  </Descriptions.Item>
                  <Descriptions.Item label="发送包数">
                    {result.sent}
                  </Descriptions.Item>
                  <Descriptions.Item label="接收包数">
                    {result.received}
                  </Descriptions.Item>
                  <Descriptions.Item label="丢包率">
                    <Tag color={result.packetLoss === '0%' ? 'success' : 'warning'}>
                      {result.packetLoss}
                    </Tag>
                  </Descriptions.Item>
                  {result.avgRtt && (
                    <>
                      <Descriptions.Item label="最小延迟">
                        {result.minRtt?.toFixed(2)} ms
                      </Descriptions.Item>
                      <Descriptions.Item label="最大延迟">
                        {result.maxRtt?.toFixed(2)} ms
                      </Descriptions.Item>
                      <Descriptions.Item label="平均延迟">
                        {result.avgRtt.toFixed(2)} ms
                      </Descriptions.Item>
                    </>
                  )}
                  <Descriptions.Item label="状态">
                    <Tag color={result.status === 'success' ? 'success' : 'error'}>
                      {result.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="检测时间" span={2}>
                    {new Date(result.checkTime).toLocaleString()}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Alert
                  message="测试失败"
                  description={result.error || '未知错误'}
                  type="error"
                  showIcon
                />
              )}
            </Card>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default PingTool;
