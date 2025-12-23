# SSH安全模块 - API接口文档

## 一、概述

SSH安全模块提供SSH命令黑名单管理和命令执行记录查询功能，确保SSH连接的安全性和可追溯性。

### 1.1 功能特性

- **命令黑名单管理**：支持精确匹配和正则匹配，可动态添加、修改、删除黑名单规则
- **命令拦截**：实时检查执行的命令，阻止危险操作
- **命令记录**：完整记录所有SSH命令执行历史，包括被阻止的命令
- **可追溯性**：支持按会话、资产、用户等维度查询命令记录

### 1.2 基础路径

所有接口的基础路径为：`/cmdb`

---

## 二、SSH命令黑名单管理接口

### 2.1 获取黑名单列表

**接口地址：** `GET /ssh/blacklist`

**接口描述：** 分页获取SSH命令黑名单列表，支持关键词搜索和状态筛选。

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| page | int | 否 | 页码，默认1 | 1 |
| pageSize | int | 否 | 每页数量，默认20 | 20 |
| keyword | string | 否 | 搜索关键词（匹配命令或备注） | "rm -rf" |
| enabled | string | 否 | 是否启用（true/false） | "true" |

**请求示例：**

```bash
GET /cmdb/ssh/blacklist?page=1&pageSize=20&keyword=rm&enabled=true
```

**响应示例：**

```json
{
  "dat": {
    "list": [
      {
        "id": 1,
        "command": "rm -rf",
        "pattern": "",
        "match_type": "exact",
        "enabled": true,
        "remark": "禁止删除操作",
        "create_at": 1703123456,
        "create_by": "admin",
        "update_at": 1703123456,
        "update_by": "admin"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

**响应字段说明：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int64 | 黑名单ID |
| command | string | 命令内容 |
| pattern | string | 正则匹配模式（match_type为regex时使用） |
| match_type | string | 匹配类型：exact（精确匹配）、regex（正则匹配） |
| enabled | bool | 是否启用 |
| remark | string | 备注说明 |
| create_at | int64 | 创建时间（Unix时间戳） |
| create_by | string | 创建人 |
| update_at | int64 | 更新时间（Unix时间戳） |
| update_by | string | 更新人 |

---

### 2.2 获取单个黑名单

**接口地址：** `GET /ssh/blacklist/:id`

**接口描述：** 根据ID获取单个黑名单详情。

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int64 | 是 | 黑名单ID |

**请求示例：**

```bash
GET /cmdb/ssh/blacklist/1
```

**响应示例：**

```json
{
  "dat": {
    "id": 1,
    "command": "rm -rf",
    "pattern": "",
    "match_type": "exact",
    "enabled": true,
    "remark": "禁止删除操作",
    "create_at": 1703123456,
    "create_by": "admin",
    "update_at": 1703123456,
    "update_by": "admin"
  }
}
```

---

### 2.3 添加黑名单

**接口地址：** `POST /ssh/blacklist`

**接口描述：** 添加新的SSH命令黑名单规则。

**请求体：**

```json
{
  "command": "rm -rf",
  "pattern": "",
  "match_type": "exact",
  "enabled": true,
  "remark": "禁止删除操作"
}
```

**请求字段说明：**

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| command | string | 是 | 命令内容 |
| pattern | string | 否 | 正则匹配模式（match_type为regex时使用） |
| match_type | string | 否 | 匹配类型：exact（精确匹配，默认）、regex（正则匹配） |
| enabled | bool | 否 | 是否启用，默认true |
| remark | string | 否 | 备注说明 |

**请求示例：**

```bash
curl -X POST /cmdb/ssh/blacklist \
  -H "Content-Type: application/json" \
  -d '{
    "command": "rm -rf",
    "match_type": "exact",
    "enabled": true,
    "remark": "禁止删除操作"
  }'
```

**响应示例：**

```json
{
  "dat": null,
  "err": null
}
```

---

### 2.4 更新黑名单

**接口地址：** `PUT /ssh/blacklist/:id`

**接口描述：** 更新指定的黑名单规则。

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int64 | 是 | 黑名单ID |

**请求体：**

```json
{
  "command": "rm -rf /",
  "pattern": "",
  "match_type": "exact",
  "enabled": true,
  "remark": "禁止删除根目录"
}
```

**请求示例：**

```bash
curl -X PUT /cmdb/ssh/blacklist/1 \
  -H "Content-Type: application/json" \
  -d '{
    "command": "rm -rf /",
    "match_type": "exact",
    "enabled": true,
    "remark": "禁止删除根目录"
  }'
