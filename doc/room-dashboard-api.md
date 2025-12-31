# 机房可视化大屏 - 后端接口文档

## 一、接口概述

### 1.1 接口前缀

所有接口统一使用前缀：`/cmdb`

### 1.2 响应格式

所有接口统一返回格式：

```json
{
  "err": "", // 错误信息，空字符串表示成功
  "dat": {} // 数据内容
}
```

### 1.3 接口分类

- **已存在接口**：机房管理模块已有的接口，可直接使用
- **需要新增接口**：大屏功能需要的新接口，需要后端开发

---

## 二、已存在接口（可直接使用）

### 2.1 机房列表接口

**接口**：`GET /cmdb/rooms`

**描述**：获取机房列表，用于机房选择器

**请求参数**：

```typescript
interface RoomListParams {
  page?: number; // 页码，默认1
  pageSize?: number; // 每页数量，默认20
  keyword?: string; // 关键词搜索（名称、编号、地址）
  status?: 'active' | 'inactive' | 'maintenance'; // 状态筛选
  type?: '自建' | '租赁' | '托管'; // 类型筛选
  level?: 'T1' | 'T2' | 'T3' | 'T4'; // 等级筛选
}
```

**响应数据**：

```typescript
interface RoomListResponse {
  list: Room[];
  total: number;
}

interface Room {
  id: number;
  name: string;
  code: string;
  address?: string;
  area?: number;
  type?: '自建' | '租赁' | '托管';
  level?: 'T1' | 'T2' | 'T3' | 'T4';
  status: 'active' | 'inactive' | 'maintenance';
  contact?: string;
  contactPhone?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  // 关联数据
  rackCount?: number; // 机柜数量
  deviceCount?: number; // 设备数量
  uUsageRate?: number; // U位使用率（0-1）
  powerUsageRate?: number; // 功率使用率（0-1）
}
```

**示例请求**：

```bash
GET /cmdb/rooms?page=1&pageSize=100&status=active
```

**示例响应**：

```json
{
  "err": "",
  "dat": {
    "list": [
      {
        "id": 1,
        "name": "主机房",
        "code": "ROOM-001",
        "status": "active",
        "rackCount": 50,
        "deviceCount": 200,
        "uUsageRate": 0.65,
        "powerUsageRate": 0.72
      }
    ],
    "total": 1
  }
}
```

---

### 2.2 机房详情接口

**接口**：`GET /cmdb/rooms/:id`

**描述**：获取机房详细信息

**路径参数**：

- `id`: 机房 ID

**响应数据**：

```typescript
interface Room {
  // 同2.1中的Room接口
}
```

**示例请求**：

```bash
GET /cmdb/rooms/1
```

---

### 2.3 机房统计接口 ✅

**接口**：`GET /cmdb/rooms/:id/statistics`

**描述**：获取机房统计数据，用于概览卡片和容量监控

**路径参数**：

- `id`: 机房 ID

**响应数据**：

```typescript
interface RoomStatistics {
  rackTotal: number; // 机柜总数
  rackUsed: number; // 已用机柜数
  rackAvailable: number; // 可用机柜数
  deviceTotal: number; // 设备总数
  uTotal: number; // 总U数
  uUsed: number; // 已用U数
  uUsageRate: number; // U位使用率（0-1）
  powerTotal: number; // 总功率容量（KW）
  powerUsed: number; // 已用功率（KW）
  powerUsageRate: number; // 功率使用率（0-1）
  alarmCount?: number; // 告警数量（可选）
}
```

**示例请求**：

```bash
GET /cmdb/rooms/1/statistics
```

**示例响应**：

```json
{
  "err": "",
  "dat": {
    "rackTotal": 50,
    "rackUsed": 45,
    "rackAvailable": 5,
    "deviceTotal": 200,
    "uTotal": 2500,
    "uUsed": 1625,
    "uUsageRate": 0.65,
    "powerTotal": 500,
    "powerUsed": 360,
    "powerUsageRate": 0.72,
    "alarmCount": 3
  }
}
```

**状态**：✅ 已存在（在 `src/pages/room/services.ts` 中已定义）

---

### 2.4 机柜列表接口

**接口**：`GET /cmdb/racks`

**描述**：获取机柜列表，可用于筛选特定机房的机柜

