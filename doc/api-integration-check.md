# 前后端接口对接检查报告

## 一、API 路径对比

### 1.1 机房管理接口

| 功能         | 前端期望 | 后端定义                         | 状态      |
| ------------ | -------- | -------------------------------- | --------- |
| 获取机房列表 | 未定义   | `GET /cmdb/rooms`                | ⚠️ 需实现 |
| 获取机房详情 | 未定义   | `GET /cmdb/rooms/:id`            | ⚠️ 需实现 |
| 创建机房     | 未定义   | `POST /cmdb/rooms`               | ⚠️ 需实现 |
| 更新机房     | 未定义   | `PUT /cmdb/rooms/:id`            | ⚠️ 需实现 |
| 删除机房     | 未定义   | `DELETE /cmdb/rooms/:id`         | ⚠️ 需实现 |
| 获取机房统计 | 未定义   | `GET /cmdb/rooms/:id/statistics` | ⚠️ 需实现 |
| 获取机房布局 | 未定义   | 后端未单独定义（应在详情中返回） | ⚠️ 需确认 |
| 更新机房布局 | 未定义   | `PUT /cmdb/rooms/:id/layout`     | ⚠️ 需实现 |

### 1.2 机柜管理接口

| 功能               | 前端期望 | 后端定义                         | 状态      |
| ------------------ | -------- | -------------------------------- | --------- |
| 获取机柜列表       | 未定义   | 后端未定义（需补充）             | ❌ 缺失   |
| 获取机柜详情       | 未定义   | `GET /cmdb/racks/:id`            | ⚠️ 需实现 |
| 创建机柜           | 未定义   | `POST /cmdb/racks`               | ⚠️ 需实现 |
| 更新机柜           | 未定义   | `PUT /cmdb/racks/:id`            | ⚠️ 需实现 |
| 删除机柜           | 未定义   | `DELETE /cmdb/racks/:id`         | ⚠️ 需实现 |
| 获取机柜统计       | 未定义   | `GET /cmdb/racks/:id/statistics` | ⚠️ 需实现 |
| 批量添加机柜到机房 | 未定义   | 后端未定义（需补充）             | ❌ 缺失   |

### 1.3 设备管理接口

| 功能             | 前端期望 | 后端定义                                       | 状态      |
| ---------------- | -------- | ---------------------------------------------- | --------- |
| 获取机柜设备列表 | 未定义   | 后端未单独定义（应在机柜详情中返回）           | ⚠️ 需确认 |
| 添加设备到机柜   | 未定义   | `POST /cmdb/racks/:rackId/devices`             | ⚠️ 需实现 |
| 更新设备位置     | 未定义   | `PUT /cmdb/racks/:rackId/devices/:deviceId`    | ⚠️ 需实现 |
| 从机柜移除设备   | 未定义   | `DELETE /cmdb/racks/:rackId/devices/:deviceId` | ⚠️ 需实现 |
| 验证 U 位占用    | 未定义   | `POST /cmdb/racks/:rackId/check-u-position`    | ⚠️ 需实现 |

### 1.4 CMDB 集成接口

| 功能               | 前端期望 | 后端定义              | 状态      |
| ------------------ | -------- | --------------------- | --------- |
| 获取 CMDB 设备列表 | 未定义   | `GET /cmdb/assets`    | ⚠️ 需实现 |
| 获取 CMDB 设备详情 | 未定义   | `GET /cmdb/asset/:id` | ⚠️ 需实现 |

---

## 二、数据结构对比

### 2.1 机房 (Room)

