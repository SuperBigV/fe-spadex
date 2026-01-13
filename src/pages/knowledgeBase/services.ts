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

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import {
  KnowledgeBase,
  Document,
  PaginatedResponse,
  ApiResponse,
  KnowledgeBaseListParams,
  DocumentListParams,
  KnowledgeBaseFormValues,
  DocumentFormValues,
} from './types';

const API_PREFIX = '/cmdb/knowledge-base';

// 处理响应数据：从 dat 字段提取数据，检查错误
const handleResponse = <T>(response: any): T => {
  if (response.err && response.err !== '') {
    throw new Error(response.err);
  }
  return response.dat as T;
};

// 知识库 API
export const knowledgeBaseApi = {
  // 获取列表
  getList: async (params: KnowledgeBaseListParams = {}): Promise<PaginatedResponse<KnowledgeBase>> => {
    const response = await request.get(API_PREFIX, {
      params,
    });
    return handleResponse<PaginatedResponse<KnowledgeBase>>(response);
  },

  // 获取详情
  getDetail: async (id: number): Promise<KnowledgeBase> => {
    const response = await request.get(`${API_PREFIX}/${id}`);
    return handleResponse<KnowledgeBase>(response);
  },

  // 创建
  create: async (data: KnowledgeBaseFormValues): Promise<number> => {
    const response = await request.post(API_PREFIX, {
      data,
    });
    const result = handleResponse<number>(response);
    return result;
  },

  // 更新
  update: async (id: number, data: Partial<KnowledgeBase>): Promise<void> => {
    await request.put(`${API_PREFIX}/${id}`, {
      data,
    });
  },

  // 删除
  delete: async (id: number): Promise<void> => {
    await request.delete(`${API_PREFIX}/${id}`);
  },
};

// 文档 API
export const documentApi = {
  // 获取列表
  getList: async (
    knowledgeBaseId: number,
    params: DocumentListParams = {},
  ): Promise<PaginatedResponse<Document>> => {
    const response = await request.get(`${API_PREFIX}/${knowledgeBaseId}/documents`, {
      params,
    });
    return handleResponse<PaginatedResponse<Document>>(response);
  },

  // 上传
  upload: async (knowledgeBaseId: number, file: File, name?: string): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    if (name) {
      formData.append('name', name);
    }
    // 不要手动设置 Content-Type，让浏览器自动设置（包含 boundary 参数）
    const response = await request.post(`${API_PREFIX}/${knowledgeBaseId}/documents`, {
      data: formData,
    });
    return handleResponse<Document>(response);
  },

  // 下载
  download: async (knowledgeBaseId: number, docId: number): Promise<Blob> => {
    const response = await request.get(`${API_PREFIX}/${knowledgeBaseId}/documents/${docId}/download`, {
      responseType: 'blob',
    });
    return response as Blob;
  },

  // 预览 URL
  getPreviewUrl: (knowledgeBaseId: number, docId: number): string => {
    return `${API_PREFIX}/${knowledgeBaseId}/documents/${docId}/preview`;
  },

  // 更新
  update: async (knowledgeBaseId: number, docId: number, data: Partial<Document>): Promise<void> => {
    await request.put(`${API_PREFIX}/${knowledgeBaseId}/documents/${docId}`, {
      data,
    });
  },

  // 删除
  delete: async (knowledgeBaseId: number, docId: number): Promise<void> => {
    await request.delete(`${API_PREFIX}/${knowledgeBaseId}/documents/${docId}`);
  },
};
