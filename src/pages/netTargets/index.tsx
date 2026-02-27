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
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Modal, Form, Input, Alert, Select, Table, Tabs, Button, Space, Row, Col, Dropdown } from 'antd';
import { DatabaseOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _, { debounce } from 'lodash';
import classNames from 'classnames';
import { bindTags, unbindTags, moveTargetBusi, deleteTargetBusi, updateTargetNote, deleteTargets, getTargetTags } from '@/services/targets';
import PageLayout from '@/components/pageLayout';
import { CommonStateContext } from '@/App';
import List from './List';
import BusinessGroup from './BusinessGroup';
import BusinessGroup2, { getCleanNetGroupIds, BusinessGroupSelectWithAll } from '@/components/BusinessNetGroup';
import AlertRuleList from '@/pages/alertRules/List';
import HistoryEvents from '@/pages/historyEvents/busiEvents';
import BusiDetail from '@/pages/dashboard/Detail/BusiDetail';
import { IDashboard } from '@/pages/dashboard/types';
import { getBusiGroupsDashboards } from '@/services/dashboardV2';
import EventTable from '@/pages/event/Table';
import { deleteAlertEventsModal } from '@/pages/event';
import { AutoRefresh } from '@/components/TimeRangePicker';
import TimeRangePicker, { getDefaultValue } from '@/components/TimeRangePicker';
import DatasourceSelect from '@/components/DatasourceSelect/DatasourceSelect';
import { getProdOptions } from '@/pages/alertRules/Form/components/ProdSelect';
import { IS_ENT } from '@/utils/constant';
import queryString from 'query-string';
import { useLocation } from 'react-router-dom';
import './locale';
import './index.less';
const { TabPane } = Tabs;
export { BusinessGroup }; // TODO 部分页面使用的老的业务组组件，后续逐步替换
export interface ITargetProps {
  id: number;
  cluster: string;
  group_id: number;
  group_objs: object[] | null;
  ident: string;
  note: string;
  tags: string[];
  update_at: number;
}
const { TextArea } = Input;
const Targets: React.FC = () => {
  const { t } = useTranslation('targets');
  const { netGroup, feats } = useContext(CommonStateContext);
  const location = useLocation();
  const [gids, setGids] = useState<string | undefined>(netGroup.ids);
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const [selectedRows, setSelectedRows] = useState<ITargetProps[]>([]);
  const [activeKey, setActiveKey] = useState('2');
  const [dashboardId, setDashboardId] = useState<number>(0);
  const [dashboardList, setDashboardList] = useState<IDashboard[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 正在告警 TabPane 相关状态
  const CACHE_KEY = 'alert_active_events_range_net';
  const query = queryString.parse(location.search);
  const getEventFilter = (query, currentGids?: string) => {
    // 优先使用 gids，如果 gids 不存在或为 '0'，则使用 query 中的 bgid
    let bgidValue: number | undefined = undefined;
    if (currentGids && currentGids !== '0' && currentGids !== '-2') {
      bgidValue = Number(currentGids);
    } else if (query.bgid) {
      bgidValue = Number(query.bgid);
    }
    return {
      range: getDefaultValue(CACHE_KEY, undefined),
      datasource_ids: query.datasource_ids ? _.split(query.datasource_ids, ',').map(Number) : [],
      bgid: bgidValue,
      severity: query.severity ? Number(query.severity) : undefined,
      query: query.query,
      is_recovered: query.is_recovered ? Number(query.is_recovered) : undefined,
      rule_prods: query.rule_prods ? _.split(query.rule_prods, ',') : [],
    };
  };
  const [eventFilter, setEventFilter] = useState(getEventFilter(query, gids));
  const [eventRefreshFlag, setEventRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [eventSelectedRowKeys, setEventSelectedRowKeys] = useState<number[]>([]);
  let prodOptions = getProdOptions(feats);
  if (IS_ENT) {
    prodOptions = [
      ...prodOptions,
      {
        label: t('AlertHisEvents:rule_prod.firemap'),
        value: 'firemap',
        pro: false,
      },
      {
        label: t('AlertHisEvents:rule_prod.northstar'),
        value: 'northstar',
        pro: false,
      },
    ];
  }

  // 正在告警 TabPane 的 header 渲染函数
  const { t: tEvent } = useTranslation('AlertCurEvents');
  function renderEventHeader() {
    return (
      <Row justify='space-between' style={{ width: '100%' }}>
        <Space>
          <TimeRangePicker
            allowClear
            localKey={CACHE_KEY}
            value={eventFilter.range}
            onChange={(val) => {
              setEventFilter({
                ...eventFilter,
                range: val,
              });
            }}
            dateFormat='YYYY-MM-DD HH:mm:ss'
          />
          <Select
            allowClear
            placeholder={tEvent('prod')}
            style={{ minWidth: 80 }}
            value={eventFilter.rule_prods}
            mode='multiple'
            onChange={(val) => {
              setEventFilter({
                ...eventFilter,
                rule_prods: val,
              });
            }}
            dropdownMatchSelectWidth={false}
          >
            {prodOptions.map((item) => {
              return (
                <Select.Option value={item.value} key={item.value}>
                  {item.label}
                </Select.Option>
              );
            })}
          </Select>
          <DatasourceSelect
            style={{ width: 100 }}
            filterKey='alertRule'
            value={eventFilter.datasource_ids}
            onChange={(val: number[]) => {
              setEventFilter({
                ...eventFilter,
                datasource_ids: val,
              });
            }}
          />
          <BusinessGroupSelectWithAll
            value={eventFilter.bgid}
            onChange={(val: number) => {
              setEventFilter({
                ...eventFilter,
                bgid: val,
              });
            }}
          />
          <Select
            allowClear
            style={{ minWidth: 80 }}
            placeholder={tEvent('severity')}
            value={eventFilter.severity}
            onChange={(val) => {
              setEventFilter({
                ...eventFilter,
                severity: val,
              });
            }}
            dropdownMatchSelectWidth={false}
          >
            <Select.Option value={1}>严重</Select.Option>
            <Select.Option value={2}>警告</Select.Option>
            <Select.Option value={3}>通知</Select.Option>
          </Select>
          <Input
            className='search-input'
            prefix={<SearchOutlined />}
            placeholder={tEvent('search_placeholder')}
            value={eventFilter.query}
            onChange={(e) => {
              setEventFilter({
                ...eventFilter,
                query: e.target.value,
              });
            }}
          />
        </Space>
        <Col
          flex='100px'
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Dropdown
            overlay={
              <ul className='ant-dropdown-menu'>
                <li
                  className='ant-dropdown-menu-item'
                  onClick={() =>
                    deleteAlertEventsModal(
                      eventSelectedRowKeys,
                      () => {
                        setEventSelectedRowKeys([]);
                        setEventRefreshFlag(_.uniqueId('refresh_'));
                      },
                      tEvent,
                    )
                  }
                >
                  {tEvent('common:btn.batch_delete')}
                </li>
              </ul>
            }
            trigger={['click']}
          >
            <Button style={{ marginRight: 8 }} disabled={eventSelectedRowKeys.length === 0}>
              {tEvent('batch_btn')}
            </Button>
          </Dropdown>
          <AutoRefresh
            onRefresh={() => {
              setEventRefreshFlag(_.uniqueId('refresh_'));
            }}
          />
        </Col>
      </Row>
    );
  }

  useEffect(() => {
    setGids(netGroup.ids);
  }, [netGroup.ids]);

  // 当 gids 变化时，更新 eventFilter 的 bgid
  useEffect(() => {
    setEventFilter((prevFilter) => {
      let newBgid: number | undefined = undefined;
      if (gids && gids !== '0' && gids !== '-2') {
        newBgid = Number(gids);
      }
      // 只有当 bgid 真正变化时才更新
      if (prevFilter.bgid !== newBgid) {
        return {
          ...prevFilter,
          bgid: newBgid,
        };
      }
      return prevFilter;
    });
  }, [gids]);
  const onChange = (key) => {
    switch (key) {
      case '3':
        setIsLoading(false);
        getBusiGroupsDashboards(gids)
          .then((res) => {
            setDashboardList(res);
            if (res && res.length > 0) {
              const id = res[0].id;
              setDashboardId(id);
              setIsLoading(true);
            }
          })
          .catch(() => {
            setIsLoading(false);
          });
        break;
    }
    setActiveKey(key);
  };
  return (
    <PageLayout icon={<DatabaseOutlined />} title={t('网络设备')}>
      <div className='object-manage-page-content'>
        <BusinessGroup2
          pageKey='assetModel'
          showSelected={gids !== '0' && gids !== undefined}
          onSelect={(key) => {
            const ids = getCleanNetGroupIds(key);
            setActiveKey('2');
            setGids(ids);
          }}
        />
        <div
          className='table-area spadex-border-base'
          style={{
            height: '100%',
            overflowY: 'auto',
          }}
        >
          <Tabs activeKey={activeKey} onChange={onChange}>
            {/* <TabPane tab='软件概览' key='1'>
            </TabPane> */}
            <TabPane tab='主机列表' key='2'>
              <List
                gids={gids}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                // targetType={labelValue}
                refreshFlag={refreshFlag}
                setRefreshFlag={setRefreshFlag}
                //setOperateType={setOperateType}
              />
            </TabPane>
            <TabPane tab='监控态势' key='3'>
              {/* <MonitoringStatus /> */}
              {isLoading && <BusiDetail dashboardId={_.toString(dashboardId)} />}
            </TabPane>
            <TabPane tab='告警规则' key='4'>
              {/* <AlarmRules /> */}
              <AlertRuleList gids={gids} businessGroupType='net' />
            </TabPane>
            <TabPane tab='正在告警' key='5'>
              {(() => {
                const eventFilterObj = Object.assign(
                  { range: eventFilter.range },
                  eventFilter.datasource_ids.length ? { datasource_ids: eventFilter.datasource_ids } : {},
                  eventFilter.severity ? { severity: eventFilter.severity } : {},
                  eventFilter.query ? { query: eventFilter.query } : {},
                  { bgid: eventFilter.bgid },
                  eventFilter.rule_prods.length ? { rule_prods: _.join(eventFilter.rule_prods, ',') } : {},
                );
                return (
                  <EventTable
                    header={renderEventHeader()}
                    filter={eventFilter}
                    filterObj={eventFilterObj}
                    setFilter={setEventFilter}
                    refreshFlag={eventRefreshFlag}
                    selectedRowKeys={eventSelectedRowKeys}
                    setSelectedRowKeys={setEventSelectedRowKeys}
                  />
                );
              })()}
            </TabPane>
            <TabPane tab='告警记录' key='6'>
              {/* <AlarmHistory /> */}
              <HistoryEvents></HistoryEvents>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
};

export default Targets;
