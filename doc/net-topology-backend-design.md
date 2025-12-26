# 网络拓扑管理 - 后端设计文档

## 一、项目概述

### 1.1 功能目标

- 提供网络拓扑管理的完整数据模型和 API 接口
- 支持拓扑视图、节点、连接关系的 CRUD 操作
- 与 CMDB 系统集成，只返回已监控状态的资产设备
- 从 Prometheus 查询端口信息和设备状态
- 提供状态监控数据接口

### 1.2 技术栈

- 语言: Go 1.23.10
- 数据库: MySQL
- Web 框架: 待定（Gin/Echo/Iris 等，需根据项目现有框架选择）
- ORM: GORM
- Prometheus 客户端: prometheus/client_golang

---

## 二、数据模型设计

### 2.1 核心实体

#### 拓扑视图 (TopologyView)

```go
type TopologyView struct {
    ID          int64     `gorm:"primaryKey;autoIncrement"`
    Name        string    `gorm:"type:varchar(100);not null;comment:视图名称"`
    Type        string    `gorm:"type:varchar(20);comment:视图类型(room/rack/cross-room/business)"`
    RoomID      *int64    `gorm:"index;comment:关联机房ID"`
    RackID      *int64    `gorm:"index;comment:关联机柜ID"`
    CanvasScale float64   `gorm:"default:1;comment:画布缩放比例"`
    CanvasX     float64   `gorm:"default:0;comment:画布X偏移"`
    CanvasY     float64   `gorm:"default:0;comment:画布Y偏移"`
    Description string    `gorm:"type:text;comment:描述"`
    CreatedAt   time.Time
    UpdatedAt   time.Time
    DeletedAt   gorm.DeletedAt `gorm:"index"`

    // 关联关系
    Nodes       []TopologyNode       `gorm:"foreignKey:ViewID"`
    Connections []TopologyConnection `gorm:"foreignKey:ViewID"`
}
```

#### 拓扑节点 (TopologyNode)

```go
type TopologyNode struct {
    ID          string    `gorm:"primaryKey;type:varchar(50);comment:节点ID"`
    ViewID      int64     `gorm:"not null;index;comment:所属视图ID"`
    AssetID     int64     `gorm:"not null;index;comment:CMDB资产ID，关联asset.id"`
    Name      string    `gorm:"type:varchar(200);not null;comment:节点名称"`
    DeviceType  string    `gorm:"type:varchar(50);comment:设备类型"`
    DeviceIcon  string    `gorm:"type:varchar(100);comment:设备图标"`
    IP          string    `gorm:"type:varchar(50);comment:设备IP"`
    RoomID      *int64    `gorm:"index;comment:所属机房ID"`
    RoomName    string    `gorm:"type:varchar(100);comment:所属机房名称"`
    RackID      *int64    `gorm:"index;comment:所属机柜ID"`
    RackName    string    `gorm:"type:varchar(100);comment:所属机柜名称"`
    PositionX   float64   `gorm:"comment:节点X坐标"`
    PositionY   float64   `gorm:"comment:节点Y坐标"`
    CreatedAt   time.Time
    UpdatedAt   time.Time
    DeletedAt   gorm.DeletedAt `gorm:"index"`

    // 关联关系
    View                TopologyView       `gorm:"foreignKey:ViewID"`
    SourceConnections   []TopologyConnection `gorm:"foreignKey:SourceNodeID"`
    TargetConnections   []TopologyConnection `gorm:"foreignKey:TargetNodeID"`
}
```

#### 连接关系 (TopologyConnection)

```go
type TopologyConnection struct {
    ID           string    `gorm:"primaryKey;type:varchar(50);comment:连接ID"`
    ViewID       int64     `gorm:"not null;index;comment:所属视图ID"`
    SourceNodeID string    `gorm:"type:varchar(50);not null;index;comment:源节点ID"`
    SourcePort   string    `gorm:"type:varchar(50);not null;comment:源端口编号"`
    TargetNodeID string    `gorm:"type:varchar(50);not null;index;comment:目标节点ID"`
    TargetPort   string    `gorm:"type:varchar(50);not null;comment:目标端口编号"`
    CreatedAt    time.Time
    UpdatedAt    time.Time
    DeletedAt    gorm.DeletedAt `gorm:"index"`

    // 关联关系
    View        TopologyView `gorm:"foreignKey:ViewID"`
    SourceNode  TopologyNode `gorm:"foreignKey:SourceNodeID"`
    TargetNode  TopologyNode `gorm:"foreignKey:TargetNodeID"`
}
```

