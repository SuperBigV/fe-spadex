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
import { Tabs } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import RoomList from './rooms/List';
import RackList from './racks/List';
import './index.less';
import { DatabaseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
const { TabPane } = Tabs;
const IDCMainPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState('rooms');
  // 根据路由确定当前 Tab
  // const getActiveKey = () => {
  //   if (location.pathname.includes('/idc/racks')) {
  //     return 'racks';
  //   }
  //   return 'rooms';
  // };

  const handleTabChange = (key: string) => {
    if (key === 'racks') {
      // history.push('/idc/racks');
      setActiveKey('racks');
    } else {
      // history.push('/idc/rooms');
      setActiveKey('rooms');
    }
  };

  return (
    <PageLayout icon={<DatabaseOutlined />} title={'数据中心管理'}>
      <div className='idc-main-page'>
        <Tabs activeKey={activeKey} onChange={handleTabChange} type='card' size='large'>
          <TabPane tab='机房管理' key='rooms'>
            <RoomList />
          </TabPane>
          <TabPane tab='机柜管理' key='racks'>
            <RackList />
          </TabPane>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default IDCMainPage;
