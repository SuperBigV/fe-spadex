# 网络拓扑管理 - 前端设计文档

## 一、项目概述

### 1.1 功能目标

- 实现机房网络拓扑的 2D 可视化展示和管理
- 拓扑节点与 CMDB 资产设备关联（仅关联已监控状态的设备）
- 网络设备间的连接关系管理（用线段表示）
- 端口信息展示（由后端从 Prometheus 查询提供）
- 网络状态监控和态势感知

### 1.2 技术栈

- 框架: React 17.0 + TypeScript
- UI 库: Ant Design 4.23.0
- 拓扑图库: 待定（推荐：react-flow / vis-network / d3.js）
- 路由: React Router 5.2.0
- 状态管理: React Hooks + Context / Redux
- 构建工具: Vite 2.9.18

---

## 二、页面结构设计

### 2.1 路由规划

```
/topology                    # 网络拓扑管理主页面
  ├─> /topology              # 拓扑视图列表页（可选）
  └─> /topology/:viewId      # 拓扑视图详情页（主页面）
        └─> 拓扑画布 + 工具栏 + 属性面板
```

### 2.2 页面层级关系

```
网络拓扑管理主页面 (/topology)
  ├─> 拓扑视图列表
  │     └─> 视图卡片展示
  │           └─> 视图创建/编辑弹窗
  └─> 拓扑视图详情页 (/topology/:viewId)
        ├─> 顶部工具栏
        ├─> 左侧设备选择面板
        ├─> 中间拓扑画布（主视图）
        └─> 右侧属性面板
```

---

## 三、UI 布局设计

### 3.1 拓扑视图详情页（主页面）

#### 3.1.1 整体布局（三栏布局）

```
┌─────────────────────────────────────────────────────────────┐
│  PageHeader: 网络拓扑管理 [返回] [保存] [导出] [设置]      │
├──────────┬──────────────────────────────────┬──────────────┤
│          │                                  │              │
│  左侧栏   │        拓扑画布区域                │   右侧栏     │
│  (300px) │        (自适应，主要区域)          │  (350px)    │
│          │                                  │              │
│ ┌──────┐ │  ┌──────────────────────────┐   │ ┌──────────┐ │
│ │设备  │ │  │                          │   │ │属性面板  │ │
│ │选择  │ │  │    拓扑画布                │   │ │          │ │
│ │      │ │  │    (支持缩放、平移)        │   │ │节点属性  │ │
│ │[筛选]│ │  │                          │   │ │连接属性  │ │
│ │[搜索]│ │  │  ┌──┐      ┌──┐         │   │ │          │ │
│ │      │ │  │  │设备│────→│设备│         │   │ └──────────┘ │
│ │设备1 │ │  │  └──┘      └──┘         │   │              │
│ │设备2 │ │  │                          │   │ ┌──────────┐ │
│ │设备3 │ │  │                          │   │ │状态监控  │ │
│ │...   │ │  └──────────────────────────┘   │ │          │ │
│ │      │ │                                  │ │设备状态  │ │
│ │[添加]│ │                                  │ │端口状态  │ │
│ └──────┘ │                                  │ │连接状态  │ │
│          │                                  │ └──────────┘ │
└──────────┴──────────────────────────────────┴──────────────┘
```

#### 3.1.2 顶部工具栏

**工具组：**

- 视图操作：新建视图、保存视图、删除视图
- 画布操作：放大、缩小、重置、适应窗口、全屏
- 布局操作：自动布局、手动布局、清除布局
- 导出操作：导出图片、导出 PDF、导出 JSON
- 刷新操作：刷新拓扑数据、刷新监控状态

#### 3.1.3 左侧设备选择面板（固定宽度 300px）

**设备筛选：**

- 搜索框：设备名称、IP 地址搜索
- 资产模型筛选：下拉选择（服务器/交换机/路由器/防火墙等）
- 机房筛选：下拉选择机房
- 机柜筛选：下拉选择机柜（需先选择机房）
- 状态筛选：全部/在线/离线/告警

**设备列表：**

- 设备卡片展示
  - 设备名称
  - 设备 IP
  - 设备类型图标
  - 设备状态标签
  - 所属机房/机柜
- 支持拖拽设备到画布
- 支持点击设备添加到画布
- 显示设备总数和已添加数量

#### 3.1.4 中间拓扑画布（自适应，主要区域）

