# 后端缺失接口设计文档

## 一、文档说明

本文档基于 `doc/api-integration-check.md` 检查报告，详细设计后端缺失的接口，可直接用于后端开发实现。

**缺失接口列表：**
1. 机柜列表接口 `GET /cmdb/racks`
2. 批量添加机柜到机房接口 `POST /cmdb/rooms/:id/racks/batch`
3. 机柜设备列表接口（可选）`GET /cmdb/racks/:id/devices`
4. 获取机房布局接口（可选）`GET /cmdb/rooms/:id/layout`

**需要修复的问题：**
1. CMDB 设备查询接口 `gids` 参数格式（支持数组）
2. 统一分页参数格式

---

## 二、机柜列表接口

### 2.1 接口定义

```
GET /cmdb/racks
```

### 2.2 功能说明

查询机柜列表，支持分页、搜索、筛选，返回机柜基本信息及关联的机房名称。

### 2.3 请求参数

**Query Parameters:**

| 参数名      | 类型   | 必填 | 说明                                                         |
| ----------- | ------ | ---- | ------------------------------------------------------------ |
| page        | int    | 否   | 页码，从 1 开始，默认 1                                       |
| pageSize    | int    | 否   | 每页数量，默认 20，最大 100                                   |
| keyword     | string | 否   | 搜索关键词，支持机柜编号、名称、所属机房名称的模糊搜索        |
| status      | string | 否   | 状态筛选，可选值：`active`、`inactive`、`maintenance`         |
| roomId      | int64  | 否   | 所属机房 ID，筛选特定机房的机柜                              |
| uUsageRate  | string | 否   | U 位使用率筛选，可选值：`<50`、`50-80`、`80-95`、`>95`        |
| powerUsageRate | string | 否   | 功率使用率筛选，可选值：`<50`、`50-80`、`80-95`、`>95`    |

### 2.4 响应格式

**成功响应：**

```json
{
  "dat": {
    "list": [
      {
        "id": 101,
        "roomId": 1,
        "name": "A01",
        "code": "RACK-A01",
        "positionX": 10.5,
        "positionY": 5.2,
        "rotation": 0,
        "totalU": 42,
        "usedU": 15,
        "powerCapacity": 10.0,
        "powerUsed": 3.5,
        "networkPorts": 48,
        "networkPortsUsed": 20,
        "status": "active",
        "description": "核心机房A的A01机柜",
        "roomName": "核心机房A",
        "deviceCount": 5,
        "createdAt": "2024-01-01T10:00:00Z",
        "updatedAt": "2024-01-15T14:30:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  },
  "err": ""
}
```

**错误响应：**

```json
{
  "dat": null,
  "err": "参数错误：pageSize 不能超过 100"
}
```

### 2.5 业务逻辑

1. **数据查询：**
   - 查询 `racks` 表，LEFT JOIN `rooms` 表获取机房名称
   - 统计每个机柜的设备数量（COUNT `rack_devices`）
   - 计算 U 位使用率：`usedU / totalU`
   - 计算功率使用率：`powerUsed / powerCapacity`

2. **搜索逻辑：**
   - `keyword` 参数：在机柜编号（`code`）、机柜名称（`name`）、机房名称（`rooms.name`）中模糊匹配
   - 使用 SQL `LIKE` 或全文索引（如果支持）

3. **筛选逻辑：**
   - `status`：精确匹配机柜状态
   - `roomId`：精确匹配所属机房 ID
   - `uUsageRate`：计算使用率后按范围筛选
     - `<50`：使用率 < 0.5
     - `50-80`：0.5 <= 使用率 < 0.8
     - `80-95`：0.8 <= 使用率 < 0.95
     - `>95`：使用率 >= 0.95
   - `powerUsageRate`：同上逻辑

4. **排序：**
   - 默认按 `id` 降序（最新在前）
   - 可选：按 `code`、`name`、`usedU`、`powerUsed` 排序

5. **分页：**
   - 使用 `LIMIT` 和 `OFFSET` 实现分页
   - `OFFSET = (page - 1) * pageSize`

### 2.6 数据验证