### 2.2 数据库表设计

#### 表结构

- `topology_views` - 拓扑视图表
- `topology_nodes` - 拓扑节点表
- `topology_connections` - 连接关系表

#### 索引设计

- `topology_views.room_id` - 普通索引
- `topology_views.rack_id` - 普通索引
- `topology_nodes.view_id` - 普通索引
- `topology_nodes.asset_id` - 普通索引
- `topology_nodes.room_id` - 普通索引
- `topology_nodes.rack_id` - 普通索引
- `topology_connections.view_id` - 普通索引
- `topology_connections.source_node_id` - 普通索引
- `topology_connections.target_node_id` - 普通索引

---

## 三、API 接口设计

### 3.1 拓扑视图管理接口

#### 3.1.1 获取拓扑视图列表

```
GET /cmdb/topology/views
Query Parameters:
  - page: int (页码，默认1)
  - pageSize: int (每页数量，默认20)
  - keyword: string (搜索关键词)
  - type: string (视图类型：room/rack/cross-room/business)

Response:
{
  "dat": {
    "list": [
      {
        "id": 1,
        "name": "核心机房A网络拓扑",
        "type": "room",
        "roomId": 1,
        "roomName": "核心机房A",
        "rackId": null,
        "canvasScale": 1.0,
        "canvasX": 0,
        "canvasY": 0,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100
  }
}
```

#### 3.1.2 获取拓扑视图详情

```
GET /cmdb/topology/views/:viewId
Path Parameters:
  - viewId: int64 (视图ID)

Response:
{
  "dat": {
    "id": 1,
    "name": "核心机房A网络拓扑",
    "type": "room",
    "roomId": 1,
    "roomName": "核心机房A",
    "rackId": null,
    "canvasScale": 1.0,
    "canvasX": 0,
    "canvasY": 0,
    "description": "核心机房A的网络拓扑视图",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 3.1.3 创建拓扑视图

```
POST /cmdb/topology/views
Body:
{
  "name": "新拓扑视图",
  "type": "room",
  "roomId": 1,
  "rackId": null,
  "canvasScale": 1.0,
  "canvasX": 0,
  "canvasY": 0,
  "description": "描述信息"
}

Response:
{
  "dat": {
    "id": 2,
    "name": "新拓扑视图",
    ...
  }
}
```

#### 3.1.4 更新拓扑视图

```
PUT /cmdb/topology/views/:viewId
Body: (同创建接口)

Response:
{
  "dat": "ok"
}
```

#### 3.1.5 删除拓扑视图

```
DELETE /cmdb/topology/views/:viewId

Response:
{
  "dat": "ok"
}

说明：
- 删除视图时，需要级联删除关联的节点和连接关系
```

---

### 3.2 拓扑节点管理接口

#### 3.2.1 获取拓扑节点列表

```
GET /cmdb/topology/views/:viewId/nodes
Path Parameters:
  - viewId: int64 (视图ID)

