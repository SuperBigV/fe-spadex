# 知识库管理模块 - 前端设计文档

## 一、项目概述

### 1.1 功能目标

- 提供知识库管理的完整前端界面
- 支持知识库的创建、编辑、删除、查询
- 支持文档的上传、下载、删除、预览
- 支持文档列表展示和管理
- 提供友好的用户交互体验

### 1.2 技术栈

- 框架: React 17.0 + TypeScript
- UI 库: Ant Design 4.23.0
- 状态管理: React Hooks / Context API
- HTTP 客户端: axios
- 路由: React Router

### 1.3 路由设计

- 知识库路由：`/knowledge-base`
- 知识库列表：`/knowledge-base`
- 知识库详情（文档列表）：`/knowledge-base/:id`

---

## 二、界面设计

### 2.1 整体布局

**布局结构：左右分栏布局**

```
┌─────────────────────────────────────────────┐
│              顶部导航栏                      │
├──────────────┬──────────────────────────────┤
│              │                              │
│  知识库列表  │        文档列表区域          │
│   (左侧)     │         (右侧)               │
│              │                              │
│  - 知识库1   │  [上传文档] [搜索框]        │
│  - 知识库2   │  ┌────────────────────────┐ │
│  - 知识库3   │  │ 文档名称 | 格式 | 大小 │ │
│              │  │ 创建时间 | 创建人 | 状态│ │
│  [+ 新建]    │  │ [操作:编辑|删除|启用] │ │
│              │  └────────────────────────┘ │
│              │         [分页器]            │
└──────────────┴──────────────────────────────┘
```

### 2.2 左侧知识库列表

**组件：KnowledgeBaseList**

**功能：**

1. 知识库列表展示
2. 知识库搜索
3. 新建知识库
4. 知识库选择（点击切换右侧文档列表）
5. 知识库操作（编辑、删除、启用/禁用）

**界面元素：**

```
┌─────────────────────┐
│  知识库管理          │
├─────────────────────┤
│ [🔍 搜索框]          │
├─────────────────────┤
│ 📁 技术文档库        │
│    (10个文档)        │
│ 📁 API文档库         │
│    (5个文档)         │
│ 📁 用户手册          │
│    (20个文档)        │
├─────────────────────┤
│ [+ 新建知识库]       │
└─────────────────────┘
```

**交互说明：**

1. 点击知识库项：切换右侧文档列表
2. 右键点击知识库项：显示操作菜单（编辑、删除、启用/禁用）
3. 点击"新建知识库"：弹出新建对话框

---

### 2.3 右侧文档列表

**组件：DocumentList**

**功能：**

1. 文档列表展示
2. 文档搜索和筛选
3. 文档上传
4. 文档操作（预览、下载、编辑、删除、启用/禁用）
5. 分页展示

**界面元素：**

```
┌─────────────────────────────────────────────┐
│ 知识库名称: 技术文档库              [上传文档]│
├─────────────────────────────────────────────┤
│ [🔍 搜索文档] [状态筛选 ▼] [格式筛选 ▼]    │
├─────────────────────────────────────────────┤
│ 文档名称     │ 格式 │ 大小   │ 创建时间    │
│             │      │        │ 创建人 │ 状态│
├─────────────────────────────────────────────┤
│ 📄 API文档   │ PDF │ 1.2MB  │ 2024-01-01  │
│             │      │        │ admin  │ ✅  │
│             │      │        │ [预览|下载|编辑|删除]│
├─────────────────────────────────────────────┤
│ 📄 用户指南  │ DOCX│ 2.5MB  │ 2024-01-02  │
│             │      │        │ user   │ ✅  │
│             │      │        │ [预览|下载|编辑|删除]│
├─────────────────────────────────────────────┤
│ 共 10 条     │        [< 1 2 3 >]           │
└─────────────────────────────────────────────┘
```

**表格列定义：**

| 列名     | 字段        | 宽度  | 说明                |
| -------- | ----------- | ----- | ------------------- |
| 文档名称 | name        | 200px | 可点击预览          |
| 格式     | file_format | 80px  | 显示图标+文字       |
| 大小     | file_size   | 100px | 格式化显示（KB/MB） |
| 创建时间 | create_at   | 150px | 格式化日期时间      |
| 创建人   | create_by   | 100px | 用户名              |
| 状态     | status      | 80px  | 启用/禁用标签       |
| 操作     | -           | 200px | 操作按钮            |

**交互说明：**

1. 点击文档名称：打开预览窗口
2. 点击"上传文档"：打开上传对话框
3. 点击"预览"：在新窗口或弹窗中预览文档
4. 点击"下载"：下载文档
5. 点击"编辑"：打开编辑对话框（可修改名称和状态）
6. 点击"删除"：确认后删除文档

---

## 三、组件设计

### 3.1 页面组件