**画布功能：**

- 画布缩放：鼠标滚轮缩放，支持缩放控制按钮
- 画布平移：鼠标拖拽平移，支持空格键+鼠标拖拽
- 网格背景：可选显示/隐藏
- 标尺：可选显示/隐藏

**设备节点渲染：**

- 使用标准拓扑图标（根据设备类型）
- 设备节点显示：
  - 设备图标
  - 设备名称
  - 设备状态指示器（颜色圆点）
  - 告警指示器（如有告警）
- 设备节点交互：
  - 单击选中设备
  - 双击查看设备详情
  - 拖拽移动设备位置
  - 右键菜单（编辑、删除、查看详情）

**连接线段渲染：**

- 连接线段自动计算路径（避免重叠）
- 连接线段显示：
  - 箭头指向（源设备->目标设备）
  - 连接标签（源端口->目标端口，可选）
  - 连接状态颜色（绿色正常/红色故障/黄色告警）
- 连接线段交互：
  - 单击选中连接
  - 双击查看连接详情
  - 右键菜单（编辑、删除）

**端口显示：**

- 设备节点上显示端口连接点
- 端口连接点显示端口编号
- 端口状态颜色区分（绿色 up/红色 down/灰色 unknown）
- 点击端口连接点可创建连接

#### 3.1.5 右侧属性面板（固定宽度 350px）

**节点属性卡片：**

- 基本信息：
  - 节点名称
  - 关联资产 ID
  - 设备类型
  - 设备 IP
  - 所属机房/机柜
- 位置信息：
  - X 坐标、Y 坐标
  - 支持手动输入或拖拽调整
- 端口列表：
  - 端口编号、端口名称、端口状态
  - 端口使用情况（已连接/未连接）
- 操作按钮：
  - 编辑节点
  - 删除节点
  - 查看资产详情

**连接属性卡片：**

- 连接信息：
  - 源设备、源端口
  - 目标设备、目标端口
  - 连接状态
  - 连接类型
- 操作按钮：
  - 编辑连接
  - 删除连接

**状态监控卡片：**

- 设备状态统计：
  - 在线设备数/总设备数
  - 离线设备数
  - 告警设备数
- 端口状态统计：
  - 正常端口数/总端口数
  - 故障端口数
- 连接状态统计：
  - 正常连接数/总连接数
  - 故障连接数

---

## 四、组件设计

### 4.1 页面级组件

#### 4.1.1 TopologyPage (拓扑管理主页面)

**路径：** `src/pages/topology/index.tsx`

**功能：**

- 路由管理
- 拓扑视图列表展示（可选）
- 拓扑视图详情页展示

**子组件：**

- `TopologyViewList` - 拓扑视图列表
- `TopologyCanvas` - 拓扑画布

---

#### 4.1.2 TopologyCanvas (拓扑画布组件)

**路径：** `src/pages/topology/components/TopologyCanvas/index.tsx`

**Props：**

```typescript
interface TopologyCanvasProps {
  viewId: number;
  nodes: TopologyNode[];
  connections: TopologyConnection[];
  onNodeSelect: (nodeId: string) => void;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onNodeDelete: (nodeId: string) => void;
  onConnectionCreate: (connection: ConnectionData) => void;
  onConnectionSelect: (connectionId: string) => void;
  onConnectionDelete: (connectionId: string) => void;
  onLayoutSave: () => void;
}
```

**功能：**

- 拓扑画布渲染
- 设备节点渲染和交互
- 连接线段渲染和交互
- 画布缩放和平移
- 自动布局算法

**子组件：**

- `TopologyNode` - 设备节点组件
- `ConnectionLine` - 连接线段组件
- `PortIndicator` - 端口指示器组件

---

### 4.2 业务组件

#### 4.2.1 TopologyNode (设备节点组件)

**路径：** `src/pages/topology/components/TopologyNode/index.tsx`

**Props：**

```typescript
interface TopologyNodeProps {
  node: TopologyNode;
  selected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onDelete: () => void;
  onConnectionStart: (portId: string) => void;
  onConnectionEnd: (portId: string) => void;
}
```

**功能：**

- 设备节点渲染（图标、名称、状态）
- 节点拖拽移动
- 节点选中状态
- 端口连接点显示
- 右键菜单

---

#### 4.2.2 ConnectionLine (连接线段组件)

**路径：** `src/pages/topology/components/ConnectionLine/index.tsx`

