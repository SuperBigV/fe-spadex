# 合作单位管理模块 - 前端开发计划

## 一、项目概述

### 1.1 功能目标

- 提供采购供应商的完整管理功能，包括增删改查、搜索筛选等
- 提供维保单位的完整管理功能，包括增删改查、搜索筛选等
- 支持两种合作单位类型的独立管理和统一视图
- 提供友好的用户界面，支持数据导出、批量操作等功能
- 与后端 API 集成，实现数据的实时同步

### 1.2 技术栈

- 框架: React 17.0 + TypeScript
- UI 库: Ant Design 4.23.0
- 路由: React Router 5.2.0
- 状态管理: React Hooks + Context
- 构建工具: Vite 2.9.18
- HTTP 客户端: Axios（基于项目现有服务层）

---

## 二、页面结构设计

### 2.1 路由规划

```
/partner                    # 合作单位管理主页面（Tab页）
  ├─> /partner/suppliers    # 采购供应商管理 Tab（默认）
  │     └─> /partner/suppliers           # 供应商列表页
  │           └─> /partner/suppliers/:id  # 供应商详情页（可选）
  └─> /partner/maintenance  # 维保单位管理 Tab
        └─> /partner/maintenance          # 维保单位列表页
              └─> /partner/maintenance/:id # 维保单位详情页（可选）
```

**说明：**

- 使用 Tab 页设计，将采购供应商和维保单位分离管理
- 采购供应商 Tab：管理所有采购供应商信息
- 维保单位 Tab：管理所有维保单位信息
- 支持在列表页直接进行编辑操作（使用 Modal/Drawer）
- 详情页为可选功能，可根据实际需求决定是否实现

### 2.2 页面层级关系

```
合作单位管理主页面 (/partner)
  ├─> 采购供应商管理 Tab (/partner/suppliers)
  │     └─> 供应商列表页 (/partner/suppliers)
  │           ├─> 搜索和筛选区域
  │           ├─> 数据表格（支持排序、分页）
  │           ├─> 新建/编辑供应商弹窗（Modal/Drawer）
  │           └─> 批量操作功能
  └─> 维保单位管理 Tab (/partner/maintenance)
        └─> 维保单位列表页 (/partner/maintenance)
              ├─> 搜索和筛选区域
              ├─> 数据表格（支持排序、分页）
              ├─> 新建/编辑维保单位弹窗（Modal/Drawer）
              └─> 批量操作功能
```

---

## 三、UI 布局设计

### 3.1 采购供应商列表页 (`/partner/suppliers`)

#### 3.1.1 整体布局

```
┌─────────────────────────────────────────────────────────┐
│  PageHeader: 合作单位管理 > 采购供应商                   │
├─────────────────────────────────────────────────────────┤
│  [搜索框] [供应商类型筛选] [合作日期筛选] [新建供应商]   │
│  [批量删除] [导出] [刷新]                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 表格列：                                          │ │
│  │ [复选框] 供应商名称 | 联系人 | 联系电话 | 邮箱    │ │
│  │         | 地址 | 供应商类型 | 合作日期 | 操作    │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ ☑ 供应商A | 张三 | 13800138000 | a@example.com  │ │
│  │          | 北京市... | 设备供应商 | 2024-01-01  │ │
│  │          | [编辑] [删除] [详情]                  │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ ☐ 供应商B | 李四 | 13900139000 | b@example.com  │ │
│  │          | 上海市... | 服务供应商 | 2024-02-01  │ │
│  │          | [编辑] [删除] [详情]                  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [分页器]                                               │
└─────────────────────────────────────────────────────────┘
```

#### 3.1.2 功能区域

**顶部操作栏：**

- 搜索框：支持供应商名称、联系人、联系电话、邮箱模糊搜索
- 筛选器：
  - 供应商类型筛选（全部/设备供应商/服务供应商/综合供应商）
  - 合作日期范围筛选
- 操作按钮：新建供应商、批量删除、导出 Excel、刷新

**数据表格：**

- 列定义：
  - 复选框列（支持全选）
  - 供应商名称（可点击查看详情）
  - 联系人
  - 联系电话（支持点击拨打电话）
  - 联系邮箱（支持点击发送邮件）
  - 地址（可展开显示完整地址）
  - 供应商类型（标签显示，不同颜色）
  - 合作日期（日期格式：YYYY-MM-DD）
  - 操作列：编辑、删除、详情
