import React, { useEffect, useState } from 'react';
import { Button, Card, Popconfirm, Space, Table, Tag } from 'antd';
import PageLayout from '@/components/pageLayout';
import { getTemplates, deleteTemplate, triggerTask, InspectionTemplate } from '@/services/inspection';
import { useHistory } from 'react-router-dom';
import { RadarChartOutlined, PlusOutlined, PlayCircleOutlined } from '@ant-design/icons';

const InspectionTemplateList: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ list: InspectionTemplate[]; total: number }>({ list: [], total: 0 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchList = () => {
    setLoading(true);
    getTemplates({ page, pageSize })
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [page, pageSize]);

  return (
    <PageLayout icon={<RadarChartOutlined />} title='巡检模板'>
      <Card
        extra={
          <Space>
            <Button type='primary' icon={<PlusOutlined />} onClick={() => history.push('/inspection-templates/add')}>
              新建模板
            </Button>
          </Space>
        }
      >
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
            { title: 'ID', dataIndex: 'id', width: 80 },
            { title: '名称', dataIndex: 'name' },
            { title: '类型', dataIndex: 'inspection_type', width: 120 },
            { title: 'Prometheus', dataIndex: 'prometheus_name', width: 140 },
            { title: 'Cron', dataIndex: 'schedule_cron', width: 160 },
            {
              title: '对象范围',
              render: (_, r) => (
                <Space size={8}>
                  <Tag>{r.object_scope_type}</Tag>
                  <span style={{ color: '#666' }}>{r.object_scope_value}</span>
                </Space>
              ),
            },
            {
              title: '启用',
              dataIndex: 'enabled',
              width: 80,
              render: (v) => (v ? <Tag color='green'>启用</Tag> : <Tag>禁用</Tag>),
            },
            {
              title: '操作',
              width: 260,
              render: (_, r) => (
                <Space>
                  <Button size='small' onClick={() => history.push(`/inspection-templates/${r.id}`)}>
                    编辑
                  </Button>
                  <Popconfirm title='确认删除该模板？' onConfirm={() => deleteTemplate(r.id).then(fetchList)}>
                    <Button size='small' danger>
                      删除
                    </Button>
                  </Popconfirm>
                  <Button size='small' icon={<PlayCircleOutlined />} onClick={() => triggerTask(r.id).then(() => history.push('/inspection-tasks'))}>
                    触发
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

export default InspectionTemplateList;
