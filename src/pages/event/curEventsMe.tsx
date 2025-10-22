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
import React, { useContext, useState } from 'react';
import { Button, Input, message, Modal, Select, Space, Row, Col, Dropdown, Menu } from 'antd';
import { AlertOutlined, ExclamationCircleOutlined, SearchOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import queryString from 'query-string';
import { useLocation, useHistory } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import { deleteAlertEvents } from '@/services/warning';
import { AutoRefresh } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { getProdOptions } from '@/pages/alertRules/Form/components/ProdSelect';
import DatasourceSelect from '@/components/DatasourceSelect/DatasourceSelect';
import TimeRangePicker, { getDefaultValue } from '@/components/TimeRangePicker';
import { IS_ENT } from '@/utils/constant';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';
import Card from './card';
import Table from './CurMeTable';
import './locale';
import './index.less';

// @ts-ignore
import BatchAckBtn from 'plus:/parcels/Event/Acknowledge/BatchAckBtn';

const CACHE_KEY = 'alert_active_events_range';
const getFilter = (query) => {
  return {
    range: getDefaultValue(CACHE_KEY, undefined),
    datasource_ids: query.datasource_ids ? _.split(query.datasource_ids, ',').map(Number) : [],
    bgid: query.bgid ? Number(query.bgid) : undefined,
    severity: query.severity ? Number(query.severity) : undefined,
    query: query.query,
    is_recovered: query.is_recovered ? Number(query.is_recovered) : undefined,
    rule_prods: query.rule_prods ? _.split(query.rule_prods, ',') : [],
  };
};

const { confirm } = Modal;
export const SeverityColor = ['red', 'orange', 'yellow', 'green'];
export function deleteAlertEventsModal(ids: number[], onSuccess = () => {}, t) {
  confirm({
    title: t('delete_confirm.title'),
    icon: <ExclamationCircleOutlined />,
    content: t('delete_confirm.content'),
    maskClosable: true,
    okButtonProps: { danger: true },
    zIndex: 1001,
    onOk() {
      return deleteAlertEvents(ids).then((res) => {
        message.success(t('common:success.delete'));
        onSuccess();
      });
    },
    onCancel() {},
  });
}

const Event: React.FC = () => {
  const { t } = useTranslation('AlertCurEvents');
  const [view, setView] = useState<'card' | 'list'>('list');
  const { feats } = useContext(CommonStateContext);
  const location = useLocation();
  const history = useHistory();
  const query = queryString.parse(location.search);
  const filter = getFilter(query);
  const setFilter = (newFilter) => {
    history.replace({
      pathname: location.pathname,
      search: queryString.stringify({
        ...query,
        ..._.omit(newFilter, 'range'), // range 仍然通过 loclalStorage 存储
      }),
    });
  };
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
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

  const filterObj = Object.assign(
    { range: filter.range },
    filter.datasource_ids.length ? { datasource_ids: filter.datasource_ids } : {},
    filter.severity ? { severity: filter.severity } : {},
    filter.query ? { query: filter.query } : {},
    { bgid: filter.bgid },
    filter.rule_prods.length ? { rule_prods: _.join(filter.rule_prods, ',') } : {},
  );

  return <Table filter={filter} filterObj={filterObj} setFilter={setFilter} refreshFlag={refreshFlag} selectedRowKeys={selectedRowKeys} setSelectedRowKeys={setSelectedRowKeys} />;
};

export default Event;
