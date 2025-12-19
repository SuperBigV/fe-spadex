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

import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { TeamOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import SupplierList from './suppliers/List';
import MaintenanceList from './maintenance/List';
import './locale';
import './index.less';

const { TabPane } = Tabs;

const PartnerMainPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState(() => {
    // 根据路由确定当前 Tab
    if (location.pathname.includes('/partner/maintenance')) {
      return 'maintenance';
    }
    return 'suppliers';
  });

  useEffect(() => {
    // 路由变化时更新 activeKey
    if (location.pathname.includes('/partner/maintenance')) {
      setActiveKey('maintenance');
    } else {
      setActiveKey('suppliers');
    }
  }, [location.pathname]);

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    if (key === 'maintenance') {
      history.push('/partner/maintenance');
    } else {
      history.push('/partner/suppliers');
    }
  };

  return (
    <PageLayout icon={<TeamOutlined />} title={'合作单位管理'}>
      <div className='partner-main-page'>
        <Tabs activeKey={activeKey} onChange={handleTabChange} type='card' size='large'>
          <TabPane tab='采购供应商' key='suppliers'>
            <SupplierList />
          </TabPane>
          <TabPane tab='维保单位' key='maintenance'>
            <MaintenanceList />
          </TabPane>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default PartnerMainPage;

