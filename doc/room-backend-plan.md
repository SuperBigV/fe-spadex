# IDC 机房管理模块 - 后端开发计划

## 一、项目概述

### 1.1 功能目标

- 提供 IDC 机房、机柜、设备的完整数据模型和 API 接口
- 支持机房布局数据的存储和管理
- 支持机柜 U 位和设备的管理
- 与 CMDB 系统集成，同步设备资产数据
- 提供可视化大屏所需的数据统计接口

### 1.2 技术栈

- 语言: Go 1.23.10
- 数据库: 待定（MySQL/PostgreSQL）
- Web 框架: 待定（Gin/Echo/Iris 等）
- ORM: 待定（GORM/Xorm 等）

### 1.3 开发周期

预计开发周期: **4-5 周**

---

## 二、数据模型设计

### 2.1 核心实体

#### 机房 (Room)

```go
type Room struct {
    ID          int64     `gorm:"primaryKey;autoIncrement"`
    Name        string    `gorm:"type:varchar(100);not null;comment:机房名称"`
    Code        string    `gorm:"type:varchar(50);uniqueIndex;comment:机房编号"`
    Address     string    `gorm:"type:varchar(200);comment:机房地址"`
    Area        float64   `gorm:"comment:机房面积(平方米)"`
    Type        string    `gorm:"type:varchar(20);comment:机房类型(自建/租赁/托管)"`
    Level       string    `gorm:"type:varchar(10);comment:机房等级(T1/T2/T3/T4)"`
    Status      string    `gorm:"type:varchar(20);default:active;comment:状态(active/inactive/maintenance)"`
    Contact     string    `gorm:"type:varchar(100);comment:联系人"`
    ContactPhone string   `gorm:"type:varchar(20);comment:联系电话"`
    Description string    `gorm:"type:text;comment:描述"`
    CreatedAt   time.Time
    UpdatedAt   time.Time
    DeletedAt   gorm.DeletedAt `gorm:"index"`

    // 关联关系
    Racks       []Rack    `gorm:"foreignKey:RoomID"`
}
```

#### 机柜 (Rack)

```go
type Rack struct {
    ID              int64     `gorm:"primaryKey;autoIncrement"`
    RoomID          int64     `gorm:"not null;index;comment:所属机房ID"`
    Name            string    `gorm:"type:varchar(100);not null;comment:机柜名称"`
    Code            string    `gorm:"type:varchar(50);uniqueIndex;comment:机柜编号"`
    PositionX       float64   `gorm:"comment:机房内X坐标(米或像素)"`
    PositionY       float64   `gorm:"comment:机房内Y坐标(米或像素)"`
    Rotation        int       `gorm:"default:0;comment:旋转角度(0/90度)"`
    TotalU          int       `gorm:"default:42;comment:总U数"`
    UsedU           int       `gorm:"default:0;comment:已用U数"`
    PowerCapacity   float64   `gorm:"comment:功率容量(KW)"`
    PowerUsed       float64   `gorm:"default:0;comment:已用功率(KW)"`
    NetworkPorts    int       `gorm:"default:0;comment:网络端口数量"`
    NetworkPortsUsed int      `gorm:"default:0;comment:已用网络端口"`
    Status          string    `gorm:"type:varchar(20);default:active;comment:状态"`
    Description     string    `gorm:"type:text;comment:描述"`
    CreatedAt       time.Time
    UpdatedAt       time.Time
    DeletedAt       gorm.DeletedAt `gorm:"index"`

    // 关联关系
    Room            Room      `gorm:"foreignKey:RoomID"`
    Devices         []RackDevice `gorm:"foreignKey:RackID"`
}
```

#### 机柜设备 (RackDevice)

```go
type RackDevice struct {
    ID              int64     `gorm:"primaryKey;autoIncrement"`
    RackID          int64     `gorm:"not null;index;comment:所属机柜ID"`
    DeviceID        int64     `gorm:"not null;index;comment:CMDB设备ID，关联asset.id"`
    DeviceName      string    `gorm:"type:varchar(200);comment:设备名称"`
    StartU          int       `gorm:"not null;comment:起始U位(1-42)"`
    HeightU         int       `gorm:"not null;comment:占用U数"`
    DeviceType      string    `gorm:"type:varchar(50);comment:设备类型"`
    Status          string    `gorm:"type:varchar(20);default:online;comment:设备状态"`
    InstallDate     time.Time `gorm:"comment:安装日期"`
    CreatedAt       time.Time
    UpdatedAt       time.Time
    DeletedAt       gorm.DeletedAt `gorm:"index"`

    // 关联关系
    Rack            Rack      `gorm:"foreignKey:RackID"`
    // 注意：DeviceID关联asset.id，需要通过JOIN查询asset表获取设备详细信息
}
```

