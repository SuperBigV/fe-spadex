/*
 * 资产管理操作记录查询页面
 */
import React, { useState } from 'react';
import { Table, Card, Row, Col, Input, Select, Button, Space, Tag, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined, HistoryOutlined } from '@ant-design/icons';
import { useAntdTable } from 'ahooks';
import PageLayout from '@/components/pageLayout';
import { getOperatorRecordList } from './services';
import { OperationTypeMap, type OperatorRecord, type OperatorRecordListParams } from './types';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const pageSizeOptions = ['10', '20', '50', '100'];

export default function OperatorRecordPage() {
  const [operationType, setOperationType] = useState<string | undefined>(undefined);
  const [operator, setOperator] = useState<string | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);

  const fetchData = ({ current, pageSize }: { current: number; pageSize: number }): Promise<any> => {
    const params: OperatorRecordListParams = {
      page: current,
      pageSize,
    };
    if (operationType) params.operation_type = operationType;
    if (operator) params.operator = operator;
    if (keyword) params.keyword = keyword;
    if (dateRange?.[0] && dateRange?.[1]) {
      params.start_time = dateRange[0].unix();
      params.end_time = dateRange[1].unix();
    }
    return getOperatorRecordList(params).then((res) => ({
      total: res.total,
      list: res.list || [],
    }));
  };

  const { tableProps, run, refresh } = useAntdTable(fetchData, {
    manual: false,
    defaultPageSize: 20,
  });

  const handleSearch = () => {
    run({
      current: 1,
      pageSize: tableProps.pagination?.pageSize || 20,
    });
  };

  const handleReset = () => {
    setOperationType(undefined);
    setOperator(undefined);
    setKeyword('');
    setDateRange(null);
    run({
      current: 1,
      pageSize: tableProps.pagination?.pageSize || 20,
    });
  };

  const columns = [
    {
      title: '操作时间',
      dataIndex: 'create_at',
      key: 'create_at',
      width: 180,
      render: (ts: number) => moment(ts * 1000).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作类型',
      dataIndex: 'operation_type',
      key: 'operation_type',
      width: 120,
      render: (type: string) => <Tag color={type === 'asset_delete' ? 'red' : type.startsWith('target_') ? 'blue' : 'green'}>{OperationTypeMap[type] ?? type}</Tag>,
    },
    {
      title: '操作对象',
      dataIndex: 'target_ident',
      key: 'target_ident',
      ellipsis: true,
      render: (text: string, record: OperatorRecord) => (
        <span title={text}>
          {text || '-'} {record.target_id ? `(ID: ${record.target_id})` : ''}
        </span>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 120,
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      width: 120,
      ellipsis: true,
      render: (text: string) => <Tag color={text === 'success' ? 'success' : 'error'}>{text === 'success' ? '成功' : text || '-'}</Tag>,
    },
  ];

  return (
    <PageLayout icon={<HistoryOutlined />} title='操作记录'>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col>
            <Select placeholder='操作类型' allowClear style={{ width: 140 }} value={operationType} onChange={setOperationType}>
              {Object.entries(OperationTypeMap).map(([value, label]) => (
                <Option key={value} value={value}>
                  {label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Input placeholder='操作人' allowClear style={{ width: 120 }} value={operator} onChange={(e) => setOperator(e.target.value || undefined)} />
          </Col>
          <Col>
            <Input placeholder='关键字（对象/结果）' allowClear style={{ width: 180 }} value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </Col>
          <Col>
            <RangePicker showTime value={dateRange as any} onChange={(dates) => setDateRange(dates as [moment.Moment, moment.Moment] | null)} style={{ width: 360 }} />
          </Col>
          <Col>
            <Space>
              <Button type='primary' icon={<SearchOutlined />} onClick={handleSearch}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button onClick={refresh}>刷新</Button>
            </Space>
          </Col>
        </Row>
        <Table
          rowKey='id'
          columns={columns}
          {...tableProps}
          pagination={{
            ...tableProps.pagination,
            showSizeChanger: true,
            pageSizeOptions,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </PageLayout>
  );
}
