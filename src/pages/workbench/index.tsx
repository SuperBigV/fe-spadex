import React, { useEffect, useState } from 'react';
import PageLayout from '@/components/pageLayout';
import { Card, Col, Row, Table } from 'antd';
import { AlertOutlined, DesktopOutlined, AppstoreAddOutlined, CheckCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { get, set } from 'lodash';
import CurEventList from '@/pages/event/curEventsMe';
import { getWorkbenchDetail, getMyHosts } from './services';
import card from '../event/card';
import HostList from './hostList';
import SoftList from './softList';

interface card {
  title: string;
  count: number;
  key: string;
}
const iconMap = {
  alert: <AlertOutlined style={{ fontSize: '30px' }} />,
  host: <DesktopOutlined style={{ fontSize: '30px' }} />,
  soft: <AppstoreAddOutlined style={{ fontSize: '30px' }} />,
  healthy: <CheckCircleOutlined style={{ fontSize: '30px' }} />,
};

const Dashboard = () => {
  const [selectedCard, setSelectedCard] = useState('host');
  const [cardData, setCardData] = useState<card[]>([]);
  const [loading, setLoading] = useState(false);
  const getCardData = async () => {
    switch (selectedCard) {
      case 'alert':
        // await getWorkbenchDetail().then((detail) => {
        //   setCardData(detail.dat);
        //   setLoading(true);
        // });
        return;
      case 'host':
        await getWorkbenchDetail().then((detail) => {
          setCardData(detail.dat);
          setLoading(true);
        });
        return;
      case 'soft':
        return;
      case 'healthy':
        return;
    }
  };
  useEffect(() => {
    getCardData();
  }, [selectedCard]);

  // const cardData = [
  //   { title: '正在告警', icon: <AlertOutlined style={{ fontSize: '14px' }} />, count: 5, key: 'alert' },
  //   { title: '我的主机', icon: <DesktopOutlined style={{ fontSize: '14px' }} />, count: 10, key: 'host' },
  //   { title: '我的软件', icon: <AppstoreAddOutlined style={{ fontSize: '14px' }} />, count: 8, key: 'soft' },
  //   { title: '健康状态', icon: <CheckCircleOutlined style={{ fontSize: '14px' }} />, count: 0, key: 'healthy' }, // 示例值
  // ];

  const tableData = {
    告警: [
      { key: 1, name: '告警1', status: '严重' },
      { key: 2, name: '告警2', status: '中等' },
    ],
    主机: [
      { key: 1, name: '主机1', ip: '192.168.1.1' },
      { key: 2, name: '主机2', ip: '192.168.1.2' },
    ],
    软件: [
      { key: 1, name: '软件1', version: '1.0' },
      { key: 2, name: '软件2', version: '2.0' },
    ],
    健康: [
      { key: 1, name: '健康1', status: '正常' },
      { key: 2, name: '健康2', status: '异常' },
    ],
  };

  const columns = {
    告警: [
      { title: '名称', dataIndex: 'name', key: 'name' },
      { title: '状态', dataIndex: 'status', key: 'status' },
    ],
    主机: [
      { title: '名称', dataIndex: 'name', key: 'name' },
      { title: 'IP', dataIndex: 'ip', key: 'ip' },
    ],
    软件: [
      { title: '名称', dataIndex: 'name', key: 'name' },
      { title: '版本', dataIndex: 'version', key: 'version' },
    ],
    健康: [
      { title: '名称', dataIndex: 'name', key: 'name' },
      { title: '状态', dataIndex: 'status', key: 'status' },
    ],
  };

  return (
    <PageLayout icon={<GlobalOutlined />} title={'工作台'}>
      {loading && (
        <div style={{ padding: '20px' }}>
          <Row gutter={16}>
            {cardData.map((card) => (
              <Col span={6} key={card.key}>
                <Card
                  onClick={() => setSelectedCard(card.key)}
                  hoverable
                  size='small'
                  style={{
                    cursor: 'pointer',
                    border: selectedCard === card.key ? '2px solid #d9d9d9' : '1px solid #4E505C',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px', // 添加内边距
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        marginRight: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {iconMap[card.key]}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', lineHeight: '1.4' }}>{card.title}</h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '24px',
                          fontWeight: 'bold',
                          lineHeight: '1.3',
                          color: card.key === 'healthy' && card.count > 0 ? '#ff4d4f' : '#52c41a',
                        }}
                      >
                        {card.key === 'healthy' ? `${card.count} 异常` : card.count}
                      </p>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ marginTop: '20px' }}>
            {/* <Table dataSource={tableData[selectedCard]} columns={columns[selectedCard]} pagination={false} /> */}
            {selectedCard === 'alert' && <CurEventList />}
            {selectedCard === 'host' && <HostList />}

            {selectedCard === 'soft' && <SoftList />}
            {/* {selectedCard === 'healthy' && <HealthyTable />}  */}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Dashboard;