**Props：**

```typescript
interface ConnectionLineProps {
  connection: TopologyConnection;
  sourceNode: TopologyNode;
  targetNode: TopologyNode;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}
```

**功能：**

- 连接线段渲染（路径计算、箭头、标签）
- 连接状态颜色
- 连接选中状态
- 右键菜单

---

#### 4.2.3 DeviceSelectPanel (设备选择面板)

**路径：** `src/pages/topology/components/DeviceSelectPanel/index.tsx`

**Props：**

```typescript
interface DeviceSelectPanelProps {
  onDeviceSelect: (device: MonitoredAsset) => void;
  onDeviceAdd: (device: MonitoredAsset) => void;
  addedDeviceIds: number[];
}
```

**功能：**

- 设备筛选（资产模型、机房、机柜、状态）
- 设备搜索
- 设备列表展示
- 设备拖拽到画布
- 设备点击添加到画布

---

#### 4.2.4 PropertyPanel (属性面板)

**路径：** `src/pages/topology/components/PropertyPanel/index.tsx`

**Props：**

```typescript
interface PropertyPanelProps {
  selectedItem: TopologyNode | TopologyConnection | null;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
}
```

**功能：**

- 节点属性展示和编辑
- 连接属性展示和编辑
- 状态监控统计展示

---

#### 4.2.5 TopologyToolbar (工具栏)

**路径：** `src/pages/topology/components/TopologyToolbar/index.tsx`

**功能：**

- 视图操作按钮
- 画布操作按钮（缩放、平移、布局）
- 导出操作按钮
- 刷新操作按钮

---

### 4.3 通用组件

#### 4.3.1 DeviceIcon (设备图标组件)

**路径：** `src/pages/topology/components/DeviceIcon/index.tsx`

**功能：**

- 根据设备类型显示标准拓扑图标
- 支持自定义图标

---

#### 4.3.2 StatusIndicator (状态指示器组件)

**路径：** `src/pages/topology/components/StatusIndicator/index.tsx`

**功能：**

- 设备状态颜色指示
- 端口状态颜色指示
- 连接状态颜色指示

---

## 五、数据流设计

### 5.1 状态管理

**使用 Context + Hooks：**

```typescript
// TopologyContext
interface TopologyContextValue {
  currentView: TopologyView | null;
  nodes: TopologyNode[];
  connections: TopologyConnection[];
  selectedItem: TopologyNode | TopologyConnection | null;
  loading: boolean;
  refreshTopology: () => Promise<void>;
  addNode: (asset: MonitoredAsset) => Promise<void>;
  updateNode: (nodeId: string, updates: Partial<TopologyNode>) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  addConnection: (connection: ConnectionData) => Promise<void>;
  updateConnection: (connectionId: string, updates: Partial<TopologyConnection>) => Promise<void>;
  deleteConnection: (connectionId: string) => Promise<void>;
  saveLayout: () => Promise<void>;
}
```

### 5.2 API 调用

**服务层：** `src/services/topology.ts`

```typescript
// 拓扑视图相关API
export const getTopologyViews = (params: ViewListParams) => Promise<ViewListResponse>;
export const getTopologyView = (viewId: number) => Promise<TopologyView>;
export const createTopologyView = (data: ViewCreateData) => Promise<TopologyView>;
export const updateTopologyView = (viewId: number, data: ViewUpdateData) => Promise<void>;
export const deleteTopologyView = (viewId: number) => Promise<void>;

// 拓扑节点相关API
export const getTopologyNodes = (viewId: number) => Promise<TopologyNode[]>;
export const addTopologyNode = (viewId: number, data: NodeCreateData) => Promise<TopologyNode>;
export const updateTopologyNode = (nodeId: string, data: NodeUpdateData) => Promise<void>;
export const deleteTopologyNode = (nodeId: string) => Promise<void>;
export const updateNodePosition = (nodeId: string, x: number, y: number) => Promise<void>;

// 连接关系相关API
export const getTopologyConnections = (viewId: number) => Promise<TopologyConnection[]>;
export const addTopologyConnection = (viewId: number, data: ConnectionCreateData) => Promise<TopologyConnection>;
export const updateTopologyConnection = (connectionId: string, data: ConnectionUpdateData) => Promise<void>;
export const deleteTopologyConnection = (connectionId: string) => Promise<void>;

// 已监控资产设备相关API
export const getMonitoredAssets = (params: AssetListParams) => Promise<MonitoredAssetListResponse>;
export const getAssetPorts = (assetId: number) => Promise<Port[]>;

// 状态监控相关API
export const getDeviceStatus = (assetIds: number[]) => Promise<DeviceStatusMap>;
export const getPortStatus = (assetId: number) => Promise<PortStatusMap>;
export const getConnectionStatus = (connectionIds: string[]) => Promise<ConnectionStatusMap>;
```

