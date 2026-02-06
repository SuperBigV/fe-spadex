import React, { useEffect, useState } from 'react';
import { Button, Card, Space, Table, Tag } from 'antd';
import PageLayout from '@/components/pageLayout';
import { getTasks, InspectionTask } from '@/services/inspection';
import { useHistory } from 'react-router-dom';
import { RadarChartOutlined } from '@ant-design/icons';

const InspectionTaskList: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ list: InspectionTask[]; total: number }>({ list: [], total: 0 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchList = () => {
    setLoading(true);
    getTasks({ page, pageSize })
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [page, pageSize]);

  return (
    <PageLayout icon={<RadarChartOutlined />} title='巡检任务'>
      <Card>
        <Table
          rowKey='id'
          loading={loading}
          dataSource={data.list}
          pagination={{
            current: page,
            pageSize,
            total: data.total,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 100 },
            { title: '模板ID', dataIndex: 'template_id', width: 100 },
            { title: '类型', dataIndex: 'inspection_type', width: 120 },
            {
              title: '状态',
              dataIndex: 'status',
              width: 140,
              render: (v) => <Tag>{v}</Tag>,
            },
            { title: '对象数', dataIndex: 'object_count', width: 100 },
            {
              title: '开始时间',
              dataIndex: 'started_at',
              width: 160,
              render: (v) => (v ? new Date(v).toLocaleString() : '-'),
            },
            {
              title: '结束时间',
              dataIndex: 'finished_at',
              width: 160,
              render: (v) => (v ? new Date(v).toLocaleString() : '-'),
            },
            {
              title: '操作',
              width: 120,
              render: (_, r) => (
                <Space>
                  <Button size='small' onClick={() => history.push(`/inspection-tasks/${r.id}`)}>
                    查看
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </PageLayout>
  );
};

export default InspectionTaskList;
