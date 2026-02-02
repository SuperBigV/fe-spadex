import React, { useState, useCallback, useEffect } from 'react';
import moment from 'moment';
import { Button, Input, message, Table, Space, Menu, Tag, Select, Modal } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, EyeOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import PageLayout from '@/components/pageLayout';
import { getWorkOrders, getWorkOrderTypes } from '@/services/workform';
import { getUserInfo } from '@/services/manage';
import WorkOrderCreateForm from '../WorkOrderCreate';
import WorkOrderDetailContent from '../WorkOrderDetail/DetailContent';
import { STATUS_MAP, VIEW_ALL, VIEW_MY_ORDERS, VIEW_PENDING, VIEW_PROCESSING, VIEW_RESOLVED, VIEW_CLOSED } from '../constants';
import './style.less';

const VIEW_ITEMS = [
  { key: VIEW_MY_ORDERS, label: '我的工单' },
  { key: VIEW_PENDING, label: '待我处理' },
  { key: VIEW_PROCESSING, label: '处理中' },
  { key: VIEW_RESOLVED, label: '已解决' },
  { key: VIEW_CLOSED, label: '已关闭' },
  { key: VIEW_ALL, label: '全部' },
];

const WorkOrderList: React.FC = () => {
  const [viewTab, setViewTab] = useState(VIEW_MY_ORDERS);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<number | undefined>();
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ list: any[]; total: number }>({ list: [], total: 0 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [typeOptions, setTypeOptions] = useState<{ id: number; name: string }[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalId, setDetailModalId] = useState<number | null>(null);
  const [detailModalOrderNo, setDetailModalOrderNo] = useState<string>('');
  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});

  const fetchTypes = useCallback(() => {
    getWorkOrderTypes({ pageSize: 500, status: 'enabled' })
      .then((res: any) => setTypeOptions(res?.list || []))
      .catch(() => {});
  }, []);

  const fetchList = useCallback(() => {
    setLoading(true);
    const params: any = { page, pageSize };
    if (statusFilter) params.status = statusFilter;
    else if (viewTab === VIEW_PENDING) params.status = 'pending';
    else if (viewTab === VIEW_PROCESSING) params.status = 'processing';
    else if (viewTab === VIEW_RESOLVED) params.status = 'resolved';
    else if (viewTab === VIEW_CLOSED) params.status = 'closed';
    if (typeFilter) params.work_order_type_id = typeFilter;
    if (keyword) params.keyword = keyword;

    // view 由后端 JWT 解析当前用户后过滤：my_orders=我提交的，my_assignee=我处理的
    if (viewTab === VIEW_MY_ORDERS) params.view = 'my_orders';
    else if (viewTab === VIEW_PROCESSING || viewTab === VIEW_PENDING) params.view = 'my_assignee';

    getWorkOrders(params)
      .then((res: any) => {
        setData({ list: res?.list || [], total: res?.total || 0 });
      })
      .catch((err) => message.error(err?.message || '加载失败'))
      .finally(() => setLoading(false));
  }, [viewTab, statusFilter, typeFilter, keyword, page, pageSize]);

  React.useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  React.useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 根据 assignee_ids 获取用户名称并缓存
  useEffect(() => {
    const ids = new Set<string>();
    data.list.forEach((item: any) => {
      const arr = item?.assignee_ids;
      if (Array.isArray(arr)) {
        arr.forEach((id: string | number) => ids.add(String(id)));
      }
    });
    const toFetch = Array.from(ids).filter((id) => id && !userNameMap[id]);
    if (toFetch.length === 0) return;
    Promise.all(
      toFetch.map((id) =>
        getUserInfo(id).then(
          (u: any) => ({ id, name: u?.nickname || u?.username || String(id) }),
          () => ({ id, name: String(id) }),
        ),
      ),
    ).then((results) => {
      setUserNameMap((prev) => {
        const next = { ...prev };
        results.forEach((r) => {
          next[r.id] = r.name;
        });
        return next;
      });
    });
  }, [data.list, userNameMap]);

  const openDetailModal = (record: { id: number; order_no?: string }) => {
    setDetailModalId(record.id);
    setDetailModalOrderNo(record.order_no || '');
  };

  const closeDetailModal = () => {
    setDetailModalId(null);
    setDetailModalOrderNo('');
    fetchList();
  };

  const columns: ColumnsType<any> = [
    {
      title: '工单号',
      dataIndex: 'order_no',
      width: 150,
      render: (text, record) => (
        <Button type='link' className='p0' onClick={() => openDetailModal(record)}>
          {text}
        </Button>
      ),
    },
    { title: '标题', dataIndex: 'title', ellipsis: true, render: (v) => v || '-' },
    {
      title: '类型',
      dataIndex: 'work_order_type_name',
      width: 100,
      render: (v) => v || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status) => {
        const cfg = STATUS_MAP[status] || { label: status, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    { title: '提交人', dataIndex: 'submitter_name', width: 100, render: (v) => v || '-' },
    {
      title: '处理人',
      dataIndex: 'assignee_ids',
      width: 150,
      render: (assigneeIds: string[] | undefined, record: any) => {
        if (!Array.isArray(assigneeIds) || assigneeIds.length === 0) {
          return record?.assignee_name || '-';
        }
        const names = assigneeIds.map((id) => userNameMap[id] || id);
        return names.join('、') || '-';
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 160,
      render: (v) => (v ? moment.unix(v).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      width: 80,
      render: (_, record) => (
        <Button type='link' className='p0' icon={<EyeOutlined />} onClick={() => openDetailModal(record)}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <PageLayout title='工单列表' icon={<SearchOutlined />}>
      <div className='workform-list-content'>
        <div className='workform-list-body'>
          <aside className='workform-side'>
            <Menu
              mode='inline'
              selectedKeys={[viewTab]}
              items={VIEW_ITEMS.map((item) => ({ key: item.key, label: item.label, icon: <UnorderedListOutlined /> }))}
              onClick={({ key }) => setViewTab(key)}
              className='workform-side-menu'
            />
          </aside>
          <main className='workform-main'>
            <div className='workform-toolbar'>
              <Space wrap size='middle'>
                <Input
                  prefix={<SearchOutlined />}
                  placeholder='工单号/描述'
                  allowClear
                  style={{ width: 180 }}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onPressEnter={fetchList}
                />
                <Select
                  placeholder='状态'
                  allowClear
                  style={{ width: 100 }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
                />
                <Select
                  placeholder='工单类型'
                  allowClear
                  style={{ width: 120 }}
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={typeOptions.map((o) => ({ value: o.id, label: o.name }))}
                />
                <Button icon={<ReloadOutlined />} onClick={fetchList}>
                  刷新
                </Button>
                <Button type='primary' icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
                  创建工单
                </Button>
              </Space>
            </div>
            <Table
              size='small'
              rowKey='id'
              columns={columns}
              dataSource={data.list}
              loading={loading}
              pagination={{
                current: page,
                pageSize,
                total: data.total,
                showSizeChanger: true,
                showQuickJumper: true,
                onChange: (p, ps) => {
                  setPage(p);
                  if (ps) setPageSize(ps);
                },
              }}
            />
          </main>
        </div>
        <Modal title='创建工单' open={createModalVisible} onCancel={() => setCreateModalVisible(false)} footer={null} destroyOnClose width={560}>
          <WorkOrderCreateForm
            onSuccess={() => {
              setCreateModalVisible(false);
              fetchList();
            }}
            onCancel={() => setCreateModalVisible(false)}
          />
        </Modal>

        <Modal
          className='workform-detail-modal'
          title={detailModalOrderNo ? `工单详情 - ${detailModalOrderNo}` : '工单详情'}
          open={detailModalId !== null}
          onCancel={closeDetailModal}
          footer={null}
          destroyOnClose
          width={760}
        >
          {detailModalId !== null && <WorkOrderDetailContent id={detailModalId} />}
        </Modal>
      </div>
    </PageLayout>
  );
};

export default WorkOrderList;
