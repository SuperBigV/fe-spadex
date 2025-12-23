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

import React, { useState, useRef } from 'react';
import { Table, message, Popconfirm, Button, Row, Col, Input, Select, Space, Switch, Tag, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, CopyOutlined, PlusOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { useAntdTable } from 'ahooks';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import _ from 'lodash';
import PageLayout from '@/components/pageLayout';
import { getBlacklistList, addBlacklist, updateBlacklist, deleteBlacklist } from './services';
import FormModal, { BlacklistItem } from './FormModal';
import './locale';

const { Option } = Select;

export const pageSizeOptions = ['10', '20', '50', '100'];

export default function BlacklistPage() {
  const { t } = useTranslation('sshSecurityBlacklist');
  const [keyword, setKeyword] = useState('');
  const [enabledFilter, setEnabledFilter] = useState<string | undefined>(undefined);

  const fetchData = ({ current, pageSize }: { current: number; pageSize: number }): Promise<any> => {
    const params: any = {
      page: current,
      pageSize: pageSize,
    };
    if (keyword) {
      params.keyword = keyword;
    }
    if (enabledFilter !== undefined) {
      params.enabled = enabledFilter;
    }
    return getBlacklistList(params).then((res) => {
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

  const handleAdd = () => {
    FormModal({
      title: t('add_blacklist'),
      onOk: async (data) => {
        await addBlacklist(data as any);
        message.success(t('add_success'));
        run({
          current: tableProps.pagination?.current || 1,
          pageSize: tableProps.pagination?.pageSize || 20,
        });
      },
    });
  };

  const handleEdit = (record: BlacklistItem) => {
    FormModal({
      id: record.id,
      title: t('edit_blacklist'),
      onOk: async (data) => {
        await updateBlacklist(record.id, data);
        message.success(t('edit_success'));
        run({
          current: tableProps.pagination?.current || 1,
          pageSize: tableProps.pagination?.pageSize || 20,
        });
      },
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBlacklist(id);
      message.success(t('delete_success'));
      run({
        current: tableProps.pagination?.current || 1,
        pageSize: tableProps.pagination?.pageSize || 20,
      });
    } catch (error: any) {
      message.error(error.message || t('delete_blacklist') + '失败');
    }
  };

  const handleStatusChange = async (record: BlacklistItem, enabled: boolean) => {
    try {
      await updateBlacklist(record.id, { enabled });
      message.success(t('update_status_success'));
      run({
        current: tableProps.pagination?.current || 1,
        pageSize: tableProps.pagination?.pageSize || 20,
      });
    } catch (error: any) {
      message.error(error.message || '更新状态失败');
    }
  };

  const handleCopyCommand = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success(t('copy_success'));
    });
  };

  const handleSearch = () => {
    run({
      current: 1,
      pageSize: tableProps.pagination?.pageSize || 20,
    });
  };

  const handleReset = () => {
    setKeyword('');
    setEnabledFilter(undefined);
    run({
      current: 1,
      pageSize: tableProps.pagination?.pageSize || 20,
    });
  };

  const columns: ColumnsType<BlacklistItem> = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: t('command'),
      dataIndex: 'command',
      key: 'command',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <Space>
          <span>{text}</span>
          <Tooltip title={t('copy_command')}>
            <CopyOutlined
              onClick={() => handleCopyCommand(text)}
              style={{ cursor: 'pointer', color: '#1890ff' }}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: t('match_type'),
      dataIndex: 'match_type',
      key: 'match_type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'exact' ? 'blue' : 'orange'}>
          {type === 'exact' ? t('exact_match') : t('regex_match')}
        </Tag>
      ),
    },
    {
      title: t('pattern'),
      dataIndex: 'pattern',
      key: 'pattern',
      width: 200,
      ellipsis: true,
      render: (text: string, record: BlacklistItem) => {
        if (record.match_type === 'regex' && text) {
          return text;
        }
        return '-';
      },
    },
    {
      title: t('enabled_status'),
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean, record: BlacklistItem) => (
        <Switch
          checked={enabled}
          checkedChildren={t('switch_enabled')}
          unCheckedChildren={t('switch_disabled')}
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      ),
    },
    {
      title: t('remark'),
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      ellipsis: true,
    },
    {
      title: t('create_by'),
      dataIndex: 'create_by',
      key: 'create_by',
      width: 100,
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
    {
      title: t('update_at'),
      dataIndex: 'update_at',
      key: 'update_at',
      width: 180,
      sorter: true,
      render: (timestamp: number) => {
        return timestamp ? moment(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
    },
    {
      title: t('operations'),
      key: 'operations',
      width: 150,
      fixed: 'right',
      render: (_: any, record: BlacklistItem) => (
        <Space size='middle'>
          <Button
            type='link'
            size='small'
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('edit')}
          </Button>
          <Popconfirm
            title={t('confirm_delete')}
            onConfirm={() => handleDelete(record.id)}
            okText='确定'
            cancelText='取消'
          >
            <Button type='link' size='small' danger icon={<DeleteOutlined />}>
              {t('delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageLayout title={t('title')}>
      <div>
        <div
          className='n9e-border-base'
          style={{
            padding: 16,
          }}
        >
          <Row justify='space-between' style={{ marginBottom: 16 }}>
            <Col>
              <Space>
                <Input
                  prefix={<SearchOutlined />}
                  placeholder={t('search_placeholder')}
                  style={{ width: 300 }}
                  allowClear
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onPressEnter={handleSearch}
                />
                <Select
                  placeholder={t('status_filter')}
                  style={{ width: 120 }}
                  allowClear
                  value={enabledFilter}
                  onChange={(value) => setEnabledFilter(value)}
                >
                  <Option value='true'>{t('enabled')}</Option>
                  <Option value='false'>{t('disabled')}</Option>
                </Select>
                <Button icon={<ReloadOutlined />} onClick={handleSearch}>
                  {t('refresh')}
                </Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Col>
            <Col>
              <Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
                {t('add_blacklist')}
              </Button>
            </Col>
          </Row>
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
          />
        </div>
      </div>
    </PageLayout>
  );
}

