/*
 * 工单系统 API 服务
 * 与 workform 后端对接，响应格式 { dat, err }
 * 用户身份由 fe-spadex 请求拦截器自动携带 Authorization: Bearer <token>，
 * workform 后端通过 JWT 解析当前用户，前端不再传递 X-User-Id/X-User-Name
 */
import request from '@/utils/request';

const PREFIX = '/workform';

function unwrap<T>(res: { dat?: T; err?: string }): T {
  if (res.err) throw new Error(res.err);
  return res.dat as T;
}

// 工单类型
export const getWorkOrderTypes = (params?: { page?: number; pageSize?: number; keyword?: string; status?: string }) =>
  request(`${PREFIX}/work-order-types`, { method: 'GET', params }).then((res: any) => unwrap(res));

export const getWorkOrderType = (id: number) => request(`${PREFIX}/work-order-types/${id}`, { method: 'GET' }).then((res: any) => unwrap(res));

export const createWorkOrderType = (data: { name: string; description?: string; status?: string; sort_order?: number }) =>
  request(`${PREFIX}/work-order-types`, { method: 'POST', data }).then((res: any) => unwrap(res));

export const updateWorkOrderType = (id: number, data: Partial<{ name: string; description: string; status: string; sort_order: number }>) =>
  request(`${PREFIX}/work-order-types/${id}`, { method: 'PUT', data }).then((res: any) => unwrap(res));

export const deleteWorkOrderType = (id: number) => request(`${PREFIX}/work-order-types/${id}`, { method: 'DELETE' }).then((res: any) => unwrap(res));

// 分配规则
export const getAssignmentRule = (workOrderTypeId: number) =>
  request(`${PREFIX}/work-order-types/${workOrderTypeId}/assignment-rule`, { method: 'GET' }).then((res: any) => unwrap(res));

export const setAssignmentRule = (workOrderTypeId: number, data: { target_type: string; target_id: string; target_name?: string }) =>
  request(`${PREFIX}/work-order-types/${workOrderTypeId}/assignment-rule`, { method: 'PUT', data }).then((res: any) => unwrap(res));

// 处理组
export const getProcessGroups = (params?: { page?: number; pageSize?: number; keyword?: string }) =>
  request(`${PREFIX}/process-groups`, { method: 'GET', params }).then((res: any) => unwrap(res));

export const getProcessGroup = (id: number) => request(`${PREFIX}/process-groups/${id}`, { method: 'GET' }).then((res: any) => unwrap(res));

export const createProcessGroup = (data: { name: string; remark?: string; member_ids?: string }) =>
  request(`${PREFIX}/process-groups`, { method: 'POST', data }).then((res: any) => unwrap(res));

export const updateProcessGroup = (id: number, data: Partial<{ name: string; remark: string; member_ids: string }>) =>
  request(`${PREFIX}/process-groups/${id}`, { method: 'PUT', data }).then((res: any) => unwrap(res));

export const deleteProcessGroup = (id: number) => request(`${PREFIX}/process-groups/${id}`, { method: 'DELETE' }).then((res: any) => unwrap(res));

// 工单（用户由后端 JWT 解析）
export const getWorkOrders = (params: {
  page?: number;
  pageSize?: number;
  status?: string;
  work_order_type_id?: number;
  submitter_id?: string;
  assignee_id?: string;
  assign_group_id?: number;
  keyword?: string;
  view?: string; // my_orders=我提交的，my_assignee=我处理的
}) => request(`${PREFIX}/work-orders`, { method: 'GET', params }).then((res: any) => unwrap(res));

export const getWorkOrder = (id: number) => request(`${PREFIX}/work-orders/${id}`, { method: 'GET' }).then((res: any) => unwrap(res));

export const createWorkOrder = (data: {
  work_order_type_id: number;
  description: string;
  contact_info?: string;
  attachments?: { file_name: string; file_path: string; file_size: number }[];
}) => request(`${PREFIX}/work-orders`, { method: 'POST', data }).then((res: any) => unwrap(res));

