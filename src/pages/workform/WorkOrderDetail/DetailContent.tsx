/*
 * 工单详情内容：供详情页与列表页模态框复用
 * 接收 id 与可选的 onClose（模态框关闭回调）
 */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Button, Card, Tag, Timeline, Modal, Form, Input, message, Descriptions, Spin } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import {
  getWorkOrder,
  addWorkOrderRecord,
  supplementWorkOrder,
  claimWorkOrder,
  startWorkOrder,
  resolveWorkOrder,
  confirmWorkOrder,
  feedbackWorkOrder,
  closeWorkOrder,
  reopenWorkOrder,
} from '@/services/workform';
import { STATUS_MAP } from '../constants';
import './style.less';

const { TextArea } = Input;

export interface WorkOrderDetailContentProps {
  id: number;
  onClose?: () => void;
}

const WorkOrderDetailContent: React.FC<WorkOrderDetailContentProps> = ({ id, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [supplementModalVisible, setSupplementModalVisible] = useState(false);
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [reopenModalVisible, setReopenModalVisible] = useState(false);
  const [recordForm] = Form.useForm();
  const [supplementForm] = Form.useForm();
  const [resolveForm] = Form.useForm();
  const [closeForm] = Form.useForm();
  const [feedbackForm] = Form.useForm();
  const [reopenForm] = Form.useForm();

  const fetchDetail = () => {
    setLoading(true);
    getWorkOrder(id)
      .then((res: any) => setDetail(res))
      .catch((err) => message.error(err?.message || '加载失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const currentUserId = (detail as any)?.current_user_id;
  const isSubmitter = detail && currentUserId && String(detail.submitter_id) === String(currentUserId);
  const isAssignee = detail && currentUserId && String(detail.assignee_id) === String(currentUserId);
  const isInAssignGroup =
    detail &&
    currentUserId &&
    (detail as any)?.assign_group_id > 0 &&
    Array.isArray((detail as any)?.assignee_ids) &&
    (detail as any).assignee_ids.some((id: string | number) => String(id) === String(currentUserId));
  const canOperate = isSubmitter || isAssignee || isInAssignGroup || (detail as any)?.current_user_admin;
  const status = detail?.status;

  const handleClaim = () => {
    claimWorkOrder(id)
      .then(() => {
        message.success('认领成功');
        fetchDetail();
      })
      .catch((e) => message.error(e?.message || '认领失败'));
  };

  const handleStart = () => {
    startWorkOrder(id)
      .then(() => {
        message.success('已开始处理');
        fetchDetail();
      })
      .catch((e) => message.error(e?.message || '操作失败'));
  };

  const handleAddRecord = () => {
    recordForm.validateFields().then((values) => {
      addWorkOrderRecord(id, { content: values.content, is_internal: 0 })
        .then(() => {
          message.success('添加成功');
          setRecordModalVisible(false);
          recordForm.resetFields();
          fetchDetail();
        })
        .catch((e) => message.error(e?.message || '添加失败'));
    });
  };

  const handleResolve = () => {
    resolveForm.validateFields().then((values) => {
      resolveWorkOrder(id, { remark: values.remark })
        .then(() => {
          message.success('已标记解决');
          setResolveModalVisible(false);
          resolveForm.resetFields();
          fetchDetail();
        })
        .catch((e) => message.error(e?.message || '操作失败'));
    });
  };

  const handleConfirm = () => {
    confirmWorkOrder(id)
      .then(() => {
        message.success('已确认');
        fetchDetail();
      })
      .catch((e) => message.error(e?.message || '操作失败'));
  };

  const handleFeedback = () => {
    feedbackForm.validateFields().then((values) => {
      feedbackWorkOrder(id, { content: values.content })
        .then(() => {
          message.success('已反馈');
          setFeedbackModalVisible(false);
          feedbackForm.resetFields();
          fetchDetail();
        })
        .catch((e) => message.error(e?.message || '操作失败'));
    });
  };

  const handleClose = () => {
    closeForm.validateFields().then((values) => {
      closeWorkOrder(id, { remark: values.remark })
        .then(() => {
          message.success('已关闭');
          setCloseModalVisible(false);
          closeForm.resetFields();
          fetchDetail();
        })
        .catch((e) => message.error(e?.message || '操作失败'));
    });
  };

  const handleReopen = () => {
    reopenForm.validateFields().then((values) => {
      reopenWorkOrder(id, { remark: values.remark })
        .then(() => {
          message.success('已重开');
          setReopenModalVisible(false);
          reopenForm.resetFields();
          fetchDetail();
        })
        .catch((e) => message.error(e?.message || '操作失败'));
    });
  };

  const handleSupplement = () => {
    supplementForm.validateFields().then((values) => {
      supplementWorkOrder(id, { description_append: values.description_append })
        .then(() => {
          message.success('补充成功');
          setSupplementModalVisible(false);
          supplementForm.resetFields();
          fetchDetail();
        })
        .catch((e) => message.error(e?.message || '补充失败'));
    });
  };

  const statusCfg = STATUS_MAP[status] || { label: status, color: 'default' };

  return (
    <>
      <Spin spinning={loading}>
        {detail && (
          <div className='workform-detail-content'>
            <Card size='small' className='workform-detail-header'>
              <Descriptions column={3} size='small'>
                <Descriptions.Item label='工单号'>{detail.order_no}</Descriptions.Item>
                <Descriptions.Item label='状态'>
                  <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label='类型'>{detail.work_order_type_name || '-'}</Descriptions.Item>
                <Descriptions.Item label='提交人'>{detail.submitter_name || '-'}</Descriptions.Item>
                <Descriptions.Item label='处理人'>{detail.assignee_name || '-'}</Descriptions.Item>
                <Descriptions.Item label='联系方式'>{detail.contact_info || '-'}</Descriptions.Item>
                <Descriptions.Item label='创建时间'>{detail.created_at ? moment.unix(detail.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}</Descriptions.Item>
                <Descriptions.Item label='解决时间'>{detail.resolved_at ? moment.unix(detail.resolved_at).format('YYYY-MM-DD HH:mm:ss') : '-'}</Descriptions.Item>
                <Descriptions.Item label='关闭时间'>{detail.closed_at ? moment.unix(detail.closed_at).format('YYYY-MM-DD HH:mm:ss') : '-'}</Descriptions.Item>
              </Descriptions>
              <div className='workform-detail-actions'>
                {canOperate && !isSubmitter && status === 'pending' && !isAssignee && (
                  <Button type='primary' onClick={handleClaim}>
                    认领
                  </Button>
                )}
                {canOperate && !isSubmitter && status === 'pending' && isAssignee && <Button onClick={handleStart}>开始处理</Button>}
                {canOperate && (status === 'processing' || status === 'pending') && isAssignee && (
                  <>
                    <Button type='primary' icon={<PlusOutlined />} onClick={() => setRecordModalVisible(true)}>
                      添加记录
                    </Button>
                    <Button icon={<CheckOutlined />} onClick={() => setResolveModalVisible(true)}>
                      标记解决
                    </Button>
                    <Button danger icon={<CloseOutlined />} onClick={() => setCloseModalVisible(true)}>
                      关闭
                    </Button>
                  </>
                )}
                {canOperate && (status === 'processing' || status === 'pending') && isSubmitter && (
                  <Button type='primary' onClick={() => setSupplementModalVisible(true)}>
                    补充问题
                  </Button>
                )}
                {canOperate && status === 'resolved' && isSubmitter && (
                  <>
                    <Button type='primary' onClick={handleConfirm}>
                      确认满意
                    </Button>
                    <Button onClick={() => setFeedbackModalVisible(true)}>不满意/需继续</Button>
                  </>
                )}
                {canOperate && status === 'resolved' && (isAssignee || (detail as any)?.current_user_admin) && (
                  <Button icon={<CloseOutlined />} onClick={() => setCloseModalVisible(true)}>
                    直接关闭
                  </Button>
                )}
                {canOperate && (status === 'resolved' || status === 'closed') && (isSubmitter || isAssignee || (detail as any)?.current_user_admin) && (
                  <Button onClick={() => setReopenModalVisible(true)}>重开</Button>
                )}
              </div>
            </Card>

            <Card size='small' className='workform-detail-section workform-detail-desc'>
              <div className='workform-detail-section-title'>问题描述</div>
              <div className='workform-detail-section-body'>
                <div className='workform-detail-desc-text'>{detail.description || '-'}</div>
                {detail.attachments?.length > 0 && (
                  <div className='workform-detail-attachments'>
                    <div className='workform-detail-attachments-label'>附件</div>
                    {detail.attachments.map((a: any) => (
                      <div key={a.id}>
                        <a href={a.file_path} target='_blank' rel='noreferrer'>
                          {a.file_name}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card size='small' className='workform-detail-section workform-detail-timeline'>
              <div className='workform-detail-section-title'>处理记录与操作日志</div>
              <div className='workform-detail-section-body'>
                <Timeline>
                  {[...((detail as any)?.records || []), ...((detail as any)?.op_logs || [])]
                    .sort((a, b) => (b.create_at || 0) - (a.create_at || 0))
                    .map((item: any, idx) => (
                      <Timeline.Item key={idx}>
                        {item.content !== undefined ? (
                          <>
                            <Tag color='blue'>处理记录</Tag>
                            {item.create_by_name} · {item.create_at ? moment.unix(item.create_at).format('YYYY-MM-DD HH:mm') : ''}
                            <div style={{ marginTop: 4 }}>{item.content}</div>
                          </>
                        ) : (
                          <>
                            <Tag color='default'>操作</Tag>
                            {item.operator_name} · {item.action} · {item.create_at ? moment.unix(item.create_at).format('YYYY-MM-DD HH:mm') : ''}
                            {item.remark && <div style={{ marginTop: 4, color: '#8c8c8c' }}>{item.remark}</div>}
                          </>
                        )}
                      </Timeline.Item>
                    ))}
                </Timeline>
              </div>
            </Card>
          </div>
        )}
      </Spin>

      <Modal title='添加处理记录' open={recordModalVisible} onOk={handleAddRecord} onCancel={() => setRecordModalVisible(false)}>
        <Form form={recordForm} layout='vertical'>
          <Form.Item name='content' label='记录内容' rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title='补充问题' open={supplementModalVisible} onOk={handleSupplement} onCancel={() => setSupplementModalVisible(false)}>
        <Form form={supplementForm} layout='vertical'>
          <Form.Item name='description_append' label='补充说明' rules={[{ required: true, message: '请输入补充内容' }]}>
            <TextArea rows={4} placeholder='请描述需要补充的问题信息' />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title='标记解决' open={resolveModalVisible} onOk={handleResolve} onCancel={() => setResolveModalVisible(false)}>
        <Form form={resolveForm} layout='vertical'>
          <Form.Item name='remark' label='解决说明'>
            <TextArea rows={3} placeholder='可选填写解决方式' />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title='关闭工单' open={closeModalVisible} onOk={handleClose} onCancel={() => setCloseModalVisible(false)}>
        <Form form={closeForm} layout='vertical'>
          <Form.Item name='remark' label='关闭说明'>
            <TextArea rows={3} placeholder='可选填写关闭原因' />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title='反馈' open={feedbackModalVisible} onOk={handleFeedback} onCancel={() => setFeedbackModalVisible(false)}>
        <Form form={feedbackForm} layout='vertical'>
          <Form.Item name='content' label='反馈内容' rules={[{ required: true }]}>
            <TextArea rows={4} placeholder='请描述仍需处理的问题' />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title='重开工单' open={reopenModalVisible} onOk={handleReopen} onCancel={() => setReopenModalVisible(false)}>
        <Form form={reopenForm} layout='vertical'>
          <Form.Item name='remark' label='重开原因' rules={[{ required: true }]}>
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default WorkOrderDetailContent;
