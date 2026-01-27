import React from 'react';
import { Card, Progress, Space } from 'antd';
import { DashboardOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

interface ResourceCardProps {
  data?: {
    cpu: { avg: number; max: number; trend: 'up' | 'down' | 'stable' };
    memory: { avg: number; max: number; trend: 'up' | 'down' | 'stable' };
    disk: { avg: number; max: number; trend: 'up' | 'down' | 'stable' };
  };
  onClick?: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ data, onClick }) => {
  const history = useHistory();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpOutlined style={{ color: '#ff4d4f' }} />;
      case 'down':
        return <ArrowDownOutlined style={{ color: '#52c41a' }} />;
      default:
        return <MinusOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return '#ff4d4f';
    if (value >= 60) return '#faad14';
    return '#52c41a';
  };

  return (
    <Card hoverable className='overview-card resource-card' onClick={onClick || (() => history.push('/dashboards'))}>
      <div className='card-header'>
        <DashboardOutlined className='card-icon' style={{ color: '#52c41a' }} />
        <span className='card-title'>资源使用率</span>
      </div>
      <div className='card-content'>
        <Space direction='vertical' size='small' style={{ width: '100%' }}>
          <div>
            <div className='resource-item'>
              <span>CPU</span>
              <Space>
                {getTrendIcon(data?.cpu.trend || 'stable')}
                <span>{data?.cpu.avg?.toFixed(1) || 0}%</span>
              </Space>
            </div>
            <Progress percent={data?.cpu.avg || 0} strokeColor={getProgressColor(data?.cpu.avg || 0)} size='small' showInfo={false} />
          </div>
          <div>
            <div className='resource-item'>
              <span>内存</span>
              <Space>
                {getTrendIcon(data?.memory.trend || 'stable')}
                <span>{data?.memory.avg?.toFixed(1) || 0}%</span>
              </Space>
            </div>
            <Progress percent={data?.memory.avg || 0} strokeColor={getProgressColor(data?.memory.avg || 0)} size='small' showInfo={false} />
          </div>
          {/* <div>
            <div className="resource-item">
              <span>磁盘</span>
              <Space>
                {getTrendIcon(data?.disk.trend || 'stable')}
                <span>{data?.disk.avg?.toFixed(1) || 0}%</span>
              </Space>
            </div>
            <Progress
              percent={data?.disk.avg || 0}
              strokeColor={getProgressColor(data?.disk.avg || 0)}
              size="small"
              showInfo={false}
            />
          </div> */}
        </Space>
      </div>
    </Card>
  );
};

export default ResourceCard;
