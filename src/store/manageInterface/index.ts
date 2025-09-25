/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React from 'react';

export interface Contacts {
  key: string;
  value: string;
}
export interface User {
  id: string;
  username: string;
  nickname: string;
  password: string;
  phone: string;
  email: string;
  portrait: string;
  status: number;
  role: string;
  contacts: Contacts[];
  permList: string[];
  permissions: string;
  create_at: number;
  create_by: number;
  update_at: number;
  update_by: number;
}

export interface ModelMetric {
  id: number;
  MetricId: number;
  DeviceModelId: number;
  Oid: string;
  Method: string;
  create_at: number;
  create_by: number;
}
export interface Team {
  id: string;
  name: string;
  note: string;
  attr: any;
  label_value?: string;
  label_key?: string;
  grp_type: string;
  create_at: number;
  create_by: string;
  update_at: number;
  update_by: string;
}
export interface UserList {
  list: Array<User>;
  total: number;
}
export interface TeamList {
  list: Array<Team>;
  total: number;
}
export enum UserType {
  User = '用户',
  Team = '团队',
}
export interface TeamInfo {
  user_groups?: Team;
  user_group?: Team;
  users: Array<User>;
}
export enum ActionType {
  CreateUser = '创建用户',
  CreateTeam = '创建团队',
  CreateBusiness = '创建业务组',
  AddBusinessMember = '添加业务组成员',
  EditBusiness = '编辑业务组',
  EditUser = '编辑用户信息',
  EditTeam = '编辑团队信息',
  Reset = '重置密码',
  Disable = '禁用',
  Undisable = '启用',
  AddUser = '添加成员',
  CreateIconGroup = '创建图标组',
  EditIconGroup = '编辑图标组',
  CreateModel = '创建型号',
  EditModel = '编辑型号',
  AddModelMetric = '添加指标',
  EditModelMetric = '编辑指标',

  AddTarget = '创建',
  EditTarget = '编辑',
}

export enum MActionType {}

export enum ModelActionType {
  CreateModelMetric = '创建指标',
  CreateModel = '创建型号',
  EditModelMetric = '编辑指标',
  Disable = '禁用',
  Undisable = '启用',
}

export enum RoleType {
  Admin = '管理员',
  Standard = '普通用户',
  Guest = '游客',
}
export enum ControlType {
  Init = 'init',
  Start = 'start',
  Stop = 'stop',
  Restart = 'restart',
  Rename = 'rename',
  Showpassword = 'showpassword',
}
export const ScrpTyps = [
  {
    label: '性能采集',
    value: 'scrp-perf',
  },
  {
    label: '进程采集',
    value: 'scrp-proc',
  },
  {
    label: '日志采集',
    value: 'scrp-log',
  },
];
export interface Title {
  create: string;
  edit: string;
  disabled: string;
  reset: string;
}
export type TitleKey = keyof Title;

export interface ControlModalProps {
  visible: boolean;
  onClose?: any;
}

export interface ModalProps {
  visible: boolean;
  userType?: string;
  onClose?: any;
  action: ActionType;
  userId?: string;
  teamId?: number;
  memberId?: string;
  onSearch?: any;
  width?: number;
  modelMetricId?: any;
  modelType?: string;
  grp_type?: string;
}

export interface AssetModalProps {
  visible: boolean;
  userType?: string;
  onClose?: any;
  onSearch?: any;
  modelId?: number;
  width?: number;
  modelType?: string;
  grp_type?: string;
}
export interface ModelProps {
  onClose?: any;
  userId?: string;
  modelId?: number;
  onSearch?: any;
  width?: number;
}
export interface TeamProps {
  onClose?: any;
  teamId?: number;
  businessId?: number;
  onSelect?: any;
  grp_type?: string;
  action?: ActionType;
}
export interface ModelProps {
  onClose?: any;
  modelId?: number;
  onSelect?: any;
  grp_type?: string;
}
export interface UserAndPasswordFormProps {
  userId?: string;
}

export interface ModelMetricFormProps {
  modelMetricId?: string;
  modelType?: string;
  action?: string;
}
export interface ContactsItem {
  key: string;
  label: string;
}
export interface PopoverProps {
  userId?: string;
  teamId?: number;
  memberId?: string;
  onClose: any;
  userType: string;
  isIcon?: boolean;
}

export interface TargetModalProps {
  visible?: boolean;
  onClose?: any;
  action?: ActionType | undefined;
  width?: number;
  data?: MiddlewareData;
  targetType: any;
  onOk: (data: TargetFormProps) => Promise<void>;
  destroy: () => void;
}

export interface TargetFormProps {
  id: number;
  host_ip: string;
  ident: string;
  attr: any;
  group_id: any;
  ident_type: string;
  category: string;
  note: string;
}

export interface MiddlewareAttr {
  target_id: number;
  auth_id: number;
}

export interface MiddlewareData {
  id: number;
  host_ip: string;
  ident: string;
  attr: any;
  group_id: any;
  ident_type: string;
  note: string;
  create_at: number;
  create_by: number;
}
