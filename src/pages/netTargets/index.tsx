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
import { Modal, Form, Input, Alert, Select, Table, Tabs } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _, { debounce } from 'lodash';
import classNames from 'classnames';
import { bindTags, unbindTags, moveTargetBusi, deleteTargetBusi, updateTargetNote, deleteTargets, getTargetTags } from '@/services/targets';
import PageLayout from '@/components/pageLayout';
import { CommonStateContext } from '@/App';
import List from './List';
import BusinessGroup from './BusinessGroup';
import BusinessGroup2, { getCleanNetGroupIds } from '@/components/BusinessNetGroup';
import AlertRuleList from '@/pages/alertRules/List';
import HistoryEvents from '@/pages/historyEvents/busiEvents';
import BusiDetail from '@/pages/dashboard/Detail/BusiDetail';
import { IDashboard } from '@/pages/dashboard/types';
import { getBusiGroupsDashboards } from '@/services/dashboardV2';
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
  const { netGroup } = useContext(CommonStateContext);
  const [gids, setGids] = useState<string | undefined>(netGroup.ids);
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const [selectedRows, setSelectedRows] = useState<ITargetProps[]>([]);
  const [activeKey, setActiveKey] = useState('2');
  const [dashboardId, setDashboardId] = useState<number>(0);
  const [dashboardList, setDashboardList] = useState<IDashboard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setGids(netGroup.ids);
  }, [netGroup.ids]);
  const onChange = (key) => {
    switch (key) {
      case '3':
        getBusiGroupsDashboards(gids).then((res) => {
          setDashboardList(res);
        });
        if (dashboardList.length > 0) {
          const id = dashboardList[0].id;
          setDashboardId(id);
          setIsLoading(true);
        }
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
            setGids(ids);
          }}
        />
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
            <AlertRuleList gids={gids} />
          </TabPane>
          {/* <TabPane tab='正在告警' key='5'>
              <ActiveAlerts />
            </TabPane> */}
          <TabPane tab='告警记录' key='6'>
            {/* <AlarmHistory /> */}
            <HistoryEvents></HistoryEvents>
          </TabPane>
        </Tabs>
        {/* <div
          className='table-area n9e-border-base'
          style={{
            height: '100%',
            overflowY: 'auto',
          }}
        >
          <List
            gids={gids}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            // targetType={labelValue}
            refreshFlag={refreshFlag}
            setRefreshFlag={setRefreshFlag}
            // setOperateType={setOperateType}
          />
        </div> */}
      </div>
    </PageLayout>
  );
};

export default Targets;