| 字段           | 前端类型   | 后端类型  | 匹配情况                |
| -------------- | ---------- | --------- | ----------------------- |
| id             | number     | int64     | ✅ 匹配                 |
| name           | string     | string    | ✅ 匹配                 |
| code           | string     | string    | ✅ 匹配                 |
| address        | string?    | string    | ✅ 匹配                 |
| area           | number?    | float64   | ✅ 匹配                 |
| type           | RoomType?  | string    | ✅ 匹配（需确认枚举值） |
| level          | RoomLevel? | string    | ✅ 匹配（需确认枚举值） |
| status         | RoomStatus | string    | ✅ 匹配                 |
| contact        | string?    | string    | ✅ 匹配                 |
| contactPhone   | string?    | string    | ✅ 匹配                 |
| description    | string?    | string    | ✅ 匹配                 |
| createdAt      | string?    | time.Time | ⚠️ 需转换（ISO 字符串） |
| updatedAt      | string?    | time.Time | ⚠️ 需转换（ISO 字符串） |
| rackCount      | number?    | -         | ⚠️ 关联数据，需计算     |
| deviceCount    | number?    | -         | ⚠️ 关联数据，需计算     |
| uUsageRate     | number?    | -         | ⚠️ 关联数据，需计算     |
| powerUsageRate | number?    | -         | ⚠️ 关联数据，需计算     |

**问题：**

- 后端返回的时间字段可能是时间戳或 ISO 字符串，需确认格式
- 关联数据（rackCount 等）需要在查询时计算或通过统计接口获取

### 2.2 机柜 (Rack)

| 字段             | 前端类型   | 后端类型  | 匹配情况                  |
| ---------------- | ---------- | --------- | ------------------------- |
| id               | number     | int64     | ✅ 匹配                   |
| roomId           | number?    | int64     | ✅ 匹配                   |
| name             | string     | string    | ✅ 匹配                   |
| code             | string     | string    | ✅ 匹配                   |
| positionX        | number?    | float64   | ✅ 匹配                   |
| positionY        | number?    | float64   | ✅ 匹配                   |
| rotation         | number?    | int       | ✅ 匹配                   |
| totalU           | number     | int       | ✅ 匹配                   |
| usedU            | number?    | int       | ✅ 匹配                   |
| powerCapacity    | number?    | float64   | ✅ 匹配                   |
| powerUsed        | number?    | float64   | ✅ 匹配                   |
| networkPorts     | number?    | int       | ✅ 匹配                   |
| networkPortsUsed | number?    | int       | ✅ 匹配                   |
| status           | RackStatus | string    | ✅ 匹配                   |
| description      | string?    | string    | ✅ 匹配                   |
| createdAt        | string?    | time.Time | ⚠️ 需转换                 |
| updatedAt        | string?    | time.Time | ⚠️ 需转换                 |
| roomName         | string?    | -         | ⚠️ 关联数据，需 JOIN 查询 |
| deviceCount      | number?    | -         | ⚠️ 关联数据，需计算       |

**问题：**

- roomName 需要通过 JOIN 查询 rooms 表获取
- deviceCount 需要通过统计接口或关联查询获取

### 2.3 机柜设备 (RackDevice)

| 字段        | 前端类型     | 后端类型  | 匹配情况  |
| ----------- | ------------ | --------- | --------- |
| id          | number       | int64     | ✅ 匹配   |
| rackId      | number       | int64     | ✅ 匹配   |
| deviceId    | number       | int64     | ✅ 匹配   |
| deviceName  | string       | string    | ✅ 匹配   |
| startU      | number       | int       | ✅ 匹配   |
| heightU     | number       | int       | ✅ 匹配   |
| deviceType  | string?      | string    | ✅ 匹配   |
| status      | DeviceStatus | string    | ✅ 匹配   |
| installDate | string?      | time.Time | ⚠️ 需转换 |
| createdAt   | string?      | time.Time | ⚠️ 需转换 |
| updatedAt   | string?      | time.Time | ⚠️ 需转换 |

**问题：**

- deviceName 和 deviceType 需要从 CMDB 的 asset 表获取
- 后端可能不直接返回这些字段，需要前端处理

### 2.4 机房布局 (RoomLayout)

