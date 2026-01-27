import React from 'react';
import { List, Tag, Space, Typography } from 'antd';
import { DesktopOutlined, CloudOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { MyAssetsResponse } from '../../types/workbench';

const { Text } = Typography;

interface AssetListProps {
  data: MyAssetsResponse | null;
  loading?: boolean;
}

const AssetList: React.FC<AssetListProps> = ({ data, loading }) => {
  const history = useHistory();

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      online: { color: 'success', text: '在线' },
      offline: { color: 'error', text: '离线' },
      abnormal: { color: 'warning', text: '异常' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const getAssetTypeIcon = (assetType: string) => {
    if (assetType?.includes('cloud')) {
      return <CloudOutlined />;
    }
    return <DesktopOutlined />;
  };

  return (
    <List
      loading={loading}
      dataSource={data?.list || []}
      renderItem={(item) => (
        <List.Item
          style={{ cursor: 'pointer', padding: '12px' }}
          onClick={() => {
            // 跳转到资产详情
            history.push(`/targets?id=${item.id}`);
          }}
        >
          <List.Item.Meta
            avatar={getAssetTypeIcon(item.assetType)}
            title={
              <Space>
                <Text strong>{item.name}</Text>
                {getStatusTag(item.status)}
              </Space>
            }
            description={
              <Space direction="vertical" size="small">
                <Text type="secondary">IP: {item.ip}</Text>
                {item.busiGroupName && (
                  <Tag color="blue">{item.busiGroupName}</Tag>
                )}
                {(item.cpuUsage !== undefined || item.memoryUsage !== undefined) && (
                  <Space size="small">
                    {item.cpuUsage !== undefined && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        CPU: {item.cpuUsage.toFixed(1)}%
                      </Text>
                    )}
                    {item.memoryUsage !== undefined && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        内存: {item.memoryUsage.toFixed(1)}%
                      </Text>
                    )}
                  </Space>
                )}
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default AssetList;