---

## 六、接口定义

### 6.1 数据类型定义

```typescript
// 拓扑视图
interface TopologyView {
  id: number;
  name: string;
  type: 'room' | 'rack' | 'cross-room' | 'business';
  roomId?: number;
  rackId?: number;
  config: {
    canvasScale: number;
    canvasX: number;
    canvasY: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 拓扑节点
interface TopologyNode {
  id: string;
  viewId: number;
  assetId: number; // CMDB资产ID
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
  status: 'online' | 'offline' | 'unknown';
  alarmCount: number;
  createdAt: string;
  updatedAt: string;
}

// 连接关系
interface TopologyConnection {
  id: string;
  viewId: number;
  sourceNodeId: string;
  sourcePort: string; // 端口编号
  targetNodeId: string;
  targetPort: string; // 端口编号
  status: 'up' | 'down' | 'unknown';
  createdAt: string;
  updatedAt: string;
}

// 已监控资产设备
interface MonitoredAsset {
  id: number;
  name: string;
  ip: string;
  deviceType: string;
  gid: number; // 资产模型ID
  roomId?: number;
  roomName?: string;
  rackId?: number;
  rackName?: string;
  status: 'online' | 'offline' | 'unknown';
}

// 端口信息
interface Port {
  portNumber: string; // 端口编号
  portName: string; // 端口名称
  status: 'up' | 'down' | 'unknown';
}

// 设备状态
interface DeviceStatus {
  assetId: number;
  status: 'online' | 'offline' | 'unknown';
  lastUpdateTime: string;
}

// 端口状态
interface PortStatus {
  assetId: number;
  ports: {
    [portNumber: string]: 'up' | 'down' | 'unknown';
  };
  lastUpdateTime: string;
}

// 连接状态
interface ConnectionStatus {
  connectionId: string;
  status: 'up' | 'down' | 'unknown';
  lastUpdateTime: string;
}
```

### 6.2 API 接口定义

#### 6.2.1 拓扑视图相关接口

```typescript
// 获取拓扑视图列表
GET /cmdb/topology/views
Query Parameters:
  - page?: number (页码，默认1)
  - pageSize?: number (每页数量，默认20)
  - keyword?: string (搜索关键词)
  - type?: string (视图类型)

Response:
{
  "dat": {
    "list": TopologyView[],
    "total": number
  }
}

// 获取拓扑视图详情
GET /cmdb/topology/views/:viewId

Response:
{
  "dat": TopologyView
}

// 创建拓扑视图
POST /cmdb/topology/views
Body:
{
  "name": string,
  "type": string,
  "roomId"?: number,
  "rackId"?: number,
  "config"?: {
    "canvasScale": number,
    "canvasX": number,
    "canvasY": number
  }
}

Response:
{
  "dat": TopologyView
}

// 更新拓扑视图
PUT /cmdb/topology/views/:viewId
Body: (同创建接口)

Response:
{
  "dat": "ok"
}

// 删除拓扑视图
DELETE /cmdb/topology/views/:viewId

Response:
{
  "dat": "ok"
}
```

#### 6.2.2 拓扑节点相关接口

```typescript
// 获取拓扑节点列表
GET /cmdb/topology/views/:viewId/nodes

Response:
{
  "dat": TopologyNode[]
}

// 添加拓扑节点
POST /cmdb/topology/views/:viewId/nodes
Body:
{
  "assetId": number, // CMDB资产ID
  "position": {
    "x": number,
    "y": number
  }
}

Response:
{
  "dat": TopologyNode
}

// 更新拓扑节点
PUT /cmdb/topology/nodes/:nodeId
Body:
{
  "name"?: string,
  "position"?: {
    "x": number,
    "y": number
  }
}

Response:
{
  "dat": "ok"
}

// 更新节点位置（批量）
PUT /cmdb/topology/views/:viewId/nodes/positions
Body:
{
  "positions": [
    {
      "nodeId": string,
      "x": number,
      "y": number
    }
  ]
}

Response:
{
  "dat": "ok"
}

// 删除拓扑节点
DELETE /cmdb/topology/nodes/:nodeId

Response:
{
  "dat": "ok"
}
```

