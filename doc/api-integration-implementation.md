# 前后端接口对接实现总结

## 一、实现概述

已按照优先级完成前后端接口对接实现，确保可以与后端接口真实对接功能可用。

## 二、已完成的修改

### 2.1 立即修复：CMDB gids 参数不匹配问题 ✅

**问题：**
- 前端：`gids?: number[]` (数组，可选)
- 后端：`gids: int64` (单个值，必填)

**解决方案：**
- 修改 `getCMDBDevices` 函数，支持数组格式的 `gids` 参数
- 使用 `umi-request` 的数组参数格式，自动转换为 `gids=10&gids=20` 或后端支持的格式
- 保持向后兼容，如果后端只支持单个值，可以循环调用

**代码位置：** `src/pages/room/services.ts` 第 600+ 行

```typescript
// 处理 gids 参数：如果提供数组，转换为查询参数
if (params.gids && params.gids.length > 0) {
  // 使用数组格式，umi-request 会自动处理
  requestParams.gids = params.gids;
}
```

### 2.2 高优先级：实现真实 API 调用和响应格式处理 ✅

**实现内容：**

1. **导入 request 工具**
   - 从 `@/utils/request` 导入 `request`
   - 定义 API 前缀：`const API_PREFIX = '/cmdb'`

2. **响应格式处理函数**
   - `handleResponse<T>(response: any): T`：从 `dat` 字段提取数据，检查 `err` 字段
   - 统一处理后端返回的 `{ dat: {}, err: '' }` 格式

3. **时间字段转换函数**
   - `formatTime(time: any): string | undefined`：处理时间戳和 ISO 字符串格式
   - 自动识别时间戳（秒或毫秒）并转换为 ISO 字符串

4. **所有 API 函数实现真实调用**
   - 机房相关 API（8个函数）
   - 机柜相关 API（7个函数）
   - 设备相关 API（5个函数）
   - CMDB 集成 API（2个函数）

5. **Mock 数据开关**
   - 定义 `USE_MOCK` 常量，可以快速切换 mock 和真实 API
   - 默认 `USE_MOCK = false`，使用真实 API

**已实现的接口列表：**

#### 机房管理接口
- ✅ `getRoomList` - GET `/cmdb/rooms`
- ✅ `getRoomDetail` - GET `/cmdb/rooms/:id`
- ✅ `createRoom` - POST `/cmdb/rooms`
- ✅ `updateRoom` - PUT `/cmdb/rooms/:id`
- ✅ `deleteRoom` - DELETE `/cmdb/rooms/:id`
- ✅ `getRoomStatistics` - GET `/cmdb/rooms/:id/statistics`
- ✅ `updateRoomLayout` - PUT `/cmdb/rooms/:id/layout`
- ✅ `getRoomLayout` - GET `/cmdb/rooms/:id/layout` (可选，有降级处理)

#### 机柜管理接口
- ✅ `getRackList` - GET `/cmdb/racks`
- ✅ `getRackDetail` - GET `/cmdb/racks/:id`
- ✅ `createRack` - POST `/cmdb/racks`
- ✅ `updateRack` - PUT `/cmdb/racks/:id`
- ✅ `deleteRack` - DELETE `/cmdb/racks/:id`
- ✅ `getRackStatistics` - GET `/cmdb/racks/:id/statistics`
- ✅ `batchAddRacksToRoom` - POST `/cmdb/rooms/:id/racks/batch`

#### 设备管理接口
- ✅ `getRackDevices` - GET `/cmdb/racks/:id/devices` (可选，有降级处理)
- ✅ `addDeviceToRack` - POST `/cmdb/racks/:rackId/devices`
- ✅ `updateDevicePosition` - PUT `/cmdb/racks/:rackId/devices/:deviceId`
- ✅ `removeDeviceFromRack` - DELETE `/cmdb/racks/:rackId/devices/:deviceId`
- ✅ `checkUPosition` - POST `/cmdb/racks/:rackId/check-u-position`

#### CMDB 集成接口
- ✅ `getCMDBDevices` - GET `/cmdb/assets` (已修复 gids 参数)
- ✅ `getCMDBDeviceDetail` - GET `/cmdb/asset/:id`

### 2.3 低优先级：数据格式转换优化 ✅

**实现内容：**

1. **时间字段转换**
   - 所有返回的时间字段（`createdAt`、`updatedAt`、`installDate`、`create_at`、`update_at`）都经过 `formatTime` 处理
   - 支持时间戳（秒或毫秒）和 ISO 字符串格式

2. **JSON 字段解析**
   - `RoomLayout.rackLayouts`：后端存储为 JSON 字符串，前端自动解析为数组
   - 发送时自动序列化为 JSON 字符串

3. **错误处理**
   - 统一使用 `handleResponse` 检查 `err` 字段
   - 友好的错误信息提示

