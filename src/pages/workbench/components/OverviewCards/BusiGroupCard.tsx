import React from 'react';
import { Card, Space } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

interface BusiGroupCardProps {
  data?: {
    total: number;
    healthy: number;
    abnormal: number;
    healthRate: number;
  };
  onClick?: () => void;
}

const BusiGroupCard: React.FC<BusiGroupCardProps> = ({ data, onClick }) => {
  const history = useHistory();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      history.push('/busi-groups');
    }
  };

  return (
    <Card hoverable className="overview-card busi-group-card" onClick={handleClick}>
      <div className="card-header">
        <AppstoreAddOutlined className="card-icon" style={{ color: '#722ed1' }} />
        <span className="card-title">业务组统计</span>
      </div>
      <div className="card-content">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              {data?.total || 0}
            </div>
            <Space>
              <span style={{ color: '#52c41a' }}>健康: {data?.healthy || 0}</span>
              <span style={{ color: '#ff4d4f' }}>异常: {data?.abnormal || 0}</span>
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

export default BusiGroupCard;