- `page`：必须 >= 1，默认 1
- `pageSize`：必须 >= 1 且 <= 100，默认 20
- `status`：必须是有效枚举值，否则忽略该筛选条件
- `roomId`：必须是有效的 int64，如果不存在则返回空列表
- `uUsageRate`、`powerUsageRate`：必须是有效范围值，否则忽略

### 2.7 SQL 查询示例

```sql
SELECT 
    r.id,
    r.room_id,
    r.name,
    r.code,
    r.position_x,
    r.position_y,
    r.rotation,
    r.total_u,
    r.used_u,
    r.power_capacity,
    r.power_used,
    r.network_ports,
    r.network_ports_used,
    r.status,
    r.description,
    r.created_at,
    r.updated_at,
    room.name AS room_name,
    COUNT(rd.id) AS device_count
FROM racks r
LEFT JOIN rooms room ON r.room_id = room.id
LEFT JOIN rack_devices rd ON r.id = rd.rack_id AND rd.deleted_at IS NULL
WHERE r.deleted_at IS NULL
    AND (r.code LIKE '%keyword%' OR r.name LIKE '%keyword%' OR room.name LIKE '%keyword%')
    AND (status IS NULL OR r.status = status)
    AND (room_id IS NULL OR r.room_id = room_id)
GROUP BY r.id, room.name
HAVING (u_usage_rate IS NULL OR 
    (u_usage_rate = '<50' AND (r.used_u / r.total_u) < 0.5) OR
    (u_usage_rate = '50-80' AND (r.used_u / r.total_u) >= 0.5 AND (r.used_u / r.total_u) < 0.8) OR
    (u_usage_rate = '80-95' AND (r.used_u / r.total_u) >= 0.8 AND (r.used_u / r.total_u) < 0.95) OR
    (u_usage_rate = '>95' AND (r.used_u / r.total_u) >= 0.95))
ORDER BY r.id DESC
LIMIT pageSize OFFSET (page - 1) * pageSize;
```

### 2.8 错误码

- `10001`：参数错误（如 pageSize > 100）
- `20001`：数据库查询错误

---

## 三、批量添加机柜到机房接口

### 3.1 接口定义

```
POST /cmdb/rooms/:id/racks/batch
```

### 3.2 功能说明

批量将多个机柜添加到指定机房，更新机柜的 `roomId` 字段。如果机柜已属于其他机房，需要提示用户确认（或直接覆盖）。

### 3.3 路径参数

| 参数名 | 类型  | 必填 | 说明     |
| ------ | ----- | ---- | -------- |
| id     | int64 | 是   | 机房 ID  |

### 3.4 请求体

```json
{
  "rackIds": [101, 102, 103]
}
```

**请求体字段说明：**

| 字段名  | 类型     | 必填 | 说明           |
| ------- | -------- | ---- | -------------- |
| rackIds | int64[]  | 是   | 机柜 ID 数组   |

### 3.5 响应格式

**成功响应：**

```json
{
  "dat": {
    "successCount": 3,
    "failedCount": 0,
    "results": [
      {
        "rackId": 101,
        "success": true,
        "message": "机柜已添加到机房"
      },
      {
        "rackId": 102,
        "success": true,
        "message": "机柜已添加到机房"
      },
      {
        "rackId": 103,
        "success": true,
        "message": "机柜已添加到机房"
      }
    ]
  },
  "err": ""
}
```

**部分成功响应：**

```json
{
  "dat": {
    "successCount": 2,
    "failedCount": 1,
    "results": [
      {
        "rackId": 101,
        "success": true,
        "message": "机柜已添加到机房"
      },
      {
        "rackId": 102,
        "success": false,
        "message": "机柜不存在"
      },
      {
        "rackId": 103,
        "success": true,
        "message": "机柜已添加到机房"
      }
    ]
  },
  "err": ""
}
```

**错误响应：**

```json
{
  "dat": null,
  "err": "机房不存在"
}
```

### 3.6 业务逻辑

1. **参数验证：**
   - 验证机房 ID 是否存在
   - 验证 `rackIds` 数组不为空，且每个 ID 都是有效的 int64

