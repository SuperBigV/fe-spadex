// "notify_groups_obj": [
//   {
//       "id": 2,
//       "name": "出行团队",
//       "note": "",
//       "create_at": 1759975634,
//       "create_by": "root",
//       "update_at": 1765949555,
//       "update_by": "root",
//       "users": null
//   }
// ],

export interface NotifyGroupType {
  id: number;
  name: string;
  note: string;
}
export interface AlertRuleType<T> {
  id: number;
  group_id: number;
  name: string;
  disabled: AlertRuleStatus;
  append_tags: string[];
  rule_config: T;
  cate: string;
  datasource_ids: number[];
  prom_ql: string;
  prom_eval_interval: number;
  prom_for_duration: number;
  runbook_url: string;
  enable_status: boolean;
  enable_days_of_weekss: number[][];
  enable_stimes: number[];
  enable_etimes: number[];
  notify_groups_obj: NotifyGroupType[];
  notify_channels: string[];
  notify_groups: string[];
  notify_recovered: number;
  recover_duration: number;
  notify_repeat_step: number;
  notify_max_number: number;
  callbacks: string[];
  annotations: any;
  cron_pattern: string; // 执行频率 "@every 15s"
  prod: string;
  severities: number[];
  update_at: number;
  update_by: number;
}

export enum AlertRuleStatus {
  Enable = 0,
  UnEnable = 1,
}
