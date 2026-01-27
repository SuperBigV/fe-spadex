import React from 'react';
import { Descriptions, Table, Tag, Typography, Card, Space, Spin } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface ToolResultDisplayProps {
  result: any;
  loading?: boolean;
  displayType?: 'descriptions' | 'table' | 'text' | 'json';
}

const renderValue = (value: any): React.ReactNode => {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'boolean') {
    return value ? (
      <Tag color="success" icon={<CheckCircleOutlined />}>
        是
      </Tag>
    ) : (
      <Tag color="error" icon={<CloseCircleOutlined />}>
        否
      </Tag>
    );
  }
  if (typeof value === 'object') {
    return <pre>{JSON.stringify(value, null, 2)}</pre>;
  }
  return String(value);
};

const ToolResultDisplay: React.FC<ToolResultDisplayProps> = ({
  result,
  loading = false,
  displayType = 'descriptions',
}) => {
  if (loading) {
    return <Spin tip="执行中..." />;
  }

  if (!result) {
    return null;
  }

  if (!result.success && result.error) {
    return (
      <Card>
        <Space>
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
          <Text type="danger">{result.error}</Text>
        </Space>
      </Card>
    );
  }

  switch (displayType) {
    case 'table':
      return <Table dataSource={result.data} columns={result.columns} />;
    case 'text':
      return (
        <Card>
          <Paragraph
            copyable
            style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
          >
            {result.data}
          </Paragraph>
        </Card>
      );
    case 'json':
      return (
        <Card>
          <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </Card>
      );
    default:
      return (
        <Descriptions bordered column={2}>
          {Object.entries(result.data || {}).map(([key, value]) => (
            <Descriptions.Item key={key} label={key}>
              {renderValue(value)}
            </Descriptions.Item>
          ))}
        </Descriptions>
      );
  }
};

export default ToolResultDisplay;