#### 机房布局 (RoomLayout)

```go
type RoomLayout struct {
    ID          int64     `gorm:"primaryKey;autoIncrement"`
    RoomID      int64     `gorm:"not null;uniqueIndex;comment:机房ID"`
    CanvasScale float64   `gorm:"default:1;comment:画布缩放比例"`
    CanvasX     float64   `gorm:"default:0;comment:画布X偏移"`
    CanvasY     float64   `gorm:"default:0;comment:画布Y偏移"`
    RackLayouts string    `gorm:"type:text;comment:机柜布局JSON数据"`
    UpdatedAt   time.Time

    // 关联关系
    Room        Room      `gorm:"foreignKey:RoomID"`
}
```

### 2.2 数据库表设计

#### 表结构

- `rooms` - 机房表
- `racks` - 机柜表
- `rack_devices` - 机柜设备表
- `room_layouts` - 机房布局表
- `cmdb_device_cache` - CMDB 设备缓存表（可选）

#### 索引设计

- `rooms.code` - 唯一索引
- `racks.code` - 唯一索引
- `racks.room_id` - 普通索引
- `rack_devices.rack_id` - 普通索引
- `rack_devices.device_id` - 普通索引
- `room_layouts.room_id` - 唯一索引

---

## 三、API 接口设计

### 3.1 机房管理接口

#### 3.1.1 获取机房列表

```
GET /cmdb/rooms
Query Parameters:
  - page: int (页码，默认1)
  - pageSize: int (每页数量，默认20)
  - keyword: string (搜索关键词)
  - status: string (状态筛选)

Response:
{
  "dat": {
    "list": [
      {
        "id": 1,
        "name": "核心机房A",
        "code": "ROOM-A-001",
        "address": "北京市朝阳区xxx",
        "status": "active",
        "rackCount": 50,
        "deviceCount": 500
      }
    ],
    "total": 100
  }
}
```

#### 3.1.2 获取机房详情

```
GET /cmdb/rooms/:id

Response:
{
  "dat": {
    "id": 1,
    "name": "核心机房A",
    "code": "ROOM-A-001",
    "address": "北京市朝阳区xxx",
    "area": 500.0,
    "type": "自建",
    "level": "T3",
    "status": "active",
    "contact": "张三",
    "contactPhone": "13800138000",
    "description": "核心机房描述",
    "racks": [
      {
        "id": 1,
        "name": "A01",
        "code": "RACK-A01",
        "positionX": 10.5,
        "positionY": 5.2,
        "rotation": 0,
        "totalU": 42,
        "usedU": 15
      }
    ],
    "layout": {
      "canvasScale": 1.0,
      "canvasX": 0,
      "canvasY": 0,
      "rackLayouts": [...]
    }
  }
}
```

#### 3.1.3 创建机房

```
POST /cmdb/rooms
Body:
{
  "name": "新机房",
  "code": "ROOM-NEW-001",
  "address": "地址",
  "area": 300.0,
  "type": "租赁",
  "level": "T2",
  "status": "active"
}

Response:
{
  "dat": {
    "id": 2,
    ...
  }
}
```

#### 3.1.4 更新机房

```
PUT /cmdb/rooms/:id
Body: (同创建接口)

Response:
{
  "dat": "ok"
}
```

#### 3.1.5 删除机房

```
DELETE /cmdb/rooms/:id

Response:
{
  "dat": "ok"
}
```

### 3.2 机柜管理接口

#### 3.2.1 获取机柜详情

```
GET /cmdb/racks/:id

Response:
{
  "dat": {
    "id": 1,
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
    "devices": [
      {
        "id": 1,
        "deviceId": "DEVICE-001",
        "deviceName": "服务器-001",
        "startU": 1,
        "heightU": 2,
        "deviceType": "server",
        "status": "online"
      }
    ]
  }
}
```

#### 3.2.2 创建机柜

```
POST /cmdb/racks
Body:
{
  "roomId": 1,
  "name": "A02",
  "code": "RACK-A02",
  "positionX": 15.0,
  "positionY": 5.2,
  "totalU": 42,
  "powerCapacity": 10.0
}

Response:
{
  "dat": {
    "id": 2,
    ...
  }
}
```

