import React, { useState, useEffect } from 'react';
import { Badge, Popover, Table, Button } from 'antd';
import { AlertOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getCurrentAlertOfMy } from './services';
interface AlertItem {
  rule_name: string;
  cate: string;
  severity: number;
  trigger_time: string;
}

interface classifyAlerts {
  critical: { count: 0; list: AlertItem[] };
  warning: { count: 0; list: AlertItem[] };
  info: { count: 0; list: AlertItem[] };
}
// 分类函数
const classifyAlerts = (data) => {
  const result: classifyAlerts = {
    critical: { count: 0, list: [] },
    warning: { count: 0, list: [] },
    info: { count: 0, list: [] },
  };

  data.forEach((item) => {
    switch (item.severity) {
      case 1:
        result.critical.count++;
        result.critical.list.push(item);
        break;
      case 2:
        result.warning.count++;
        result.warning.list.push(item);
        break;
      case 3:
        result.info.count++;
        result.info.list.push(item);
        break;
      default:
        console.warn(`Unknown severity level: ${item.severity}`);
    }
  });

  return result;
};
const AlertIndicator = () => {
  // 告警数据状态
  const [alerts, setAlerts] = useState<classifyAlerts>({
    critical: { count: 0, list: [] },
    warning: { count: 0, list: [] },
    info: { count: 0, list: [] },
  });

  // 弹出框可见状态
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('critical');

  // 定时请求后端接口
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getCurrentAlertOfMy();
        let respData = classifyAlerts(data);
        setAlerts(respData);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // 每分钟轮询

    return () => clearInterval(interval);
  }, []);

  // 表格列配置
  const columns = [
    {
      title: '标题',
      dataIndex: 'rule_name',
      key: 'rule_name',
    },
    {
      title: '告警源',
      dataIndex: 'cate',
      key: 'cate',
    },
    {
      title: '告警时间',
      dataIndex: 'trigger_time',
      key: 'trigger_time',
      render: (text: string) => {
        console.log(text);
        return <div className='table-text'>{moment.unix(Number(text)).format('YYYY-MM-DD HH:mm:ss')}</div>;
      },
    },
  ];

  // 弹出框内容
  const popoverContent = (
    <div style={{ width: 800 }}>
      <div style={{ marginBottom: 16 }}>
        <Button type={activeTab === 'critical' ? 'primary' : 'default'} onClick={() => setActiveTab('critical')} danger>
          严重({alerts.critical.count})
        </Button>
        <Button type={activeTab === 'warning' ? 'primary' : 'default'} onClick={() => setActiveTab('warning')} style={{ marginLeft: 8, borderColor: '#faad14' }}>
          警告({alerts.warning.count})
        </Button>
        <Button type={activeTab === 'info' ? 'primary' : 'default'} onClick={() => setActiveTab('info')} style={{ marginLeft: 8, color: '#C6C6C6', borderColor: '#8c8c8c' }}>
          通知({alerts.info.count})
        </Button>
      </div>
      <Table columns={columns} dataSource={alerts[activeTab].list} size='small' pagination={{ pageSize: 5 }} rowKey='id' />
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 24, marginRight: 16 }}>
      <Popover content={popoverContent} trigger='click' open={popoverVisible} onOpenChange={setPopoverVisible} placement='bottomRight'>
        <div style={{ cursor: 'pointer' }}>
          <Badge count={alerts.critical.count + alerts.warning.count + alerts.info.count} overflowCount={99}>
            <AlertOutlined style={{ fontSize: 15, color: '#ff4d4f' }} />
          </Badge>
        </div>
      </Popover>

      {/* <div
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setPopoverVisible(true);
          setActiveTab('warning');
        }}
      >
        <Badge count={alerts.warning.count} overflowCount={99}>
          <AlertOutlined style={{ fontSize: 15, color: '#faad14' }} />
        </Badge>
      </div> */}

      {/* <div
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setPopoverVisible(true);
          setActiveTab('info');
        }}
      >
        <Badge count={alerts.info.count} overflowCount={99}>
          <AlertOutlined style={{ fontSize: 15, color: '#8c8c8c' }} />
        </Badge>
      </div> */}
    </div>
  );
};

export default AlertIndicator;
