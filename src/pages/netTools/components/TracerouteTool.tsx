import React, { useState } from 'react';
import { Card, Form, Button, Space, InputNumber, message, Spin, Alert, Input, Tooltip } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import HostSelector from './HostSelector';
import ExecutionModeSelector from './ExecutionModeSelector';
import { postNetToolTraceroute } from '../services';
import type { Host, TracerouteResponse } from '../types';

const { TextArea } = Input;

interface TracerouteToolProps {
  hosts: Host[];
}

const TracerouteTool: React.FC<TracerouteToolProps> = ({ hosts }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TracerouteResponse | null>(null);
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
      const res = await postNetToolTraceroute({
        target: values.target,
        maxHops: values.maxHops || 30,
        timeout: values.timeout || 1,
        execMode,
        agentIdent: values.agentIdent,
      });

      if (res.err) {
        message.error(res.err);
        setResult({
          success: false,
          target: values.target,
          result: '',
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
        result: '',
        error: err.message,
        checkTime: new Date().toISOString(),
        execMode,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='tool-container'>
      <Card
        title='路由追踪'
        extra={
          <Tooltip title='追踪数据包从源到目标的完整路径。用于精确定位网络故障和路由分析。'>
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        }
      >
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          initialValues={{
            maxHops: 30,
            timeout: 1,
          }}
        >
          <Form.Item label='执行模式' name='execMode'>
            <ExecutionModeSelector value={execMode} onChange={setExecMode} />
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

          <Form.Item label='目标地址' name='target' rules={[{ required: true, message: '请输入目标 IP 或域名' }]}>
            <HostSelector hosts={hosts} allowInput placeholder='输入 IP 或域名，或从列表选择' />
          </Form.Item>

          <Form.Item label='高级参数'>
            <Space>
              <Form.Item name='maxHops' noStyle>
                <InputNumber min={1} max={64} placeholder='最大跳数' addonBefore='最大跳数' />
              </Form.Item>
              <Form.Item name='timeout' noStyle>
                <InputNumber min={1} max={10} placeholder='超时(秒)' addonBefore='超时' />
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
          {result && (
            <Card title='测试结果' style={{ marginTop: 16 }}>
              {result.success ? (
                <div>
                  <Alert
                    message={`目标: ${result.target}`}
                    description={`执行模式: ${result.execMode === 'local' ? '本地执行' : '远程执行'} | 检测时间: ${new Date(result.checkTime).toLocaleString()}`}
                    type='info'
                    style={{ marginBottom: 16 }}
                  />
                  <TextArea
                    value={result.result}
                    rows={20}
                    readOnly
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}
                    placeholder='路由追踪结果将显示在这里...'
                  />
                </div>
              ) : (
                <Alert message='测试失败' description={result.error || '未知错误'} type='error' showIcon />
              )}
            </Card>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default TracerouteTool;
