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
import { Modal, Form, Input, Alert, Select, Table } from 'antd';
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
import './locale';
import './index.less';

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
  useEffect(() => {
    setGids(netGroup.ids);
  }, [netGroup.ids]);

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
        <div
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
        </div>
      </div>
    </PageLayout>
  );
};

export default Targets;
