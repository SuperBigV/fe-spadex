import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import WorkOrderDetailContent from './DetailContent';

const WorkOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  if (!id) return null;

  return (
    <PageLayout
      title={
        <Space>
          <Button type='link' icon={<ArrowLeftOutlined />} onClick={() => history.push('/workform-orders')} className='p0' />
          工单详情
        </Space>
      }
    >
      <WorkOrderDetailContent id={Number(id)} />
    </PageLayout>
  );
};

export default WorkOrderDetail;
