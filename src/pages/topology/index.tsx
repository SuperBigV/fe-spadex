/*
 * 网络拓扑管理主页面 - 路由分发
 */

import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import TopologyListPage from './List';
import TopologyDetailPage from './Detail';

const TopologyPage: React.FC = () => {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${match.path}`} component={TopologyListPage} />
      <Route path={`${match.path}/:viewId`} component={TopologyDetailPage} />
    </Switch>
  );
};

export default TopologyPage;
