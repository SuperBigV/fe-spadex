# 网络拓扑 Sub-Flows 功能 - 后端接口设计文档

## 一、概述

本文档描述为支持 React Flow Sub-Flows 功能所需的后端接口调整和新增接口。Sub-Flows 功能允许将设备节点作为子节点嵌套在机房组节点内，实现整体移动组及组内设备，同时支持组内设备的单独操作。

### 1.1 功能目标

- 支持设备节点与机房组节点的父子关系
- 支持整体移动机房组及其内部设备
- 支持组内设备节点的单独操作
- 在拖动结束时更新组和组内设备的位置
- 保持数据一致性和完整性

### 1.2 技术背景

React Flow Sub-Flows 实现要点：
- 父节点（机房组）：使用 `type: 'group'` 或自定义类型标识
- 子节点（设备）：设置 `parentId` 指向父节点 ID，设置 `extent: 'parent'` 限制在父节点范围内
- 位置关系：子节点的 `position` 是相对于父节点的相对位置
- 移动行为：父节点移动时，子节点相对位置不变；子节点可单独移动，但受父节点范围限制

---

## 二、数据模型调整

### 2.1 TopologyNode 数据模型调整

需要在现有的 `TopologyNode` 模型中增加 `ParentNodeID` 字段，用于建立父子关系。

#### 数据库表结构调整

```sql
ALTER TABLE topology_nodes 
ADD COLUMN parent_node_id VARCHAR(50) NULL COMMENT '父节点ID，用于Sub-Flows功能，NULL表示根节点',
ADD INDEX idx_parent_node_id (parent_node_id);
```

#### Go 数据模型调整

```go
type TopologyNode struct {
    ID          string    `gorm:"primaryKey;type:varchar(50);comment:节点ID"`
    ViewID      int64     `gorm:"not null;index;comment:所属视图ID"`
    AssetID     int64     `gorm:"not null;index;comment:CMDB资产ID，关联asset.id"`
    Name        string    `gorm:"type:varchar(200);not null;comment:节点名称"`
    DeviceType  string    `gorm:"type:varchar(50);comment:设备类型"`
    DeviceIcon  string    `gorm:"type:varchar(100);comment:设备图标"`
    IP          string    `gorm:"type:varchar(50);comment:设备IP"`
    RoomID      *int64    `gorm:"index;comment:所属机房ID"`
    RoomName    string    `gorm:"type:varchar(100);comment:所属机房名称"`
    RackID      *int64    `gorm:"index;comment:所属机柜ID"`
    RackName    string    `gorm:"type:varchar(100);comment:所属机柜名称"`
    PositionX   float64   `gorm:"comment:节点X坐标（绝对坐标或相对坐标）"`
    PositionY   float64   `gorm:"comment:节点Y坐标（绝对坐标或相对坐标）"`
    Width       float64   `gorm:"comment:节点宽度（用于机房等可调整大小的节点）"`
    Height      float64   `gorm:"comment:节点高度（用于机房等可调整大小的节点）"`
    ParentNodeID *string  `gorm:"type:varchar(50);index;comment:父节点ID，用于Sub-Flows功能，NULL表示根节点"`
    CreatedAt   time.Time
    UpdatedAt   time.Time
    DeletedAt   gorm.DeletedAt `gorm:"index"`

    // 关联关系
    View                TopologyView       `gorm:"foreignKey:ViewID"`
    ParentNode          *TopologyNode      `gorm:"foreignKey:ParentNodeID"`
    ChildNodes          []TopologyNode     `gorm:"foreignKey:ParentNodeID"`
    SourceConnections   []TopologyConnection `gorm:"foreignKey:SourceNodeID"`
    TargetConnections   []TopologyConnection `gorm:"foreignKey:TargetNodeID"`
}
```

#### 前端类型定义调整