#### KnowledgeBasePage

**路径：** `src/pages/KnowledgeBase/index.tsx`

**功能：** 知识库管理主页面

**结构：**

```typescript
const KnowledgeBasePage: React.FC = () => {
  const [selectedKBId, setSelectedKBId] = useState<number | null>(null);

  return (
    <div className='knowledge-base-page'>
      <Row>
        <Col span={6}>
          <KnowledgeBaseList selectedId={selectedKBId} onSelect={setSelectedKBId} />
        </Col>
        <Col span={18}>{selectedKBId ? <DocumentList knowledgeBaseId={selectedKBId} /> : <Empty description='请选择一个知识库' />}</Col>
      </Row>
    </div>
  );
};
```

---

### 3.2 业务组件

#### KnowledgeBaseList

**路径：** `src/components/KnowledgeBase/KnowledgeBaseList.tsx`

**Props：**

```typescript
interface KnowledgeBaseListProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
}
```

**功能：**

1. 获取知识库列表
2. 搜索知识库
3. 新建知识库
4. 编辑知识库
5. 删除知识库
6. 启用/禁用知识库

**状态管理：**

```typescript
const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
const [loading, setLoading] = useState(false);
const [searchKeyword, setSearchKeyword] = useState('');
const [modalVisible, setModalVisible] = useState(false);
const [editItem, setEditItem] = useState<KnowledgeBase | null>(null);
```

**API 调用：**

```typescript
// 获取列表
GET /cmdb/knowledge-base?page=1&pageSize=100&keyword={keyword}

// 创建
POST /cmdb/knowledge-base

// 更新
PUT /cmdb/knowledge-base/:id

// 删除
DELETE /cmdb/knowledge-base/:id
```

---

#### DocumentList

**路径：** `src/components/Document/DocumentList.tsx`

**Props：**

```typescript
interface DocumentListProps {
  knowledgeBaseId: number;
}
```

**功能：**

1. 获取文档列表
2. 搜索和筛选文档
3. 上传文档
4. 预览文档
5. 下载文档
6. 编辑文档
7. 删除文档
8. 启用/禁用文档

**状态管理：**

```typescript
const [documents, setDocuments] = useState<Document[]>([]);
const [loading, setLoading] = useState(false);
const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
const [searchKeyword, setSearchKeyword] = useState('');
const [statusFilter, setStatusFilter] = useState<string>('');
const [uploadVisible, setUploadVisible] = useState(false);
const [previewVisible, setPreviewVisible] = useState(false);
const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
```

**API 调用：**

```typescript
// 获取列表
GET /cmdb/knowledge-base/:id/documents?page={page}&pageSize={pageSize}&keyword={keyword}&status={status}

// 上传
POST /cmdb/knowledge-base/:id/documents (multipart/form-data)

// 下载
GET /cmdb/knowledge-base/:id/documents/:docId/download

// 预览
GET /cmdb/knowledge-base/:id/documents/:docId/preview

// 更新
PUT /cmdb/knowledge-base/:id/documents/:docId

// 删除
DELETE /cmdb/knowledge-base/:id/documents/:docId
```

---

### 3.3 对话框组件

#### KnowledgeBaseModal

**路径：** `src/components/KnowledgeBase/KnowledgeBaseModal.tsx`

**功能：** 新建/编辑知识库对话框

**表单字段：**

- 知识库名称（必填）
- 描述（可选）

**Props：**

```typescript
interface KnowledgeBaseModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: KnowledgeBaseFormValues) => void;
  initialValues?: KnowledgeBase;
}
```

---

#### DocumentUploadModal

**路径：** `src/components/Document/DocumentUploadModal.tsx`

**功能：** 上传文档对话框

**表单字段：**

- 文件选择（必填）
- 文档名称（可选，默认使用文件名）

**Props：**

```typescript
interface DocumentUploadModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (file: File, name?: string) => void;
  knowledgeBaseId: number;
}
```

**功能特性：**

1. 文件拖拽上传
2. 文件格式验证
3. 文件大小验证
4. 上传进度显示

---

#### DocumentEditModal

**路径：** `src/components/Document/DocumentEditModal.tsx`

**功能：** 编辑文档对话框

**表单字段：**

- 文档名称（必填）
- 状态（启用/禁用）

**Props：**

```typescript
interface DocumentEditModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: DocumentFormValues) => void;
  document: Document;
}
```

---

#### DocumentPreviewModal

**路径：** `src/components/Document/DocumentPreviewModal.tsx`

**功能：** 文档预览对话框

**Props：**

```typescript
interface DocumentPreviewModalProps {
  visible: boolean;
  onCancel: () => void;
  document: Document;
  knowledgeBaseId: number;
}
```

**功能特性：**

1. PDF 文件：使用 `<iframe>` 嵌入预览
2. 文本文件：直接显示文本内容
3. Office 文件：提示下载或使用在线预览服务
4. 支持下载按钮

