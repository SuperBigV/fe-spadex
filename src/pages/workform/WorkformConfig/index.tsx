import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Space, Tag, message, Modal, Tabs, Form, Input, Select, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { debounce } from 'lodash';
import PageLayout from '@/components/pageLayout';
import {
  getWorkOrderTypes,
  deleteWorkOrderType,
  createWorkOrderType,
  getWorkOrderType,
  updateWorkOrderType,
  getAssignmentRule,
  setAssignmentRule,
  getProcessGroups,
  deleteProcessGroup,
  createProcessGroup,
  getProcessGroup,
  updateProcessGroup,
} from '@/services/workform';
import { getUserInfoList } from '@/services/manage';
import './style.less';

interface UserOption {
  label: string;
  value: number;
}

const { TabPane } = Tabs;
const { TextArea } = Input;

const WorkformConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('types');

  // 工单类型
  const [typeLoading, setTypeLoading] = useState(false);
  const [typeData, setTypeData] = useState<{ list: any[]; total: number }>({ list: [], total: 0 });
  const [typePage, setTypePage] = useState(1);
  const [typePageSize, setTypePageSize] = useState(20);
  const [typeAddVisible, setTypeAddVisible] = useState(false);
  const [typeAddSubmitting, setTypeAddSubmitting] = useState(false);
  const [typeEditVisible, setTypeEditVisible] = useState(false);
  const [typeEditId, setTypeEditId] = useState<number | null>(null);
  const [typeEditLoading, setTypeEditLoading] = useState(false);
  const [typeEditSubmitting, setTypeEditSubmitting] = useState(false);
  const [typeEditRuleTargetName, setTypeEditRuleTargetName] = useState<string>('');
  const [typeGroupOptions, setTypeGroupOptions] = useState<{ id: number; name: string }[]>([]);
  const [typeForm] = Form.useForm();
  const [typeAddForm] = Form.useForm(); // 新建使用独立 form，避免与编辑 form 冲突导致 target_type/target_id 未收集

  // 处理组
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupData, setGroupData] = useState<{ list: any[]; total: number }>({ list: [], total: 0 });
  const [groupPage, setGroupPage] = useState(1);
  const [groupPageSize, setGroupPageSize] = useState(20);
  const [groupAddVisible, setGroupAddVisible] = useState(false);
  const [groupAddSubmitting, setGroupAddSubmitting] = useState(false);
  const [groupEditVisible, setGroupEditVisible] = useState(false);
  const [groupEditId, setGroupEditId] = useState<number | null>(null);
  const [groupEditLoading, setGroupEditLoading] = useState(false);
  const [groupEditSubmitting, setGroupEditSubmitting] = useState(false);
  const [groupForm] = Form.useForm();
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  const fetchUsers = useCallback(async (query: string) => {
    setUserSearchLoading(true);
    try {
      const res: any = await getUserInfoList({ p: 1, limit: 10, query: query || '' });
      const list = res?.dat?.list || [];
      setUserOptions(
        list.map((item: { id: number; nickname?: string; username?: string }) => ({
          label: item.nickname || item.username || String(item.id),
          value: item.id,
        })),
      );
    } finally {
      setUserSearchLoading(false);
    }
  }, []);

  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 300), [fetchUsers]);

  useEffect(() => {
    if (groupAddVisible || groupEditVisible || typeAddVisible || typeEditVisible) fetchUsers('');
  }, [groupAddVisible, groupEditVisible, typeAddVisible, typeEditVisible, fetchUsers]);

  useEffect(() => {
    if (typeAddVisible) {
      getProcessGroups({ pageSize: 500 })
        .then((res: any) => setTypeGroupOptions(res?.list || []))
        .catch(() => {});
    }
  }, [typeAddVisible]);

  useEffect(() => {
    if (!groupEditVisible || groupEditId == null) return;
    setGroupEditLoading(true);
    getProcessGroup(groupEditId)
      .then((res: any) => {
        const memberIds = res.member_ids
          ? String(res.member_ids)
              .split(',')
              .map((s: string) => Number(s.trim()))
              .filter((n: number) => !Number.isNaN(n))
          : [];
        groupForm.setFieldsValue({
          name: res.name,
          remark: res.remark,
          member_ids: memberIds,
        });
      })
      .catch((e) => message.error(e?.message || '加载失败'))
      .finally(() => setGroupEditLoading(false));
  }, [groupEditVisible, groupEditId]);

  const fetchTypeList = useCallback(() => {
    setTypeLoading(true);
    getWorkOrderTypes({ page: typePage, pageSize: typePageSize })
      .then((res: any) => setTypeData({ list: res?.list || [], total: res?.total || 0 }))
      .catch((e) => message.error(e?.message || '加载失败'))
      .finally(() => setTypeLoading(false));
  }, [typePage, typePageSize]);

  const fetchGroupList = useCallback(() => {
    setGroupLoading(true);
    getProcessGroups({ page: groupPage, pageSize: groupPageSize })
      .then((res: any) => setGroupData({ list: res?.list || [], total: res?.total || 0 }))
      .catch((e) => message.error(e?.message || '加载失败'))
      .finally(() => setGroupLoading(false));
  }, [groupPage, groupPageSize]);

  useEffect(() => {
    if (activeTab === 'types') fetchTypeList();
  }, [activeTab, fetchTypeList]);

  useEffect(() => {
    if (activeTab === 'groups') fetchGroupList();
  }, [activeTab, fetchGroupList]);

  useEffect(() => {
    if (!typeEditVisible || typeEditId == null) return;
    setTypeEditLoading(true);
    Promise.all([getWorkOrderType(typeEditId), getProcessGroups({ pageSize: 500 })])
      .then(([typeRes, groupsRes]: [any, any]) => {
        setTypeGroupOptions(groupsRes?.list || []);
        return getAssignmentRule(typeEditId).then((rule: any) => {
          const targetId = rule?.target_type === 'user' && rule?.target_id != null ? Number(rule.target_id) : rule?.target_id;
          setTypeEditRuleTargetName(rule?.target_name || '');
          typeForm.setFieldsValue({
            name: typeRes.name,
            description: typeRes.description,
            status: typeRes.status || 'enabled',
            sort_order: typeRes.sort_order ?? 0,
            target_type: rule?.target_type,
            target_id: targetId,
          });
        });
      })
      .catch((e) => message.error(e?.message || '加载失败'))
      .finally(() => setTypeEditLoading(false));
  }, [typeEditVisible, typeEditId]);

  const openTypeEdit = (record: any) => {
    setTypeEditId(record.id);
    setTypeEditVisible(true);
  };

  const closeTypeEdit = () => {
    setTypeEditVisible(false);
    setTypeEditId(null);
    typeForm.resetFields();
  };

  const handleTypeEditSubmit = () => {
    if (typeEditId == null) return;
    typeForm.validateFields().then((values) => {
      const { target_type, target_id, ...rest } = values;
      const payload = { ...rest, sort_order: rest.sort_order != null ? Number(rest.sort_order) : 0 };
      setTypeEditSubmitting(true);
      const rulePayload =
        target_type && target_id != null && target_id !== ''
          ? {
              target_type,
              target_id: String(target_id),
              target_name: target_type === 'user' ? userOptions.find((o) => o.value === target_id)?.label || typeEditRuleTargetName || '' : undefined,
            }
          : undefined;
      updateWorkOrderType(typeEditId, payload)
        .then(() => {
          if (rulePayload) {
            return setAssignmentRule(typeEditId, rulePayload);
          }
          return Promise.resolve();
        })
        .then(() => {
          message.success('保存成功');
          closeTypeEdit();
          fetchTypeList();
        })
        .catch((e) => message.error(e?.message || '保存失败'))
        .finally(() => setTypeEditSubmitting(false));
    });
  };

  const handleDeleteType = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除工单类型「${record.name}」吗？`,
      onOk: () =>
        deleteWorkOrderType(record.id)
          .then(() => {
            message.success('删除成功');
            fetchTypeList();
          })
          .catch((e) => message.error(e?.message || '删除失败')),
    });
  };

  const handleDeleteGroup = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除处理组「${record.name}」吗？`,
      onOk: () =>
        deleteProcessGroup(record.id)
          .then(() => {
            message.success('删除成功');
            fetchGroupList();
          })
          .catch((e) => message.error(e?.message || '删除失败')),
    });
  };

  const handleTypeAddSubmit = () => {
    typeAddForm.validateFields().then((values) => {
      const { target_type, target_id, ...rest } = values;
      const payload = { ...rest, sort_order: rest.sort_order != null ? Number(rest.sort_order) : 0 };
      setTypeAddSubmitting(true);
      const rulePayload =
        target_type && target_id != null && target_id !== ''
          ? {
              target_type,
              target_id: String(target_id),
              target_name: target_type === 'user' ? userOptions.find((o) => o.value === target_id)?.label || '' : undefined,
            }
          : undefined;
      createWorkOrderType(payload)
        .then((res: any) => {
          // const newId = res?.id;
          const newId = res?.id ?? res;
          if (newId != null && rulePayload) {
            return setAssignmentRule(newId, rulePayload);
          }
          return Promise.resolve();
        })
        .then(() => {
          message.success('创建成功');
          setTypeAddVisible(false);
          typeAddForm.resetFields();
          fetchTypeList();
        })
        .catch((e) => message.error(e?.message || '创建失败'))
        .finally(() => setTypeAddSubmitting(false));
    });
  };

  const normalizeMemberIds = (values: any) => ({
    ...values,
    member_ids: Array.isArray(values.member_ids) ? values.member_ids.map(String).join(',') : values.member_ids ?? '',
  });

  const handleGroupAddSubmit = () => {
    groupForm.validateFields().then((values) => {
      setGroupAddSubmitting(true);
      createProcessGroup(normalizeMemberIds(values))
        .then(() => {
          message.success('创建成功');
          setGroupAddVisible(false);
          groupForm.resetFields();
          fetchGroupList();
        })
        .catch((e) => message.error(e?.message || '创建失败'))
        .finally(() => setGroupAddSubmitting(false));
    });
  };

  const openGroupEdit = (record: any) => {
    setGroupEditId(record.id);
    setGroupEditVisible(true);
  };

  const closeGroupEdit = () => {
    setGroupEditVisible(false);
    setGroupEditId(null);
    groupForm.resetFields();
  };

  const handleGroupEditSubmit = () => {
    if (groupEditId == null) return;
    groupForm.validateFields().then((values) => {
      setGroupEditSubmitting(true);
      updateProcessGroup(groupEditId, normalizeMemberIds(values))
        .then(() => {
          message.success('保存成功');
          closeGroupEdit();
          fetchGroupList();
        })
        .catch((e) => message.error(e?.message || '保存失败'))
        .finally(() => setGroupEditSubmitting(false));
    });
  };

  const typeColumns: ColumnsType<any> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '名称', dataIndex: 'name', width: 150 },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v) => (v === 'enabled' ? <Tag color='green'>启用</Tag> : <Tag color='default'>禁用</Tag>),
    },
    { title: '排序', dataIndex: 'sort_order', width: 80 },
    {
      title: '操作',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type='link' size='small' icon={<EditOutlined />} onClick={() => openTypeEdit(record)}>
            编辑
          </Button>
          <Button type='link' size='small' danger icon={<DeleteOutlined />} onClick={() => handleDeleteType(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const groupColumns: ColumnsType<any> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '组名', dataIndex: 'name', width: 150 },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    {
      title: '成员数',
      dataIndex: 'member_ids',
      width: 100,
      render: (v) => (v ? v.split(',').filter(Boolean).length : 0),
    },
    {
      title: '操作',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type='link' size='small' icon={<EditOutlined />} onClick={() => openGroupEdit(record)}>
            编辑
          </Button>
          <Button type='link' size='small' danger icon={<DeleteOutlined />} onClick={() => handleDeleteGroup(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageLayout title='工单配置' icon={<SettingOutlined />}>
      <div className='workform-config'>
        <Tabs activeKey={activeTab} onChange={setActiveTab} className='workform-config-tabs' destroyInactiveTabPane={false}>
          <TabPane
            tab={
              <span>
                <SettingOutlined style={{ marginRight: 6 }} />
                工单类型
              </span>
            }
            key='types'
          >
            <div className='workform-config-toolbar'>
              <span className='workform-config-desc'>管理工单类型与分配规则，新建工单时可选类型由此配置。</span>
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => {
                  typeAddForm.resetFields();
                  setTypeAddVisible(true);
                }}
              >
                新建类型
              </Button>
            </div>
            <div className='workform-config-table-wrap'>
              <Table
                size='small'
                rowKey='id'
                columns={typeColumns}
                dataSource={typeData.list}
                loading={typeLoading}
                pagination={{
                  current: typePage,
                  pageSize: typePageSize,
                  total: typeData.total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  onChange: (p, ps) => {
                    setTypePage(p);
                    if (ps) setTypePageSize(ps);
                  },
                }}
              />
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                <TeamOutlined style={{ marginRight: 6 }} />
                处理组
              </span>
            }
            key='groups'
          >
            <div className='workform-config-toolbar'>
              <span className='workform-config-desc'>管理处理组（团队），工单类型分配规则中可指定分配给某组。</span>
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => {
                  groupForm.resetFields();
                  setGroupAddVisible(true);
                }}
              >
                新建处理组
              </Button>
            </div>
            <div className='workform-config-table-wrap'>
              <Table
                size='small'
                rowKey='id'
                columns={groupColumns}
                dataSource={groupData.list}
                loading={groupLoading}
                pagination={{
                  current: groupPage,
                  pageSize: groupPageSize,
                  total: groupData.total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  onChange: (p, ps) => {
                    setGroupPage(p);
                    if (ps) setGroupPageSize(ps);
                  },
                }}
              />
            </div>
          </TabPane>
        </Tabs>

        <Modal
          title='新建工单类型'
          open={typeAddVisible}
          onCancel={() => {
            setTypeAddVisible(false);
            typeAddForm.resetFields();
          }}
          footer={null}
          destroyOnClose
          width={520}
        >
          <Form form={typeAddForm} layout='vertical' onFinish={handleTypeAddSubmit}>
            <Form.Item name='name' label='名称' rules={[{ required: true, message: '请输入名称' }]}>
              <Input placeholder='工单类型名称' />
            </Form.Item>
            <Form.Item name='description' label='描述'>
              <TextArea rows={2} placeholder='类型描述' />
            </Form.Item>
            <Form.Item name='status' label='状态' initialValue='enabled'>
              <Select
                options={[
                  { value: 'enabled', label: '启用' },
                  { value: 'disabled', label: '禁用' },
                ]}
              />
            </Form.Item>
            <Form.Item name='sort_order' label='排序' initialValue={0}>
              <Input type='number' />
            </Form.Item>
            <div style={{ marginTop: 24, marginBottom: 16, fontWeight: 500 }}>分配规则</div>
            <Form.Item name='target_type' label='分配对象类型'>
              <Select
                placeholder='请选择'
                options={[
                  { value: 'user', label: '个人' },
                  { value: 'group', label: '组' },
                ]}
              />
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.target_type !== curr.target_type}>
              {({ getFieldValue }) =>
                getFieldValue('target_type') === 'group' ? (
                  <Form.Item name='target_id' label='处理组'>
                    <Select placeholder='请选择处理组' allowClear options={typeGroupOptions.map((o) => ({ value: String(o.id), label: o.name }))} />
                  </Form.Item>
                ) : getFieldValue('target_type') === 'user' ? (
                  <Form.Item name='target_id' label='分配用户'>
                    <Select
                      showSearch
                      placeholder='搜索并选择要分配的用户'
                      options={userOptions}
                      loading={userSearchLoading}
                      filterOption={false}
                      onSearch={(q) => debouncedFetchUsers(q)}
                      optionFilterProp='label'
                      allowClear
                      notFoundContent={userSearchLoading ? '加载中...' : '输入关键字搜索用户'}
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space>
                <Button type='primary' htmlType='submit' loading={typeAddSubmitting}>
                  保存
                </Button>
                <Button
                  onClick={() => {
                    setTypeAddVisible(false);
                    typeAddForm.resetFields();
                  }}
                >
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal title='编辑工单类型' open={typeEditVisible} onCancel={closeTypeEdit} footer={null} destroyOnClose width={520}>
          <Spin spinning={typeEditLoading}>
            <Form form={typeForm} layout='vertical' onFinish={handleTypeEditSubmit}>
              <Form.Item name='name' label='名称' rules={[{ required: true, message: '请输入名称' }]}>
                <Input placeholder='工单类型名称' />
              </Form.Item>
              <Form.Item name='description' label='描述'>
                <TextArea rows={2} placeholder='类型描述' />
              </Form.Item>
              <Form.Item name='status' label='状态' initialValue='enabled'>
                <Select
                  options={[
                    { value: 'enabled', label: '启用' },
                    { value: 'disabled', label: '禁用' },
                  ]}
                />
              </Form.Item>
              <Form.Item name='sort_order' label='排序' initialValue={0}>
                <Input type='number' />
              </Form.Item>
              <div style={{ marginTop: 24, marginBottom: 16, fontWeight: 500 }}>分配规则</div>
              <Form.Item name='target_type' label='分配对象类型'>
                <Select
                  placeholder='请选择'
                  options={[
                    { value: 'user', label: '个人' },
                    { value: 'group', label: '组' },
                  ]}
                />
              </Form.Item>
              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.target_type !== curr.target_type}>
                {({ getFieldValue }) =>
                  getFieldValue('target_type') === 'group' ? (
                    <Form.Item name='target_id' label='处理组'>
                      <Select placeholder='请选择处理组' allowClear options={typeGroupOptions.map((o) => ({ value: String(o.id), label: o.name }))} />
                    </Form.Item>
                  ) : getFieldValue('target_type') === 'user' ? (
                    <Form.Item name='target_id' label='分配用户'>
                      <Select
                        showSearch
                        placeholder='搜索并选择要分配的用户'
                        options={userOptions}
                        loading={userSearchLoading}
                        filterOption={false}
                        onSearch={(q) => debouncedFetchUsers(q)}
                        optionFilterProp='label'
                        allowClear
                        notFoundContent={userSearchLoading ? '加载中...' : '输入关键字搜索用户'}
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
              <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                <Space>
                  <Button type='primary' htmlType='submit' loading={typeEditSubmitting}>
                    保存
                  </Button>
                  <Button onClick={closeTypeEdit}>取消</Button>
                </Space>
              </Form.Item>
            </Form>
          </Spin>
        </Modal>

        <Modal
          title='新建处理组'
          open={groupAddVisible}
          onCancel={() => {
            setGroupAddVisible(false);
            groupForm.resetFields();
          }}
          footer={null}
          destroyOnClose
          width={520}
        >
          <Form form={groupForm} layout='vertical' onFinish={handleGroupAddSubmit}>
            <Form.Item name='name' label='组名' rules={[{ required: true, message: '请输入组名' }]}>
              <Input placeholder='处理组名称' />
            </Form.Item>
            <Form.Item name='remark' label='备注'>
              <TextArea rows={2} placeholder='组备注' />
            </Form.Item>
            <Form.Item name='member_ids' label='成员'>
              <Select
                mode='multiple'
                showSearch
                placeholder='搜索并选择成员'
                options={userOptions}
                loading={userSearchLoading}
                filterOption={false}
                onSearch={(q) => debouncedFetchUsers(q)}
                optionFilterProp='label'
                allowClear
                notFoundContent={userSearchLoading ? '加载中...' : '输入关键字搜索用户'}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space>
                <Button type='primary' htmlType='submit' loading={groupAddSubmitting}>
                  保存
                </Button>
                <Button
                  onClick={() => {
                    setGroupAddVisible(false);
                    groupForm.resetFields();
                  }}
                >
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal title='编辑处理组' open={groupEditVisible} onCancel={closeGroupEdit} footer={null} destroyOnClose width={520}>
          <Spin spinning={groupEditLoading}>
            <Form form={groupForm} layout='vertical' onFinish={handleGroupEditSubmit}>
              <Form.Item name='name' label='组名' rules={[{ required: true, message: '请输入组名' }]}>
                <Input placeholder='处理组名称' />
              </Form.Item>
              <Form.Item name='remark' label='备注'>
                <TextArea rows={2} placeholder='组备注' />
              </Form.Item>
              <Form.Item name='member_ids' label='成员'>
                <Select
                  mode='multiple'
                  showSearch
                  placeholder='搜索并选择成员'
                  options={userOptions}
                  loading={userSearchLoading}
                  filterOption={false}
                  onSearch={(q) => debouncedFetchUsers(q)}
                  optionFilterProp='label'
                  allowClear
                  notFoundContent={userSearchLoading ? '加载中...' : '输入关键字搜索用户'}
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                <Space>
                  <Button type='primary' htmlType='submit' loading={groupEditSubmitting}>
                    保存
                  </Button>
                  <Button onClick={closeGroupEdit}>取消</Button>
                </Space>
              </Form.Item>
            </Form>
          </Spin>
        </Modal>
      </div>
    </PageLayout>
  );
};

export default WorkformConfig;
