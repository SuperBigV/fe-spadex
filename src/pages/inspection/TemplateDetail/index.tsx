import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Select, Space, Switch, Table, message } from 'antd';
import PageLayout from '@/components/pageLayout';
import { createTemplate, getPrometheusOptions, getTemplate, updateTemplate, InspectionItem, InspectionTemplate } from '@/services/inspection';
import { RadarChartOutlined, PlusOutlined } from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';

type RouteParams = { id: string };

const InspectionTemplateDetail: React.FC = () => {
  const history = useHistory();
  const params = useParams<RouteParams>();
  const isAdd = !params.id || params.id === 'add';
  const idNum = isAdd ? 0 : Number(params.id);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [promOptions, setPromOptions] = useState<string[]>([]);
  const [items, setItems] = useState<InspectionItem[]>([]);

  useEffect(() => {
    getPrometheusOptions().then(setPromOptions);
  }, []);

  useEffect(() => {
    if (isAdd) return;
    setLoading(true);
    getTemplate(idNum)
      .then((tpl) => {
        form.setFieldsValue({
          ...tpl,
          enabled: !!tpl.enabled,
        });
        setItems((tpl.items || []).map((it) => ({ ...it, template_id: tpl.id })));
      })
      .finally(() => setLoading(false));
  }, [idNum, isAdd]);

  const itemColumns = useMemo(
    () => [
      {
        title: '名称',
        dataIndex: 'name',
        render: (_: any, r: InspectionItem, idx: number) => (
          <Input
            value={r.name}
            onChange={(e) => {
              const next = [...items];
              next[idx] = { ...next[idx], name: e.target.value };
              setItems(next);
            }}
          />
        ),
      },
      {
        title: 'PromQL 模板',
        dataIndex: 'promql_tpl',
        render: (_: any, r: InspectionItem, idx: number) => (
          <Input.TextArea
            autoSize={{ minRows: 1, maxRows: 4 }}
            value={r.promql_tpl}
            onChange={(e) => {
              const next = [...items];
              next[idx] = { ...next[idx], promql_tpl: e.target.value };
              setItems(next);
            }}
          />
        ),
      },
      {
        title: '对象标签',
        dataIndex: 'object_label',
        width: 120,
        render: (_: any, r: InspectionItem, idx: number) => (
          <Input
            value={r.object_label}
            onChange={(e) => {
              const next = [...items];
              next[idx] = { ...next[idx], object_label: e.target.value };
              setItems(next);
            }}
          />
        ),
      },
      {
        title: '阈值',
        dataIndex: 'threshold_rule',
        width: 120,
        render: (_: any, r: InspectionItem, idx: number) => (
          <Input
            placeholder='如 > 80'
            value={r.threshold_rule}
            onChange={(e) => {
              const next = [...items];
              next[idx] = { ...next[idx], threshold_rule: e.target.value };
              setItems(next);
            }}
          />
        ),
      },
      {
        title: '级别',
        dataIndex: 'severity',
        width: 120,
        render: (_: any, r: InspectionItem, idx: number) => (
          <Select
            value={r.severity || 'info'}
            style={{ width: '100%' }}
            options={[
              { value: 'critical', label: 'critical' },
              { value: 'warning', label: 'warning' },
              { value: 'info', label: 'info' },
            ]}
            onChange={(v) => {
              const next = [...items];
              next[idx] = { ...next[idx], severity: v };
              setItems(next);
            }}
          />
        ),
      },
      {
        title: '操作',
        width: 80,
        render: (_: any, __: any, idx: number) => (
          <Button
            danger
            size='small'
            onClick={() => {
              const next = items.filter((_, i) => i !== idx);
              setItems(next);
            }}
          >
            删除
          </Button>
        ),
      },
    ],
    [items],
  );

  const onSubmit = async () => {
    const v = await form.validateFields();
    if (!items.length) {
      message.error('请至少添加一条巡检项');
      return;
    }
    const payload: Partial<InspectionTemplate> = {
      ...v,
      enabled: v.enabled ? 1 : 0,
      items,
    };
    setLoading(true);
    try {
      if (isAdd) {
        const res = await createTemplate(payload);
        message.success('创建成功');
        history.replace(`/inspection-templates/${res.id}`);
      } else {
        await updateTemplate(idNum, payload);
        message.success('保存成功');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout icon={<RadarChartOutlined />} title={isAdd ? '新建巡检模板' : '编辑巡检模板'}>
      <Card loading={loading} bordered>
        <Form form={form} layout='vertical' initialValues={{ enabled: true, object_scope_type: 'asset_model' }}>
          <Form.Item label='模板名称' name='name' rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label='巡检类型' name='inspection_type' rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'server', label: 'server' },
                { value: 'network', label: 'network' },
                { value: 'database', label: 'database' },
                { value: 'business', label: 'business' },
                { value: 'room', label: 'room' },
              ]}
            />
          </Form.Item>
          <Form.Item label='Prometheus' name='prometheus_name' rules={[{ required: true }]}>
            <Select options={promOptions.map((x) => ({ value: x, label: x }))} />
          </Form.Item>
          <Form.Item label='Cron' name='schedule_cron' rules={[{ required: true }]}>
            <Input placeholder='如 0 0 2 * * *' />
          </Form.Item>

          <Form.Item label='对象范围类型' name='object_scope_type' rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'asset_model', label: '资产类型（asset_model）' },
                { value: 'busi_group', label: '业务组（busi_group）' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label='对象范围值（多选 JSON 数组字符串）'
            name='object_scope_value'
            rules={[{ required: true }]}
            extra='首期先按 JSON 数组字符串输入，例如 ["host_phy","host_vm"] 或 ["16","18"]。后续再接入下拉多选。'
          >
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
          </Form.Item>

          <Form.Item label='启用' name='enabled' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Form>

        <Card
          size='small'
          title='巡检项'
          style={{ marginTop: 16 }}
          extra={
            <Button
              icon={<PlusOutlined />}
              onClick={() => setItems([...items, { id: 0, template_id: idNum, name: '', promql_tpl: '', object_label: 'ident', severity: 'info' } as any])}
            >
              添加
            </Button>
          }
        >
          <Table rowKey={(_, idx) => String(idx)} dataSource={items} columns={itemColumns as any} pagination={false} />
        </Card>

        <Space style={{ marginTop: 16 }}>
          <Button type='primary' onClick={onSubmit} loading={loading}>
            保存
          </Button>
          <Button onClick={() => history.push('/inspection-templates')}>返回列表</Button>
        </Space>
      </Card>
    </PageLayout>
  );
};

export default InspectionTemplateDetail;