2. **批量处理：**
   - 遍历 `rackIds` 数组
   - 对每个机柜 ID：
     - 验证机柜是否存在
     - 如果机柜已属于其他机房，记录警告信息（但不阻止操作）
     - 更新机柜的 `roomId` 字段
     - 更新机柜的 `updated_at` 字段

3. **事务处理：**
   - 使用数据库事务确保数据一致性
   - 如果部分机柜更新失败，回滚所有操作（或记录失败信息，继续处理其他机柜）

4. **返回结果：**
   - 返回每个机柜的处理结果
   - 统计成功和失败的数量

### 3.7 数据验证

- `id`（机房 ID）：必须存在且未删除
- `rackIds`：数组不能为空，最多 100 个
- `rackIds` 中的每个 ID：必须存在且未删除

### 3.8 SQL 更新示例

```sql
-- 验证机房存在
SELECT id FROM rooms WHERE id = ? AND deleted_at IS NULL;

-- 批量更新机柜
UPDATE racks 
SET room_id = ?, updated_at = NOW()
WHERE id IN (?, ?, ?) AND deleted_at IS NULL;
```

### 3.9 错误码

- `10001`：参数错误（rackIds 为空或超过限制）
- `10002`：机房不存在
- `10003`：部分机柜不存在
- `20001`：数据库更新错误

### 3.10 注意事项

1. **机柜已属于其他机房：**
   - 方案 A：直接覆盖，更新 `roomId`（推荐）
   - 方案 B：返回错误，提示用户先移除机柜
   - 方案 C：返回警告信息，但继续操作

2. **机柜已属于当前机房：**
   - 可以跳过，或返回提示信息

3. **性能优化：**
   - 如果机柜数量较多（> 50），考虑分批处理
   - 使用批量更新 SQL 语句

---

## 四、机柜设备列表接口（可选）

### 4.1 接口定义

```
GET /cmdb/racks/:id/devices
```

### 4.2 功能说明

获取指定机柜的设备列表。如果机柜详情接口已返回设备列表，此接口可选。

### 4.3 路径参数

| 参数名 | 类型  | 必填 | 说明    |
| ------ | ----- | ---- | ------- |
| id     | int64 | 是   | 机柜 ID |

### 4.4 请求参数

**Query Parameters:**

| 参数名   | 类型   | 必填 | 说明                           |
| -------- | ------ | ---- | ------------------------------ |
| keyword  | string | 否   | 搜索关键词，支持设备名称、IP   |
| status   | string | 否   | 状态筛选：`online`、`offline`、`maintenance` |

### 4.5 响应格式

**成功响应：**

```json
{
  "dat": {
    "list": [
      {
        "id": 1,
        "rackId": 101,
        "deviceId": 1001,
        "deviceName": "server-001",
        "startU": 5,
        "heightU": 2,
        "deviceType": "server",
        "status": "online",
        "installDate": "2024-01-10",
        "createdAt": "2024-01-10T10:00:00Z",
        "updatedAt": "2024-01-15T14:30:00Z"
      }
    ],
    "total": 10
  },
  "err": ""
}
```

### 4.6 业务逻辑

1. **数据查询：**
   - 查询 `rack_devices` 表，过滤 `rack_id = id` 且未删除的记录
   - 可选：JOIN `asset` 表获取设备详细信息（如果 `deviceName` 和 `deviceType` 需要从 CMDB 获取）

2. **搜索和筛选：**
   - `keyword`：在设备名称中模糊匹配
   - `status`：精确匹配设备状态

3. **排序：**
   - 默认按 `startU` 升序（从上到下）

### 4.7 SQL 查询示例

```sql
SELECT 
    rd.id,
    rd.rack_id,
    rd.device_id,
    rd.device_name,
    rd.start_u,
    rd.height_u,
    rd.device_type,
    rd.status,
    rd.install_date,
    rd.created_at,
    rd.updated_at
FROM rack_devices rd
WHERE rd.rack_id = ? 
    AND rd.deleted_at IS NULL
    AND (keyword IS NULL OR rd.device_name LIKE '%keyword%')
    AND (status IS NULL OR rd.status = status)
ORDER BY rd.start_u ASC;
```