#### 3.2.3 更新机柜

```
PUT /cmdb/racks/:id
Body: (同创建接口)

Response:
{
  "dat": "ok"
}
```

#### 3.2.4 删除机柜

```
DELETE /cmdb/racks/:id

Response:
{
  "dat": "ok"
}
```

### 3.3 布局管理接口

#### 3.3.1 更新机房布局

```
PUT /cmdb/rooms/:id/layout
Body:
{
  "canvasScale": 1.0,
  "canvasX": 0,
  "canvasY": 0,
  "rackLayouts": [
    {
      "rackId": 1,
      "x": 10.5,
      "y": 5.2,
      "rotation": 0
    }
  ]
}

Response:
{
  "dat": "ok"
}
```

### 3.4 设备管理接口

#### 3.4.1 添加设备到机柜

```
POST /cmdb/racks/:rackId/devices
Body:
{
  "deviceId": 1,  // CMDB设备ID (int64)
  "startU": 5,
  "heightU": 2
}

Response:
{
  "dat": {
    "id": 1,
    "rackId": 5,
    "deviceId": 1,
    "deviceName": "server-001",
    "startU": 5,
    "heightU": 2,
    "deviceType": "server",
    "status": "online"
  }
}
```

#### 3.4.2 更新设备位置

```
PUT /cmdb/racks/:rackId/devices/:deviceId
Path Parameters:
  - rackId: int64 (机柜ID)
  - deviceId: int64 (CMDB设备ID)

Body:
{
  "startU": 8,
  "heightU": 2
}

Response:
{
  "dat": "ok"
}
```

#### 3.4.3 从机柜移除设备

```
DELETE /cmdb/racks/:rackId/devices/:deviceId
Path Parameters:
  - rackId: int64 (机柜ID)
  - deviceId: int64 (CMDB设备ID)

Response:
{
  "dat": "ok"
}
```

#### 3.4.4 验证 U 位占用

```
POST /cmdb/racks/:rackId/check-u-position
Body:
{
  "startU": 5,
  "heightU": 2,
  "excludeDeviceId": 1  // 可选，排除某个设备ID (int64)
}

Response:
{
  "dat": {
    "available": true,
    "conflicts": [  // 冲突的设备列表
      {
        "id": 2,
        "deviceId": 3,
        "deviceName": "server-002",
        "startU": 4,
        "heightU": 3
      }
    ]
  }
}
```

### 3.5 CMDB 集成接口

#### 3.5.1 获取 CMDB 设备列表（按资产模型）

```
GET /cmdb/assets
Query Parameters:
  - gids: int64 (资产模型ID，必填)
  - query: string (搜索关键词，支持名称、IP、标签搜索)
  - limit: int (每页数量，默认3000)
  - offset: int (偏移量，通过page计算)
  - order: string (排序字段，默认create_at)
  - desc: bool (是否降序，默认false)

Response:
{
  "dat": {
    "list": [
      {
        "id": 1,
        "gid": 10,
        "status": "online",
        "tags": ["env=prod", "team=ops"],
        "tags_maps": {
          "env": "prod",
          "team": "ops"
        },
        "data": {
          "name": "server-001",
          "ip": "192.168.1.100",
          "category": "server",
          "belong_room": 1,
          "belong_rack": 5,
          "model": 2,
          "manufacturer": "Dell",
          "spec": "..."
        },
        "asset_type": "server",
        "belong_room": "核心机房A",  // 通过rack_devices表查询rack_id -> racks表查询room_id -> rooms表获取机房名称
        "belong_rack": "A01",        // 通过rack_devices表查询rack_id -> racks表获取机柜名称
        "create_at": 1703123456,
        "update_at": 1703123456
      }
    ],
    "total": 100
  }
}
```

#### 3.5.2 获取 CMDB 设备详情