- 功能：
  - 支持按列排序（名称、合作日期等）
  - 支持分页（每页 10/20/50/100 条）
  - 支持行选择（单选/多选）
  - 支持行内编辑（可选）

#### 3.1.3 新建/编辑供应商弹窗

```
┌─────────────────────────────────────┐
│  新建供应商                    [×]  │
├─────────────────────────────────────┤
│                                     │
│  供应商名称 * [________________]    │
│                                     │
│  联系人 *     [________________]    │
│                                     │
│  联系电话 *   [________________]    │
│                                     │
│  联系邮箱     [________________]    │
│                                     │
│  地址         [________________]    │
│                                     │
│  供应商类型 * [下拉选择框 ▼]        │
│    - 设备供应商                      │
│    - 服务供应商                      │
│    - 综合供应商                      │
│                                     │
│  合作日期 *   [日期选择器]          │
│                                     │
│  备注         [多行文本框]          │
│                                     │
│            [取消]  [确定]           │
└─────────────────────────────────────┘
```

**表单字段：**

- 供应商名称（必填，最大长度 100）
- 联系人（必填，最大长度 50）
- 联系电话（必填，手机号/座机号格式验证）
- 联系邮箱（选填，邮箱格式验证）
- 地址（选填，最大长度 200）
- 供应商类型（必填，下拉选择：设备供应商/服务供应商/综合供应商）
- 合作日期（必填，日期选择器）
- 备注（选填，多行文本，最大长度 500）

### 3.2 维保单位列表页 (`/partner/maintenance`)

#### 3.2.1 整体布局

```
┌─────────────────────────────────────────────────────────┐
│  PageHeader: 合作单位管理 > 维保单位                     │
├─────────────────────────────────────────────────────────┤
│  [搜索框] [维保类型筛选] [合作日期筛选] [新建维保单位]   │
│  [批量删除] [导出] [刷新]                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 表格列：                                          │ │
│  │ [复选框] 单位名称 | 联系人 | 联系电话 | 邮箱      │ │
│  │         | 地址 | 维保类型 | 合作日期 | 维保时长  │ │
│  │         | 操作                                    │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ ☑ 维保单位A | 王五 | 13700137000 | c@example.com │ │
│  │          | 广州市... | 硬件维保 | 2024-01-01     │ │
│  │          | 12个月 | [编辑] [删除] [详情]         │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ ☐ 维保单位B | 赵六 | 13600136000 | d@example.com │ │
│  │          | 深圳市... | 软件维保 | 2024-02-01     │ │
│  │          | 24个月 | [编辑] [删除] [详情]         │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [分页器]                                               │
└─────────────────────────────────────────────────────────┘
```

#### 3.2.2 功能区域

**顶部操作栏：**

- 搜索框：支持单位名称、联系人、联系电话、邮箱模糊搜索
- 筛选器：
  - 维保类型筛选（全部/硬件维保/软件维保/综合维保/应急响应）
  - 合作日期范围筛选
- 操作按钮：新建维保单位、批量删除、导出 Excel、刷新

**数据表格：**

- 列定义：
  - 复选框列（支持全选）
  - 单位名称（可点击查看详情）
  - 联系人
  - 联系电话（支持点击拨打电话）
  - 联系邮箱（支持点击发送邮件）
  - 地址（可展开显示完整地址）
  - 维保类型（标签显示，不同颜色）
  - 合作日期（日期格式：YYYY-MM-DD）
  - 维保时长（显示为 "X 个月" 或 "X 年 X 个月"）
  - 操作列：编辑、删除、详情
- 功能：
  - 支持按列排序（名称、合作日期等）
  - 支持分页（每页 10/20/50/100 条）
  - 支持行选择（单选/多选）
  - 支持行内编辑（可选）

#### 3.2.3 新建/编辑维保单位弹窗

```
┌─────────────────────────────────────┐
│  新建维保单位                  [×]  │
├─────────────────────────────────────┤
│                                     │
│  单位名称 *   [________________]    │
│                                     │
│  联系人 *     [________________]    │
│                                     │
│  联系电话 *   [________________]    │
│                                     │
│  联系邮箱     [________________]    │
│                                     │
│  地址         [________________]    │
│                                     │
│  维保类型 *   [下拉选择框 ▼]        │
│    - 硬件维保                        │
│    - 软件维保                        │
│    - 综合维保                        │
│    - 应急响应                        │
│                                     │
│  合作日期 *   [日期选择器]          │
│                                     │
│  维保时长 *   [数字输入框] 个月     │
│                                     │
│            [取消]  [确定]           │
└─────────────────────────────────────┘
```

