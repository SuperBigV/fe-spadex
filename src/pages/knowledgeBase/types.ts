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

// 知识库状态
export type KnowledgeBaseStatus = 'enabled' | 'disabled';

// 文档状态
export type DocumentStatus = 'enabled' | 'disabled' | 'processing' | 'failed';

// 同步状态
export type SyncStatus = 'synced' | 'failed' | 'pending';

// 知识库
export interface KnowledgeBase {
  id: number;
  name: string;
  description: string;
  status: KnowledgeBaseStatus;
  dify_dataset_id?: string;
  local_path: string;
  document_count: number;
  create_at: number;
  create_by: string;
  update_at: number;
  update_by: string;
}

// 文档
export interface Document {
  id: number;
  knowledge_base_id: number;
  name: string;
  file_name: string;
  file_format: string;
  file_size: number;
  file_path: string;
  file_md5: string;
  status: DocumentStatus;
  dify_document_id?: string;
  sync_status: SyncStatus;
  sync_error?: string;
  create_at: number;
  create_by: string;
  update_at: number;
  update_by: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// API 响应
export interface ApiResponse<T> {
  dat: T;
  err?: string;
}

// 知识库列表查询参数
export interface KnowledgeBaseListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
}

// 文档列表查询参数
export interface DocumentListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
}

// 知识库表单值
export interface KnowledgeBaseFormValues {
  name: string;
  description?: string;
}

// 文档表单值
export interface DocumentFormValues {
  name: string;
  status: DocumentStatus;
}