```
GET /cmdb/asset/:id

Response:
{
  "dat": {
    "id": 1,
    "gid": 10,
    "status": "online",
    "scrape": "enabled",
    "tags": ["env=prod", "team=ops"],
    "tags_json": ["env=prod", "team=ops"],
    "tags_maps": {
      "env": "prod",
      "team": "ops"
    },
    "data": {
      "name": "server-001",
      "ip": "192.168.1.100",
      "category": "server",
      "belong_room": 1,
      "belong_rack": 5,
      "model": 2,
      "manufacturer": "Dell",
      "model_name": "PowerEdge R740",
      "spec": {...},
      "password": "encrypted_password",
      "port": "22",
      "auth_snmp": 1,
      "auth_telnet": 0
    },
    "asset_type": "server",
    "belong_room": "核心机房A",  // 通过rack_devices表查询rack_id -> racks表查询room_id -> rooms表获取机房名称
    "belong_rack": "A01",        // 通过rack_devices表查询rack_id -> racks表获取机柜名称
    "target_up": 2,
    "cpu_num": 16,
    "cpu_util": 45.5,
    "mem_util": 60.2,
    "arch": "x86_64",
    "create_at": 1703123456,
    "create_by": "admin",
    "update_at": 1703123456,
    "update_by": "admin"
  }
}
```

#### 3.5.3 按资产类型唯一标识查询设备

```
GET /cmdb/assets/:unit
Path Parameters:
  - unit: string (资产模型的unique_identifier，如"server", "rack", "switch"等)

Response:
{
  "dat": [
    {
      "id": 1,
      "gid": 10,
      "status": "online",
      "data": {...},
      "belong_room": "核心机房A",  // 通过rack_devices表查询rack_id -> racks表查询room_id -> rooms表获取机房名称
      "belong_rack": "A01",        // 通过rack_devices表查询rack_id -> racks表获取机柜名称
      ...
    }
  ]
}
```

#### 3.5.4 MCP 接口 - 多条件查询设备

```
GET /cmdb/assets/mcp
Query Parameters:
  - asset_type: string (资产类型，通过资产模型表的name字段查询，支持模糊匹配)
  - ident: string (主机名称，通过data字段中的name字段精确查询)
  - ip: string (主机IP，通过data字段中的ip字段精确查询)

Response:
{
  "dat": [
    {
      "name": "server-001",
      "ip": "192.168.1.100",
      "asset_type": "server"
    }
  ]
}
```

#### 3.5.5 获取机柜列表（按机房 ID）

```
GET /cmdb/asset-racks/:id
Path Parameters:
  - id: int64 (机房ID，即belong_room字段值)

Response:
{
  "dat": [
    {
      "id": 5,
      "gid": 20,
      "status": "active",
      "data": {
        "name": "A01",
        "code": "RACK-A01",
        "belong_room": 1,
        "position_x": 10.5,
        "position_y": 5.2,
        "total_u": 42,
        "power_capacity": 10.0
      },
      ...
    }
  ]
}
```

#### 3.5.6 获取所有机柜列表

```
GET /cmdb/assets/racks

Response:
{
  "dat": [
    {
      "id": 5,
      "gid": 20,
      "data": {
        "name": "A01",
        "code": "RACK-A01",
        "belong_room": 1,
        ...
      },
      ...
    }
  ]
}
```

#### 3.5.7 数据模型说明

**Asset 模型字段说明：**

- `id`: int64，设备主键 ID
- `gid`: int64，资产模型 ID，关联 asset_model 表
- `status`: string，设备状态（online/offline/maintenance 等）
- `scrape`: string，采集状态
- `tags`: string，标签字符串，格式为"key1=value1 key2=value2"
- `data`: JSON 对象，存储设备的详细属性，包括：
  - `name`: 设备名称（必填）
  - `ip`: 设备 IP 地址
  - `category`: 设备分类
  - `belong_room`: int，所属机房 ID
  - `belong_rack`: int，所属机柜 ID
  - `model`: int，设备型号 ID
  - `manufacturer`: 制造商
  - `model_name`: 型号名称
  - `spec`: 规格信息（JSON 对象）
  - `password`: 加密后的密码
  - `port`: 端口号
  - `auth_snmp`: int，是否支持 SNMP 认证
  - `auth_telnet`: int，是否支持 Telnet 认证

**AssetModel 模型字段说明：**

- `id`: int64，资产模型主键 ID
- `name`: string，资产模型名称（如"服务器/物理机"）
- `unique_identifier`: string，唯一标识符（如"server", "rack", "switch"）

**字段关联说明：**

1. **机柜字段（belong_rack）获取方式：**

   - 通过查询 `rack_devices` 表，使用 `device_id` 关联 `asset.id`
   - 从 `rack_devices` 表获取 `rack_id`
   - 通过 `rack_id` 查询 `racks` 表获取机柜名称（`name` 字段）
   - 查询路径：`asset.id` -> `rack_devices.device_id` -> `rack_devices.rack_id` -> `racks.id` -> `racks.name`

