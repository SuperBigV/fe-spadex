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
import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { DesktopOutlined } from '@ant-design/icons';
import { Tag, Button, Table, Tooltip, Dropdown, Menu, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useHistory, Link } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import queryString from 'query-string';
import { useAntdTable } from 'ahooks';
import { CommonStateContext } from '@/App';
import { parseRange } from '@/components/TimeRangePicker';
import { getCurEventsOfMe } from './services';
import { deleteAlertEventsModal } from './index';
import { SeverityColor } from './index';

// @ts-ignore
import AckBtn from 'plus:/parcels/Event/Acknowledge/AckBtn';
const { Title } = Typography;
interface IProps {
  filterObj: any;
  filter: any;
  setFilter: (filter: any) => void;
  refreshFlag: string;
  selectedRowKeys: number[];
  setSelectedRowKeys: (selectedRowKeys: number[]) => void;
}

export default function TableCpt(props: IProps) {
  const { filterObj, filter, setFilter, selectedRowKeys, setSelectedRowKeys } = props;
  const history = useHistory();
  const { t } = useTranslation('AlertCurEvents');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const columns = [
    {
      title: t('prod'),
      dataIndex: 'rule_prod',
      width: 100,
      render: (value) => {
        return t(`AlertHisEvents:rule_prod.${value}`);
      },
    },

    {
      title: t('规则标题'),
      dataIndex: 'rule_name',
      render(title, { id, tags }) {
        return (
          <>
            <div className='mb1'>
              <Link to={`/alert-cur-events/${id}`}>{title}</Link>
            </div>
          </>
        );
      },
    },

    {
      title: t('first_trigger_time'),
      dataIndex: 'first_trigger_time',
      width: 180,
      render(value) {
        return moment(value * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: t('trigger_time'),
      dataIndex: 'trigger_time',
      width: 180,
      render(value) {
        return moment(value * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: t('common:table.operations'),
      dataIndex: 'operate',
      width: 120,
      render(value, record) {
        return (
          <>
            <Button
              style={{ padding: 0 }}
              size='small'
              type='link'
              onClick={() => {
                history.push({
                  pathname: '/alert-mutes/add',
                  search: queryString.stringify({
                    busiGroup: record.group_id,
                    prod: record.rule_prod,
                    cate: record.cate,
                    datasource_ids: [record.datasource_id],
                    tags: record.tags,
                  }),
                });
              }}
            >
              {t('屏蔽')}
            </Button>
            <Button
              style={{ padding: 0 }}
              size='small'
              type='link'
              danger
              onClick={() =>
                deleteAlertEventsModal(
                  [record.id],
                  () => {
                    setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.id));
                    setRefreshFlag(_.uniqueId('refresh_'));
                  },
                  t,
                )
              }
            >
              {t('common:btn.delete')}
            </Button>
          </>
        );
      },
    },
  ];
  if (import.meta.env.VITE_IS_PRO === 'true') {
    columns.splice(5, 0, {
      title: t('claimant'),
      dataIndex: 'claimant',
      width: 100,
      render: (value, record) => {
        if (record.status === 1) {
          return value;
        }
        return t('status_0');
      },
    });
  }
  const fetchData = ({ current, pageSize }) => {
    const params: any = {
      p: current,
      limit: pageSize,
      ..._.omit(filterObj, 'range'),
    };
    if (filterObj.range) {
      const parsedRange = parseRange(filterObj.range);
      params.stime = moment(parsedRange.start).unix();
      params.etime = moment(parsedRange.end).unix();
    }
    return getCurEventsOfMe(params).then((res) => {
      return {
        total: res.dat.total,
        list: res.dat.list,
      };
    });
  };
  const { tableProps } = useAntdTable(fetchData, {
    refreshDeps: [refreshFlag, JSON.stringify(filterObj), props.refreshFlag],
    defaultPageSize: 30,
    debounceWait: 500,
  });

  return (
    <div className='n9e-border-base' style={{ padding: 16, width: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}>
          <DesktopOutlined /> {t('当前告警事件')}
        </Title>
        {/* <Input placeholder='搜索设备名称、IP或类型' prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} /> */}
      </div>
      <Table
        className='mt8'
        size='small'
        tableLayout='fixed'
        rowKey={(record) => record.id}
        columns={columns}
        {...tableProps}
        rowClassName={(record: { severity: number; is_recovered: number }) => {
          return SeverityColor[record.is_recovered ? 3 : record.severity - 1] + '-left-border';
        }}
        rowSelection={{
          selectedRowKeys: selectedRowKeys,
          onChange(selectedRowKeys: number[]) {
            setSelectedRowKeys(selectedRowKeys);
          },
        }}
        pagination={{
          ...tableProps.pagination,
          pageSizeOptions: ['30', '100', '200', '500'],
        }}
      />
    </div>
  );
}