### 4.8 错误码

- `10002`：机柜不存在
- `20001`：数据库查询错误

---

## 五、获取机房布局接口（可选）

### 5.1 接口定义

```
GET /cmdb/rooms/:id/layout
```

### 5.2 功能说明

获取指定机房的布局信息。如果机房详情接口已返回布局信息，此接口可选。

### 5.3 路径参数

| 参数名 | 类型  | 必填 | 说明    |
| ------ | ----- | ---- | ------- |
| id     | int64 | 是   | 机房 ID |

### 5.4 响应格式

**成功响应：**

```json
{
  "dat": {
    "id": 1,
    "roomId": 1,
    "canvasScale": 1.0,
    "canvasX": 0,
    "canvasY": 0,
    "rackLayouts": [
      {
        "rackId": 101,
        "x": 10.5,
        "y": 5.2,
        "rotation": 0
      },
      {
        "rackId": 102,
        "x": 15.0,
        "y": 5.2,
        "rotation": 0
      }
    ],
    "updatedAt": "2024-01-15T14:30:00Z"
  },
  "err": ""
}
```

**注意：** `rackLayouts` 字段在后端存储为 JSON 字符串，返回时需要解析为数组。

### 5.5 业务逻辑

1. **数据查询：**
   - 查询 `room_layouts` 表，过滤 `room_id = id`
   - 如果不存在，返回默认布局（`canvasScale: 1.0, canvasX: 0, canvasY: 0, rackLayouts: []`）

2. **JSON 解析：**
   - 将 `rack_layouts` 字段（JSON 字符串）解析为数组
   - 如果解析失败，返回空数组

### 5.6 SQL 查询示例

```sql
SELECT 
    id,
    room_id,
    canvas_scale,
    canvas_x,
    canvas_y,
    rack_layouts,
    updated_at
FROM room_layouts
WHERE room_id = ?;
```

### 5.7 错误码

- `10002`：机房不存在
- `20001`：数据库查询错误

---

## 六、CMDB 设备查询接口修复

### 6.1 接口定义

```
GET /cmdb/assets
```

### 6.2 问题说明

**当前定义：**
- `gids: int64` (单个值，必填)

**前端需求：**
- `gids?: number[]` (数组，可选)

**修复方案：** 支持数组格式，同时保持向后兼容。

### 6.3 修复后的请求参数

**Query Parameters:**

| 参数名 | 类型        | 必填 | 说明                                                         |
| ------ | ----------- | ---- | ------------------------------------------------------------ |
| gids   | int64[]     | 否   | 资产模型 ID 数组，支持多个值，如：`gids=10&gids=20` 或 `gids=10,20` |
| query  | string      | 否   | 搜索关键词，支持名称、IP、标签搜索                           |
| limit  | int         | 否   | 每页数量，默认 3000，最大 10000                               |
| offset | int         | 否   | 偏移量，默认 0                                                |
| order  | string      | 否   | 排序字段，默认 `create_at`                                   |
| desc   | bool        | 否   | 是否降序，默认 false                                          |

### 6.4 参数处理逻辑

1. **gids 参数解析：**
   - 支持两种格式：
     - 数组格式：`gids=10&gids=20`（HTTP 查询参数数组）
     - 逗号分隔：`gids=10,20`（单个字符串，逗号分隔）
   - 如果未提供 `gids`，返回所有设备（或返回错误，根据业务需求）

2. **SQL 查询：**
   ```sql
   SELECT * FROM assets
   WHERE deleted_at IS NULL
       AND (gids IS NULL OR gid IN (10, 20, ...))
       AND (query IS NULL OR name LIKE '%query%' OR ip LIKE '%query%')
   ORDER BY create_at DESC
   LIMIT limit OFFSET offset;
   ```

### 6.5 向后兼容

- 如果只提供一个 `gids` 值（单个 int64），仍然支持
- 如果提供多个值，使用 `IN` 查询

---

## 七、分页参数统一

### 7.1 当前状态

- 机房列表：使用 `page/pageSize`
- 机柜列表：使用 `page/pageSize`（新接口）
- CMDB 设备列表：使用 `limit/offset`