2. **机房字段（belong_room）获取方式：**
   - 通过查询 `rack_devices` 表，使用 `device_id` 关联 `asset.id`
   - 从 `rack_devices` 表获取 `rack_id`
   - 通过 `rack_id` 查询 `racks` 表获取 `room_id`
   - 通过 `room_id` 查询 `rooms` 表获取机房名称（`name` 字段）
   - 查询路径：`asset.id` -> `rack_devices.device_id` -> `rack_devices.rack_id` -> `racks.id` -> `racks.room_id` -> `rooms.id` -> `rooms.name`

**注意事项：**

1. 设备 ID 使用 int64 类型，不是字符串
2. 设备详细信息存储在`data` JSON 字段中，查询时使用`data->'$.field_name'`语法
3. 通过`gid`字段关联资产模型，通过`data->'$.belong_room'`和`data->'$.belong_rack'`关联机房和机柜（仅作为备用字段）
4. **实际机柜和机房名称通过 `rack_devices` 表关联查询获取**，确保数据准确性
5. 标签使用空格分隔的 key=value 格式存储
6. 查询接口支持分页，通过`limit`和`offset`参数控制
7. 搜索功能支持在名称、IP、标签等字段中模糊匹配

### 3.6 统计接口

#### 3.6.1 机房统计

```
GET /cmdb/rooms/:id/statistics

Response:
{
  "dat": {
    "rackTotal": 50,
    "rackUsed": 45,
    "rackAvailable": 5,
    "deviceTotal": 500,
    "uTotal": 2100,      // 总U数
    "uUsed": 1800,       // 已用U数
    "uUsageRate": 0.857, // U位使用率
    "powerTotal": 500.0, // 总功率(KW)
    "powerUsed": 350.0,  // 已用功率
    "powerUsageRate": 0.7,
    "alarmCount": 5
  }
}
```

#### 3.6.2 机柜统计

```
GET /cmdb/racks/:id/statistics

Response:
{
  "dat": {
    "deviceCount": 10,
    "uUsed": 15,
    "uAvailable": 27,
    "uUsageRate": 0.357,
    "powerUsed": 3.5,
    "powerAvailable": 6.5,
    "powerUsageRate": 0.35,
    "networkPortsUsed": 20,
    "networkPortsAvailable": 24
  }
}
```

---

## 四、开发阶段规划

### 阶段一：数据模型与数据库设计 (Week 1)

#### 4.1 数据库设计

- [ ] 设计数据库表结构
- [ ] 创建数据库迁移脚本
- [ ] 定义索引和约束
- [ ] 编写数据模型（Go Struct）

#### 4.2 基础项目结构

- [ ] 创建项目目录结构
- [ ] 配置数据库连接
- [ ] 配置 ORM 框架
- [ ] 编写基础工具函数

#### 4.3 数据访问层（DAO）

- [ ] Room 数据访问层
- [ ] Rack 数据访问层
- [ ] RackDevice 数据访问层
- [ ] RoomLayout 数据访问层

**交付物：**

- 数据库表创建完成
- 数据模型定义完成
- 数据访问层基础功能完成

---

### 阶段二：核心 API 开发 (Week 2)

#### 4.4 机房管理 API

- [ ] 机房列表查询接口
- [ ] 机房详情查询接口
- [ ] 机房创建接口
- [ ] 机房更新接口
- [ ] 机房删除接口

#### 4.5 机柜管理 API

- [ ] 机柜详情查询接口
- [ ] 机柜创建接口
- [ ] 机柜更新接口
- [ ] 机柜删除接口

#### 4.6 布局管理 API

- [ ] 机房布局更新接口
- [ ] 机房布局查询接口

**交付物：**

- 机房和机柜基础 CRUD 接口完成
- 布局管理接口完成

---

### 阶段三：设备管理 API (Week 3)

#### 4.7 设备管理 API

- [ ] 添加设备到机柜接口
- [ ] 更新设备位置接口
- [ ] 从机柜移除设备接口
- [ ] U 位占用验证接口

#### 4.8 U 位管理逻辑

- [ ] U 位占用检查算法
- [ ] U 位冲突检测
- [ ] U 位自动推荐算法（可选）

#### 4.9 设备状态同步

- [ ] 设备状态更新机制
- [ ] 设备容量计算（U 位、功率）

**交付物：**

- 设备管理接口完成
- U 位管理逻辑完善
- 设备容量自动计算

---