**表单字段：**

- 单位名称（必填，最大长度 100）
- 联系人（必填，最大长度 50）
- 联系电话（必填，手机号/座机号格式验证）
- 联系邮箱（选填，邮箱格式验证）
- 地址（选填，最大长度 200）
- 维保类型（必填，下拉选择：硬件维保/软件维保/综合维保/应急响应）
- 合作日期（必填，日期选择器）
- 维保时长（必填，数字输入，单位：月，最小值 1，最大值 1200）

---

## 四、组件设计

### 4.1 页面组件

#### 4.1.1 PartnerLayout（合作单位管理主布局）

**位置：** `src/pages/partner/index.tsx`

**功能：**

- 提供 Tab 切换功能
- 管理路由导航
- 统一页面布局

**Props：**

```typescript
interface PartnerLayoutProps {
  children?: React.ReactNode;
}
```

#### 4.1.2 SupplierList（采购供应商列表页）

**位置：** `src/pages/partner/suppliers/List/index.tsx`

**功能：**

- 显示供应商列表
- 处理搜索、筛选、分页
- 处理新建、编辑、删除操作
- 处理批量操作

**主要状态：**

```typescript
interface SupplierListState {
  dataSource: Supplier[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  filters: {
    keyword?: string;
    type?: SupplierType;
    dateRange?: [string, string];
  };
  selectedRowKeys: number[];
}
```

#### 4.1.3 MaintenanceList（维保单位列表页）

**位置：** `src/pages/partner/maintenance/List/index.tsx`

**功能：**

- 显示维保单位列表
- 处理搜索、筛选、分页
- 处理新建、编辑、删除操作
- 处理批量操作

**主要状态：**

```typescript
interface MaintenanceListState {
  dataSource: Maintenance[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  filters: {
    keyword?: string;
    type?: MaintenanceType;
    dateRange?: [string, string];
  };
  selectedRowKeys: number[];
}
```

### 4.2 表单组件

#### 4.2.1 SupplierForm（供应商表单）

**位置：** `src/pages/partner/suppliers/components/SupplierForm/index.tsx`

**功能：**

- 供应商新建/编辑表单
- 表单验证
- 数据提交

**Props：**

```typescript
interface SupplierFormProps {
  visible: boolean;
  initialValues?: Partial<Supplier>;
  onCancel: () => void;
  onOk: (values: Supplier) => Promise<void>;
}
```

#### 4.2.2 MaintenanceForm（维保单位表单）

**位置：** `src/pages/partner/maintenance/components/MaintenanceForm/index.tsx`

**功能：**

- 维保单位新建/编辑表单
- 表单验证
- 数据提交

**Props：**

```typescript
interface MaintenanceFormProps {
  visible: boolean;
  initialValues?: Partial<Maintenance>;
  onCancel: () => void;
  onOk: (values: Maintenance) => Promise<void>;
}
```

### 4.3 类型定义

#### 4.3.1 Supplier（采购供应商）

**位置：** `src/pages/partner/suppliers/types.ts`

```typescript
export type SupplierType = '设备供应商' | '服务供应商' | '综合供应商';

export interface Supplier {
  id: number;
  name: string; // 供应商名称
  contact: string; // 联系人
  phone: string; // 联系电话
  email?: string; // 联系邮箱
  address?: string; // 地址
  type: SupplierType; // 供应商类型
  cooperationDate: string; // 合作日期 (YYYY-MM-DD)
  remark?: string; // 备注
  createdAt: string;
  updatedAt: string;
}
```

#### 4.3.2 Maintenance（维保单位）

**位置：** `src/pages/partner/maintenance/types.ts`

```typescript
export type MaintenanceType = '硬件维保' | '软件维保' | '综合维保' | '应急响应';

export interface Maintenance {
  id: number;
  name: string; // 单位名称
  contact: string; // 联系人
  phone: string; // 联系电话
  email?: string; // 联系邮箱
  address?: string; // 地址
  type: MaintenanceType; // 维保类型
  cooperationDate: string; // 合作日期 (YYYY-MM-DD)
  duration: number; // 维保时长（月）
  createdAt: string;
  updatedAt: string;
}
```

---

## 五、API 接口设计

### 5.1 采购供应商接口