| 字段        | 前端类型         | 后端类型      | 匹配情况  |
| ----------- | ---------------- | ------------- | --------- |
| id          | number           | int64         | ✅ 匹配   |
| roomId      | number           | int64         | ✅ 匹配   |
| canvasScale | number           | float64       | ✅ 匹配   |
| canvasX     | number           | float64       | ✅ 匹配   |
| canvasY     | number           | float64       | ✅ 匹配   |
| rackLayouts | RackLayoutItem[] | string (JSON) | ⚠️ 需解析 |
| updatedAt   | string?          | time.Time     | ⚠️ 需转换 |

**问题：**

- 后端 `rackLayouts` 存储为 JSON 字符串，前端需要解析
- 前端发送时需要序列化为 JSON 字符串

### 2.5 统计数据结构

#### RoomStatistics

| 字段           | 前端类型 | 后端类型 | 匹配情况 |
| -------------- | -------- | -------- | -------- |
| rackTotal      | number   | int      | ✅ 匹配  |
| rackUsed       | number   | int      | ✅ 匹配  |
| rackAvailable  | number   | int      | ✅ 匹配  |
| deviceTotal    | number   | int      | ✅ 匹配  |
| uTotal         | number   | int      | ✅ 匹配  |
| uUsed          | number   | int      | ✅ 匹配  |
| uUsageRate     | number   | float64  | ✅ 匹配  |
| powerTotal     | number   | float64  | ✅ 匹配  |
| powerUsed      | number   | float64  | ✅ 匹配  |
| powerUsageRate | number   | float64  | ✅ 匹配  |
| alarmCount     | number?  | int?     | ✅ 匹配  |

#### RackStatistics

| 字段                  | 前端类型 | 后端类型 | 匹配情况 |
| --------------------- | -------- | -------- | -------- |
| deviceCount           | number   | int      | ✅ 匹配  |
| uUsed                 | number   | int      | ✅ 匹配  |
| uAvailable            | number   | int      | ✅ 匹配  |
| uUsageRate            | number   | float64  | ✅ 匹配  |
| powerUsed             | number   | float64  | ✅ 匹配  |
| powerAvailable        | number   | float64  | ✅ 匹配  |
| powerUsageRate        | number   | float64  | ✅ 匹配  |
| networkPortsUsed      | number   | int      | ✅ 匹配  |
| networkPortsAvailable | number   | int      | ✅ 匹配  |

---

## 三、响应格式对比

### 3.1 后端响应格式

根据后端文档，标准响应格式为：

```json
{
  "dat": {},
  "err": ""
}
```

### 3.2 前端请求工具处理

根据 `src/utils/request.tsx` 的代码，响应拦截器会处理：

- 如果 `data.err === ''` 或 `data.status === 'success'`，返回 `{ ...data, success: true }`
- 前端需要从 `data.dat` 中获取实际数据

**问题：**

- 前端代码中直接返回数据，未处理 `dat` 字段
- 需要修改 services.ts 中的响应处理逻辑

---

## 四、关键问题汇总

### 4.1 缺失的接口

1. **机柜列表接口** - 后端文档未定义，前端需要

   - 建议：`GET /cmdb/racks`（支持分页、搜索、筛选）

2. **批量添加机柜到机房接口** - 后端文档未定义，前端需要

   - 建议：`POST /cmdb/rooms/:id/racks/batch` 或 `POST /cmdb/racks/batch-assign`

3. **获取机柜设备列表接口** - 后端文档未单独定义

   - 当前：在机柜详情中返回 devices 数组
   - 建议：如果需要单独查询，可添加 `GET /cmdb/racks/:id/devices`

4. **获取机房布局接口** - 后端文档未单独定义
   - 当前：在机房详情中返回 layout 对象
   - 建议：如果需要单独查询，可添加 `GET /cmdb/rooms/:id/layout`

### 4.2 数据结构问题

1. **时间字段格式**

   - 后端：`time.Time` (Go 类型)
   - 前端：`string` (ISO 字符串)
   - 需要确认后端返回格式（时间戳还是 ISO 字符串）

