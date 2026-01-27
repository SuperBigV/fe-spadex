import React, { useState } from 'react';
import {
  Card,
  Form,
  Button,
  Space,
  InputNumber,
  message,
  Spin,
  Alert,
  Descriptions,
  Tag,
  Select,
  Tooltip,
} from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import HostSelector from './HostSelector';
import ExecutionModeSelector from './ExecutionModeSelector';
import { postNetToolSpeedTest } from '../services';
import type { Host, SpeedTestResponse } from '../types';

interface SpeedTestToolProps {
  hosts: Host[];
}

const SpeedTestTool: React.FC<SpeedTestToolProps> = ({ hosts }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpeedTestResponse | null>(null);
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
      const res = await postNetToolSpeedTest({
        target: values.target,
        testType: values.testType || 'both',
        duration: values.duration || 10,
        execMode,
        agentIdent: values.agentIdent,
      });

      if (res.err) {
        message.error(res.err);
        setResult({
          success: false,
          target: values.target,
          testType: values.testType || 'both',
          packetLoss: '0%',
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

  return (
    <div className="tool-container">
      <Card
        title="网络测速"
        extra={
          <Tooltip title="测试网络带宽和延迟性能。用于质量评估和性能监控。注意：需要目标服务器支持 iperf3 服务端。">
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        }
      >

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            testType: 'both',
            duration: 10,
          }}
        >
          <Form.Item label="执行模式" name="execMode">
            <ExecutionModeSelector value={execMode} onChange={setExecMode} />
          </Form.Item>

          <Form.Item
            label="目标服务器"
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
              <Form.Item name="testType" noStyle>
                <Select style={{ width: 150 }}>
                  <Select.Option value="both">带宽 + 延迟</Select.Option>
                  <Select.Option value="bandwidth">仅带宽</Select.Option>
                  <Select.Option value="latency">仅延迟</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="duration" noStyle>
                <InputNumber
                  min={1}
                  max={300}
                  placeholder="测试时长(秒)"
                  addonBefore="时长"
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
          {result && result.success && (
            <Card title="测试结果" style={{ marginTop: 16 }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="目标服务器" span={2}>
                  {result.target}
                </Descriptions.Item>
                <Descriptions.Item label="测试类型">
                  <Tag>{result.testType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="丢包率">
                  <Tag color={result.packetLoss === '0%' ? 'success' : 'warning'}>
                    {result.packetLoss}
                  </Tag>
                </Descriptions.Item>
                {result.latency && (
                  <>
                    <Descriptions.Item label="最小延迟" span={2}>
                      {result.latency.min.toFixed(2)} ms
                    </Descriptions.Item>
                    <Descriptions.Item label="最大延迟">
                      {result.latency.max.toFixed(2)} ms
                    </Descriptions.Item>
                    <Descriptions.Item label="平均延迟">
                      {result.latency.avg.toFixed(2)} ms
                    </Descriptions.Item>
                    <Descriptions.Item label="抖动">
                      {result.latency.jitter.toFixed(2)} ms
                    </Descriptions.Item>
                  </>
                )}
                {result.bandwidth && (
                  <>
                    <Descriptions.Item label="下载带宽" span={2}>
                      <Tag color="blue" style={{ fontSize: '16px' }}>
                        {result.bandwidth.download.toFixed(2)} {result.bandwidth.unit}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="上传带宽" span={2}>
                      <Tag color="green" style={{ fontSize: '16px' }}>
                        {result.bandwidth.upload.toFixed(2)} {result.bandwidth.unit}
                      </Tag>
                    </Descriptions.Item>
                  </>
                )}
                <Descriptions.Item label="测试时间" span={2}>
                  {new Date(result.checkTime).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default SpeedTestTool;