#### 5.1.1 获取供应商列表

**接口：** `GET /cmdb/partner/suppliers`

**请求参数：**

```typescript
interface GetSuppliersParams {
  page?: number; // 页码，默认 1
  pageSize?: number; // 每页数量，默认 20
  keyword?: string; // 搜索关键词
  type?: SupplierType; // 供应商类型筛选
  startDate?: string; // 合作日期开始（YYYY-MM-DD）
  endDate?: string; // 合作日期结束（YYYY-MM-DD）
}
```

**响应数据：**

```typescript
interface GetSuppliersResponse {
  list: Supplier[];
  total: number;
  page: number;
  pageSize: number;
}
```

#### 5.1.2 获取供应商详情

**接口：** `GET /cmdb/partner/suppliers/:id`

**响应数据：**

```typescript
Supplier;
```

#### 5.1.3 创建供应商

**接口：** `POST /cmdb/partner/suppliers`

**请求体：**

```typescript
Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>;
```

**响应数据：**

```typescript
Supplier;
```

#### 5.1.4 更新供应商

**接口：** `PUT /cmdb/partner/suppliers/:id`

**请求体：**

```typescript
Partial<Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>>;
```

**响应数据：**

```typescript
Supplier;
```

#### 5.1.5 删除供应商

**接口：** `DELETE /cmdb/partner/suppliers/:id`

**响应数据：**

```typescript
{ success: boolean; message?: string; }
```

#### 5.1.6 批量删除供应商

**接口：** `DELETE /cmdb/partner/suppliers/batch`

**请求体：**

```typescript
{ ids: number[]; }
```

**响应数据：**

```typescript
{ success: boolean; message?: string; }
```

### 5.2 维保单位接口

#### 5.2.1 获取维保单位列表

**接口：** `GET /cmdb/partner/maintenance`

**请求参数：**

```typescript
interface GetMaintenanceParams {
  page?: number; // 页码，默认 1
  pageSize?: number; // 每页数量，默认 20
  keyword?: string; // 搜索关键词
  type?: MaintenanceType; // 维保类型筛选
  startDate?: string; // 合作日期开始（YYYY-MM-DD）
  endDate?: string; // 合作日期结束（YYYY-MM-DD）
}
```

**响应数据：**

```typescript
interface GetMaintenanceResponse {
  list: Maintenance[];
  total: number;
  page: number;
  pageSize: number;
}
```

#### 5.2.2 获取维保单位详情

**接口：** `GET /cmdb/partner/maintenance/:id`

**响应数据：**

```typescript
Maintenance;
```

#### 5.2.3 创建维保单位

**接口：** `POST /cmdb/partner/maintenance`

**请求体：**

```typescript
Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>;
```

**响应数据：**

```typescript
Maintenance;
```

#### 5.2.4 更新维保单位

**接口：** `PUT /cmdb/partner/maintenance/:id`

**请求体：**

```typescript
Partial<Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>>;
```

**响应数据：**

```typescript
Maintenance;
```

#### 5.2.5 删除维保单位

**接口：** `DELETE /cmdb/partner/maintenance/:id`

**响应数据：**

```typescript
{ success: boolean; message?: string; }
```

#### 5.2.6 批量删除维保单位

**接口：** `DELETE /cmdb/partner/maintenance/batch`

**请求体：**

```typescript
{ ids: number[]; }
```

**响应数据：**

```typescript
{ success: boolean; message?: string; }
```

### 5.3 服务层实现

#### 5.3.1 SupplierService

**位置：** `src/services/partner.ts`

```typescript
// 获取供应商列表
export function getSuppliers(params: GetSuppliersParams): Promise<GetSuppliersResponse>;

// 获取供应商详情
export function getSupplierById(id: number): Promise<Supplier>;

// 创建供应商
export function createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier>;

// 更新供应商
export function updateSupplier(id: number, data: Partial<Supplier>): Promise<Supplier>;

// 删除供应商
export function deleteSupplier(id: number): Promise<void>;

// 批量删除供应商
export function batchDeleteSuppliers(ids: number[]): Promise<void>;
```

#### 5.3.2 MaintenanceService

**位置：** `src/services/partner.ts`