### 阶段四：CMDB 集成 (Week 4)

#### 4.10 CMDB 接口封装

- [ ] CMDB 客户端封装
- [ ] 设备查询接口
- [ ] 设备详情接口
- [ ] 错误处理和重试机制

#### 4.11 数据同步机制

- [ ] 设备数据缓存策略
- [ ] 增量同步机制
- [ ] 数据一致性保证

#### 4.12 CMDB 代理接口

- [ ] 获取 CMDB 设备列表接口
- [ ] 获取 CMDB 设备详情接口
- [ ] 设备搜索接口

**交付物：**

- CMDB 集成完成
- 数据同步机制正常
- CMDB 代理接口可用

---

### 阶段五：统计与优化 (Week 5)

#### 4.13 统计接口开发

- [ ] 机房统计接口
- [ ] 机柜统计接口
- [ ] 全局统计接口（可选）

#### 4.14 性能优化

- [ ] 数据库查询优化
- [ ] 缓存机制（Redis）
- [ ] 批量操作优化

#### 4.15 数据校验与约束

- [ ] 输入数据校验
- [ ] 业务规则校验
- [ ] 数据完整性约束

#### 4.16 错误处理

- [ ] 统一错误处理
- [ ] 错误码定义
- [ ] 错误日志记录

#### 4.17 单元测试

- [ ] 数据访问层测试
- [ ] 业务逻辑层测试
- [ ] API 接口测试

**交付物：**

- 统计接口完成
- 性能优化完成
- 测试覆盖率达标

---

## 五、技术实现细节

### 5.1 U 位占用检查算法

```go
// 检查U位是否可用
func (r *RackService) CheckUPosition(rackID int64, startU, heightU int, excludeDeviceID *int64) (bool, []RackDevice, error) {
    endU := startU + heightU - 1

    // 查询机柜中所有设备
    devices, err := r.repo.GetDevicesByRackID(rackID)
    if err != nil {
        return false, nil, err
    }

    var conflicts []RackDevice
    for _, device := range devices {
        // 排除指定设备
        if excludeDeviceID != nil && device.DeviceID == *excludeDeviceID {
            continue
        }

        deviceEndU := device.StartU + device.HeightU - 1

        // 检查U位是否冲突
        if !(endU < device.StartU || startU > deviceEndU) {
            conflicts = append(conflicts, device)
        }
    }

    return len(conflicts) == 0, conflicts, nil
}
```

### 5.2 容量自动计算

```go
// 更新机柜使用容量
func (r *RackService) UpdateRackCapacity(rackID int64) error {
    devices, err := r.repo.GetDevicesByRackID(rackID)
    if err != nil {
        return err
    }

    var usedU int
    var powerUsed float64

    for _, device := range devices {
        usedU += device.HeightU
        // 从CMDB获取设备功率（需要实现）
        // powerUsed += device.Power
    }

    rack := &Rack{
        ID: rackID,
        UsedU: usedU,
        PowerUsed: powerUsed,
    }

    return r.repo.UpdateRack(rack)
}
```

### 5.3 布局数据存储

```go
// 保存机房布局
type RackLayout struct {
    RackID   int64   `json:"rackId"`
    X        float64 `json:"x"`
    Y        float64 `json:"y"`
    Rotation int     `json:"rotation"`
}

func (s *RoomService) SaveLayout(roomID int64, layout *RoomLayout) error {
    // 将机柜布局转换为JSON
    rackLayoutsJSON, err := json.Marshal(layout.RackLayouts)
    if err != nil {
        return err
    }

    // 更新或创建布局记录
    roomLayout := &RoomLayout{
        RoomID:      roomID,
        CanvasScale: layout.CanvasScale,
        CanvasX:     layout.CanvasX,
        CanvasY:     layout.CanvasY,
        RackLayouts: string(rackLayoutsJSON),
    }

    return s.repo.SaveRoomLayout(roomLayout)
}
```

---

## 六、数据库设计详细说明

### 6.1 表关系图

```
rooms (1) ----< (N) racks
racks (1) ----< (N) rack_devices
rooms (1) ----< (1) room_layouts
```

### 6.2 字段说明

#### rooms 表

- `id`: 主键，自增
- `code`: 机房编号，唯一，用于业务标识
- `status`: 状态枚举值（active/inactive/maintenance）

#### racks 表

- `room_id`: 外键，关联 rooms.id
- `code`: 机柜编号，全局唯一
- `position_x`, `position_y`: 机柜在机房中的位置（单位：米或像素）
- `rotation`: 旋转角度，0 或 90 度