---

## 四、类型定义

### 4.1 数据模型类型

```typescript
// 知识库
interface KnowledgeBase {
  id: number;
  name: string;
  description: string;
  status: 'enabled' | 'disabled';
  dify_dataset_id?: string;
  local_path: string;
  document_count: number;
  create_at: number;
  create_by: string;
  update_at: number;
  update_by: string;
}

// 文档
interface Document {
  id: number;
  knowledge_base_id: number;
  name: string;
  file_name: string;
  file_format: string;
  file_size: number;
  file_path: string;
  file_md5: string;
  status: 'enabled' | 'disabled' | 'processing' | 'failed';
  dify_document_id?: string;
  sync_status: 'synced' | 'failed' | 'pending';
  sync_error?: string;
  create_at: number;
  create_by: string;
  update_at: number;
  update_by: string;
}

// 分页响应
interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// API 响应
interface ApiResponse<T> {
  dat: T;
  err?: string;
}
```

---

## 五、API 服务封装

### 5.1 API 服务文件

**路径：** `src/services/knowledgeBase.ts`

```typescript
import axios from 'axios';
import { KnowledgeBase, Document, PaginatedResponse, ApiResponse } from '@/types';

const API_PREFIX = '/cmdb/knowledge-base';

// 知识库 API
export const knowledgeBaseApi = {
  // 获取列表
  getList: (params: { page?: number; pageSize?: number; keyword?: string; status?: string }): Promise<ApiResponse<PaginatedResponse<KnowledgeBase>>> => {
    return axios.get(API_PREFIX, { params });
  },

  // 获取详情
  getDetail: (id: number): Promise<ApiResponse<KnowledgeBase>> => {
    return axios.get(`${API_PREFIX}/${id}`);
  },

  // 创建
  create: (data: { name: string; description?: string }): Promise<ApiResponse<number>> => {
    return axios.post(API_PREFIX, data);
  },

  // 更新
  update: (id: number, data: Partial<KnowledgeBase>): Promise<ApiResponse<null>> => {
    return axios.put(`${API_PREFIX}/${id}`, data);
  },

  // 删除
  delete: (id: number): Promise<ApiResponse<null>> => {
    return axios.delete(`${API_PREFIX}/${id}`);
  },
};

// 文档 API
export const documentApi = {
  // 获取列表
  getList: (
    knowledgeBaseId: number,
    params: {
      page?: number;
      pageSize?: number;
      keyword?: string;
      status?: string;
    },
  ): Promise<ApiResponse<PaginatedResponse<Document>>> => {
    return axios.get(`${API_PREFIX}/${knowledgeBaseId}/documents`, { params });
  },

  // 上传
  upload: (knowledgeBaseId: number, file: File, name?: string): Promise<ApiResponse<Document>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (name) {
      formData.append('name', name);
    }
    return axios.post(`${API_PREFIX}/${knowledgeBaseId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // 下载
  download: (knowledgeBaseId: number, docId: number): Promise<Blob> => {
    return axios.get(`${API_PREFIX}/${knowledgeBaseId}/documents/${docId}/download`, { responseType: 'blob' });
  },

  // 预览 URL
  getPreviewUrl: (knowledgeBaseId: number, docId: number): string => {
    return `${API_PREFIX}/${knowledgeBaseId}/documents/${docId}/preview`;
  },

  // 更新
  update: (knowledgeBaseId: number, docId: number, data: Partial<Document>): Promise<ApiResponse<null>> => {
    return axios.put(`${API_PREFIX}/${knowledgeBaseId}/documents/${docId}`, data);
  },

  // 删除
  delete: (knowledgeBaseId: number, docId: number): Promise<ApiResponse<null>> => {
    return axios.delete(`${API_PREFIX}/${knowledgeBaseId}/documents/${docId}`);
  },
};
```

---

## 六、工具函数

### 6.1 文件大小格式化

**路径：** `src/utils/file.ts`

```typescript
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
```

### 6.2 文件格式图标

**路径：** `src/utils/file.ts`

```typescript
export const getFileFormatIcon = (format: string): string => {
  const iconMap: Record<string, string> = {
    pdf: '📄',
    docx: '📝',
    doc: '📝',
    xlsx: '📊',
    xls: '📊',
    pptx: '📽️',
    ppt: '📽️',
    txt: '📄',
    md: '📄',
  };
  return iconMap[format.toLowerCase()] || '📄';
};
```

### 6.3 日期时间格式化

**路径：** `src/utils/date.ts`

```typescript
import moment from 'moment';

