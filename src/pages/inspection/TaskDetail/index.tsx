import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Descriptions, Space, Spin, message } from 'antd';
import PageLayout from '@/components/pageLayout';
import { getTask } from '@/services/inspection';
import { RadarChartOutlined, DownloadOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

type RouteParams = { id: string };

const InspectionTaskDetail: React.FC = () => {
  const params = useParams<RouteParams>();
  const idNum = Number(params.id);

  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<any>(null);
  const [report, setReport] = useState<any>(null);

  const fetch = () => {
    setLoading(true);
    getTask(idNum)
      .then((res) => {
        setTask(res.task);
        setReport(res.report);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch();
  }, [idNum]);

  const exportMarkdown = () => {
    const content = report?.report_content || '';
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `inspection-task-${idNum}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
    message.success('已导出');
  };

  const snapshotText = useMemo(() => {
    try {
      return task?.result_snapshot ? JSON.stringify(task.result_snapshot, null, 2) : '';
    } catch (e) {
      return String(task?.result_snapshot || '');
    }
  }, [task]);

  return (
    <PageLayout icon={<RadarChartOutlined />} title='巡检任务详情'>
      <Spin spinning={loading}>
        <Card style={{ marginBottom: 16 }}>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={exportMarkdown}>
              导出
            </Button>
            <Button onClick={fetch}>刷新</Button>
          </Space>
        </Card>
        <Card title='任务信息' style={{ marginBottom: 16 }}>
          <Descriptions bordered size='small' column={2}>
            <Descriptions.Item label='任务ID'>{task?.id ?? '-'}</Descriptions.Item>
            <Descriptions.Item label='模板ID'>{task?.template_id ?? '-'}</Descriptions.Item>
            <Descriptions.Item label='类型'>{task?.inspection_type ?? '-'}</Descriptions.Item>
            <Descriptions.Item label='状态'>{task?.status ?? '-'}</Descriptions.Item>
            <Descriptions.Item label='对象数'>{task?.object_count ?? '-'}</Descriptions.Item>
            <Descriptions.Item label='开始时间'>{task?.started_at ? new Date(task.started_at).toLocaleString() : '-'}</Descriptions.Item>
            <Descriptions.Item label='结束时间'>{task?.finished_at ? new Date(task.finished_at).toLocaleString() : '-'}</Descriptions.Item>
            <Descriptions.Item label='回调时间'>{task?.report_received_at ? new Date(task.report_received_at).toLocaleString() : '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title='报告内容（report_content）' style={{ marginBottom: 16 }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{report?.report_content || '暂无报告'}</pre>
        </Card>

        <Card title='巡检结果快照（result_snapshot）'>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{snapshotText || '暂无'}</pre>
        </Card>
      </Spin>
    </PageLayout>
  );
};

export default InspectionTaskDetail;