Response:
{
  "dat": [
    {
      "id": "node-001",
      "viewId": 1,
      "assetId": 100,
      "name": "交换机-001",
      "deviceType": "switch",
      "deviceIcon": "switch",
      "ip": "192.168.1.1",
      "roomId": 1,
      "roomName": "核心机房A",
      "rackId": 5,
      "rackName": "A01",
      "position": {
        "x": 100.5,
        "y": 200.3
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 3.2.2 添加拓扑节点

```
POST /cmdb/topology/views/:viewId/nodes
Path Parameters:
  - viewId: int64 (视图ID)

Body:
{
  "assetId": 100, // CMDB资产ID
  "position": {
    "x": 100.5,
    "y": 200.3
  }
}

Response:
{
  "dat": {
    "id": "node-001",
    "viewId": 1,
    "assetId": 100,
    "name": "交换机-001",
    "deviceType": "switch",
    "deviceIcon": "switch",
    "ip": "192.168.1.1",
    "roomId": 1,
    "roomName": "核心机房A",
    "rackId": 5,
    "rackName": "A01",
    "position": {
      "x": 100.5,
      "y": 200.3
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}

业务逻辑：
1. 验证assetId是否存在且已监控状态
2. 从CMDB获取资产信息（名称、IP、设备类型等）
3. 从机房管理模块获取机房和机柜信息
4. 生成节点ID（建议使用UUID或时间戳+随机数）
5. 创建节点记录
6. 返回节点信息
```

#### 3.2.3 更新拓扑节点

```
PUT /cmdb/topology/nodes/:nodeId
Path Parameters:
  - nodeId: string (节点ID)

Body:
{
  "name": "交换机-001-修改",
  "position": {
    "x": 150.5,
    "y": 250.3
  }
}

Response:
{
  "dat": "ok"
```

#### 3.2.4 批量更新节点位置

```
PUT /cmdb/topology/views/:viewId/nodes/positions
Path Parameters:
  - viewId: int64 (视图ID)

Body:
{
  "positions": [
    {
      "nodeId": "node-001",
      "x": 150.5,
      "y": 250.3
    },
    {
      "nodeId": "node-002",
      "x": 200.5,
      "y": 300.3
    }
  ]
}

Response:
{
  "dat": "ok"
}

说明：
- 用于批量保存节点位置，提升性能
- 建议前端使用防抖，减少请求次数
```

#### 3.2.5 删除拓扑节点

```
DELETE /cmdb/topology/nodes/:nodeId
Path Parameters:
  - nodeId: string (节点ID)

Response:
{
  "dat": "ok"
}

业务逻辑：
1. 检查节点是否存在
2. 检查是否有连接关系关联此节点
3. 如有连接关系，提示用户先删除连接（或级联删除）
4. 删除节点记录
```

---

### 3.3 连接关系管理接口

#### 3.3.1 获取连接关系列表

```
GET /cmdb/topology/views/:viewId/connections
Path Parameters:
  - viewId: int64 (视图ID)

Response:
{
  "dat": [
    {
      "id": "conn-001",
      "viewId": 1,
      "sourceNodeId": "node-001",
      "sourcePort": "GigabitEthernet0/1",
      "targetNodeId": "node-002",
      "targetPort": "GigabitEthernet0/2",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 3.3.2 添加连接关系

```
POST /cmdb/topology/views/:viewId/connections
Path Parameters:
  - viewId: int64 (视图ID)

Body:
{
  "sourceNodeId": "node-001",
  "sourcePort": "GigabitEthernet0/1", // 端口编号
  "targetNodeId": "node-002",
  "targetPort": "GigabitEthernet0/2" // 端口编号
}

Response:
{
  "dat": {
    "id": "conn-001",
    "viewId": 1,
    "sourceNodeId": "node-001",
    "sourcePort": "GigabitEthernet0/1",
    "targetNodeId": "node-002",
    "targetPort": "GigabitEthernet0/2",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}

业务逻辑：
1. 验证源节点和目标节点是否存在
2. 验证源端口和目标端口是否存在（通过Prometheus查询）
3. 检查连接是否已存在（防止重复连接）
4. 检查端口是否已被其他连接使用（不允许同一个端口多个连接）
   - 检查源端口是否已被其他连接使用
   - 检查目标端口是否已被其他连接使用
   - 如果端口已被使用，返回错误
5. 创建连接记录
6. 返回连接信息
```

#### 3.3.3 更新连接关系

```
PUT /cmdb/topology/connections/:connectionId
Path Parameters:
  - connectionId: string (连接ID)

Body:
{
  "sourcePort": "GigabitEthernet0/2",
  "targetPort": "GigabitEthernet0/3"
}

Response:
{
  "dat": "ok"
}
```

#### 3.3.4 删除连接关系

```
DELETE /cmdb/topology/connections/:connectionId
Path Parameters:
  - connectionId: string (连接ID)

Response:
{
  "dat": "ok"
}
```

---

### 3.4 已监控资产设备查询接口

#### 3.4.1 获取已监控资产设备列表

```
GET /cmdb/topology/assets/monitored
Query Parameters:
  - page: int (页码，默认1)
  - pageSize: int (每页数量，默认20)
  - keyword: string (搜索关键词：设备名称、IP)
  - gids: string (资产模型ID，多个用逗号分隔，如"10,20,30")
  - roomId: int (机房ID)
  - rackId: int (机柜ID)
  - status: string (状态筛选：online/offline/unknown)

Response:
{
  "dat": {
    "list": [
      {
        "id": 100,
        "name": "交换机-001",
        "ip": "192.168.1.1",
        "deviceType": "switch",
        "gid": 20,
        "roomId": 1,
        "roomName": "核心机房A",
        "rackId": 5,
        "rackName": "A01",
        "status": "online"
      }
    ],
    "total": 100
  }
}

业务逻辑：
1. 从CMDB查询资产设备，过滤条件：
   - 通过asset表的gid关联asset_model表
   - 只返回asset_model表的unique_identifier字段为"host_"或"net_"开头的资产（服务器和网络设备）
   - 根据gids、roomId、rackId进一步筛选
2. 对每个资产设备，通过Prometheus验证监控状态
   - 查询条件：ident标签 = 资产设备的名称（从asset.data JSON字段的name字段获取，即data->$.name）
   - 使用指标：snmp_uptime{ident="设备名称"}
   - 如果Prometheus中有该ident的监控数据，则认为已监控
3. 只返回已监控状态的资产设备
4. 根据keyword搜索设备名称和IP
5. 根据status筛选设备状态（从Prometheus查询实时状态）
6. 分页返回结果

关键实现：
- 使用Prometheus API查询：snmp_uptime{ident="设备名称"} > 0
- 如果查询结果存在，则认为设备已监控
- 批量查询优化：使用Prometheus的批量查询接口
- 资产过滤：JOIN asset_model表，WHERE unique_identifier LIKE 'host_%' OR unique_identifier LIKE 'net_%'
```

---

### 3.5 端口信息查询接口

#### 3.5.1 获取设备端口信息

```
GET /cmdb/topology/devices/:assetId/ports
Path Parameters:
  - assetId: int64 (CMDB资产ID)

Response:
{
  "dat": [
    {
      "portNumber": "GigabitEthernet0/1",
      "portName": "GigabitEthernet0/1",
      "status": "up"
    },
    {
      "portNumber": "GigabitEthernet0/2",
      "portName": "GigabitEthernet0/2",
      "status": "down"
    }
  ]
}

业务逻辑：
1. 从CMDB获取资产设备的名称（从asset.data JSON字段的name字段获取，即data->$.name）
2. 通过Prometheus查询端口信息
   - 查询指标：snmp_interface_admin_state{ident="设备名称"}
   - 返回所有端口的状态值
3. 解析端口编号和状态
4. 返回端口列表

Prometheus查询示例：
snmp_interface_admin_state{ident="switch-001"}

返回格式：
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      {
        "metric": {
          "ident": "switch-001",
          "ifDescr": "GigabitEthernet0/1"
        },
        "value": [1234567890, "1"] // 1表示up，2表示down
      }
    ]
  }
}

端口状态映射：
- 1 -> "up"
- 2 -> "down"
- 其他 -> "unknown"

关键实现：
- 使用Prometheus HTTP API查询
- 解析返回的metric和value
- 提取端口编号（ifDescr字段）
- 映射端口状态（value值）
```

---

### 3.6 状态监控接口

#### 3.6.1 获取设备状态（批量）

```
POST /cmdb/topology/devices/status
Body:
{
  "assetIds": [100, 101, 102] // CMDB资产ID数组
}

Response:
{
  "dat": {
    "100": {
      "assetId": 100,
      "status": "online",
      "lastUpdateTime": "2024-01-01T00:00:00Z"
    },
    "101": {
      "assetId": 101,
      "status": "offline",
      "lastUpdateTime": "2024-01-01T00:00:00Z"
    }
  }
}

业务逻辑：
1. 从CMDB获取资产设备的名称列表（从asset.data JSON字段的name字段获取，即data->$.name）
2. 批量查询Prometheus：snmp_uptime{ident=~"设备名称1|设备名称2|..."}
3. 解析返回结果，映射设备状态
4. 返回设备状态Map

Prometheus查询示例：
snmp_uptime{ident=~"switch-001|switch-002|server-001"}

状态映射：
- snmp_uptime{ident="xxx"} > 0 -> "online"
- snmp_uptime{ident="xxx"} = 0 -> "offline"
- 无数据 -> "unknown"
```

#### 3.6.2 获取端口状态

```
GET /cmdb/topology/devices/:assetId/ports/status
Path Parameters:
  - assetId: int64 (CMDB资产ID)

Response:
{
  "dat": {
    "assetId": 100,
    "ports": {
      "GigabitEthernet0/1": "up",
      "GigabitEthernet0/2": "down",
      "GigabitEthernet0/3": "up"
    },
    "lastUpdateTime": "2024-01-01T00:00:00Z"
  }
}

业务逻辑：
1. 从CMDB获取资产设备的名称（从asset.data JSON字段的name字段获取，即data->$.name）
2. 查询Prometheus：snmp_interface_admin_state{ident="设备名称"}
3. 解析端口状态（从ifDescr字段获取端口编号）
4. 返回端口状态Map
```

#### 3.6.3 获取连接状态（批量）

```
POST /cmdb/topology/connections/status
Body:
{
  "connectionIds": ["conn-001", "conn-002"] // 连接ID数组
}

Response:
{
  "dat": {
    "conn-001": {
      "connectionId": "conn-001",
      "status": "up",
      "lastUpdateTime": "2024-01-01T00:00:00Z"
    },
    "conn-002": {
      "connectionId": "conn-002",
      "status": "down",
      "lastUpdateTime": "2024-01-01T00:00:00Z"
    }
  }
}

业务逻辑：
1. 根据连接ID查询连接关系（获取源节点、源端口、目标节点、目标端口）
2. 从源节点和目标节点获取资产ID
3. 查询源端口和目标端口的状态
4. 连接状态计算：
   - 源端口up && 目标端口up -> "up"
   - 源端口down || 目标端口down -> "down"
   - 其他 -> "unknown"
5. 返回连接状态Map
```

---

## 四、Prometheus 集成方案

### 4.1 Prometheus 查询接口

#### 4.1.1 设备监控状态验证

```go
// 验证设备是否已监控
func CheckDeviceMonitored(deviceName string) (bool, error) {
    // 查询Prometheus: snmp_uptime{ident="设备名称"}
    query := fmt.Sprintf(`snmp_uptime{ident="%s"}`, deviceName)
    result, err := prometheusClient.Query(query)
    if err != nil {
        return false, err
    }

    // 如果查询结果存在且值>0，则认为已监控
    if len(result.Data.Result) > 0 {
        value := result.Data.Result[0].Value[1].(string)
        if value != "0" && value != "" {
            return true, nil
        }
    }
    return false, nil
}
```

#### 4.1.2 批量验证设备监控状态

```go
// 批量验证设备监控状态
func BatchCheckDevicesMonitored(deviceNames []string) (map[string]bool, error) {
    // 构建正则表达式查询
    namePattern := strings.Join(deviceNames, "|")
    query := fmt.Sprintf(`snmp_uptime{ident=~"%s"}`, namePattern)

    result, err := prometheusClient.Query(query)
    if err != nil {
        return nil, err
    }

    // 构建结果Map
    monitoredMap := make(map[string]bool)
    for _, name := range deviceNames {
        monitoredMap[name] = false
    }

    // 解析查询结果
    for _, r := range result.Data.Result {
        ident := r.Metric["ident"]
        value := r.Value[1].(string)
        if value != "0" && value != "" {
            monitoredMap[ident] = true
        }
    }

    return monitoredMap, nil
}
```

#### 4.1.3 查询端口信息

```go
// 查询设备端口信息
func GetDevicePorts(deviceName string) ([]Port, error) {
    // 查询Prometheus: snmp_interface_admin_state{ident="设备名称"}
    query := fmt.Sprintf(`snmp_interface_admin_state{ident="%s"}`, deviceName)
    result, err := prometheusClient.Query(query)
    if err != nil {
        return nil, err
    }

    var ports []Port
    for _, r := range result.Data.Result {
        portNumber := r.Metric["ifDescr"] // 端口编号
        portName := r.Metric["ifDescr"]   // 端口名称（通常与端口编号相同）
        statusValue := r.Value[1].(string)

        // 状态映射：1->up, 2->down, 其他->unknown
        status := "unknown"
        if statusValue == "1" {
            status = "up"
        } else if statusValue == "2" {
            status = "down"
        }

        ports = append(ports, Port{
            PortNumber: portNumber,
            PortName:   portName,
            Status:     status,
        })
    }

    return ports, nil
}
```

#### 4.1.4 获取设备状态

```go
// 获取设备状态
func GetDeviceStatus(deviceName string) (string, error) {
    // 查询Prometheus: snmp_uptime{ident="设备名称"}
    query := fmt.Sprintf(`snmp_uptime{ident="%s"}`, deviceName)
    result, err := prometheusClient.Query(query)
    if err != nil {
        return "unknown", err
    }

    // 如果查询结果存在且值>0，则设备在线
    if len(result.Data.Result) > 0 {
        value := result.Data.Result[0].Value[1].(string)
        if value != "0" && value != "" {
            return "online", nil
        } else {
            return "offline", nil
        }
    }
    return "unknown", nil
}
```

#### 4.1.5 获取资产设备名称

```go
// 从CMDB获取资产设备的名称
func GetAssetDeviceName(assetID int64) (string, error) {
    asset, err := cmdbClient.GetAsset(assetID)
    if err != nil {
        return "", err
    }

    // 从asset.data JSON字段的name字段获取设备名称
    deviceName := asset.Data["name"].(string)
    return deviceName, nil
}
```

### 4.2 Prometheus 客户端配置

```go
// Prometheus客户端配置
type PrometheusConfig struct {
    BaseURL string // Prometheus API地址，如 "http://127.0.0.1:9090"
    Timeout time.Duration // 请求超时时间
}

// Prometheus客户端
type PrometheusClient struct {
    config PrometheusConfig
    httpClient *http.Client
}

// 查询接口
func (c *PrometheusClient) Query(query string) (*PrometheusResponse, error) {
    url := fmt.Sprintf("%s//v1/query?query=%s", c.config.BaseURL, url.QueryEscape(query))
    // 发送HTTP请求
    // 解析返回结果
}
```

---

## 五、CMDB 集成方案

### 5.1 资产设备查询

```go
// 查询资产设备（根据筛选条件）
func GetAssets(params AssetListParams) ([]MonitoredAsset, int64, error) {
    // 1. 从CMDB查询资产设备，过滤服务器和网络设备
    // 通过asset表的gid关联asset_model表
    // 只返回asset_model表的unique_identifier字段为"host_"或"net_"开头的资产
    assets, total, err := cmdbClient.GetAssetsWithFilter(params, func(asset Asset, model AssetModel) bool {
        // 过滤条件：unique_identifier为"host_"或"net_"开头
        return strings.HasPrefix(model.UniqueIdentifier, "host_") || strings.HasPrefix(model.UniqueIdentifier, "net_")
    })
    if err != nil {
        return nil, 0, err
    }

    // 2. 提取所有资产的设备名称（从data->$.name获取）
    deviceNames := make([]string, 0, len(assets))
    for _, asset := range assets {
        deviceName := asset.Data["name"].(string) // 从asset.data JSON字段的name字段获取
        deviceNames = append(deviceNames, deviceName)
    }

    // 3. 批量验证监控状态
    monitoredMap, err := BatchCheckDevicesMonitored(deviceNames)
    if err != nil {
        return nil, 0, err
    }

    // 4. 过滤已监控的设备
    monitoredAssets := make([]MonitoredAsset, 0)
    for _, asset := range assets {
        deviceName := asset.Data["name"].(string)
        if monitoredMap[deviceName] {
            // 获取设备状态（从Prometheus查询）
            status, err := GetDeviceStatus(deviceName)
            if err != nil {
                status = "unknown"
            }

            // 获取机房和机柜信息（从rack_devices表关联查询）
            roomName, rackName := GetDeviceLocation(asset.ID)

            monitoredAssets = append(monitoredAssets, MonitoredAsset{
                ID:         asset.ID,
                Name:       asset.Data["name"].(string),
                IP:         asset.Data["ip"].(string),
                DeviceType: asset.AssetType,
                GID:        asset.GID,
                RoomID:     asset.Data["belong_room"].(int),
                RoomName:   roomName,
                RackID:     asset.Data["belong_rack"].(int),
                RackName:   rackName,
                Status:     status,
            })
        }
    }

    // 5. 根据status筛选（如果指定）
    if params.Status != "" {
        filtered := make([]MonitoredAsset, 0)
        for _, asset := range monitoredAssets {
            if asset.Status == params.Status {
                filtered = append(filtered, asset)
            }
        }
        monitoredAssets = filtered
    }

    return monitoredAssets, int64(len(monitoredAssets)), nil
}
```

### 5.2 设备位置信息获取

```go
// 获取设备所属机房和机柜信息
func GetDeviceLocation(assetID int64) (roomName string, rackName string) {
    // 查询rack_devices表，获取rack_id
    var rackDevice RackDevice
    db.Where("device_id = ?", assetID).First(&rackDevice)

    if rackDevice.RackID == 0 {
        return "", ""
    }

    // 查询racks表，获取rack信息和room_id
    var rack Rack
    db.Where("id = ?", rackDevice.RackID).First(&rack)
    rackName = rack.Name

    if rack.RoomID == 0 {
        return "", rackName
    }

    // 查询rooms表，获取room信息
    var room Room
    db.Where("id = ?", rack.RoomID).First(&room)
    roomName = room.Name

    return roomName, rackName
}
```

---

## 六、业务逻辑实现

### 6.1 节点创建业务逻辑

```go
// 创建拓扑节点
func CreateTopologyNode(viewID int64, assetID int64, position Position) (*TopologyNode, error) {
    // 1. 验证视图是否存在
    var view TopologyView
    if err := db.Where("id = ?", viewID).First(&view).Error; err != nil {
        return nil, errors.New("视图不存在")
    }

    // 2. 验证资产是否存在且已监控
    asset, err := cmdbClient.GetAsset(assetID)
    if err != nil {
        return nil, errors.New("资产不存在")
    }

    deviceName := asset.Data["name"].(string) // 从asset.data JSON字段的name字段获取
    monitored, err := CheckDeviceMonitored(deviceName)
    if err != nil {
        return nil, err
    }
    if !monitored {
        return nil, errors.New("资产设备未监控，无法添加到拓扑")
    }

    // 3. 检查节点是否已存在（同一视图不能重复添加同一设备）
    var existingNode TopologyNode
    if err := db.Where("view_id = ? AND asset_id = ?", viewID, assetID).First(&existingNode).Error; err == nil {
        return nil, errors.New("该设备已在此视图中存在")
    }

    // 4. 获取设备信息
    deviceType := asset.AssetType
    deviceIcon := GetDeviceIcon(deviceType)
    name := asset.Data["name"].(string)
    ip := asset.Data["ip"].(string)

    // 5. 获取机房和机柜信息
    roomName, rackName := GetDeviceLocation(assetID)
    var roomID, rackID *int64
    if roomName != "" {
        // 查询room ID
        var room Room
        db.Where("name = ?", roomName).First(&room)
        if room.ID > 0 {
            roomID = &room.ID
        }
    }
    if rackName != "" {
        // 查询rack ID
        var rack Rack
        db.Where("name = ?", rackName).First(&rack)
        if rack.ID > 0 {
            rackID = &rack.ID
        }
    }

    // 6. 生成节点ID
    nodeID := GenerateNodeID()

    // 7. 创建节点
    node := &TopologyNode{
        ID:         nodeID,
        ViewID:     viewID,
        AssetID:    assetID,
        Name:       name,
        DeviceType: deviceType,
        DeviceIcon: deviceIcon,
        IP:         ip,
        RoomID:     roomID,
        RoomName:   roomName,
        RackID:    rackID,
        RackName:   rackName,
        PositionX:  position.X,
        PositionY:  position.Y,
    }

    if err := db.Create(node).Error; err != nil {
        return nil, err
    }

    return node, nil
}
```

### 6.2 连接创建业务逻辑

```go
// 创建连接关系
func CreateTopologyConnection(viewID int64, sourceNodeID string, sourcePort string, targetNodeID string, targetPort string) (*TopologyConnection, error) {
    // 1. 验证视图是否存在
    var view TopologyView
    if err := db.Where("id = ?", viewID).First(&view).Error; err != nil {
        return nil, errors.New("视图不存在")
    }

    // 2. 验证源节点和目标节点是否存在
    var sourceNode, targetNode TopologyNode
    if err := db.Where("id = ?", sourceNodeID).First(&sourceNode).Error; err != nil {
        return nil, errors.New("源节点不存在")
    }
    if err := db.Where("id = ?", targetNodeID).First(&targetNode).Error; err != nil {
        return nil, errors.New("目标节点不存在")
    }

    // 3. 验证端口是否存在（通过Prometheus查询）
    // 获取源设备和目标设备的名称（从asset.data JSON字段的name字段获取）
    sourceDeviceName, err := GetAssetDeviceName(sourceNode.AssetID)
    if err != nil {
        return nil, errors.New("无法获取源设备名称")
    }
    targetDeviceName, err := GetAssetDeviceName(targetNode.AssetID)
    if err != nil {
        return nil, errors.New("无法获取目标设备名称")
    }

    sourcePorts, err := GetDevicePorts(sourceDeviceName)
    if err != nil {
        return nil, err
    }
    targetPorts, err := GetDevicePorts(targetDeviceName)
    if err != nil {
        return nil, err
    }

    // 检查源端口是否存在
    sourcePortExists := false
    for _, p := range sourcePorts {
        if p.PortNumber == sourcePort {
            sourcePortExists = true
            break
        }
    }
    if !sourcePortExists {
        return nil, errors.New("源端口不存在")
    }

    // 检查目标端口是否存在
    targetPortExists := false
    for _, p := range targetPorts {
        if p.PortNumber == targetPort {
            targetPortExists = true
            break
        }
    }
    if !targetPortExists {
        return nil, errors.New("目标端口不存在")
    }

    // 4. 检查连接是否已存在（防止重复连接）
    var existingConn TopologyConnection
    if err := db.Where("view_id = ? AND source_node_id = ? AND source_port = ? AND target_node_id = ? AND target_port = ?",
        viewID, sourceNodeID, sourcePort, targetNodeID, targetPort).First(&existingConn).Error; err == nil {
        return nil, errors.New("连接已存在")
    }

    // 5. 检查端口是否已被其他连接使用（不允许同一个端口多个连接）
    // 检查源端口是否已被使用
    var sourcePortUsed TopologyConnection
    if err := db.Where("(source_node_id = ? AND source_port = ?) OR (target_node_id = ? AND target_port = ?)",
        sourceNodeID, sourcePort, sourceNodeID, sourcePort).First(&sourcePortUsed).Error; err == nil {
        return nil, errors.New("源端口已被其他连接使用")
    }

    // 检查目标端口是否已被使用
    var targetPortUsed TopologyConnection
    if err := db.Where("(source_node_id = ? AND source_port = ?) OR (target_node_id = ? AND target_port = ?)",
        targetNodeID, targetPort, targetNodeID, targetPort).First(&targetPortUsed).Error; err == nil {
        return nil, errors.New("目标端口已被其他连接使用")
    }

    // 6. 生成连接ID
    connectionID := GenerateConnectionID()

    // 7. 创建连接
    connection := &TopologyConnection{
        ID:           connectionID,
        ViewID:       viewID,
        SourceNodeID: sourceNodeID,
        SourcePort:   sourcePort,
        TargetNodeID: targetNodeID,
        TargetPort:   targetPort,
    }

    if err := db.Create(connection).Error; err != nil {
        return nil, err
    }

    return connection, nil
}
```

---

## 七、错误处理

### 7.1 统一响应格式

```go
type Response struct {
    Dat interface{} `json:"dat"`
    Err string      `json:"err,omitempty"`
}
```

### 7.2 错误码定义

- `10001`: 参数错误
- `10002`: 数据不存在
- `10003`: 数据已存在
- `10004`: 端口不存在
- `10005`: 连接已存在
- `10006`: 资产设备未监控
- `20001`: 数据库错误
- `20002`: Prometheus 接口错误
- `20003`: CMDB 接口错误
- `30001`: 权限不足

---

## 八、性能优化

### 8.1 批量查询优化

- 批量验证设备监控状态（使用 Prometheus 正则查询）
- 批量查询设备状态（使用 Prometheus 批量查询）
- 批量更新节点位置（使用批量更新接口）

### 8.2 缓存策略

- Redis 缓存设备监控状态（TTL: 5 分钟）
- Redis 缓存端口信息（TTL: 5 分钟）
- Redis 缓存设备状态（TTL: 30 秒，与前端刷新频率一致）

### 8.3 数据库优化

- 合理使用索引
- 避免 N+1 查询，使用预加载
- 分页查询大数据量

---

## 九、开发阶段规划

### 阶段一：数据模型与数据库设计 (Week 1)

- [ ] 设计数据库表结构
- [ ] 创建数据库迁移脚本
- [ ] 定义索引和约束
- [ ] 编写数据模型（Go Struct）

### 阶段二：核心 API 开发 (Week 2)

- [ ] 拓扑视图 CRUD 接口
- [ ] 拓扑节点 CRUD 接口
- [ ] 连接关系 CRUD 接口
- [ ] 基础业务逻辑实现

### 阶段三：CMDB 和 Prometheus 集成 (Week 3)

- [ ] CMDB 集成接口封装
- [ ] Prometheus 客户端封装
- [ ] 已监控资产设备查询接口
- [ ] 端口信息查询接口
- [ ] 状态监控接口

### 阶段四：测试与优化 (Week 4)

- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能优化
- [ ] 错误处理完善

---

## 十、待确认问题（已确认）

1. **Prometheus 指标名称：**

   - 接口状态指标：`snmp_interface_admin_state`
   - 设备运行状态指标：`snmp_uptime`

2. **端口编号字段：** Prometheus 中端口编号的字段名是 `ifDescr`

3. **设备名称字段：** CMDB 资产中设备名称从 `asset.data` JSON 字段的 `name` 字段获取，即 `data->$.name`

4. **连接冲突检测：** 不允许同一个端口多个连接

5. **状态刷新频率：** 30 秒

6. **已监控资产设备列表过滤条件：**
   - 通过 asset 表的 gid 关联 asset_model 表
   - 只返回 asset*model 表的 unique_identifier 字段为 "host*" 或 "net\_" 开头的资产（服务器和网络设备）
