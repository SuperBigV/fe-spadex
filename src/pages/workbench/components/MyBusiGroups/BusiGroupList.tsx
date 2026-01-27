import React from 'react';
import { List, Tag, Space, Typography, Progress } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { MyBusiGroupsResponse } from '../../types/workbench';

const { Text } = Typography;

interface BusiGroupListProps {
  data: MyBusiGroupsResponse | null;
  loading?: boolean;
}

const BusiGroupList: React.FC<BusiGroupListProps> = ({ data, loading }) => {
  const history = useHistory();

  const getHealthStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      healthy: { color: 'success', text: '健康' },
      warning: { color: 'warning', text: '警告' },
      abnormal: { color: 'error', text: '异常' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const calculateHealthRate = (item: MyBusiGroupsResponse['list'][0]) => {
    if (item.assetCount === 0) return 0;
    return (item.onlineAssetCount / item.assetCount) * 100;
  };

  return (
    <List
      loading={loading}
      dataSource={data?.list || []}
      renderItem={(item) => (
        <List.Item
          style={{ cursor: 'pointer', padding: '12px' }}
          onClick={() => {
            // 跳转到业务组详情
            history.push(`/busi-groups?id=${item.id}`);
          }}
        >
          <List.Item.Meta
            avatar={<AppstoreAddOutlined style={{ fontSize: '20px', color: '#722ed1' }} />}
            title={
              <Space>
                <Text strong>{item.name}</Text>
                {getHealthStatusTag(item.healthStatus)}
              </Space>
            }
            description={
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space>
                  <Text type="secondary">资产: {item.assetCount}</Text>
                  <Text type="secondary" style={{ color: '#52c41a' }}>
                    在线: {item.onlineAssetCount}
                  </Text>
                  <Text type="secondary" style={{ color: '#ff4d4f' }}>
                    离线: {item.offlineAssetCount}
                  </Text>
                </Space>
                <Space>
                  <Tag color="red">严重: {item.alertCount.critical}</Tag>
                  <Tag color="orange">警告: {item.alertCount.warning}</Tag>
                  <Tag color="blue">通知: {item.alertCount.info}</Tag>
                </Space>
                <Progress
                  percent={calculateHealthRate(item)}
                  size="small"
                  strokeColor={item.healthStatus === 'healthy' ? '#52c41a' : item.healthStatus === 'warning' ? '#faad14' : '#ff4d4f'}
                  format={(percent) => `健康率: ${percent?.toFixed(1)}%`}
                />
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default BusiGroupList;
