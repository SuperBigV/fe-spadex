import React, { useState } from 'react';
import { Table, Card, Tag, Switch, Space, Button, Input, message, Tooltip, Typography, Popconfirm, Modal } from 'antd';
import { SearchOutlined, ReloadOutlined, CodeOutlined, PlayCircleOutlined, FileTextOutlined, PoweroffOutlined, PlayCircleFilled, PauseCircleFilled } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

const SoftwareList = () => {
  // 模拟软件数据
  const [softwareData, setSoftwareData] = useState([
    {
      id: 1,
      name: 'Nginx',
      status: 'running',
      attr: {
        language: 'C',
        processName: 'nginx',
        is_collection_enabled: true,
        is_log_collection_enabled: true,
      },
    },
    {
      id: 2,
      name: 'Appxx1',
      status: 'stopped',
      attr: {
        language: 'Java',
        processName: 'demoproc',
        is_collection_enabled: true,
        is_log_collection_enabled: false,
      },
    },
    {
      id: 3,
      name: 'spadex',
      status: 'running',
      attr: {
        language: 'Golang',
        processName: 'spadex',
        is_collection_enabled: false,
        is_log_collection_enabled: true,
      },
    },
    {
      id: 4,
      name: 'Node.js应用',
      status: 'running',
      attr: {
        language: 'JavaScript',
        processName: 'node',
        is_collection_enabled: true,
        is_log_collection_enabled: true,
      },
    },
    {
      id: 5,
      name: 'Python服务',
      status: 'stopped',
      attr: {
        language: 'Python',
        processName: 'python',
        is_collection_enabled: false,
        is_log_collection_enabled: false,
      },
    },
  ]);

  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSoftware, setSelectedSoftware] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  // 处理进程采集状态切换
  const handleProcessCollectionToggle = async (id, checked) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSoftwareData((prev) => prev.map((item) => (item.id === id ? { ...item, attr: { ...item.attr, is_collection_enabled: checked } } : item)));

      message.success(checked ? '进程采集已开启' : '进程采集已关闭');
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理日志采集状态切换
  const handleLogCollectionToggle = async (id, checked) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSoftwareData((prev) => prev.map((item) => (item.id === id ? { ...item, attr: { ...item.attr, is_log_collection_enabled: checked } } : item)));

      message.success(checked ? '日志采集已开启' : '日志采集已关闭');
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 启动软件
  const handleStart = async (software) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSoftwareData((prev) => prev.map((item) => (item.id === software.id ? { ...item, status: 'running' } : item)));

      message.success(`${software.name} 启动成功`);
    } catch (error) {
      message.error(`${software.name} 启动失败`);
    } finally {
      setLoading(false);
    }
  };

  // 关闭软件
  const handleStop = async (software) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSoftwareData((prev) => prev.map((item) => (item.id === software.id ? { ...item, status: 'stopped' } : item)));

      message.success(`${software.name} 已关闭`);
    } catch (error) {
      message.error(`${software.name} 关闭失败`);
    } finally {
      setLoading(false);
    }
  };

  // 重启软件
  const handleRestart = async (software) => {
    setLoading(true);
    try {
      setSelectedSoftware(software);
      setActionModalVisible(true);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSoftwareData((prev) => prev.map((item) => (item.id === software.id ? { ...item, status: 'running' } : item)));

      message.success(`${software.name} 重启成功`);
      setActionModalVisible(false);
    } catch (error) {
      message.error(`${software.name} 重启失败`);
      setActionModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('数据已刷新');
    }, 1000);
  };

  // 过滤数据
  const filteredData = softwareData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.attr.language.toLowerCase().includes(searchText.toLowerCase()) ||
      item.attr.processName.toLowerCase().includes(searchText.toLowerCase()),
  );

  // 获取状态标签
  const getStatusTag = (status) => {
    const statusConfig = {
      running: { color: 'green', text: '运行中' },
      stopped: { color: 'red', text: '已停止' },
      starting: { color: 'blue', text: '启动中' },
      stopping: { color: 'orange', text: '停止中' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义
  const columns = [
    {
      title: '软件名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => <strong>{name}</strong>,
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      width: 90,
    },
    {
      title: '语言',
      dataIndex: ['attr', 'language'],
      key: 'language',
      sorter: (a, b) => a.attr.language.localeCompare(b.attr.language),
      render: (language) => (
        <Tag color='blue' icon={<CodeOutlined />}>
          {language}
        </Tag>
      ),
      width: 120,
    },
    {
      title: '软件进程',
      dataIndex: ['attr', 'processName'],
      key: 'processName',
      sorter: (a, b) => a.attr.processName.localeCompare(b.attr.processName),
      render: (processName) => (
        <Tag color='purple' icon={<PlayCircleOutlined />}>
          {processName}
        </Tag>
      ),
      width: 130,
    },
    {
      title: '进程采集',
      dataIndex: ['attr', 'is_collection_enabled'],
      key: 'is_collection_enabled',
      render: (isEnabled, record) => (
        <Space>
          <Tag color={isEnabled ? 'green' : 'red'}>{isEnabled ? '开启' : '未开启'}</Tag>
          <Switch size='small' checked={isEnabled} loading={loading} onChange={(checked) => handleProcessCollectionToggle(record.id, checked)} />
        </Space>
      ),
      width: 130,
    },
    {
      title: '日志采集',
      dataIndex: ['attr', 'is_log_collection_enabled'],
      key: 'is_log_collection_enabled',
      render: (isEnabled, record) => (
        <Space>
          <Tag color={isEnabled ? 'green' : 'red'}>{isEnabled ? '开启' : '未开启'}</Tag>
          <Switch size='small' checked={isEnabled} loading={loading} onChange={(checked) => handleLogCollectionToggle(record.id, checked)} />
        </Space>
      ),
      width: 130,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size='small'>
          <Tooltip title='启动'>
            <Button
              size='small'
              type='primary'
              icon={<PlayCircleFilled />}
              onClick={() => handleStart(record)}
              disabled={record.status === 'running' || record.status === 'starting'}
            >
              启动
            </Button>
          </Tooltip>

          <Tooltip title='关闭'>
            <Popconfirm title={`确认要关闭 ${record.name} 吗？`} onConfirm={() => handleStop(record)} okText='确认' cancelText='取消'>
              <Button size='small' danger icon={<PoweroffOutlined />} disabled={record.status === 'stopped' || record.status === 'stopping'}>
                关闭
              </Button>
            </Popconfirm>
          </Tooltip>

          <Tooltip title='重启'>
            <Button size='small' icon={<ReloadOutlined />} onClick={() => handleRestart(record)} disabled={record.status === 'stopped'}>
              重启
            </Button>
          </Tooltip>
        </Space>
      ),
      width: 250,
    },
  ];

  return (
    <div>
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            <FileTextOutlined /> 软件列表
          </Title>

          <Space>
            <Search placeholder='搜索软件名称、语言或进程' allowClear value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 280 }} />
            <Tooltip title='刷新数据'>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                刷新
              </Button>
            </Tooltip>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey='id'
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 操作确认模态框 */}
      <Modal title={`正在重启 ${selectedSoftware?.name}`} open={actionModalVisible} footer={null} closable={false} width={400}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <ReloadOutlined spin style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <p>正在重启进程，请稍候...</p>
        </div>
      </Modal>
    </div>
  );
};

export default SoftwareList;