export const supplementWorkOrder = (id: number, data: { description_append?: string; attachments?: { file_name: string; file_path: string; file_size: number }[] }) =>
  request(`${PREFIX}/work-orders/${id}/supplement`, { method: 'PUT', data }).then((res: any) => unwrap(res));

export const claimWorkOrder = (id: number) => request(`${PREFIX}/work-orders/${id}/claim`, { method: 'POST' }).then((res: any) => unwrap(res));

export const assignWorkOrder = (id: number, data: { target_type: string; target_id: string; target_name?: string; remark?: string }) =>
  request(`${PREFIX}/work-orders/${id}/assign`, { method: 'POST', data }).then((res: any) => unwrap(res));

export const startWorkOrder = (id: number) => request(`${PREFIX}/work-orders/${id}/start`, { method: 'POST' }).then((res: any) => unwrap(res));

export const addWorkOrderRecord = (id: number, data: { content: string; is_internal?: number }) =>
  request(`${PREFIX}/work-orders/${id}/records`, { method: 'POST', data }).then((res: any) => unwrap(res));

export const resolveWorkOrder = (id: number, data?: { remark?: string }) =>
  request(`${PREFIX}/work-orders/${id}/resolve`, { method: 'POST', data: data || {} }).then((res: any) => unwrap(res));

export const confirmWorkOrder = (id: number) => request(`${PREFIX}/work-orders/${id}/confirm`, { method: 'POST' }).then((res: any) => unwrap(res));

export const feedbackWorkOrder = (id: number, data: { content: string }) =>
  request(`${PREFIX}/work-orders/${id}/feedback`, { method: 'POST', data }).then((res: any) => unwrap(res));

export const closeWorkOrder = (id: number, data?: { remark?: string }) =>
  request(`${PREFIX}/work-orders/${id}/close`, { method: 'POST', data: data || {} }).then((res: any) => unwrap(res));

export const reopenWorkOrder = (id: number, data: { remark: string }) => request(`${PREFIX}/work-orders/${id}/reopen`, { method: 'POST', data }).then((res: any) => unwrap(res));

// 附件上传
export const uploadAttachment = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request(`${PREFIX}/attachments/upload`, { method: 'POST', data: formData }).then((res: any) => unwrap(res));
};

// 报表
export const getReportOverview = (params?: { start_time?: number; end_time?: number }) =>
  request(`${PREFIX}/reports/overview`, { method: 'GET', params }).then((res: any) => unwrap(res));

export const getReportByType = (params?: { start_time?: number; end_time?: number }) =>
  request(`${PREFIX}/reports/by-type`, { method: 'GET', params }).then((res: any) => unwrap(res));

export const getReportTopAssignees = (params?: { start_time?: number; end_time?: number; limit?: number }) =>
  request(`${PREFIX}/reports/top-assignees`, { method: 'GET', params }).then((res: any) => unwrap(res));

// 站内信
export interface InboxMessageItem {
  id: number;
  title: string;
  content?: string;
  link_url: string;
  biz_type: string;
  biz_id: number;
  event_type: string;
  is_read: number;
  created_at: number;
}

export const getMessages = (params?: { page?: number; pageSize?: number; is_read?: number; biz_type?: string }) =>
  request(`${PREFIX}/messages`, { method: 'GET', params }).then((res: any) => unwrap(res)) as Promise<{
    list: InboxMessageItem[];
    total: number;
    page: number;
    pageSize: number;
    unread_count: number;
  }>;

export const getMessageUnreadCount = () => request(`${PREFIX}/messages/unread-count`, { method: 'GET' }).then((res: any) => unwrap(res)) as Promise<{ unread_count: number }>;

export const markMessageRead = (id: number) => request(`${PREFIX}/messages/${id}/read`, { method: 'PUT' }).then((res: any) => unwrap(res));

export const markMessageReadIds = (ids: number[]) => request(`${PREFIX}/messages/read-ids`, { method: 'POST', data: { ids } }).then((res: any) => unwrap(res));
