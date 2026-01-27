import React from 'react';
import { Button, Space } from 'antd';
import {
  PlusOutlined,
  AlertOutlined,
  DashboardOutlined,
  DesktopOutlined,
  BellOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import './index.less';

const QuickActions: React.FC = () => {
  const history = useHistory();

  const actions = [
    { icon: <PlusOutlined />, label: '新建资产', path: '/targets?action=add' },
    { icon: <AlertOutlined />, label: '新建告警规则', path: '/alert-rules?action=add' },
    { icon: <DashboardOutlined />, label: '查看监控大盘', path: '/dashboards' },
    { icon: <DesktopOutlined />, label: '资产管理', path: '/targets' },
    { icon: <BellOutlined />, label: '告警中心', path: '/alert-cur-events' },
    { icon: <SettingOutlined />, label: '系统设置', path: '/site-settings' },
  ];

  return (
    <div className="quick-actions-wrapper">
      <Space size="middle" wrap>
        {actions.map((action, index) => (
          <Button
            key={index}
            type="default"
            icon={action.icon}
            onClick={() => {
              history.push(action.path);
            }}
          >
            {action.label}
          </Button>
        ))}
      </Space>
    </div>
  );
};

export default QuickActions;