```typescript
// 获取维保单位列表
export function getMaintenanceList(params: GetMaintenanceParams): Promise<GetMaintenanceResponse>;

// 获取维保单位详情
export function getMaintenanceById(id: number): Promise<Maintenance>;

// 创建维保单位
export function createMaintenance(data: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Maintenance>;

// 更新维保单位
export function updateMaintenance(id: number, data: Partial<Maintenance>): Promise<Maintenance>;

// 删除维保单位
export function deleteMaintenance(id: number): Promise<void>;

// 批量删除维保单位
export function batchDeleteMaintenance(ids: number[]): Promise<void>;
```

---

## 六、功能特性

### 6.1 基础功能

1. **列表展示**

   - 支持分页显示
   - 支持列排序
   - 支持列宽调整
   - 支持表格列显示/隐藏配置

2. **搜索筛选**

   - 关键词搜索（名称、联系人、电话、邮箱）
   - 类型筛选
   - 日期范围筛选
   - 筛选条件持久化（URL 参数）

3. **数据操作**

   - 新建记录
   - 编辑记录
   - 删除记录（单个/批量）
   - 查看详情

4. **数据导出**
   - 导出当前页数据为 Excel
   - 导出全部数据为 Excel
   - 支持自定义导出字段

### 6.2 高级功能

1. **数据验证**

   - 表单字段格式验证
   - 必填字段验证
   - 邮箱格式验证
   - 电话格式验证
   - 日期范围验证

2. **用户体验优化**

   - 加载状态提示
   - 操作成功/失败提示
   - 删除确认弹窗
   - 表单数据自动保存（草稿）
   - 快捷键支持（Ctrl+S 保存等）

3. **性能优化**

   - 列表数据虚拟滚动（大数据量时）
   - 防抖搜索
   - 请求缓存
   - 分页加载优化

4. **权限控制**
   - 基于用户权限显示/隐藏操作按钮
   - 操作权限验证

---

## 七、国际化支持

### 7.1 多语言配置

**位置：** `src/locales/partner/`

支持语言：

- 简体中文（zh_CN）
- 繁体中文（zh_HK）
- 英文（en_US）

### 7.2 需要翻译的文本

- 页面标题
- 表格列名
- 表单标签
- 按钮文本
- 提示信息
- 错误信息
- 供应商类型选项
- 维保类型选项

---

## 八、样式设计

### 8.1 样式文件结构

```
src/pages/partner/
  ├─ index.less              # 主布局样式
  ├─ suppliers/
  │   ├─ List/
  │   │   └─ index.less      # 供应商列表页样式
  │   └─ components/
  │       └─ SupplierForm/
  │           └─ index.less # 供应商表单样式
  └─ maintenance/
      ├─ List/
      │   └─ index.less      # 维保单位列表页样式
      └─ components/
          └─ MaintenanceForm/
              └─ index.less  # 维保单位表单样式
```

### 8.2 设计规范

- 遵循 Ant Design 设计规范
- 使用项目统一的主题色
- 保持与项目其他页面风格一致
- 响应式设计，支持不同屏幕尺寸

---

## 九、开发计划

### 9.1 开发阶段

**第一阶段：基础功能（1-2 周）**

- 页面路由配置
- 列表页基础布局
- 数据表格展示
- 基础 CRUD 操作

**第二阶段：完善功能（1 周）**

- 搜索筛选功能
- 表单验证
- 批量操作
- 数据导出

**第三阶段：优化和测试（1 周）**

- 性能优化
- 用户体验优化
- 国际化支持
- 单元测试和集成测试

### 9.2 开发顺序

1. 类型定义和接口设计
2. 服务层实现
3. 供应商管理功能
4. 维保单位管理功能
5. 功能完善和优化

---

## 十、注意事项

### 10.1 数据安全

- 所有 API 请求需要身份验证
- 敏感操作需要二次确认
- 输入数据需要严格验证和转义

### 10.2 错误处理

- 网络错误处理
- 业务错误处理
- 友好的错误提示

### 10.3 兼容性

- 浏览器兼容性（Chrome、Firefox、Safari、Edge）
- 响应式布局适配
- 移动端适配（可选）

### 10.4 代码规范

- 遵循项目代码规范
- 使用 TypeScript 严格模式
- 组件复用性考虑
- 代码注释完善

---

## 十一、后续扩展

### 11.1 可能的功能扩展

- 供应商/维保单位详情页
- 合作历史记录
- 合同管理
- 评价和评分系统
- 数据统计分析
- 导入功能（Excel 导入）
- 关联设备/资产管理

### 11.2 集成需求

- 与设备管理模块集成
- 与合同管理模块集成
- 与通知系统集成