```typescript
export interface TopologyNode {
  id: string;
  viewId: number;
  assetId: number;
  name: string;
  deviceType: string;
  deviceIcon: string;
  ip: string;
  roomId?: number;
  roomName?: string;
  rackId?: number;
  rackName?: string;
  position: {
    x: number;
    y: number;
  };
  width?: number;
  height?: number;
  parentNodeId?: string; // 新增：父节点ID，用于Sub-Flows功能
  status: 'online' | 'offline' | 'unknown';
  alarmCount: number;
  selectedPorts?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### 2.2 位置坐标说明

- **根节点（机房组）**：`position` 为画布上的绝对坐标
- **子节点（设备）**：`position` 为相对于父节点的相对坐标
- **位置更新**：当父节点移动时，需要计算子节点的绝对坐标变化；当子节点移动时，只更新相对坐标

---

## 三、现有接口调整

### 3.1 获取拓扑节点列表接口

**接口路径：** `GET /cmdb/topology/views/:viewId/nodes`

#### 调整说明

1. **响应数据结构调整**：增加 `parentNodeId` 字段
2. **返回格式调整**：支持返回父子关系的嵌套结构（可选）

#### 调整后的响应格式

**方案一：扁平结构（推荐）**

```json
{
  "dat": [
    {
      "id": "room-001",
      "viewId": 1,
      "assetId": 0,
      "name": "核心机房A",
      "deviceType": "topology_room",
      "deviceIcon": "room",
      "ip": "",
      "roomId": 1,
      "roomName": "核心机房A",
      "rackId": null,
      "rackName": "",
      "position": {
        "x": 100.5,
        "y": 200.3
      },
      "width": 400,
      "height": 300,
      "parentNodeId": null,
      "status": "unknown",
      "alarmCount": 0,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
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
        "x": 50.0,
        "y": 30.0
      },
      "parentNodeId": "room-001",
      "status": "online",
      "alarmCount": 0,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**方案二：嵌套结构（可选）**

如果前端需要嵌套结构，可以增加查询参数 `format=nested`：

```
GET /cmdb/topology/views/:viewId/nodes?format=nested
```

响应格式：

```json
{
  "dat": [
    {
      "id": "room-001",
      "viewId": 1,
      "assetId": 0,
      "name": "核心机房A",
      "deviceType": "topology_room",
      "deviceIcon": "room",
      "ip": "",
      "roomId": 1,
      "roomName": "核心机房A",
      "rackId": null,
      "rackName": "",
      "position": {
        "x": 100.5,
        "y": 200.3
      },
      "width": 400,
      "height": 300,
      "parentNodeId": null,
      "status": "unknown",
      "alarmCount": 0,
      "children": [
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
            "x": 50.0,
            "y": 30.0
          },
          "parentNodeId": "room-001",
          "status": "online",
          "alarmCount": 0,
          "createdAt": "2024-01-01T00:00:00Z",
          "updatedAt": "2024-01-01T00:00:00Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 业务逻辑调整

1. 查询节点时，需要包含 `parent_node_id` 字段
2. 如果使用嵌套结构，需要构建父子关系的树形结构
3. 确保子节点的 `position` 是相对于父节点的相对坐标

---

### 3.2 添加拓扑节点接口

**接口路径：** `POST /cmdb/topology/views/:viewId/nodes`

#### 调整说明

1. **请求参数调整**：增加 `parentNodeId` 字段（可选）
2. **业务逻辑调整**：验证父节点存在性，处理位置坐标

#### 调整后的请求格式

```json
{
  "assetId": 100,
  "position": {
    "x": 50.0,
    "y": 30.0
  },
  "parentNodeId": "room-001"
}
```

#### 业务逻辑调整

1. **验证父节点**：
   - 如果提供了 `parentNodeId`，验证父节点是否存在
   - 验证父节点是否为机房类型节点（`deviceType === 'topology_room'`）
   - 验证父节点是否属于同一视图

2. **位置坐标处理**：
   - 如果提供了 `parentNodeId`，`position` 为相对于父节点的相对坐标
   - 如果没有 `parentNodeId`，`position` 为画布上的绝对坐标

3. **创建节点**：
   - 保存 `parent_node_id` 字段
   - 保存位置坐标（相对或绝对）

#### 响应格式

响应格式与获取节点列表接口一致，包含 `parentNodeId` 字段。

---

### 3.3 更新拓扑节点接口

**接口路径：** `PUT /cmdb/topology/nodes/:nodeId`

#### 调整说明

1. **请求参数调整**：支持更新 `parentNodeId` 和 `position`
2. **业务逻辑调整**：处理父子关系变更和位置坐标转换

#### 调整后的请求格式

```json
{
  "name": "交换机-001-修改",
  "position": {
    "x": 60.0,
    "y": 40.0
  },
  "parentNodeId": "room-001",
  "width": 200,
  "height": 150
}
```

#### 业务逻辑调整

1. **父子关系变更**：
   - 如果 `parentNodeId` 从 `null` 变为有值：将节点添加到组内，需要将绝对坐标转换为相对坐标
   - 如果 `parentNodeId` 从有值变为 `null`：将节点从组内移除，需要将相对坐标转换为绝对坐标
   - 如果 `parentNodeId` 从一个值变为另一个值：需要重新计算相对坐标

2. **位置坐标转换**：
   - 当节点从组外移动到组内时：
     ```go
     // 获取父节点位置
     parentPosition := getParentNodePosition(parentNodeID)
     // 计算相对坐标
     relativeX := absoluteX - parentPosition.X
     relativeY := absoluteY - parentPosition.Y
     ```
   - 当节点从组内移动到组外时：
     ```go
     // 获取父节点位置
     parentPosition := getParentNodePosition(oldParentNodeID)
     // 计算绝对坐标
     absoluteX := relativeX + parentPosition.X
     absoluteY := relativeY + parentPosition.Y
     ```

3. **验证约束**：
   - 验证父节点存在性
   - 验证不能将节点设置为自己的子节点（防止循环引用）
   - 验证不能将机房节点设置为其他节点的子节点

---

### 3.4 批量更新节点位置接口

**接口路径：** `PUT /cmdb/topology/views/:viewId/nodes/positions`

#### 调整说明

1. **请求参数调整**：支持批量更新父子节点的位置
2. **业务逻辑调整**：处理父子节点的位置同步更新

#### 调整后的请求格式

```json
{
  "positions": [
    {
      "nodeId": "room-001",
      "x": 150.5,
      "y": 250.3
    },
    {
      "nodeId": "node-001",
      "x": 60.0,
      "y": 40.0,
      "parentNodeId": "room-001"
    }
  ]
}
```

#### 业务逻辑调整

1. **位置更新策略**：
   - 如果更新的是父节点（机房组），需要同步更新所有子节点的绝对坐标（但保持相对坐标不变）
   - 如果更新的是子节点，只更新该子节点的相对坐标

2. **批量更新优化**：
   - 先更新父节点位置
   - 再更新子节点位置
   - 使用事务确保数据一致性

3. **位置计算**：
   ```go
   // 更新父节点位置
   updateParentNodePosition(parentNodeID, newX, newY)
   
   // 更新子节点相对位置（如果子节点也在更新列表中）
   for each childNode in updateList {
       if childNode.parentNodeId == parentNodeID {
           updateChildNodeRelativePosition(childNode.id, childNode.x, childNode.y)
       }
   }
   ```

---

### 3.5 删除拓扑节点接口

**接口路径：** `DELETE /cmdb/topology/nodes/:nodeId`

#### 调整说明

1. **业务逻辑调整**：处理子节点的级联处理

#### 业务逻辑调整

1. **子节点处理策略**（二选一）：
   - **方案一：级联删除**：删除父节点时，同时删除所有子节点
   - **方案二：解除关联**：删除父节点时，将所有子节点的 `parentNodeId` 设置为 `null`，并将相对坐标转换为绝对坐标

2. **推荐方案**：方案二（解除关联），因为：
   - 保留设备节点数据，避免误删
   - 设备节点可以重新分配到其他组
   - 更符合业务逻辑

3. **实现逻辑**：
   ```go
   // 查找所有子节点
   childNodes := getChildNodes(nodeID)
   
   // 获取父节点位置（用于坐标转换）
   parentPosition := getNodePosition(nodeID)
   
   // 更新子节点：解除关联并转换坐标
   for each childNode in childNodes {
       // 计算绝对坐标
       absoluteX := childNode.positionX + parentPosition.X
       absoluteY := childNode.positionY + parentPosition.Y
       
       // 更新子节点
       updateNode(childNode.id, {
           parentNodeId: null,
           positionX: absoluteX,
           positionY: absoluteY
       })
   }
   
   // 删除父节点
   deleteNode(nodeID)
   ```

---

## 四、新增接口

### 4.1 设置节点父子关系接口

**接口路径：** `POST /cmdb/topology/nodes/:nodeId/parent`

**请求方法：** `POST`

**功能说明：** 将设备节点添加到机房组内，或从机房组内移除

#### 请求参数

**Path Parameters:**
- `nodeId`: string (节点ID)

**Body:**
```json
{
  "parentNodeId": "room-001" // 父节点ID，null 表示从组内移除
}
```

#### 响应格式

```json
{
  "dat": "ok"
}
```

#### 业务逻辑

1. **验证节点存在性**：验证 `nodeId` 对应的节点是否存在
2. **验证父节点**：
   - 如果 `parentNodeId` 不为 `null`，验证父节点是否存在
   - 验证父节点是否为机房类型节点（`deviceType === 'topology_room'`）
   - 验证父节点是否属于同一视图
   - 验证不能将节点设置为自己的子节点（防止循环引用）
3. **位置坐标转换**：
   - 如果 `parentNodeId` 从 `null` 变为有值：将绝对坐标转换为相对坐标
   - 如果 `parentNodeId` 从有值变为 `null`：将相对坐标转换为绝对坐标
4. **更新节点**：更新节点的 `parent_node_id` 和位置坐标

#### 错误处理

- `400`: 参数错误（节点不存在、父节点不存在、父节点类型错误等）
- `409`: 冲突（循环引用、节点类型不匹配等）

---

### 4.2 批量设置节点父子关系接口

**接口路径：** `POST /cmdb/topology/views/:viewId/nodes/parents`

**请求方法：** `POST`

**功能说明：** 批量设置多个节点的父子关系

#### 请求参数

**Path Parameters:**
- `viewId`: int64 (视图ID)

**Body:**
```json
{
  "relationships": [
    {
      "nodeId": "node-001",
      "parentNodeId": "room-001"
    },
    {
      "nodeId": "node-002",
      "parentNodeId": "room-001"
    },
    {
      "nodeId": "node-003",
      "parentNodeId": null
    }
  ]
}
```

#### 响应格式

```json
{
  "dat": "ok"
}
```

#### 业务逻辑

1. **批量验证**：验证所有节点和父节点存在性
2. **批量更新**：使用事务批量更新节点关系
3. **位置坐标转换**：对每个节点进行坐标转换

---

### 4.3 获取节点的子节点列表接口

**接口路径：** `GET /cmdb/topology/nodes/:nodeId/children`

**请求方法：** `GET`

**功能说明：** 获取指定节点的所有子节点列表

#### 请求参数

**Path Parameters:**
- `nodeId`: string (节点ID)

#### 响应格式

```json
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
        "x": 50.0,
        "y": 30.0
      },
      "parentNodeId": "room-001",
      "status": "online",
      "alarmCount": 0,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 业务逻辑

1. 查询 `parent_node_id = nodeId` 的所有节点
2. 返回子节点列表（包含完整节点信息）

---

## 五、数据一致性保证

### 5.1 约束规则

1. **父子关系约束**：
   - 只有机房类型节点（`deviceType === 'topology_room'`）可以作为父节点
   - 设备节点不能作为父节点
   - 不能形成循环引用（节点不能是自己的祖先）

2. **位置坐标约束**：
   - 子节点的位置必须在父节点的范围内（由前端 React Flow 的 `extent: 'parent'` 保证）
   - 子节点的相对坐标不能为负值（由前端保证）

3. **删除约束**：
   - 删除父节点时，需要处理子节点（解除关联或级联删除）

### 5.2 数据迁移

对于现有数据，需要进行数据迁移：

1. **识别机房节点**：`deviceType === 'topology_room'` 的节点为机房节点
2. **识别设备节点**：根据 `roomId` 字段，将设备节点关联到对应的机房节点
3. **设置父子关系**：
   ```sql
   -- 为设备节点设置父节点（机房节点）
   UPDATE topology_nodes AS child
   INNER JOIN topology_nodes AS parent 
     ON child.room_id = parent.room_id 
     AND parent.device_type = 'topology_room'
   SET child.parent_node_id = parent.id
   WHERE child.device_type != 'topology_room'
     AND child.room_id IS NOT NULL;
   ```
4. **坐标转换**：将设备节点的绝对坐标转换为相对于机房节点的相对坐标

---

## 六、接口调用示例

### 6.1 创建机房组并添加设备

```bash
# 1. 创建机房节点
POST /cmdb/topology/views/1/nodes
{
  "assetId": 0,
  "deviceType": "topology_room",
  "name": "核心机房A",
  "position": { "x": 100, "y": 200 },
  "width": 400,
  "height": 300
}

# 2. 创建设备节点并添加到机房组
POST /cmdb/topology/views/1/nodes
{
  "assetId": 100,
  "position": { "x": 50, "y": 30 },
  "parentNodeId": "room-001"
}
```

### 6.2 移动机房组及其内部设备

```bash
# 批量更新位置（父节点和子节点）
PUT /cmdb/topology/views/1/nodes/positions
{
  "positions": [
    {
      "nodeId": "room-001",
      "x": 150,
      "y": 250
    },
    {
      "nodeId": "node-001",
      "x": 50,
      "y": 30,
      "parentNodeId": "room-001"
    }
  ]
}
```

### 6.3 将设备从组内移除

```bash
# 设置父节点为 null
POST /cmdb/topology/nodes/node-001/parent
{
  "parentNodeId": null
}
```

---

## 七、开发注意事项

### 7.1 性能优化

1. **批量操作**：使用批量接口减少请求次数
2. **索引优化**：确保 `parent_node_id` 字段有索引
3. **查询优化**：使用 JOIN 查询减少数据库查询次数

### 7.2 错误处理

1. **验证父节点类型**：确保只有机房节点可以作为父节点
2. **防止循环引用**：验证节点不能成为自己的祖先
3. **坐标范围验证**：确保子节点坐标在父节点范围内（可选，主要由前端保证）

### 7.3 测试要点

1. **父子关系创建**：测试创建父子关系的各种场景
2. **位置更新**：测试父节点移动时子节点位置同步
3. **关系变更**：测试节点在不同组之间移动
4. **删除处理**：测试删除父节点时子节点的处理
5. **数据一致性**：测试并发更新时的数据一致性

---

## 八、总结

### 8.1 主要调整

1. **数据模型**：增加 `parent_node_id` 字段
2. **现有接口调整**：
   - 获取节点列表：增加 `parentNodeId` 字段
   - 添加节点：支持 `parentNodeId` 参数
   - 更新节点：支持更新 `parentNodeId` 和位置坐标转换
   - 批量更新位置：支持父子节点位置同步更新
   - 删除节点：处理子节点的级联处理
3. **新增接口**：
   - 设置节点父子关系
   - 批量设置节点父子关系
   - 获取节点的子节点列表

### 8.2 开发优先级

1. **第一阶段**：数据模型调整和现有接口调整（必需）
2. **第二阶段**：新增接口开发（可选，但建议实现以提升用户体验）
3. **第三阶段**：数据迁移和测试

---

## 九、附录

### A.1 数据库迁移脚本

```sql
-- 添加 parent_node_id 字段
ALTER TABLE topology_nodes 
ADD COLUMN parent_node_id VARCHAR(50) NULL COMMENT '父节点ID，用于Sub-Flows功能，NULL表示根节点',
ADD INDEX idx_parent_node_id (parent_node_id);

-- 数据迁移：为设备节点设置父节点（机房节点）
UPDATE topology_nodes AS child
INNER JOIN topology_nodes AS parent 
  ON child.room_id = parent.room_id 
  AND parent.device_type = 'topology_room'
SET child.parent_node_id = parent.id
WHERE child.device_type != 'topology_room'
  AND child.room_id IS NOT NULL
  AND child.parent_node_id IS NULL;
```

### A.2 前端类型定义示例

```typescript
// 位置更新请求参数
export interface PositionUpdate {
  nodeId: string;
  x: number;
  y: number;
  parentNodeId?: string; // 新增：用于标识父子关系
}

// 节点创建请求参数
export interface NodeCreateData {
  assetId: number;
  deviceIcon?: string;
  deviceType?: string;
  position: {
    x: number;
    y: number;
  };
  selectedPorts?: string[];
  name?: string;
  width?: number;
  height?: number;
  parentNodeId?: string; // 新增：父节点ID
}
```

---

**文档版本：** v1.0  
**最后更新：** 2024-01-01  
**作者：** AI Assistant  
**审核状态：** 待审核