#### 6.2.3 连接关系相关接口

```typescript
// 获取连接关系列表
GET /cmdb/topology/views/:viewId/connections

Response:
{
  "dat": TopologyConnection[]
}

// 添加连接关系
POST /cmdb/topology/views/:viewId/connections
Body:
{
  "sourceNodeId": string,
  "sourcePort": string, // 端口编号
  "targetNodeId": string,
  "targetPort": string // 端口编号
}

Response:
{
  "dat": TopologyConnection
}

// 更新连接关系
PUT /cmdb/topology/connections/:connectionId
Body:
{
  "sourcePort"?: string,
  "targetPort"?: string
}

Response:
{
  "dat": "ok"
}

// 删除连接关系
DELETE /cmdb/topology/connections/:connectionId

Response:
{
  "dat": "ok"
}
```

#### 6.2.4 已监控资产设备相关接口

```typescript
// 获取已监控资产设备列表
GET /cmdb/topology/assets/monitored
Query Parameters:
  - page?: number (页码，默认1)
  - pageSize?: number (每页数量，默认20)
  - keyword?: string (搜索关键词：设备名称、IP)
  - gids?: string (资产模型ID，多个用逗号分隔，如"10,20,30")
  - roomId?: number (机房ID)
  - rackId?: number (机柜ID)
  - status?: string (状态筛选：online/offline/unknown)

Response:
{
  "dat": {
    "list": MonitoredAsset[],
    "total": number
  }
}

说明：
- 后端已过滤，只返回已正常监控状态的资产设备
- 前端无需验证监控状态，直接使用返回的资产列表
```

#### 6.2.5 端口信息相关接口

```typescript
// 获取设备端口信息
GET /cmdb/topology/devices/:assetId/ports
Path Parameters:
  - assetId: number (CMDB资产ID)

Response:
{
  "dat": Port[]
}

说明：
- 端口信息由后端从Prometheus通过ident标签查询提供
- 返回字段：端口编号、端口名称、端口状态
- 不返回：端口速率、端口类型
```

#### 6.2.6 状态监控相关接口

```typescript
// 获取设备状态（批量）
POST /cmdb/topology/devices/status
Body:
{
  "assetIds": number[] // CMDB资产ID数组
}

Response:
{
  "dat": {
    [assetId: number]: DeviceStatus
  }
}

// 获取端口状态
GET /cmdb/topology/devices/:assetId/ports/status
Path Parameters:
  - assetId: number (CMDB资产ID)

Response:
{
  "dat": PortStatus
}

// 获取连接状态（批量）
POST /cmdb/topology/connections/status
Body:
{
  "connectionIds": string[] // 连接ID数组
}

Response:
{
  "dat": {
    [connectionId: string]: ConnectionStatus
  }
}
```

---

## 七、交互设计

### 7.1 设备节点添加流程

1. 用户在左侧设备选择面板筛选设备（资产模型、机房、机柜等）
2. 后端返回已监控的资产设备列表
3. 用户选择设备，有两种方式添加：
   - 方式 1：拖拽设备到画布
   - 方式 2：点击设备，然后在画布上点击位置
4. 调用 `POST /cmdb/topology/views/:viewId/nodes` 创建节点
5. 节点创建成功后，自动获取设备端口信息（调用 `GET /cmdb/topology/devices/:assetId/ports`）
6. 刷新画布，显示新添加的节点

### 7.2 连接关系创建流程

1. 用户点击源设备的端口连接点
2. 系统进入连接创建模式（鼠标显示连接线）
3. 用户移动鼠标到目标设备的端口连接点
4. 点击目标端口，完成连接创建
5. 调用 `POST /cmdb/topology/views/:viewId/connections` 创建连接
6. 连接创建成功后，刷新画布，显示新连接

### 7.3 状态监控刷新流程

1. 页面加载时，获取所有设备的状态（调用 `POST /cmdb/topology/devices/status`）
2. 获取所有端口的状态（遍历设备，调用 `GET /cmdb/topology/devices/:assetId/ports/status`）
3. 获取所有连接的状态（调用 `POST /cmdb/topology/connections/status`）
4. 定时刷新（如每 30 秒刷新一次）
5. 根据状态更新节点、端口、连接的颜色和图标