### 7.2 统一方案

**方案 A：统一使用 `page/pageSize`（推荐）**

- 优点：更符合用户习惯，前端更容易实现分页组件
- 缺点：需要修改 CMDB 设备查询接口

**方案 B：统一使用 `limit/offset`**

- 优点：更灵活，适合复杂查询
- 缺点：前端需要计算 offset

**推荐方案 A**，理由：
1. 用户体验更好（显示页码）
2. 前端实现更简单
3. 符合 RESTful API 常见实践

### 7.3 CMDB 设备查询接口修改

**修改前：**
```
GET /cmdb/assets?gids=10&limit=100&offset=0
```

**修改后：**
```
GET /cmdb/assets?gids=10&page=1&pageSize=100
```

**内部转换：**
```go
offset = (page - 1) * pageSize
limit = pageSize
```

---

## 八、实现建议

### 8.1 开发优先级

1. **高优先级（必须实现）：**
   - 机柜列表接口 `GET /cmdb/racks`
   - 批量添加机柜接口 `POST /cmdb/rooms/:id/racks/batch`
   - CMDB `gids` 参数修复（支持数组）

2. **中优先级（建议实现）：**
   - 机柜设备列表接口 `GET /cmdb/racks/:id/devices`
   - 获取机房布局接口 `GET /cmdb/rooms/:id/layout`
   - 统一分页参数（CMDB 接口改为 `page/pageSize`）

### 8.2 技术实现要点

1. **数据库查询优化：**
   - 使用索引：`racks.room_id`、`racks.status`、`racks.code`
   - 避免 N+1 查询：使用 JOIN 或预加载
   - 大数据量时使用分页

2. **事务处理：**
   - 批量操作使用数据库事务
   - 确保数据一致性

3. **错误处理：**
   - 统一的错误码定义
   - 友好的错误信息
   - 详细的错误日志

4. **性能优化：**
   - 缓存常用查询结果（如机房列表）
   - 批量操作分批处理（避免超时）

### 8.3 测试要点

1. **单元测试：**
   - 参数验证测试
   - 业务逻辑测试
   - 边界条件测试

2. **集成测试：**
   - 数据库操作测试
   - 事务回滚测试
   - 并发操作测试

3. **性能测试：**
   - 大数据量查询测试
   - 批量操作性能测试

---

## 九、接口汇总表

| 接口路径                              | 方法 | 优先级 | 状态 |
| ------------------------------------- | ---- | ------ | ---- |
| `/cmdb/racks`                         | GET  | 高     | 缺失 |
| `/cmdb/rooms/:id/racks/batch`         | POST | 高     | 缺失 |
| `/cmdb/racks/:id/devices`             | GET  | 中     | 可选 |
| `/cmdb/rooms/:id/layout`              | GET  | 中     | 可选 |
| `/cmdb/assets` (修复 gids 参数)       | GET  | 高     | 需修复 |
| `/cmdb/assets` (统一分页参数)         | GET  | 中     | 需修复 |

---

## 十、附录

### 10.1 错误码定义

| 错误码 | 说明           |
| ------ | -------------- |
| 10001  | 参数错误       |
| 10002  | 数据不存在     |
| 10003  | 数据已存在     |
| 10004  | U 位冲突       |
| 10005  | 容量不足       |
| 20001  | 数据库错误     |
| 20002  | CMDB 接口错误  |
| 30001  | 权限不足       |

### 10.2 时间字段格式

**建议：** 统一使用 ISO 8601 格式字符串
- 格式：`2024-01-15T14:30:00Z`
- Go 实现：`time.Now().Format(time.RFC3339)`

### 10.3 JSON 字段处理

**RoomLayout.rackLayouts：**
- 存储：JSON 字符串
- 返回：解析为数组
- Go 实现：
  ```go
  // 存储
  rackLayoutsJSON, _ := json.Marshal(rackLayouts)
  
  // 返回
  json.Unmarshal(rackLayoutsJSON, &rackLayouts)
  ```

---

**文档版本：** v1.0  
**创建日期：** 2024-01-15  
**最后更新：** 2024-01-15

