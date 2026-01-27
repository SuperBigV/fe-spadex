import React, { useState, useEffect } from 'react';
import { Tabs, message, Tooltip } from 'antd';
import { QuestionCircleOutlined, ApiOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import PingTool from './components/PingTool';
import TracerouteTool from './components/TracerouteTool';
import SubnetTool from './components/SubnetTool';
import PortScanTool from './components/PortScanTool';
import HostDiscoveryTool from './components/HostDiscoveryTool';
import IPConflictTool from './components/IPConflictTool';
import PacketCaptureTool from './components/PacketCaptureTool';
import DNSTool from './components/DNSTool';
import SpeedTestTool from './components/SpeedTestTool';
import { getHosts } from './services';
import type { Host } from './types';
import {
  pingTooltip,
  tracerouteTooltip,
  subnetTooltip,
  portScanTooltip,
  hostDiscoveryTooltip,
  ipConflictTooltip,
  packetCaptureTooltip,
  dnsTooltip,
  speedTestTooltip,
} from './constants/tooltips';
import './index.less';

const renderTabLabel = (title: string, tooltip: string) => (
  <span>
    {title}
    <Tooltip title={<div style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{tooltip}</div>}>
      <QuestionCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
    </Tooltip>
  </span>
);

const NetToolsPage: React.FC = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHosts();
  }, []);

  const loadHosts = async () => {
    setLoading(true);
    try {
      const res = await getHosts();
      setHosts(res.dat?.list || []);
    } catch (err) {
      message.error('加载主机列表失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout icon={<ApiOutlined />} title='网络测试工具箱'>
      <div style={{ margin: 10, minHeight: 400 }}>
        <div style={{ padding: 10 }}>
          <div className='net-tools-container'>
            <Tabs
              defaultActiveKey='ping'
              type='card'
              size='large'
              items={[
                {
                  key: 'ping',
                  label: renderTabLabel('Ping 测试', pingTooltip),
                  children: <PingTool hosts={hosts} />,
                },
                {
                  key: 'traceroute',
                  label: renderTabLabel('路由追踪', tracerouteTooltip),
                  children: <TracerouteTool hosts={hosts} />,
                },
                {
                  key: 'subnet',
                  label: renderTabLabel('子网计算', subnetTooltip),
                  children: <SubnetTool />,
                },
                {
                  key: 'port-scan',
                  label: renderTabLabel('端口扫描', portScanTooltip),
                  children: <PortScanTool hosts={hosts} />,
                },
                {
                  key: 'host-discovery',
                  label: renderTabLabel('主机发现', hostDiscoveryTooltip),
                  children: <HostDiscoveryTool hosts={hosts} />,
                },
                {
                  key: 'ip-conflict',
                  label: renderTabLabel('IP 冲突检测', ipConflictTooltip),
                  children: <IPConflictTool hosts={hosts} />,
                },
                {
                  key: 'packet-capture',
                  label: renderTabLabel('数据包抓包', packetCaptureTooltip),
                  children: <PacketCaptureTool hosts={hosts} />,
                },
                {
                  key: 'dns',
                  label: renderTabLabel('DNS 测试', dnsTooltip),
                  children: <DNSTool hosts={hosts} />,
                },
                // {
                //   key: 'speed-test',
                //   label: renderTabLabel('网络测速', speedTestTooltip),
                //   children: <SpeedTestTool hosts={hosts} />,
                // },
              ]}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NetToolsPage;
