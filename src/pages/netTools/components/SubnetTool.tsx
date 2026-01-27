import React, { useState } from 'react';
import {
  Card,
  Form,
  Button,
  Input,
  message,
  Spin,
  Alert,
  Descriptions,
  Tag,
  Select,
  Tooltip,
} from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { postNetToolSubnet } from '../services';
import type { SubnetResponse } from '../types';

const SubnetTool: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubnetResponse | null>(null);

  const handleSubmit = async (values: any) => {
    if (!values.ip || !values.mask) {
      message.warning('请输入 IP 地址和子网掩码');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await postNetToolSubnet({
        ip: values.ip,
        mask: values.mask,
        calculateType: values.calculateType || 'all',
      });

      if (res.err) {
        message.error(res.err);
        setResult({
          success: false,
          network: '',
          broadcast: '',
          netmask: '',
          cidr: '',
          hosts: {
            total: 0,
            usable: 0,
            first: '',
            last: '',
          },
          wildcard: '',
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
        title="子网计算"
        extra={
          <Tooltip title="计算子网掩码、网络地址、广播地址、可用 IP 范围等。用于网络规划和 IP 地址管理。">
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        }
      >

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            calculateType: 'all',
          }}
        >
          <Form.Item
            label="IP 地址"
            name="ip"
            rules={[
              { required: true, message: '请输入 IP 地址' },
              {
                pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
                message: '请输入有效的 IP 地址',
              },
            ]}
          >
            <Input placeholder="例如: 192.168.1.1" style={{ width: 400 }} />
          </Form.Item>

          <Form.Item
            label="子网掩码"
            name="mask"
            rules={[{ required: true, message: '请输入子网掩码' }]}
            extra="支持 CIDR 格式 (如 /24) 或点分十进制格式 (如 255.255.255.0)"
          >
            <Input placeholder="例如: /24 或 255.255.255.0" style={{ width: 400 }} />
          </Form.Item>

          <Form.Item label="计算类型" name="calculateType">
            <Select style={{ width: 200 }}>
              <Select.Option value="all">全部信息</Select.Option>
              <Select.Option value="subnet">子网信息</Select.Option>
              <Select.Option value="hosts">主机信息</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<PlayCircleOutlined />}
            >
              开始计算
            </Button>
          </Form.Item>
        </Form>

        <Spin spinning={loading} tip="计算中，请稍候...">
          {result && result.success && (
            <Card title="计算结果" style={{ marginTop: 16 }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="网络地址" span={2}>
                  <Tag color="blue">{result.network}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="广播地址">
                  <Tag color="orange">{result.broadcast}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="子网掩码">
                  {result.netmask}
                </Descriptions.Item>
                <Descriptions.Item label="CIDR 表示">
                  <Tag color="green">{result.cidr}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="通配符掩码">
                  {result.wildcard}
                </Descriptions.Item>
                <Descriptions.Item label="总主机数" span={2}>
                  {result.hosts.total}
                </Descriptions.Item>
                <Descriptions.Item label="可用主机数">
                  <Tag color="success">{result.hosts.usable}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="第一个可用 IP">
                  {result.hosts.first}
                </Descriptions.Item>
                <Descriptions.Item label="最后一个可用 IP">
                  {result.hosts.last}
                </Descriptions.Item>
                <Descriptions.Item label="计算时间" span={2}>
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

export default SubnetTool;