2. **JSON 字段解析**

   - `RoomLayout.rackLayouts`：后端存储为 JSON 字符串，需要解析
   - `CMDBAsset.data`：后端存储为 JSON 对象，前端已正确处理

3. **关联数据获取**
   - `Room.rackCount`、`deviceCount` 等：需要计算或通过统计接口获取
   - `Rack.roomName`：需要通过 JOIN 查询获取

### 4.3 响应格式问题

1. **响应数据提取**

   - 后端返回：`{ dat: {}, err: '' }`
   - 前端需要：从 `response.dat` 中提取数据
   - 当前代码：直接返回数据，未处理响应格式

2. **错误处理**
   - 后端错误：通过 `err` 字段返回
   - 前端需要：检查 `err` 字段并抛出错误

### 4.4 参数格式问题

1. **CMDB 设备查询参数 - 严重不匹配**

   - 前端：`gids?: number[]` (数组，可选)
   - 后端：`gids: int64` (单个值，必填)
   - **问题**：
     - 类型不匹配：数组 vs 单个值
     - 必填性不匹配：可选 vs 必填
   - **解决方案**：
     - 方案 A：后端支持数组 `gids: int64[]`（推荐）
     - 方案 B：前端改为单个值，需要多个时循环调用
     - 方案 C：前端改为单个值，后端改为可选

2. **分页参数不匹配**
   - 前端：`page`, `pageSize`（机房、机柜列表）
   - 前端：`limit`, `offset`（CMDB 设备列表）
   - 后端：`page`, `pageSize`（机房列表）
   - 后端：`limit`, `offset`（CMDB 设备列表）
   - **问题**：机房和机柜列表的分页参数不一致
   - **解决方案**：统一使用 `page/pageSize` 或 `limit/offset`

---

## 五、修复建议

### 5.1 前端代码修复

1. **实现真实 API 调用**

   - 在 `services.ts` 中取消注释真实 API 调用
   - 添加 API 路径前缀：`/api/n9e/cmdb` 或 `/api/cmdb`

2. **处理响应格式**

   ```typescript
   // 修改前
   return request.get(`${API_PREFIX}/rooms`, { params });

   // 修改后
   const response = await request.get(`${API_PREFIX}/rooms`, { params });
   if (response.err) {
     throw new Error(response.err);
   }
   return response.dat;
   ```

3. **处理时间字段**

   - 如果后端返回时间戳，需要转换为 ISO 字符串
   - 如果后端返回 ISO 字符串，直接使用

4. **处理 JSON 字段**
   - `RoomLayout.rackLayouts`：需要 `JSON.parse()` 解析
   - 发送时：需要 `JSON.stringify()` 序列化

### 5.2 后端接口补充

1. **机柜列表接口**

   ```
   GET /cmdb/racks
   Query Parameters:
     - page: int
     - pageSize: int
     - keyword: string
     - status: string
     - roomId: int64
   ```

2. **批量添加机柜接口**

   ```
   POST /cmdb/rooms/:id/racks/batch
   Body:
     {
       "rackIds": [1, 2, 3]
     }
   ```

3. **机柜设备列表接口（可选）**
   ```
   GET /cmdb/racks/:id/devices
   ```

### 5.3 数据类型确认

1. **时间字段格式**：确认后端返回的是 ISO 字符串还是时间戳
2. **CMDB gids 参数**：确认是否支持数组，还是需要循环调用
3. **分页参数**：确认使用 `page/pageSize` 还是 `limit/offset`

---

## 六、对接检查清单

### 6.1 必须修复的问题

- [ ] 实现真实 API 调用（替换 mock 数据）
- [ ] 处理响应格式（提取 `dat` 字段）
- [ ] 处理错误响应（检查 `err` 字段）
- [ ] 处理时间字段格式转换
- [ ] 处理 `RoomLayout.rackLayouts` JSON 解析
- [ ] **修复 CMDB `gids` 参数不匹配问题**（数组 vs 单个值）
- [ ] 统一分页参数格式（`page/pageSize` vs `limit/offset`）

