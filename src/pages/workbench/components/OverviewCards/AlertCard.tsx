import React from 'react';
import { Card, Tag, Space } from 'antd';
import { AlertOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

interface AlertCardProps {
  data?: {
    critical: number;
    warning: number;
    info: number;
    todayNew: number;
    todayResolved: number;
  };
  onClick?: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ data, onClick }) => {
  const history = useHistory();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      history.push('/alert-cur-events');
    }
  };

  return (
    <Card hoverable className="overview-card alert-card" onClick={handleClick}>
      <div className="card-header">
        <AlertOutlined className="card-icon" style={{ color: '#ff4d4f' }} />
        <span className="card-title">告警统计</span>
      </div>
      <div className="card-content">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div>
            <Tag color="red">严重: {data?.critical || 0}</Tag>
            <Tag color="orange">警告: {data?.warning || 0}</Tag>
            <Tag color="blue">通知: {data?.info || 0}</Tag>
          </div>
          <div className="card-footer">
            <span>今日新增: {data?.todayNew || 0}</span>
            <span>已处理: {data?.todayResolved || 0}</span>
          </div>
        </Space>
      </div>
    </Card>
  );
};

export default AlertCard;