#### rack_devices 表

- `rack_id`: 外键，关联 racks.id
- `device_id`: CMDB 设备 ID，int64 类型，关联 asset.id
- `start_u`: 起始 U 位，1-42
- `height_u`: 占用 U 数，必须>0

---

## 七、API 接口规范

### 7.1 统一响应格式

```go
type Response struct {
    Dat interface{} `json:"dat"`
    Err string      `json:"err,omitempty"`
}
```

### 7.2 分页响应格式

```go
type PageResponse struct {
    List     interface{} `json:"list"`
    Total    int64       `json:"total"`
    Page     int         `json:"page"`
    PageSize int         `json:"pageSize"`
}
```

### 7.3 错误码定义

- `10001`: 参数错误
- `10002`: 数据不存在
- `10003`: 数据已存在
- `10004`: U 位冲突
- `10005`: 容量不足
- `20001`: 数据库错误
- `20002`: CMDB 接口错误
- `30001`: 权限不足

---

## 八、CMDB 集成方案

### 8.1 集成方式

- **内部 API 调用**：IDC 机房管理模块与 CMDB 在同一系统中，直接调用 CMDB 的 API 接口
- **数据库查询**：通过 ORM 直接查询 asset 表和 asset_model 表
- **数据同步**：通过 asset 表的 data JSON 字段中的 belong_room 和 belong_rack 字段建立关联

### 8.2 数据映射

#### CMDB Asset 模型映射

```go
// CMDB Asset模型（已存在）
type Asset struct {
    Id         int64             `json:"id" gorm:"primaryKey"`
    Gid        int64             `json:"gid"`  // 关联asset_model.id
    Status     string            `json:"status"`
    Scrape     string            `json:"scrape"`
    Tags       string            `json:"-"`    // 标签字符串
    TagsJSON   []string          `json:"tags" gorm:"-"`
    TagsMap    map[string]string `json:"tags_maps" gorm:"-"`
    Data       ormx.JSONObj      `json:"data"` // JSON字段，存储设备详细信息
    AssetType  string            `json:"asset_type" gorm:"-"`
    CreateAt   int64             `json:"create_at"`
    UpdateAt   int64             `json:"update_at"`
    CreateBy   string            `json:"create_by"`
    UpdateBy   string            `json:"update_by"`
}

// Asset的Data字段结构（JSON）
type AssetData struct {
    Name        string `json:"name"`         // 设备名称（必填）
    Ip          string `json:"ip"`           // IP地址
    Category    string `json:"category"`     // 设备分类
    BelongRoom  int    `json:"belong_room"`  // 所属机房ID
    BelongRack  int    `json:"belong_rack"`  // 所属机柜ID
    Model       int    `json:"model"`        // 设备型号ID
    Manufacturer string `json:"manufacturer"` // 制造商
    ModelName   string `json:"model_name"`   // 型号名称
    Spec        map[string]interface{} `json:"spec"` // 规格信息
    Password    string `json:"password"`     // 加密密码
    Port        string `json:"port"`        // 端口号
    AuthSnmp    int    `json:"auth_snmp"`   // SNMP认证
    AuthTelnet  int    `json:"auth_telnet"` // Telnet认证
}

// AssetModel模型（资产模型）
type AssetModel struct {
    Id               int64  `json:"id" gorm:"primaryKey"`
    Name             string `json:"name"`              // 如"服务器/物理机"
    UniqueIdentifier string `json:"uniqueIdentifier"` // 如"server", "rack", "switch"
}
```

#### 机柜设备关联映射

```go
// RackDevice模型（IDC模块）
type RackDevice struct {
    ID          int64     `gorm:"primaryKey;autoIncrement"`
    RackID      int64     `gorm:"not null;index;comment:所属机柜ID"`
    DeviceID    int64     `gorm:"not null;index;comment:CMDB设备ID，关联asset.id"`
    DeviceName  string    `gorm:"type:varchar(200);comment:设备名称"`
    StartU      int       `gorm:"not null;comment:起始U位(1-42)"`
    HeightU     int       `gorm:"not null;comment:占用U数"`
    DeviceType  string    `gorm:"type:varchar(50);comment:设备类型"`
    Status      string    `gorm:"type:varchar(20);default:online;comment:设备状态"`
    InstallDate time.Time `gorm:"comment:安装日期"`
    CreatedAt   time.Time
    UpdatedAt   time.Time
    DeletedAt   gorm.DeletedAt `gorm:"index"`

    // 关联关系
    Rack        Rack      `gorm:"foreignKey:RackID"`
    // 通过DeviceID关联Asset，需要查询时JOIN asset表
}
```