**请求参数**：

```typescript
interface RackListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  roomId?: number; // 所属机房ID
  uUsageRate?: string; // U位使用率筛选：'<50', '50-80', '80-95', '>95'
}
```

**响应数据**：

```typescript
interface RackListResponse {
  list: Rack[];
  total: number;
}

interface Rack {
  id: number;
  roomId?: number;
  name: string;
  code: string;
  totalU: number;
  usedU?: number;
  powerCapacity?: number;
  powerUsed?: number;
  networkPorts?: number;
  networkPortsUsed?: number;
  status: 'active' | 'inactive' | 'maintenance';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  roomName?: string; // 所属机房名称
  deviceCount?: number; // 设备数量
}
```

**示例请求**：

```bash
GET /cmdb/racks?roomId=1&page=1&pageSize=100
```

**用于机柜 U 数统计图表**：

- 通过 `roomId` 参数筛选特定机房的所有机柜
- 设置 `pageSize` 为较大值（如 1000）获取所有机柜
- 前端通过返回的机柜列表中的 `totalU`、`usedU` 字段进行统计和图表展示
- 可以通过 `totalU` 字段统计不同 U 数的机柜数量（如统计 42U、45U 等不同规格的机柜数量）

**示例响应**：

```json
{
  "err": "",
  "dat": {
    "list": [
      {
        "id": 1,
        "roomId": 1,
        "name": "机柜A01",
        "code": "RACK-A01",
        "totalU": 42,
        "usedU": 28,
        "status": "active",
        "roomName": "主机房",
        "deviceCount": 5
      },
      {
        "id": 2,
        "roomId": 1,
        "name": "机柜A02",
        "code": "RACK-A02",
        "totalU": 42,
        "usedU": 35,
        "status": "active",
        "roomName": "主机房",
        "deviceCount": 8
      }
    ],
    "total": 2
  }
}
```

---

### 2.5 机柜详情接口

**接口**：`GET /cmdb/racks/:id`

**描述**：获取机柜详细信息

**路径参数**：

- `id`: 机柜 ID

**响应数据**：

```typescript
interface Rack {
  // 同2.4中的Rack接口
}
```

---

### 2.6 机柜统计接口 ✅

**接口**：`GET /cmdb/racks/:id/statistics`

**描述**：获取机柜统计数据

**路径参数**：

- `id`: 机柜 ID

**响应数据**：

```typescript
interface RackStatistics {
  deviceCount: number;
  uUsed: number;
  uAvailable: number;
  uUsageRate: number;
  powerUsed: number;
  powerAvailable: number;
  powerUsageRate: number;
  networkPortsUsed: number;
  networkPortsAvailable: number;
}
```

**状态**：✅ 已存在（在 `src/pages/room/services.ts` 中已定义）

---

### 2.7 机柜设备列表接口

**接口**：`GET /cmdb/racks/:id/devices`

**描述**：获取机柜内的设备列表

**路径参数**：

- `id`: 机柜 ID

**响应数据**：

