import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Spin } from 'antd';
import PageLayout from '@/components/pageLayout';
import { getOverview } from '@/services/inspection';
import { RadarChartOutlined } from '@ant-design/icons';

const InspectionOverview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    getOverview()
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout icon={<RadarChartOutlined />} title='巡检概览'>
      <Spin spinning={loading}>
        <Card>
          <Descriptions column={1} size='small' bordered>
            <Descriptions.Item label='原始数据'>{data ? <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre> : '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      </Spin>
    </PageLayout>
  );
};

export default InspectionOverview;
