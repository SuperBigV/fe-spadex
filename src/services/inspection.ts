/*
 * 巡检模块 API 服务
 * 与 inspection 后端对接（响应格式 { dat, err }）
 */
import request from '@/utils/request';

const PREFIX = '/inspection';

function unwrap<T>(res: { dat?: T; err?: string }): T {
  if ((res as any)?.err) throw new Error((res as any).err);
  return (res as any).dat as T;
}

export type InspectionTemplate = {
  id: number;
  name: string;
  inspection_type: string;
  prometheus_name: string;
  schedule_cron: string;
  object_scope_type: 'asset_model' | 'busi_group';
  object_scope_value: string; // JSON 数组字符串
  enabled: number;
  created_at?: number;
  updated_at?: number;
  created_by?: string;
  updated_by?: string;
  items?: InspectionItem[];
};

export type InspectionItem = {
  id: number;
  template_id: number;
  name: string;
  promql_tpl: string;
  object_label: string;
  unit?: string;
  threshold_rule?: string;
  severity?: string;
  sort_order?: number;
};

export type InspectionTask = {
  id: number;
  template_id: number;
  inspection_type: string;
  status: string;
  object_count: number;
  started_at: number;
  finished_at: number;
  report_received_at: number;
  result_snapshot?: any;
};

export type InspectionReport = {
  id: number;
  task_id: number;
  report_content: string;
  summary_json?: any;
  anomaly_list_json?: any;
  created_at: number;
};

export const getPrometheusOptions = (): Promise<string[]> => request(`${PREFIX}/prometheus-options`, { method: 'GET' }).then((res: any) => unwrap(res));

export const getTemplates = (params?: { page?: number; pageSize?: number; inspection_type?: string }) =>
  request(`${PREFIX}/templates`, { method: 'GET', params }).then((res: any) => unwrap(res) as { list: InspectionTemplate[]; total: number });

export const getTemplate = (id: number) => request(`${PREFIX}/templates/${id}`, { method: 'GET' }).then((res: any) => unwrap(res) as InspectionTemplate);

export const createTemplate = (data: Partial<InspectionTemplate>) => request(`${PREFIX}/templates`, { method: 'POST', data }).then((res: any) => unwrap(res) as { id: number });

export const updateTemplate = (id: number, data: Partial<InspectionTemplate>) => request(`${PREFIX}/templates/${id}`, { method: 'PUT', data }).then((res: any) => unwrap(res));

export const deleteTemplate = (id: number) => request(`${PREFIX}/templates/${id}`, { method: 'DELETE' }).then((res: any) => unwrap(res));

export const getTasks = (params?: { page?: number; pageSize?: number; template_id?: number; status?: string; inspection_type?: string }) =>
  request(`${PREFIX}/tasks`, { method: 'GET', params }).then((res: any) => unwrap(res) as { list: InspectionTask[]; total: number });

export const getTask = (id: number) => request(`${PREFIX}/tasks/${id}`, { method: 'GET' }).then((res: any) => unwrap(res) as { task: InspectionTask; report?: InspectionReport });

export const triggerTask = (templateId: number) =>
  request(`${PREFIX}/tasks/trigger`, { method: 'POST', data: { template_id: templateId } }).then((res: any) => unwrap(res) as { task_id: number });

export const getOverview = () => request(`${PREFIX}/overview`, { method: 'GET' }).then((res: any) => unwrap(res));