```typescript
interface RackDeviceListResponse {
  list: RackDevice[];
}

interface RackDevice {
  id: number;
  rackId: number;
  deviceId: number;
  deviceName: string;
  startU: number;
  heightU: number;
  deviceType?: string;
  target_up: number;
  status: 'online' | 'offline' | 'maintenance';
  installDate?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

**示例请求**：

```bash
GET /cmdb/racks/1/devices
```

---

## 三、需要新增接口

### 3.1 设备类型统计接口 ⭐

**接口**：`GET /cmdb/rooms/:id/devices/type-statistics`

**描述**：获取机房内设备类型统计，用于设备类型统计饼图

**路径参数**：

- `id`: 机房 ID

**响应数据**：

```typescript
interface DeviceTypeStatisticsResponse {
  list: Array<{
    deviceType: string; // 设备类型：server, switch, router, firewall, storage等
    deviceTypeName: string; // 设备类型名称：服务器、交换机、路由器等
    count: number; // 设备数量
    percentage: number; // 占比（0-1）
  }>;
  total: number; // 设备总数
}
```

**示例请求**：

```bash
GET /cmdb/rooms/1/devices/type-statistics
```

**示例响应**：

```json
{
  "err": "",
  "dat": {
    "list": [
      {
        "deviceType": "server",
        "deviceTypeName": "服务器",
        "count": 120,
        "percentage": 0.6
      },
      {
        "deviceType": "switch",
        "deviceTypeName": "交换机",
        "count": 40,
        "percentage": 0.2
      },
      {
        "deviceType": "router",
        "deviceTypeName": "路由器",
        "count": 20,
        "percentage": 0.1
      },
      {
        "deviceType": "firewall",
        "deviceTypeName": "防火墙",
        "count": 10,
        "percentage": 0.05
      },
      {
        "deviceType": "storage",
        "deviceTypeName": "存储设备",
        "count": 10,
        "percentage": 0.05
      }
    ],
    "total": 200
  }
}
```

**业务逻辑**：

1. 查询机房内所有设备（通过机柜关联）
2. 按设备类型分组统计
3. 计算每个类型的数量和占比
4. 返回统计结果

**优先级**：⭐ 高（核心功能）

---

### 3.2 环境监控接口 ⭐

**接口**：`GET /cmdb/rooms/:id/environment`

**描述**：获取机房环境监控数据（温度、湿度），用于环境监控折线图

**路径参数**：

- `id`: 机房 ID

**请求参数**：

```typescript
interface EnvironmentParams {
  startTime?: string; // 开始时间，ISO格式，默认最近24小时
  endTime?: string; // 结束时间，ISO格式，默认当前时间
  interval?: string; // 数据间隔，如 '1h', '30m'，默认 '1h'
}
```

**响应数据**：

```typescript
interface EnvironmentDataResponse {
  list: Array<{
    timestamp: string; // 时间戳，ISO格式
    temperature: number; // 温度（℃）
    humidity: number; // 湿度（%）
  }>;
  current: {
    temperature: number; // 当前温度
    humidity: number; // 当前湿度
    timestamp: string; // 当前时间
  };
}
```

**示例请求**：

```bash
GET /cmdb/rooms/1/environment?startTime=2024-01-01T00:00:00Z&endTime=2024-01-02T00:00:00Z&interval=1h
```

**示例响应**：

```json
{
  "err": "",
  "dat": {
    "list": [
      {
        "timestamp": "2024-01-01T00:00:00Z",
        "temperature": 22.5,
        "humidity": 45.2
      },
      {
        "timestamp": "2024-01-01T01:00:00Z",
        "temperature": 22.8,
        "humidity": 45.5
      }
    ],
    "current": {
      "temperature": 23.1,
      "humidity": 46.0,
      "timestamp": "2024-01-02T12:00:00Z"
    }
  }
}
```

**业务逻辑**：

1. 查询机房环境监控数据（从动环监控系统或数据库）
2. 按时间间隔聚合数据
3. 返回时间序列数据和当前值

**数据来源**：

- 如果有机房动环监控系统，从监控系统获取
- 如果没有，需要建立环境监控数据表，定期采集数据

**优先级**：⭐ 高（核心功能）

---

### 3.3 网络设备监控 Top 10 接口 ⭐

**接口**：`GET /cmdb/rooms/:id/network-devices/top10`

**描述**：获取机房内网络设备（交换机、路由器、防火墙等）的 CPU/内存使用率 Top 10，用于网络设备监控横向柱状图

**路径参数**：

- `id`: 机房 ID

**请求参数**：

```typescript
interface NetworkDeviceTop10Params {
  metric?: 'cpu' | 'memory'; // 监控指标，默认 'cpu'
  limit?: number; // 返回数量，默认 10
}
```

**响应数据**：

```typescript
interface NetworkDeviceTop10Response {
  list: Array<{
    deviceId: number;
    deviceName: string;
    deviceType: string; // 设备类型：switch, router, firewall等
    deviceTypeName: string; // 设备类型名称
    cpuUsage: number; // CPU使用率（%）
    memoryUsage: number; // 内存使用率（%）
    timestamp: string; // 数据时间戳
    rank: number; // 排名（1-10）
  }>;
  metric: 'cpu' | 'memory'; // 当前指标类型
}
```

**示例请求**：

```bash
GET /cmdb/rooms/1/network-devices/top10?metric=cpu&limit=10
```

**示例响应**：

```json
{
  "err": "",
  "dat": {
    "list": [
      {
        "deviceId": 101,
        "deviceName": "核心交换机-01",
        "deviceType": "switch",
        "deviceTypeName": "交换机",
        "cpuUsage": 85.5,
        "memoryUsage": 72.3,
        "timestamp": "2024-01-02T12:00:00Z",
        "rank": 1
      },
      {
        "deviceId": 102,
        "deviceName": "核心交换机-02",
        "deviceType": "switch",
        "deviceTypeName": "交换机",
        "cpuUsage": 78.2,
        "memoryUsage": 68.5,
        "timestamp": "2024-01-02T12:00:00Z",
        "rank": 2
      }
    ],
    "metric": "cpu"
  }
}
```

**业务逻辑**：

1. 查询机房内所有网络设备（设备类型为 switch, router, firewall 等）
2. 从监控系统获取设备的 CPU 和内存使用率（实时或最近数据）
3. 根据指定指标（CPU 或内存）排序，取 Top 10
4. 返回排序后的设备列表

**数据来源**：

- 需要从监控系统（如 Prometheus、Zabbix 等）获取设备性能数据
- 或从设备管理系统的性能监控模块获取

**优先级**：⭐ 高（核心功能）

---

### 3.4 机房图片配置接口 ⭐（可选）

**接口**：`GET /cmdb/rooms/:id/image-config`

**描述**：获取机房图片中机柜的坐标配置信息（已移除机柜交互功能，此接口可选，如不需要可删除）

**路径参数**：

- `id`: 机房 ID

**响应数据**：

```typescript
interface RoomImageConfigResponse {
  imageUrl: string; // 图片路径，如 "/image/room.png" 或完整URL
  racks: Array<{
    rackId: number;
    rackName: string;
    rackCode: string;
    x: number; // 机柜在图片中的X坐标（百分比 0-100）
    y: number; // 机柜在图片中的Y坐标（百分比 0-100）
    width: number; // 机柜区域宽度（百分比 0-100）
    height: number; // 机柜区域高度（百分比 0-100）
    status: 'normal' | 'alarm' | 'maintenance'; // 机柜状态
    uUsageRate?: number; // U位使用率（用于颜色标识，0-1）
  }>;
}
```

**示例请求**：

```bash
GET /cmdb/rooms/1/image-config
```

**示例响应**：

```json
{
  "err": "",
  "dat": {
    "imageUrl": "/image/room.png",
    "racks": [
      {
        "rackId": 1,
        "rackName": "机柜A01",
        "rackCode": "RACK-A01",
        "x": 10,
        "y": 20,
        "width": 5,
        "height": 30,
        "status": "normal",
        "uUsageRate": 0.67
      },
      {
        "rackId": 2,
        "rackName": "机柜A02",
        "rackCode": "RACK-A02",
        "x": 15,
        "y": 20,
        "width": 5,
        "height": 30,
        "status": "alarm",
        "uUsageRate": 0.95
      }
    ]
  }
}
```

**业务逻辑**：

1. 查询机房内所有机柜
2. 获取机柜的坐标配置（从数据库或配置文件）
3. 计算机柜状态（根据告警、维护等信息）
4. 返回机柜坐标和状态信息

**数据存储**：

- 机柜坐标信息可以存储在 `room_layout` 表中，或单独的 `rack_position` 表中
- 坐标可以通过机房布局管理功能配置

**优先级**：⭐ 高（核心功能）

---

### 3.5 机房告警列表接口 ⭐

**接口**：`GET /cmdb/rooms/:id/alarms`

**描述**：获取机房相关的最近告警列表，用于告警列表组件

**路径参数**：

- `id`: 机房 ID

**请求参数**：

```typescript
interface RoomAlarmParams {
  limit?: number; // 返回数量，默认 10
  level?: 'critical' | 'warning' | 'info'; // 告警级别筛选
}
```

**响应数据**：

```typescript
interface RoomAlarmResponse {
  list: Array<{
    id: number;
    title: string; // 告警标题
    level: 'critical' | 'warning' | 'info'; // 告警级别
    source: string; // 告警源：rack, device, environment等
    rackId?: number; // 关联机柜ID（可选）
    rackName?: string; // 关联机柜名称（可选）
    deviceId?: number; // 关联设备ID（可选）
    deviceName?: string; // 关联设备名称（可选）
    message: string; // 告警消息
    triggerTime: string; // 触发时间，ISO格式
    status: 'active' | 'resolved'; // 告警状态
  }>;
  total: number; // 告警总数
}
```

**示例请求**：

```bash
GET /cmdb/rooms/1/alarms?limit=10
```

**示例响应**：

```json
{
  "err": "",
  "dat": {
    "list": [
      {
        "id": 1001,
        "title": "机柜A01温度过高",
        "level": "critical",
        "source": "rack",
        "rackId": 1,
        "rackName": "机柜A01",
        "message": "机柜A01温度达到35℃，超过阈值30℃",
        "triggerTime": "2024-01-02T10:30:00Z",
        "status": "active"
      },
      {
        "id": 1002,
        "title": "设备CPU使用率过高",
        "level": "warning",
        "source": "device",
        "rackId": 2,
        "rackName": "机柜A02",
        "deviceId": 201,
        "deviceName": "服务器-201",
        "message": "服务器-201 CPU使用率达到85%",
        "triggerTime": "2024-01-02T11:00:00Z",
        "status": "active"
      }
    ],
    "total": 5
  }
}
```

**业务逻辑**：

1. 查询机房相关的告警（通过机柜、设备关联）
2. 按触发时间倒序排序
3. 返回最近的告警列表

**数据来源**：

- 如果已有告警系统，从告警系统获取
- 如果没有，需要建立告警数据表，或从监控系统获取告警信息

**优先级**：⭐ 高（核心功能）

---

## 四、接口汇总表

| 接口            | 方法 | 路径                                      | 状态      | 优先级  | 说明                                       |
| --------------- | ---- | ----------------------------------------- | --------- | ------- | ------------------------------------------ |
| 机房列表        | GET  | `/cmdb/rooms`                             | ✅ 已存在 | -       | 用于机房选择器                             |
| 机房详情        | GET  | `/cmdb/rooms/:id`                         | ✅ 已存在 | -       | 获取机房信息                               |
| 机房统计        | GET  | `/cmdb/rooms/:id/statistics`              | ✅ 已存在 | -       | 概览卡片数据                               |
| 机柜列表        | GET  | `/cmdb/racks`                             | ✅ 已存在 | -       | 获取机柜列表                               |
| 机柜详情        | GET  | `/cmdb/racks/:id`                         | ✅ 已存在 | -       | 获取机柜信息                               |
| 机柜统计        | GET  | `/cmdb/racks/:id/statistics`              | ✅ 已存在 | -       | 机柜统计数据                               |
| 机柜设备列表    | GET  | `/cmdb/racks/:id/devices`                 | ✅ 已存在 | -       | 获取机柜设备                               |
| 机柜 U 数统计   | GET  | `/cmdb/racks?roomId=:id`                  | ✅ 已存在 | -       | 使用机柜列表接口，通过 totalU 字段统计     |
| 设备类型统计    | GET  | `/cmdb/rooms/:id/devices/type-statistics` | ❌ 需新增 | ⭐ 高   | 设备类型统计饼图                           |
| 环境监控        | GET  | `/cmdb/rooms/:id/environment`             | ❌ 需新增 | ⭐ 高   | 温度湿度折线图                             |
| 网络设备 Top 10 | GET  | `/cmdb/rooms/:id/network-devices/top10`   | ❌ 需新增 | ⭐ 高   | 网络设备监控图表                           |
| 机房图片配置    | GET  | `/cmdb/rooms/:id/image-config`            | ❌ 需新增 | ⭐ 可选 | 机房 3D 图片（已移除交互功能，此接口可选） |
| 机房告警列表    | GET  | `/cmdb/rooms/:id/alarms`                  | ❌ 需新增 | ⭐ 高   | 告警列表组件                               |

---

## 五、数据模型设计建议

### 5.1 环境监控数据表

如果系统中没有环境监控数据，建议创建以下表：

```sql
CREATE TABLE room_environment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  room_id BIGINT NOT NULL,
  temperature DECIMAL(5,2) NOT NULL COMMENT '温度（℃）',
  humidity DECIMAL(5,2) NOT NULL COMMENT '湿度（%）',
  timestamp DATETIME NOT NULL COMMENT '采集时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_room_timestamp (room_id, timestamp)
) COMMENT '机房环境监控数据表';
```

### 5.2 机柜坐标配置表

如果系统中没有机柜坐标配置，建议创建以下表：

```sql
CREATE TABLE rack_position (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rack_id BIGINT NOT NULL UNIQUE,
  room_id BIGINT NOT NULL,
  image_x DECIMAL(5,2) NOT NULL COMMENT 'X坐标（百分比）',
  image_y DECIMAL(5,2) NOT NULL COMMENT 'Y坐标（百分比）',
  image_width DECIMAL(5,2) NOT NULL COMMENT '宽度（百分比）',
  image_height DECIMAL(5,2) NOT NULL COMMENT '高度（百分比）',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_room_id (room_id)
) COMMENT '机柜在机房图片中的坐标配置表';
```

### 5.3 设备性能监控数据表

如果系统中没有设备性能监控数据，建议创建以下表：

```sql
CREATE TABLE device_performance (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  device_id BIGINT NOT NULL,
  cpu_usage DECIMAL(5,2) NOT NULL COMMENT 'CPU使用率（%）',
  memory_usage DECIMAL(5,2) NOT NULL COMMENT '内存使用率（%）',
  timestamp DATETIME NOT NULL COMMENT '采集时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_device_timestamp (device_id, timestamp)
) COMMENT '设备性能监控数据表';
```

---

## 六、开发优先级建议

### 第一阶段（核心功能）

1. ✅ 设备类型统计接口
2. ⚠️ 机房图片配置接口（可选，已移除机柜交互功能）

### 第二阶段（监控功能）

3. ✅ 环境监控接口
4. ✅ 网络设备 Top 10 接口
5. ✅ 机房告警列表接口

**重要说明**：

- **机柜 U 数统计功能**：使用已存在的机柜列表接口（`GET /cmdb/racks?roomId=:id`）实现
  - 通过 `roomId` 参数筛选特定机房的所有机柜
  - 前端通过返回的机柜列表中的 `totalU`、`usedU` 字段进行统计和图表展示
  - 可以通过 `totalU` 字段统计不同 U 数的机柜数量（如统计 42U、45U 等不同规格的机柜数量）
- **机房图片配置接口**：由于已移除机柜交互功能，此接口变为可选，如不需要可删除

---

## 七、注意事项

### 7.1 性能优化

- 机柜列表接口用于 U 数统计时，建议设置合理的 `pageSize`，避免一次性返回过多数据
- 设备类型统计接口需要聚合查询，注意数据库索引优化
- 环境监控接口需要时间范围查询，建议按时间建立索引
- 网络设备 Top 10 接口需要实时数据，考虑使用缓存

### 7.2 数据一致性

- 确保统计数据与明细数据一致
- 环境监控数据需要定期采集和更新
- 设备性能数据需要实时或准实时更新

### 7.3 错误处理

- 所有接口需要统一的错误处理
- 数据为空时返回空数组，不要返回错误
- 参数验证要严格，避免 SQL 注入等安全问题

### 7.4 接口文档

- 建议使用 Swagger 或类似工具生成 API 文档
- 提供接口测试用例
- 标注接口的响应时间和数据量级

---

## 八、总结

本接口文档详细列出了机房可视化大屏所需的所有后端接口，区分了已存在的接口和需要新增的接口。

**已存在接口（8 个）**：

- 机房列表、详情、统计
- 机柜列表、详情、统计
- 机柜设备列表
- **机柜 U 数统计**（使用机柜列表接口实现）

**需要新增接口（5 个）**：

- 设备类型统计（⭐ 高优先级）
- 环境监控（⭐ 高优先级）
- 网络设备 Top 10（⭐ 高优先级）
- 机房图片配置（⭐ 可选，已移除机柜交互功能）
- 机房告警列表（⭐ 高优先级）

**重要说明**：

- **机柜 U 数统计功能**：使用已存在的机柜列表接口（`GET /cmdb/racks?roomId=:id`）实现
  - 通过 `roomId` 参数筛选特定机房的所有机柜
  - 前端通过返回的机柜列表中的 `totalU`、`usedU` 字段进行统计和图表展示
  - 可以通过 `totalU` 字段统计不同 U 数的机柜数量（如统计 42U、45U 等不同规格的机柜数量）
- 所有需要新增的接口都是高优先级，建议按照开发优先级分阶段实现