### 6.2 后端需要补充的接口

- [ ] 机柜列表接口 `GET /cmdb/racks`
- [ ] 批量添加机柜接口 `POST /cmdb/rooms/:id/racks/batch`
- [ ] 机柜设备列表接口（可选）`GET /cmdb/racks/:id/devices`

### 6.3 需要确认的问题

- [ ] 时间字段返回格式（ISO 字符串 vs 时间戳）
- [ ] **CMDB `gids` 参数格式**（必须确认：数组 vs 单个值，必填 vs 可选）
- [ ] **分页参数统一**（统一使用 `page/pageSize` 或 `limit/offset`）
- [ ] 关联数据（roomName, rackCount 等）的获取方式

---

## 七、建议的修复方案

### 7.1 前端 services.ts 修复示例

```typescript
const API_PREFIX = '/api/n9e/cmdb';

// 处理响应数据
const handleResponse = <T>(response: any): T => {
  if (response.err) {
    throw new Error(response.err);
  }
  return response.dat as T;
};

export const getRoomList = async (params: RoomListParams): Promise<RoomListResponse> => {
  const response = await request.get(`${API_PREFIX}/rooms`, { params });
  return handleResponse<RoomListResponse>(response);
};

export const getRoomLayout = async (id: number): Promise<RoomLayout | null> => {
  const response = await request.get(`${API_PREFIX}/rooms/${id}/layout`);
  const data = handleResponse<RoomLayout>(response);
  // 解析 rackLayouts JSON字符串
  if (data.rackLayouts && typeof data.rackLayouts === 'string') {
    data.rackLayouts = JSON.parse(data.rackLayouts);
  }
  return data;
};

export const updateRoomLayout = async (id: number, layout: RoomLayoutData): Promise<void> => {
  // 序列化 rackLayouts
  const payload = {
    ...layout,
    rackLayouts: JSON.stringify(layout.rackLayouts),
  };
  await request.put(`${API_PREFIX}/rooms/${id}/layout`, { data: payload });
};
```

### 7.2 后端接口补充建议

1. **机柜列表接口**

   - 路径：`GET /cmdb/racks`
   - 支持分页、搜索、筛选
   - 返回机柜列表及关联的机房名称

2. **批量添加机柜接口**
   - 路径：`POST /cmdb/rooms/:id/racks/batch`
   - 请求体：`{ "rackIds": [1, 2, 3] }`
   - 批量更新机柜的 `roomId` 字段

---

## 八、总结

### 8.1 主要问题

1. **前端未实现真实 API 调用**：当前使用 mock 数据，需要实现真实调用
2. **响应格式处理缺失**：未处理后端 `{ dat: {}, err: '' }` 格式
3. **后端接口缺失**：机柜列表接口、批量添加接口未定义
4. **数据格式转换**：时间字段、JSON 字段需要转换处理

### 8.2 修复优先级

**高优先级（必须修复）：**

1. **修复 CMDB `gids` 参数不匹配**（数组 vs 单个值，必填 vs 可选）
2. 实现真实 API 调用
3. 处理响应格式
4. 后端补充机柜列表接口
5. 统一分页参数格式

**中优先级（重要）：**

1. 处理时间字段格式
2. 处理 JSON 字段解析
3. 后端补充批量添加接口

**低优先级（可选）：**

1. 优化错误处理
2. 添加数据缓存
3. 性能优化

---

## 九、下一步行动

1. **前端开发**：

   - 修改 `services.ts`，实现真实 API 调用
   - 添加响应格式处理函数
   - 处理数据格式转换

2. **后端开发**：

   - 补充机柜列表接口
   - 补充批量添加机柜接口
   - 确认时间字段返回格式

3. **联调测试**：
   - 测试所有接口对接
   - 验证数据格式转换
   - 测试错误处理
