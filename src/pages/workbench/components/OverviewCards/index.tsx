import React from 'react';
import { Row, Col, Spin } from 'antd';
import AlertCard from './AlertCard';
import AssetCard from './AssetCard';
import BusiGroupCard from './BusiGroupCard';
import ResourceCard from './ResourceCard';
import { WorkbenchOverviewResponse } from '../../types/workbench';

interface OverviewCardsProps {
  data?: WorkbenchOverviewResponse | null;
  loading?: boolean;
  onRefresh?: () => void;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ data, loading, onRefresh }) => {
  return (
    <Spin spinning={loading}>
      <div className="overview-cards-wrapper">
        <Row gutter={16} className="overview-cards" wrap={false}>
          <Col flex="1 1 0%">
            <AlertCard data={data?.alerts} onClick={() => {/* 跳转到告警列表 */}} />
          </Col>
          <Col flex="1 1 0%">
            <AssetCard data={data?.assets} onClick={() => {/* 跳转到资产管理 */}} />
          </Col>
          <Col flex="1 1 0%">
            <BusiGroupCard data={data?.busiGroups} onClick={() => {/* 跳转到业务组管理 */}} />
          </Col>
          <Col flex="1 1 0%">
            <ResourceCard data={data?.resources} onClick={() => {/* 跳转到监控大盘 */}} />
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default OverviewCards;