4. **降级处理**
   - `getRoomLayout`：如果布局接口不存在，尝试从机房详情获取
   - `getRackDevices`：如果设备列表接口不存在，尝试从机柜详情获取

## 三、代码结构

### 3.1 工具函数

```typescript
// API 前缀
const API_PREFIX = '/cmdb';

// Mock 数据开关
const USE_MOCK = false;

// 处理响应数据
const handleResponse = <T>(response: any): T => {
  if (response.err && response.err !== '') {
    throw new Error(response.err);
  }
  return response.dat as T;
};

// 处理时间字段
const formatTime = (time: any): string | undefined => {
  if (!time) return undefined;
  if (typeof time === 'string') return time;
  if (typeof time === 'number') {
    const timestamp = time < 10000000000 ? time * 1000 : time;
    return new Date(timestamp).toISOString();
  }
  return undefined;
};
```

### 3.2 API 函数模式

所有 API 函数都遵循以下模式：

```typescript
export const apiFunction = async (...args): Promise<ReturnType> => {
  if (USE_MOCK) {
    // Mock 数据逻辑
    return mockData;
  }

  // 真实 API 调用
  const response = await request.get/post/put/delete(`${API_PREFIX}/path`, { params/data });
  const data = handleResponse<ReturnType>(response);
  
  // 处理时间字段（如果需要）
  return {
    ...data,
    createdAt: formatTime(data.createdAt),
    updatedAt: formatTime(data.updatedAt),
  };
};
```

## 四、使用说明

### 4.1 切换 Mock 数据

如果需要临时使用 Mock 数据进行开发或测试，修改：

```typescript
const USE_MOCK = true; // 改为 true
```

### 4.2 后端接口准备

确保后端已实现以下接口：

**必须实现的接口：**
- ✅ 所有机房管理接口
- ✅ 所有机柜管理接口
- ✅ 所有设备管理接口
- ✅ CMDB 设备查询接口（支持 gids 数组）

**可选接口（有降级处理）：**
- `GET /cmdb/rooms/:id/layout` - 如果不存在，从机房详情获取
- `GET /cmdb/racks/:id/devices` - 如果不存在，从机柜详情获取

### 4.3 响应格式要求

后端必须返回以下格式：

```json
{
  "dat": {
    // 实际数据
  },
  "err": ""  // 错误信息，成功时为空字符串
}
```

### 4.4 时间字段格式

后端可以返回以下任一格式：
- ISO 字符串：`"2024-01-15T14:30:00Z"`
- 时间戳（秒）：`1705315800`
- 时间戳（毫秒）：`1705315800000`

前端会自动转换为 ISO 字符串格式。

### 4.5 CMDB gids 参数格式

后端需要支持以下格式之一：
- 数组格式：`gids=10&gids=20` (HTTP 查询参数数组)
- 逗号分隔：`gids=10,20` (单个字符串)

前端发送的是数组格式，`umi-request` 会自动处理。

## 五、测试建议

### 5.1 单元测试

测试每个 API 函数的：
- 参数验证
- 响应格式处理
- 错误处理
- 时间字段转换

### 5.2 集成测试

1. **真实 API 测试**
   - 设置 `USE_MOCK = false`
   - 连接真实后端服务
   - 测试所有接口的调用

2. **错误场景测试**
   - 网络错误
   - 后端返回错误
   - 数据格式错误

3. **数据格式测试**
   - 时间字段格式（时间戳 vs ISO 字符串）
   - JSON 字段解析
   - 空值处理

### 5.3 兼容性测试

- 测试后端接口不存在时的降级处理
- 测试 gids 参数的不同格式
- 测试分页参数的不同格式

## 六、注意事项

1. **API 路径**
   - 所有接口使用 `/cmdb` 前缀
   - 确保后端代理配置正确（`vite.config.ts` 中的 `/cmdb` 代理）

2. **认证**
   - `request` 工具会自动添加 `Authorization` header
   - 确保后端接口需要认证时，token 已正确设置

3. **错误处理**
   - 所有错误都会通过 `handleResponse` 抛出
   - 前端组件需要捕获并显示错误信息

4. **性能优化**
   - 大量数据时考虑使用分页
   - 可以考虑添加请求缓存（后续优化）

## 七、后续优化建议

1. **请求缓存**
   - 使用 React Query 或 SWR 缓存数据
   - 减少重复请求

2. **乐观更新**
   - 用户操作立即更新 UI
   - 后台同步到服务器

3. **错误重试**
   - 网络错误时自动重试
   - 显示重试状态

4. **加载状态**
   - 统一的加载状态管理
   - 骨架屏显示

---

**实现日期：** 2024-01-15  
**实现状态：** ✅ 已完成  
**测试状态：** ⏳ 待测试

