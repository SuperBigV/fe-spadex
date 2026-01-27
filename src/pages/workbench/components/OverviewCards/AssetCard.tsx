import React from 'react';
import { Card, Space } from 'antd';
import { DesktopOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

interface AssetCardProps {
  data?: {
    total: number;
    online: number;
    offline: number;
    abnormal: number;
    healthRate: number;
  };
  onClick?: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ data, onClick }) => {
  const history = useHistory();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      history.push('/targets');
    }
  };

  return (
    <Card hoverable className="overview-card asset-card" onClick={handleClick}>
      <div className="card-header">
        <DesktopOutlined className="card-icon" style={{ color: '#1890ff' }} />
        <span className="card-title">资产统计</span>
      </div>
      <div className="card-content">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              {data?.total || 0}
            </div>
            <Space>
              <span style={{ color: '#52c41a' }}>在线: {data?.online || 0}</span>
              <span style={{ color: '#ff4d4f' }}>离线: {data?.offline || 0}</span>
            </Space>
          </div>
          <div className="card-footer">
            <span>健康率: {data?.healthRate?.toFixed(1) || 0}%</span>
          </div>
        </Space>
      </div>
    </Card>
  );
};

export default AssetCard;
