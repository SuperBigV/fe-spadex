import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, message, Card, Tooltip, Modal, Typography } from 'antd';
import { DesktopOutlined, PoweroffOutlined, ReloadOutlined, LinkOutlined, SearchOutlined, CloudOutlined, CodeOutlined } from '@ant-design/icons';
import { useHistory, Link } from 'react-router-dom';
import { getMyHosts } from './services';
const { Title } = Typography;
interface IHost {
  id: number;
  ident: string;
  host_ip: string;
  ident_type: string;
  status: string;
  update_at: string;
}
const HostList = () => {
  const history = useHistory();
  // const [data, setData] = useState([
  //   {
  //     id: 1,
  //     name: 'Web服务器-01',
  //     ip: '192.168.1.101',
  //     ident_type: 'host_server',
  //     status: '在线',
  //   },
  //   {
  //     id: 2,
  //     name: '数据库服务器',
  //     ip: '192.168.1.102',
  //     ident_type: 'host_vm',
  //     status: '在线',
  //   },
  //   {
  //     id: 3,
  //     name: '开发工作站',
  //     ip: '192.168.1.50',
  //     ident_type: 'host_server',
  //     status: '离线',
  //   },
  //   {
  //     id: 4,
  //     name: '阿里云主机',
  //     ip: '10.0.0.103',
  //     ident_type: 'host_cloud',
  //     status: '在线',
  //   },
  //   {
  //     id: 5,
  //     name: '核心交换机',
  //     ip: '192.168.1.1',
  //     ident_type: 'net_switch',
  //     status: '在线',
  //   },
  //   {
  //     id: 6,
  //     name: '边界防火墙',
  //     ip: '192.168.1.254',
  //     ident_type: 'net_firewall',
  //     status: '在线',
  //   },
  //   {
  //     id: 7,
  //     name: '出口路由器',
  //     ip: '192.168.0.1',
  //     ident_type: 'net_router',
  //     status: '在线',
  //   },
  // ]);
  // 设备类型字典映射
  const deviceTypeDict = {
    host_vm: '虚拟机',
    host_server: '物理机',
    host_cloud: '云主机',
    net_switch: '交换机',
    net_firewall: '防火墙',
    net_router: '路由器',
  };
  const [data, setData] = useState<IHost[]>([]);
  useEffect(() => {
    getMyHosts().then((res) => {
      // console.log('@@@res:', res);
      setData(res.dat.list);
    });
  }, []);

  // 模拟主机数据

  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);

  // 判断是否为网络设备
  const isNetworkDevice = (ident_type) => {
    return ident_type.startsWith('net_');
  };

  // 获取设备类型显示名称
  const getDeviceTypeName = (ident_type) => {
    return deviceTypeDict[ident_type] || ident_type;
  };

  // 获取设备类型对应的图标和颜色
  const getDeviceTypeProps = (ident_type) => {
    if (ident_type.startsWith('host_')) {
      return { color: 'blue', icon: <DesktopOutlined /> };
    } else if (ident_type.startsWith('net_')) {
      return { color: 'green', icon: <CodeOutlined /> };
    }
    return { color: 'default', icon: <DesktopOutlined /> };
  };

  const handleReboot = (host) => {
    message.loading({ content: `正在重启 ${host.ident}...`, key: 'reboot', duration: 0 });
    setTimeout(() => {
      message.success({ content: `${host.ident} 重启成功`, key: 'reboot' });
    }, 2000);
  };

  const handlePowerOn = (host) => {
    message.loading({ content: `正在启动 ${host.ident}...`, key: 'poweron', duration: 0 });
    setTimeout(() => {
      const newData = data.map((item) => (item.id === host.id ? { ...item, status: '在线' } : item));
      setData(newData);
      message.success({ content: `${host.ident} 启动成功`, key: 'poweron' });
    }, 2000);
  };

  const handlePowerOff = (host) => {
    message.loading({ content: `正在关闭 ${host.ident}...`, key: 'poweroff', duration: 0 });
    setTimeout(() => {
      const newData = data.map((item) => (item.id === host.id ? { ...item, status: '离线' } : item));
      setData(newData);
      message.success({ content: `${host.ident} 已安全关闭`, key: 'poweroff' });
    }, 2000);
  };

  // 表格列定义
  const columns = [
    {
      title: '设备名称',
      dataIndex: 'ident',
      key: 'name',
      sorter: (a, b) => a.ident.localeCompare(b.ident),
      render: (name, record) => (
        <Space>
          {getDeviceTypeProps(record.ident_type).icon}
          {name}
        </Space>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'host_ip',
      key: 'host_ip',
      sorter: (a, b) => a.host_ip.localeCompare(b.host_ip),
    },
    {
      title: '设备类型',
      dataIndex: 'ident_type',
      key: 'ident_type',
      filters: [
        { text: '虚拟机', value: 'host_vm' },
        { text: '物理机', value: 'host_server' },
        { text: '云主机', value: 'host_cloud' },
        { text: '交换机', value: 'net_switch' },
        { text: '防火墙', value: 'net_firewall' },
        { text: '路由器', value: 'net_router' },
      ],
      onFilter: (value, record) => record.ident_type === value,
      render: (ident_type) => {
        const { color } = getDeviceTypeProps(ident_type);
        return (
          <Tag color={color} icon={getDeviceTypeProps(ident_type).icon}>
            {getDeviceTypeName(ident_type)}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'offset',
      key: 'offset',
      // render: (status) => <Tag color={status === '在线' ? 'green' : 'red'}>{status}</Tag>,
      render(text, reocrd) {
        if (reocrd.cpu_num === -1) return '离线';
        let result = '离线';
        let backgroundColor = 'red';
        if (Math.abs(text) > 1) {
          result = '在线';
          backgroundColor = 'green';
        }
        return <Tag color={backgroundColor}>{result}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (record) => {
        const isNetDevice = isNetworkDevice(record.ident_type);

        return (
          <Space size='small'>
            <Tooltip title='远程连接'>
              <Button
                icon={<LinkOutlined />}
                size='small'
                type='link'
                style={{ padding: 0 }}
                onClick={() => {
                  history.push(`/ident/${record.asset_id}/${record.ident}/terminal/${record.ident_type}`);
                }}
              >
                {'远程连接'}
              </Button>
            </Tooltip>

            {!isNetDevice && (
              <>
                <Tooltip title='重启设备'>
                  <Button icon={<ReloadOutlined />} size='small' onClick={() => handleReboot(record)} disabled={Math.abs(record.offset) < 1}>
                    重启
                  </Button>
                </Tooltip>
                <Tooltip title='开机'>
                  <Button icon={<PoweroffOutlined />} size='small' type='primary' ghost onClick={() => handlePowerOn(record)} disabled={Math.abs(record.offset) > 1}>
                    开机
                  </Button>
                </Tooltip>
                <Tooltip title='关机'>
                  <Button icon={<PoweroffOutlined />} size='small' danger ghost onClick={() => handlePowerOff(record)} disabled={Math.abs(record.offset) < 1}>
                    关机
                  </Button>
                </Tooltip>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  // 过滤数据
  const filteredData = data.filter(
    (item) =>
      item.ident.toLowerCase().includes(searchText.toLowerCase()) ||
      item.host_ip.includes(searchText) ||
      getDeviceTypeName(item.ident_type).toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={2} style={{ margin: 0 }}>
            <DesktopOutlined /> 主机列表管理
          </Title>
          {/* <Input placeholder='搜索设备名称、IP或类型' prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} /> */}
        </div>

        <Table columns={columns} dataSource={filteredData} rowKey='id' pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
};

export default HostList;
