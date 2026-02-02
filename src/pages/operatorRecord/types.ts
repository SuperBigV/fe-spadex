/*
 * 资产管理操作记录类型定义
 */

/** 操作类型枚举 */
export const OperationTypeMap: Record<string, string> = {
  asset_add: '资产新增',
  asset_delete: '资产删除',
  target_start: '服务器启动',
  target_stop: '服务器停止',
  target_restart: '服务器重启',
  target_rename: '主机重命名',
  password_change: '修改密码',
};

export type OperationType = keyof typeof OperationTypeMap;

/** 单条操作记录 */
export interface OperatorRecord {
  id: number;
  operation_type: string;
  target_id: number;
  target_ident: string;
  extra?: Record<string, unknown>;
  operator: string;
  create_at: number;
  result: string;
}

/** 列表查询参数 */
export interface OperatorRecordListParams {
  page?: number;
  pageSize?: number;
  operation_type?: string;
  operator?: string;
  target_id?: number;
  keyword?: string;
  start_time?: number;
  end_time?: number;
}

/** 列表响应 */
export interface OperatorRecordListResponse {
  list: OperatorRecord[];
  total: number;
  page: number;
  pageSize: number;
}