```

**响应示例：**

```json
{
  "dat": null,
  "err": null
}
```

---

### 2.5 删除黑名单

**接口地址：** `DELETE /ssh/blacklist/:id`

**接口描述：** 删除指定的黑名单规则。

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int64 | 是 | 黑名单ID |

**请求示例：**

```bash
DELETE /cmdb/ssh/blacklist/1
```

**响应示例：**

```json
{
  "dat": null,
  "err": null
}
```

---

## 三、SSH命令执行记录查询接口

### 3.1 获取命令记录列表

**接口地址：** `GET /ssh/command-records`

**接口描述：** 分页获取SSH命令执行记录列表，支持多维度筛选。

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| page | int | 否 | 页码，默认1 | 1 |
| pageSize | int | 否 | 每页数量，默认20 | 20 |
| sessionId | string | 否 | 会话ID | "1234567890" |
| assetId | int64 | 否 | 资产ID | 100 |
| blocked | string | 否 | 是否被阻止（true/false） | "true" |
| keyword | string | 否 | 搜索关键词（匹配命令、资产名称或用户） | "ls" |
| startTime | int64 | 否 | 开始时间（Unix时间戳） | 1703123456 |
| endTime | int64 | 否 | 结束时间（Unix时间戳） | 1703209856 |

**请求示例：**

```bash
GET /cmdb/ssh/command-records?page=1&pageSize=20&blocked=false&startTime=1703123456&endTime=1703209856
```

**响应示例：**

```json
{
  "dat": {
    "list": [
      {
        "id": 1,
        "session_id": "1234567890",
        "asset_id": 100,
        "asset_name": "服务器-001",
        "command": "ls -la",
        "command_md5": "abc123def456",
        "blocked": false,
        "block_reason": "",
        "client_ip": "192.168.1.100",
        "user": "admin",
        "create_at": 1703123456
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

**响应字段说明：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int64 | 记录ID |
| session_id | string | 会话ID |
| asset_id | int64 | 资产ID |
| asset_name | string | 资产名称 |
| command | string | 执行的命令 |
| command_md5 | string | 命令MD5值 |
| blocked | bool | 是否被阻止 |
| block_reason | string | 阻止原因（被阻止时才有值） |
| client_ip | string | 客户端IP |
| user | string | 执行用户 |
| create_at | int64 | 执行时间（Unix时间戳） |

---

### 3.2 根据会话ID获取命令记录

**接口地址：** `GET /ssh/command-records/session/:sessionId`

**接口描述：** 获取指定会话的所有命令执行记录。

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sessionId | string | 是 | 会话ID |

**请求示例：**

```bash
GET /cmdb/ssh/command-records/session/1234567890
```

**响应示例：**

```json
{
  "dat": [
    {
      "id": 1,
      "session_id": "1234567890",
      "asset_id": 100,
      "asset_name": "服务器-001",
      "command": "ls -la",
      "command_md5": "abc123def456",
      "blocked": false,
      "block_reason": "",
      "client_ip": "192.168.1.100",
      "user": "admin",
      "create_at": 1703123456
    },
    {
      "id": 2,
      "session_id": "1234567890",
      "asset_id": 100,
      "asset_name": "服务器-001",
      "command": "pwd",
      "command_md5": "def456ghi789",
      "blocked": false,
      "block_reason": "",
      "client_ip": "192.168.1.100",
      "user": "admin",
      "create_at": 1703123500
    }
  ]
}
```

---

### 3.3 根据资产ID获取命令记录

**接口地址：** `GET /ssh/command-records/asset/:assetId`

**接口描述：** 获取指定资产的所有命令执行记录。

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| assetId | int64 | 是 | 资产ID |

**请求示例：**

```bash
GET /cmdb/ssh/command-records/asset/100
```

**响应示例：**

```json
{
  "dat": [
    {
      "id": 1,
      "session_id": "1234567890",
      "asset_id": 100,
      "asset_name": "服务器-001",
      "command": "ls -la",
      "command_md5": "abc123def456",
      "blocked": false,
      "block_reason": "",
      "client_ip": "192.168.1.100",
      "user": "admin",
      "create_at": 1703123456
    }
  ]
}
```

---

### 3.4 获取命令记录统计信息

**接口地址：** `GET /ssh/command-records/statistics`

**接口描述：** 获取命令执行记录的统计信息，包括总数、被阻止数、按用户统计、按资产统计等。

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| assetId | int64 | 否 | 资产ID（筛选特定资产） | 100 |
| startTime | int64 | 否 | 开始时间（Unix时间戳） | 1703123456 |
| endTime | int64 | 否 | 结束时间（Unix时间戳） | 1703209856 |

**请求示例：**

```bash
GET /cmdb/ssh/command-records/statistics?assetId=100&startTime=1703123456&endTime=1703209856
```

**响应示例：**

```json
{
  "dat": {
    "total": 1000,
    "blocked": 50,
    "allowed": 950,
    "userStats": {
      "admin": 500,
      "user1": 300,
      "user2": 200
    },
    "assetStats": {
      "100": 400,
      "101": 300,
      "102": 300
    }
  }
}
```

**响应字段说明：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| total | int64 | 总命令数 |
| blocked | int64 | 被阻止的命令数 |
| allowed | int64 | 允许执行的命令数 |
| userStats | object | 按用户统计的命令数（key为用户名，value为命令数） |
| assetStats | object | 按资产统计的命令数（key为资产ID，value为命令数） |

---

## 四、错误码说明

所有接口统一使用以下错误响应格式：

```json
{
  "dat": null,
  "err": "错误信息"
}
```

常见错误：

- `黑名单不存在`：指定的黑名单ID不存在
- `命令内容不能为空`：添加黑名单时命令内容为空
- `会话ID不能为空`：查询命令记录时会话ID为空
- `资产ID无效`：资产ID小于等于0

---

## 五、使用示例

### 5.1 添加危险命令到黑名单

```bash
# 添加精确匹配规则
curl -X POST http://localhost:8080/cmdb/ssh/blacklist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "command": "rm -rf /",
    "match_type": "exact",
    "enabled": true,
    "remark": "禁止删除根目录"
  }'

# 添加正则匹配规则
curl -X POST http://localhost:8080/cmdb/ssh/blacklist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "command": ".*rm.*",
    "pattern": ".*rm.*",
    "match_type": "regex",
    "enabled": true,
    "remark": "禁止所有包含rm的命令"
  }'
```

### 5.2 查询被阻止的命令

```bash
curl -X GET "http://localhost:8080/cmdb/ssh/command-records?blocked=true&page=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5.3 查询特定会话的命令记录

```bash
curl -X GET "http://localhost:8080/cmdb/ssh/command-records/session/1234567890" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5.4 获取统计信息

```bash
curl -X GET "http://localhost:8080/cmdb/ssh/command-records/statistics?startTime=1703123456&endTime=1703209856" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 六、注意事项

1. **权限控制**：所有接口需要JWT认证，请在请求头中携带 `Authorization: Bearer <token>`

2. **时间格式**：所有时间参数使用Unix时间戳（秒级）

3. **分页限制**：建议每页数量不超过100条

4. **正则表达式**：使用正则匹配时，请确保正则表达式语法正确，避免性能问题

5. **黑名单缓存**：黑名单规则有5分钟缓存，修改后可能需要等待缓存刷新才能生效

6. **命令记录**：命令记录是异步写入的，可能存在轻微延迟

---

## 七、数据模型

### 7.1 SSH命令黑名单表 (ssh_command_blacklist)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int64 | 主键 |
| command | string(512) | 命令内容 |
| pattern | string(512) | 正则匹配模式 |
| match_type | string(20) | 匹配类型：exact/regex |
| enabled | bool | 是否启用 |
| remark | string(500) | 备注说明 |
| create_at | int64 | 创建时间 |
| create_by | string(64) | 创建人 |
| update_at | int64 | 更新时间 |
| update_by | string(64) | 更新人 |

### 7.2 SSH命令执行记录表 (ssh_command_record)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int64 | 主键 |
| session_id | string(128) | 会话ID |
| asset_id | int64 | 资产ID |
| asset_name | string(255) | 资产名称 |
| command | text | 执行的命令 |
| command_md5 | string(32) | 命令MD5值 |
| blocked | bool | 是否被阻止 |
| block_reason | string(500) | 阻止原因 |
| client_ip | string(50) | 客户端IP |
| user | string(64) | 执行用户 |
| create_at | int64 | 执行时间 |

---

## 八、更新日志

### v1.0.0 (2024-12-22)

- 初始版本发布
- 支持SSH命令黑名单管理（增删改查）
- 支持SSH命令执行记录查询
- 支持多维度统计查询