export const formatDateTime = (timestamp: number): string => {
  return moment.unix(timestamp).format('YYYY-MM-DD HH:mm:ss');
};
```

---

## 七、交互流程

### 7.1 知识库管理流程

**创建知识库：**

1. 点击"新建知识库"按钮
2. 弹出新建对话框
3. 填写知识库名称和描述
4. 点击"确定"
5. 调用 API 创建知识库
6. 刷新知识库列表
7. 自动选中新建的知识库

**编辑知识库：**

1. 右键点击知识库项
2. 选择"编辑"
3. 弹出编辑对话框（预填充数据）
4. 修改名称或描述
5. 点击"确定"
6. 调用 API 更新知识库
7. 刷新知识库列表

**删除知识库：**

1. 右键点击知识库项
2. 选择"删除"
3. 弹出确认对话框（提示将同时删除所有文档）
4. 点击"确认"
5. 调用 API 删除知识库
6. 刷新知识库列表
7. 清空右侧文档列表

---

### 7.2 文档管理流程

**上传文档：**

1. 点击"上传文档"按钮
2. 弹出上传对话框
3. 选择文件（或拖拽文件）
4. 可选：修改文档名称
5. 点击"确定"
6. 显示上传进度
7. 调用 API 上传文档
8. 上传成功后刷新文档列表

**预览文档：**

1. 点击文档名称或"预览"按钮
2. 打开预览对话框
3. 根据文件格式：
   - PDF：使用 `<iframe>` 嵌入预览
   - 文本：直接显示内容
   - Office：提示下载或使用在线预览
4. 支持下载按钮

**下载文档：**

1. 点击"下载"按钮
2. 调用下载 API
3. 创建 `<a>` 标签触发下载
4. 或使用 `window.open` 打开下载链接

**编辑文档：**

1. 点击"编辑"按钮
2. 弹出编辑对话框（预填充数据）
3. 修改文档名称或状态
4. 点击"确定"
5. 调用 API 更新文档
6. 刷新文档列表

**删除文档：**

1. 点击"删除"按钮
2. 弹出确认对话框
3. 点击"确认"
4. 调用 API 删除文档
5. 刷新文档列表

---

## 八、状态管理

### 8.1 使用 Context API

**路径：** `src/contexts/KnowledgeBaseContext.tsx`

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';
import { KnowledgeBase } from '@/types';

interface KnowledgeBaseContextType {
  selectedKBId: number | null;
  setSelectedKBId: (id: number | null) => void;
  refreshList: () => void;
}

const KnowledgeBaseContext = createContext<KnowledgeBaseContextType | undefined>(undefined);

export const KnowledgeBaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedKBId, setSelectedKBId] = useState<number | null>(null);

  const refreshList = () => {
    // 触发列表刷新
  };

  return <KnowledgeBaseContext.Provider value={{ selectedKBId, setSelectedKBId, refreshList }}>{children}</KnowledgeBaseContext.Provider>;
};

export const useKnowledgeBase = () => {
  const context = useContext(KnowledgeBaseContext);
  if (!context) {
    throw new Error('useKnowledgeBase must be used within KnowledgeBaseProvider');
  }
  return context;
};
```

---

## 九、样式设计

### 9.1 布局样式

```css
.knowledge-base-page {
  height: 100%;
  padding: 16px;
}

.knowledge-base-list {
  height: 100%;
  border-right: 1px solid #f0f0f0;
  padding-right: 16px;
}

.document-list {
  height: 100%;
  padding-left: 16px;
}
```

### 9.2 组件样式

使用 Ant Design 组件库的默认样式，必要时进行自定义覆盖。

---

## 十、开发计划

### 阶段一：基础组件开发（Week 1）

1. 页面布局组件
2. 知识库列表组件
3. 文档列表组件
4. API 服务封装

### 阶段二：功能开发（Week 2）

1. 知识库管理功能（CRUD）
2. 文档上传功能
3. 文档列表展示
4. 文档操作功能（预览、下载、编辑、删除）

### 阶段三：交互优化（Week 3）

1. 搜索和筛选功能
2. 分页功能
3. 加载状态和错误处理
4. 用户反馈和提示

### 阶段四：测试和优化（Week 4）

1. 单元测试
2. 集成测试
3. 性能优化
4. 用户体验优化

---

## 十一、注意事项

1. **错误处理**：所有 API 调用都需要进行错误处理，使用 Ant Design 的 `message` 组件提示用户

2. **加载状态**：列表加载、上传文件等操作需要显示加载状态

3. **文件大小限制**：上传前需要检查文件大小，超过限制时提示用户

4. **文件格式验证**：上传前需要验证文件格式，不支持格式时提示用户

5. **预览功能**：PDF 和文本文件可以直接预览，Office 文件需要特殊处理

6. **下载功能**：下载文件时需要考虑文件大小，大文件可能需要使用流式下载

7. **权限控制**：根据用户权限控制操作按钮的显示和可用性

8. **响应式设计**：考虑不同屏幕尺寸的适配，移动端可能需要调整布局