### 8.3 数据同步策略

#### 8.3.1 设备添加流程

1. 用户选择 CMDB 设备（通过`GET /cmdb/assets`接口查询）
2. 验证设备是否已存在于机柜中（查询 rack_devices 表）
3. 验证 U 位是否可用（调用 U 位检查接口）
4. 创建 rack_device 记录，关联 asset.id
5. 更新 asset 表的 data 字段，设置 belong_rack 字段
6. 更新机柜的 used_u 和 power_used 字段

#### 8.3.2 设备信息同步

- **实时查询**：通过`GET /cmdb/asset/:id`接口实时获取设备最新信息
- **状态同步**：设备状态变更时，同步更新 rack_device 表的 status 字段
- **位置同步**：设备在机柜中的位置变更时，更新 rack_device 表的 start_u 和 height_u 字段
- **机柜和机房字段获取**：
  - 查询资产列表或详情时，通过 `rack_devices` 表关联查询获取机柜名称
  - 查询路径：`asset.id` -> `rack_devices.device_id` -> `rack_devices.rack_id` -> `racks.id` -> `racks.name`（机柜名称）
  - 继续查询：`racks.room_id` -> `rooms.id` -> `rooms.name`（机房名称）
  - 确保返回的 `belong_rack` 和 `belong_room` 字段为实际名称，而非 ID

#### 8.3.3 数据一致性保证

- 使用数据库事务保证 rack_device 和 asset 表数据的一致性
- 通过外键约束保证 device_id 的有效性
- 定期校验 rack_device 表中的 device_id 是否在 asset 表中存在

### 8.4 API 调用示例

#### 查询设备列表

```go
// 查询服务器类型的设备
GET /cmdb/assets?gids=10&query=server&limit=100&offset=0

// 按资产类型查询
GET /cmdb/assets/server

// MCP接口多条件查询
GET /cmdb/assets/mcp?asset_type=server&ident=server-001
```

#### 获取设备详情

```go
// 获取设备详细信息
GET /cmdb/asset/1
```

#### 查询机柜列表

```go
// 查询某个机房下的机柜
GET /cmdb/asset-racks/1

// 查询所有机柜
GET /cmdb/assets/racks
```

---

## 九、性能优化策略

### 9.1 数据库优化

- 合理使用索引
- 避免 N+1 查询，使用预加载
- 分页查询大数据量
- 使用连接池

### 9.2 缓存策略

- Redis 缓存机房列表
- Redis 缓存机柜详情（TTL: 5 分钟）
- 缓存 CMDB 设备信息（TTL: 10 分钟）

### 9.3 批量操作

- 批量更新机柜布局
- 批量查询设备信息

---

## 十、测试计划

### 10.1 单元测试

- 数据访问层测试
- 业务逻辑层测试
- U 位计算算法测试

### 10.2 集成测试

- API 接口测试
- CMDB 集成测试
- 数据库操作测试

### 10.3 性能测试

- 接口响应时间测试
- 并发压力测试
- 数据库查询性能测试

---

## 十一、部署与运维

### 11.1 数据库迁移

- 使用数据库迁移工具
- 版本化管理迁移脚本

### 11.2 配置管理

- 环境变量配置
- 配置文件管理
- CMDB 连接配置

### 11.3 监控与日志

- 接口访问日志
- 错误日志记录
- 性能监控指标

---

## 十二、风险评估

| 风险             | 影响 | 概率 | 应对措施                   |
| ---------------- | ---- | ---- | -------------------------- |
| CMDB 接口不稳定  | 高   | 中   | 增加重试机制，提供缓存降级 |
| U 位冲突检测遗漏 | 高   | 低   | 完善测试用例，数据库约束   |
| 性能问题         | 中   | 中   | 提前进行性能测试，优化查询 |
| 数据一致性       | 中   | 中   | 事务处理，数据校验         |

---

## 十三、后续迭代计划

### 13.1 第二期功能

- 机柜间连接关系管理
- 网络拓扑数据支持
- 设备端口管理
- 工单流程集成

### 13.2 第三期功能

- 智能布局推荐
- 容量预测分析
- 设备生命周期管理
- 自动化运维集成
