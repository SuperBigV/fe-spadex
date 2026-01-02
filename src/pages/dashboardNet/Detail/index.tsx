import React from 'react';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import Detail from './Detail';

interface URLParam {
  id: string;
}

export default function index() {
  console.log('dashboardNet Detail');
  const { id } = useParams<URLParam>();
  console.log('id--->', id);
  // 切换仪表盘是，Detail 组件需要重新加载，不然会出现数据错乱的情况
  return <Detail key={id} />;
}
