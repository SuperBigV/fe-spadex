import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Card, Select, Button, Table, Tag, Space } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import MonitorChart from './MonitorChart';
import './DeviceDrawer.less';

const { Option } = Select;

const DeviceDrawer = ({ visible, onClose, device }) => {
  const [timeRange, setTimeRange] = useState('1分钟');
  const [alarmData, setAlarmData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monitorData, setMonitorData] = useState({
    cpu: [],
    memory: [],
    inTraffic: [],
    outTraffic: [],
  });
  // 处理抽屉内容点击
  const handleDrawerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose(e);
  };
  // 模拟获取告警数据
  const fetchAlarmData = () => {
    setLoading(true);

    // 模拟API延迟
    setTimeout(() => {
      const mockAlarms = [
        {
          id: '1',
          deviceName: device?.device.name || '未知设备',
          deviceIp: device?.device.ip || '0.0.0.0',
          level: '严重',
          content: 'CPU使用率超过90%',
          duration: '2分钟',
        },
        {
          id: '2',
          deviceName: device?.device.name || '未知设备',
          deviceIp: device?.device.ip || '0.0.0.0',
          level: '警告',
          content: '内存使用率超过80%',
          duration: '5分钟',
        },
      ];

      setAlarmData(mockAlarms);
      setLoading(false);
    }, 500);
  };

  // 模拟获取监控数据
  const fetchMonitorData = () => {
    // 生成模拟数据
    const now = Date.now();
    const newData = {
      cpu: [],
      memory: [],
      inTraffic: [],
      outTraffic: [],
    };

    for (let i = 4; i >= 0; i--) {
      const time = new Date(now - i * 60 * 1000);

      newData.cpu.push({ time, value: Math.floor(Math.random() * 30) + 50 });
      newData.memory.push({ time, value: Math.floor(Math.random() * 40) + 40 });
      newData.inTraffic.push({ time, value: Math.floor(Math.random() * 50) + 20 });
      newData.outTraffic.push({ time, value: Math.floor(Math.random() * 60) + 10 });
    }

    setMonitorData(newData);
  };

  // 刷新所有数据
  const handleRefresh = () => {
    fetchAlarmData();
    fetchMonitorData();
  };

  useEffect(() => {
    if (visible && device) {
      fetchAlarmData();
      fetchMonitorData();
    }
  }, [visible, device, timeRange]);

  const getLevelColor = (level) => {
    switch (level) {
      case '严重':
        return 'error';
      case '警告':
        return 'warning';
      case '提示':
        return 'processing';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceId',
    },
    {
      title: '设备IP',
      dataIndex: 'deviceIp',
      key: 'deviceId',
    },
    {
      title: '告警级别',
      dataIndex: 'level',
      key: 'deviceId',
      render: (level) => <Tag color={getLevelColor(level)}>{level}</Tag>,
    },
    {
      title: '告警内容',
      dataIndex: 'content',
      key: 'deviceId',
    },
    {
      title: '持续时间',
      dataIndex: 'duration',
      key: 'deviceId',
    },
    {
      title: '操作',
      key: 'deviceId',
      render: (_, record) => (
        <Space size='middle'>
          <a>查看详情</a>
          <a>忽略</a>
        </Space>
      ),
    },
  ];

  return (
    <Drawer
      title='设备详情'
      placement='right'
      onClose={handleClose}
      open={visible}
      width={800}
      closable={true}
      maskClosable={true}
      destroyOnClose={true}
      className='device-drawer' // 阻止事件冒泡
      onClick={handleDrawerClick}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {device && (
        <div className='device-drawer-content'>
          {/* 设备信息模块 */}
          <div className='device-info-section'>
            <h2>设备信息</h2>
            <Descriptions column={2} size='small' bordered>
              <Descriptions.Item label='设备名称'>{device.device.name}</Descriptions.Item>
              <Descriptions.Item label='设备类型'>交换机</Descriptions.Item>
              {/* <Descriptions.Item label='设备类型'>{device.type}</Descriptions.Item> */}
              <Descriptions.Item label='IP地址'>{device.device.ip}</Descriptions.Item>
              {/* <Descriptions.Item label='设备型号'>{device.device.model}</Descriptions.Item> */}
              <Descriptions.Item label='设备型号'>{'华为/交换机/S530'}</Descriptions.Item>
              <Descriptions.Item label='设备状态'>
                {/* <span className={`status-dot ${device.status === '在线' ? 'online' : 'offline'}`}></span> */}
                {/* <span className={'status-dot online'}>{'运行中'}</span> */}
                <Tag color='#87d068'>{'运行中'}</Tag>
                {/* {device.status} */}
              </Descriptions.Item>
              {/* <Descriptions.Item label='所属区域'>{device.device.belong_room}</Descriptions.Item> */}
              <Descriptions.Item label='所属区域'>{'北京xxx机房'}</Descriptions.Item>
              <Descriptions.Item label='负责人'>{'李磊'}</Descriptions.Item>
            </Descriptions>
          </div>

          {/* 监控信息模块 */}
          <div className='monitor-section'>
            <div className='section-header'>
              <h2>实时监控</h2>
              <Button type='text' icon={<SyncOutlined />} onClick={fetchMonitorData} />
            </div>

            <div className='chart-grid'>
              <Card title='CPU使用率 (%)'>
                <MonitorChart data={monitorData.cpu} color='#4096ff' />
              </Card>
              <Card title='内存使用率 (%)'>
                <MonitorChart data={monitorData.memory} color='#73d13d' />
              </Card>
              <Card title='入流量 (Mbps)'>
                <MonitorChart data={monitorData.inTraffic} color='#ffd666' />
              </Card>
              <Card title='出流量 (Mbps)'>
                <MonitorChart data={monitorData.outTraffic} color='#9254de' />
              </Card>
            </div>
          </div>

          {/* 告警列表模块 */}
          <div className='alarm-section'>
            <div className='section-header'>
              <h2>告警列表</h2>
              <div className='alarm-controls'>
                <Select value={timeRange} onChange={setTimeRange} size='small' style={{ width: 120 }}>
                  <Option value='1分钟'>1分钟</Option>
                  <Option value='5分钟'>5分钟</Option>
                  <Option value='10分钟'>10分钟</Option>
                  <Option value='30分钟'>30分钟</Option>
                </Select>
                <Button type='text' icon={<SyncOutlined />} onClick={fetchAlarmData} loading={loading} />
              </div>
            </div>

            <Table columns={columns} dataSource={alarmData} pagination={false} loading={loading} locale={{ emptyText: '当前时间范围内无告警记录' }} size='small' />
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default DeviceDrawer;