### 7.4 布局保存流程

1. 用户拖拽设备节点调整位置
2. 防抖处理（延迟 2-3 秒）
3. 批量调用 `PUT /cmdb/topology/views/:viewId/nodes/positions` 保存位置
4. 显示保存状态提示（保存中/已保存/保存失败）

---

## 八、错误处理

### 8.1 错误场景处理

1. **API 调用失败：**

   - 网络错误：显示友好提示，提供重试按钮
   - 权限错误：提示用户无权限，引导联系管理员
   - 数据冲突：提示冲突信息，提供解决方案

2. **数据验证失败：**

   - 连接冲突：提示连接已存在
   - 端口冲突：提示端口已被使用
   - 必填字段缺失：表单验证，字段级别错误提示

3. **操作失败：**
   - 删除失败：提示失败原因
   - 保存失败：保留用户输入，提供重试功能

### 8.2 加载状态设计

- **页面加载：** 显示 Skeleton 加载骨架屏
- **数据刷新：** 显示 Spin 加载动画，不阻塞用户操作
- **操作提交：** 按钮显示 loading 状态，禁用重复提交

---

## 九、性能优化

### 9.1 渲染优化

- **虚拟渲染：** 大量节点时使用虚拟滚动或 Canvas 渲染
- **按需加载：** 只渲染可视区域内的节点和连接
- **防抖处理：** 节点位置更新使用防抖，减少 API 调用

### 9.2 数据优化

- **数据缓存：** 使用 React Query 或 SWR 缓存拓扑数据
- **批量请求：** 状态监控使用批量接口，减少请求次数
- **增量更新：** 只更新变更的数据，不刷新整个拓扑

---

## 十、开发优先级

### 阶段一：核心功能（必须）

1. 拓扑节点设备管理（关联已监控资产）
2. 端口信息展示（仅展示端口编号、名称、状态）
3. 网络连接关系管理（线段表示）
4. 2D 拓扑图实现
5. 基础 API 接口对接

### 阶段二：增强功能（重要）

6. 网络状态监控（基于 Prometheus）
7. 拓扑视图管理
8. 属性面板
9. 工具栏功能
10. 设备选择面板

### 阶段三：优化功能（可选）

11. 自动布局算法
12. 拓扑搜索和定位
13. 拓扑导出功能
14. 性能优化

---

## 十一、待确认问题（已确认）

1. **拓扑图库选择：** react-flow
2. **状态刷新频率：** 60 秒
3. **节点位置保存策略：** 手动保存
4. **连接创建方式：** 拖拽创建连接
5. **端口连接点显示方式：** 悬停显示

---

## 十二、拓扑图库选择建议

### 12.1 候选库对比

#### 12.1.1 react-flow

**优点：**

- ✅ 完全基于 React，与项目技术栈完美匹配
- ✅ TypeScript 支持完善，类型定义完整
- ✅ 支持自定义节点和边，灵活度高
- ✅ 内置拖拽创建连接功能（handle 连接点）
- ✅ 支持节点拖拽、缩放、平移
- ✅ 性能优秀，支持大量节点渲染
- ✅ 文档完善，社区活跃
- ✅ 支持悬停显示端口（通过自定义节点实现）
- ✅ 支持节点和边的样式自定义（状态颜色）
- ✅ 支持画布操作（缩放、平移、适应窗口等）

**缺点：**

- ⚠️ 需要一定的学习成本
- ⚠️ 复杂布局需要自定义算法

**适用场景：** ✅ **推荐使用** - 完全符合项目需求

**安装：**

```bash
npm install reactflow
```

**核心特性：**

- 自定义节点组件
- 连接点（Handle）支持拖拽创建连接
- 支持悬停显示端口
- 支持节点和边的状态样式
- 内置画布操作（缩放、平移、适应窗口）

---

#### 12.1.2 vis-network

**优点：**

- ✅ 功能丰富，性能优秀
- ✅ 支持大量节点（数千个节点）
- ✅ 内置多种布局算法
- ✅ 支持拖拽创建连接
- ✅ 文档完善

**缺点：**

