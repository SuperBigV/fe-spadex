import React from 'react';
import { List, Tag, Space, Typography } from 'antd';
import { AlertOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { MyAlertsResponse } from '../../types/workbench';

const { Text } = Typography;

interface AlertListProps {
  data: MyAlertsResponse | null;
  loading?: boolean;
}

const AlertList: React.FC<AlertListProps> = ({ data, loading }) => {
  const history = useHistory();

  const getSeverityTag = (severity: string) => {
    const severityMap: Record<string, { color: string; text: string }> = {
      critical: { color: 'red', text: '严重' },
      warning: { color: 'orange', text: '警告' },
      info: { color: 'blue', text: '通知' },
    };
    const severityInfo = severityMap[severity] || { color: 'default', text: severity };
    return <Tag color={severityInfo.color}>{severityInfo.text}</Tag>;
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      unhandled: { color: 'red', text: '未处理' },
      handling: { color: 'orange', text: '处理中' },
      resolved: { color: 'success', text: '已处理' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  return (
    <List
      loading={loading}
      dataSource={data?.list || []}
      renderItem={(item) => (
        <List.Item
          style={{ cursor: 'pointer', padding: '12px' }}
          onClick={() => {
            // 跳转到告警详情
            history.push(`/alert-cur-events?id=${item.id}`);
          }}
        >
          <List.Item.Meta
            avatar={<AlertOutlined style={{ fontSize: '20px', color: item.severity === 'critical' ? '#ff4d4f' : item.severity === 'warning' ? '#faad14' : '#1890ff' }} />}
            title={
              <Space>
                <Text strong>{item.title}</Text>
                {getSeverityTag(item.severity)}
                {getStatusTag(item.status)}
              </Space>
            }
            description={
              <Space direction="vertical" size="small">
                <Space>
                  <Text type="secondary">资产: {item.assetName}</Text>
                  {item.busiGroupName && <Tag color="blue">{item.busiGroupName}</Tag>}
                </Space>
                <Space>
                  <Text type="secondary">触发时间: {item.triggerTime}</Text>
                  <Text type="secondary">持续时间: {item.duration}</Text>
                </Space>
                {item.currentValue !== undefined && item.threshold !== undefined && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    当前值: {item.currentValue.toFixed(2)} / 阈值: {item.threshold.toFixed(2)}
                  </Text>
                )}
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default AlertList;
