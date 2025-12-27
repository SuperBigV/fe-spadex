/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React, { useState } from 'react';
import { Table, message, Button, Row, Col, Input, Select, Space, Tag, Tooltip, Card, Modal, Statistic } from 'antd';
import { SearchOutlined, CopyOutlined, ReloadOutlined, BarChartOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { useAntdTable } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { DatePicker } from 'antd';
import PageLayout from '@/components/pageLayout';
import { getCommandRecordsList, getCommandRecordsBySession, getCommandRecordsByAsset, getCommandRecordsStatistics } from './services';
import './locale';

const { Option } = Select;
const { RangePicker } = DatePicker;

export interface CommandRecord {
  id: number;
  session_id: string;
  asset_id: number;
  asset_name: string;
  command: string;
  command_md5: string;
  blocked: boolean;
  block_reason?: string;
  client_ip: string;
  user: string;
  create_at: number;
}

export const pageSizeOptions = ['10', '20', '50', '100'];

export default function CommandRecordsPage() {
  const { t } = useTranslation('sshSecurityCommandRecords');
  const history = useHistory();
  const [keyword, setKeyword] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [assetId, setAssetId] = useState<number | undefined>(undefined);
  const [blockedFilter, setBlockedFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
  const [statisticsVisible, setStatisticsVisible] = useState(false);
  const [statisticsData, setStatisticsData] = useState<any>(null);

  const fetchData = ({ current, pageSize }: { current: number; pageSize: number }): Promise<any> => {
    const params: any = {
      page: current,
      pageSize: pageSize,
    };
    if (keyword) {
      params.keyword = keyword;
    }
    if (sessionId) {
      params.sessionId = sessionId;
    }
    if (assetId) {
      params.assetId = assetId;
    }
    if (blockedFilter !== undefined) {
      params.blocked = blockedFilter;
    }
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.startTime = dateRange[0].unix();
      params.endTime = dateRange[1].unix();
    }
    return getCommandRecordsList(params).then((res) => {
      return {
        total: res.total,
        list: res.list || [],
      };
    });
  };

  const { tableProps, run, refresh } = useAntdTable(fetchData, {
    manual: false,
    defaultPageSize: 20,
  });

  const handleSearch = () => {
    run({
      current: 1,
      pageSize: tableProps.pagination?.pageSize || 20,
    });
  };

  const handleReset = () => {
    setKeyword('');
    setSessionId('');
    setAssetId(undefined);
    setBlockedFilter(undefined);
    setDateRange(null);
    run({
      current: 1,
      pageSize: tableProps.pagination?.pageSize || 20,
    });
  };

  const handleCopyCommand = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success(t('copy_success'));
    });
  };

  const handleViewSession = async (sessionId: string) => {
    try {
      const records = await getCommandRecordsBySession(sessionId);
      Modal.info({
        title: t('view_session'),
        width: 800,
        content: (
          <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
            <Table
              size='small'
              rowKey='id'
              columns={[
                {
                  title: t('command'),
                  dataIndex: 'command',
                  ellipsis: true,
                },
                {
                  title: t('status'),
                  dataIndex: 'blocked',
                  width: 100,
                  render: (blocked: boolean) => <Tag color={blocked ? 'red' : 'green'}>{blocked ? t('blocked') : t('allowed')}</Tag>,
                },
                {
                  title: t('create_at'),
                  dataIndex: 'create_at',
                  width: 180,
                  render: (timestamp: number) => moment(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss'),
                },
              ]}
              dataSource={records}
              pagination={false}
            />
          </div>
        ),
      });
    } catch (error: any) {
      message.error(error.message || '获取会话记录失败');
    }
  };

  const handleViewAsset = async (assetId: number) => {
    try {
      const records = await getCommandRecordsByAsset(assetId);
      Modal.info({
        title: t('view_asset'),
        width: 800,
        content: (
          <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
            <Table
              size='small'
              rowKey='id'
              columns={[
                {
                  title: t('command'),
                  dataIndex: 'command',
                  ellipsis: true,
                },
                {
                  title: t('user'),
                  dataIndex: 'user',
                  width: 100,
                },
                {
                  title: t('status'),
                  dataIndex: 'blocked',
                  width: 100,
                  render: (blocked: boolean) => <Tag color={blocked ? 'red' : 'green'}>{blocked ? t('blocked') : t('allowed')}</Tag>,
                },
                {
                  title: t('create_at'),
                  dataIndex: 'create_at',
                  width: 180,
                  render: (timestamp: number) => moment(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss'),
                },
              ]}
              dataSource={records}
              pagination={false}
            />
          </div>
        ),
      });
    } catch (error: any) {
      message.error(error.message || '获取资产记录失败');
    }
  };

  const handleViewStatistics = async () => {
    try {
      const params: any = {};
      if (assetId) {
        params.assetId = assetId;
      }
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startTime = dateRange[0].unix();
        params.endTime = dateRange[1].unix();
      }
      const data = await getCommandRecordsStatistics(params);
      setStatisticsData(data);
      setStatisticsVisible(true);
    } catch (error: any) {
      message.error(error.message || '获取统计信息失败');
    }
  };

  const columns: ColumnsType<CommandRecord> = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: t('session_id_col'),
      dataIndex: 'session_id',
      key: 'session_id',
      width: 150,
      ellipsis: true,
      render: (text: string) => (
        <Button type='link' size='small' style={{ padding: 0 }} onClick={() => handleViewSession(text)}>
          {text}
        </Button>
      ),
    },
    {
      title: t('asset_name'),
      dataIndex: 'asset_name',
      key: 'asset_name',
      width: 150,
      ellipsis: true,
      render: (text: string, record: CommandRecord) => (
        <Button type='link' size='small' style={{ padding: 0 }} onClick={() => handleViewAsset(record.asset_id)}>
          {text}
        </Button>
      ),
    },
    {
      title: t('command'),
      dataIndex: 'command',
      key: 'command',
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string, record: CommandRecord) => (
        <Space>
          <Tooltip title={text}>
            <span style={{ color: record.blocked ? '#ff4d4f' : 'inherit' }}>{text}</span>
          </Tooltip>
          <Tooltip title={t('copy_command')}>
            <CopyOutlined onClick={() => handleCopyCommand(text)} style={{ cursor: 'pointer', color: '#1890ff' }} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: t('user'),
      dataIndex: 'user',
      key: 'user',
      width: 100,
    },
    {
      title: t('client_ip'),
      dataIndex: 'client_ip',
      key: 'client_ip',
      width: 120,
    },
    {
      title: t('status'),
      dataIndex: 'blocked',
      key: 'blocked',
      width: 100,
      render: (blocked: boolean) => <Tag color={blocked ? 'red' : 'green'}>{blocked ? t('blocked') : t('allowed')}</Tag>,
    },
    {
      title: t('block_reason'),
      dataIndex: 'block_reason',
      key: 'block_reason',
      width: 200,
      ellipsis: true,
      render: (text: string, record: CommandRecord) => {
        if (record.blocked && text) {
          return text;
        }
        return '-';
      },
    },
    {
      title: t('create_at'),
      dataIndex: 'create_at',
      key: 'create_at',
      width: 180,
      sorter: true,
      render: (timestamp: number) => {
        return timestamp ? moment(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
    },
  ];

  return (
    <PageLayout title={t('title')}>
      <div>
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Input
                prefix={<SearchOutlined />}
                placeholder={t('search_placeholder')}
                allowClear
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={handleSearch}
              />
            </Col>
            <Col span={4}>
              <Input placeholder={t('session_id')} allowClear value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
            </Col>
            <Col span={4}>
              <Input placeholder={t('asset_id')} allowClear type='number' value={assetId} onChange={(e) => setAssetId(e.target.value ? Number(e.target.value) : undefined)} />
            </Col>
            <Col span={4}>
              <Select placeholder={t('blocked_filter')} allowClear style={{ width: '100%' }} value={blockedFilter} onChange={(value) => setBlockedFilter(value)}>
                <Option value='true'>{t('blocked')}</Option>
                <Option value='false'>{t('allowed')}</Option>
              </Select>
            </Col>
            <Col span={6}>
              <RangePicker showTime format='YYYY-MM-DD HH:mm:ss' style={{ width: '100%' }} value={dateRange} onChange={(dates) => setDateRange(dates as any)} />
            </Col>
          </Row>
          <Row style={{ marginTop: 16 }}>
            <Col>
              <Space>
                <Button type='primary' onClick={handleSearch}>
                  {t('query')}
                </Button>
                <Button onClick={handleReset}>{t('reset')}</Button>
                <Button icon={<BarChartOutlined />} onClick={handleViewStatistics}>
                  {t('statistics')}
                </Button>
                <Button icon={<ReloadOutlined />} onClick={refresh}>
                  刷新
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
        <div
          className='n9e-border-base'
          style={{
            padding: 16,
          }}
        >
          <Table
            className='mt8'
            size='small'
            rowKey='id'
            {...tableProps}
            columns={columns}
            pagination={{
              ...tableProps.pagination,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              pageSizeOptions: pageSizeOptions,
            }}
            rowClassName={(record) => (record.blocked ? 'blocked-row' : '')}
          />
        </div>
        <Modal
          title={t('statistics')}
          open={statisticsVisible}
          onCancel={() => setStatisticsVisible(false)}
          footer={[
            <Button key='close' onClick={() => setStatisticsVisible(false)}>
              确定
            </Button>,
          ]}
          width={800}
        >
          {statisticsData && (
            <div>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                  <Statistic title={t('total_commands')} value={statisticsData.total} />
                </Col>
                <Col span={8}>
                  <Statistic title={t('blocked_commands')} value={statisticsData.blocked} valueStyle={{ color: '#ff4d4f' }} />
                </Col>
                <Col span={8}>
                  <Statistic title={t('allowed_commands')} value={statisticsData.allowed} valueStyle={{ color: '#52c41a' }} />
                </Col>
              </Row>
              {statisticsData.userStats && Object.keys(statisticsData.userStats).length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h4>{t('user_stats')}</h4>
                  <Table
                    size='small'
                    rowKey='user'
                    columns={[
                      { title: t('user'), dataIndex: 'user', key: 'user' },
                      { title: t('total_commands'), dataIndex: 'count', key: 'count' },
                    ]}
                    dataSource={Object.entries(statisticsData.userStats).map(([user, count]) => ({
                      user,
                      count,
                    }))}
                    pagination={false}
                  />
                </div>
              )}
              {statisticsData.assetStats && Object.keys(statisticsData.assetStats).length > 0 && (
                <div>
                  <h4>{t('asset_stats')}</h4>
                  <Table
                    size='small'
                    rowKey='asset'
                    columns={[
                      { title: t('asset_id'), dataIndex: 'asset', key: 'asset' },
                      { title: t('total_commands'), dataIndex: 'count', key: 'count' },
                    ]}
                    dataSource={Object.entries(statisticsData.assetStats).map(([asset, count]) => ({
                      asset,
                      count,
                    }))}
                    pagination={false}
                  />
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
      <style>{`
        .blocked-row {
          background-color: #313340;
        }
      `}</style>
    </PageLayout>
  );
}