- ❌ 不是纯 React 组件，需要封装
- ❌ TypeScript 支持一般
- ❌ 自定义节点和边相对复杂
- ❌ 悬停显示端口需要额外开发
- ❌ 与 React 生态集成不如 react-flow 自然

**适用场景：** 适合需要处理超大量节点的场景，但需要更多封装工作

---

#### 12.1.3 d3.js

**优点：**

- ✅ 功能强大，灵活性极高
- ✅ 可以完全自定义所有细节
- ✅ 性能优秀

**缺点：**

- ❌ 学习曲线陡峭
- ❌ 需要大量开发工作
- ❌ 不是 React 组件，需要手动管理 DOM
- ❌ 拖拽创建连接需要自己实现
- ❌ 开发周期长

**适用场景：** 适合需要完全自定义的场景，但开发成本高

---

#### 12.1.4 cytoscape.js

**优点：**

- ✅ 专业的图可视化库
- ✅ 功能强大
- ✅ 支持多种布局算法

**缺点：**

- ❌ 不是 React 组件
- ❌ 学习成本高
- ❌ 与 React 集成需要封装
- ❌ 文档相对复杂

**适用场景：** 适合复杂的图分析场景，但集成成本高

---

### 12.2 推荐方案：react-flow

**推荐理由：**

1. **技术栈匹配：** 完全基于 React，与项目技术栈完美匹配，无需额外封装
2. **功能满足：** 支持所有核心需求：
   - ✅ 节点拖拽移动
   - ✅ 拖拽创建连接（通过 Handle 连接点）
   - ✅ 悬停显示端口（自定义节点组件实现）
   - ✅ 状态颜色区分（节点和边的样式自定义）
   - ✅ 画布缩放、平移
   - ✅ 自定义节点图标
3. **开发效率：** TypeScript 支持完善，开发体验好
4. **性能优秀：** 支持大量节点渲染，性能优化良好
5. **社区活跃：** 文档完善，问题解决方便

**实现示例：**

```typescript
// 自定义节点组件（支持悬停显示端口）
const CustomNode = ({ data, selected }) => {
  const [showPorts, setShowPorts] = useState(false);

  return (
    <div className='topology-node' onMouseEnter={() => setShowPorts(true)} onMouseLeave={() => setShowPorts(false)}>
      <Handle type='target' position={Position.Top} />
      <div className='node-content'>
        <DeviceIcon type={data.deviceType} />
        <div className='node-name'>{data.name}</div>
        <StatusIndicator status={data.status} />
      </div>
      {showPorts && (
        <div className='ports-container'>
          {data.ports.map((port) => (
            <Handle key={port.portNumber} type='source' position={Position.Right} id={port.portNumber} style={{ top: `${port.position}%` }} />
          ))}
        </div>
      )}
      <Handle type='source' position={Position.Bottom} />
    </div>
  );
};

// 使用react-flow
<ReactFlow nodes={nodes} edges={edges} nodeTypes={{ custom: CustomNode }} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView />;
```

**核心 API：**

- `ReactFlow` - 主组件
- `Node` - 节点数据
- `Edge` - 边（连接）数据
- `Handle` - 连接点（支持拖拽创建连接）
- `useReactFlow` - Hook，用于控制画布操作
- `Background` - 网格背景
- `Controls` - 画布控制按钮（缩放、适应窗口等）
- `MiniMap` - 小地图（可选）

---

### 12.3 最终建议

**推荐使用：react-flow**

**理由总结：**

1. ✅ 与 React 技术栈完美匹配
2. ✅ 支持所有核心功能需求
3. ✅ 开发效率高，TypeScript 支持好
4. ✅ 性能优秀，支持大量节点
5. ✅ 文档完善，社区活跃
6. ✅ 悬停显示端口、拖拽创建连接等功能易于实现

**实施步骤：**

1. 安装 react-flow：`npm install reactflow`
2. 创建自定义节点组件（支持悬停显示端口）
3. 配置节点类型和边样式
4. 实现拖拽创建连接功能
5. 集成状态监控和颜色区分
6. 实现画布操作（缩放、平移、适应窗口等）

---

### 12.4 备选方案

如果 react-flow 无法满足某些特殊需求，可以考虑：

1. **vis-network** - 如果需要处理超大量节点（>1000 个）
2. **d3.js** - 如果需要完全自定义的复杂交互
3. **cytoscape.js** - 如果需要复杂的图分析功能

但对于当前项目需求，**react-flow 是最佳选择**。
