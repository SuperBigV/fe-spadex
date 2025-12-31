# 机房可视化大屏设计文档

## 一、项目概述

### 1.1 功能目标

机房可视化大屏是一个数据展示大屏，用于快速了解机房的整体运行状态和详细信息，包括：

- **机房概览信息**：机房基本信息、状态、容量统计
- **机柜统计**：按 U 数统计、机柜使用情况
- **设备统计**：设备类型分布、设备数量统计
- **容量监控**：U 位使用率、功率使用率
- **环境监控**：温度、湿度实时监控
- **网络设备监控**：CPU 和内存利用率（可切换展示）
- **机房切换**：大屏内支持切换不同机房查看

### 1.2 技术栈

- **框架**: React 17.0 + TypeScript
- **UI 库**: Ant Design 4.23.0
- **可视化库**:
  - ECharts 5.x（图表展示）
  - DataV（大屏组件）
- **路由**: React Router 5.2.0
- **状态管理**: React Hooks + Context
- **构建工具**: Vite 2.9.18
- **样式**: Less + CSS3（深色主题）

### 1.3 项目路径

```
src/pages/operation/roomDashboard/
  ├── index.tsx              # 大屏主页面
  ├── index.less             # 大屏样式
  ├── components/            # 大屏组件
  │   ├── RoomSelector/      # 机房选择器
  │   ├── OverviewCards/     # 概览卡片
  │   ├── RoomImage/         # 机房3D图片组件
  │   ├── RackStatistics/    # 机柜统计
  │   ├── DeviceStatistics/  # 设备统计
  │   ├── CapacityMonitor/   # 容量监控
  │   ├── EnvironmentMonitor/# 环境监控
  │   └── NetworkMonitor/    # 网络设备监控
  └── services.ts            # API服务
```

---

## 二、页面布局设计

### 2.1 整体布局（1920x1080 大屏）- 左中右布局

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  顶部标题栏 (100px)                                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  [机房选择器]  机房可视化大屏                    [刷新] [全屏] [设置] │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
├──────────┬──────────────────────────────────────────────┬──────────────────┤
│          │                                              │                  │
│  左侧栏   │              中间区域                        │    右侧栏        │
│  (400px) │                                              │   (400px)       │
│          │                                              │                  │
│ ┌──────┐ │  ┌──────────────────────────────────────┐   │ ┌──────────────┐ │
│ │概览  │ │  │                                      │   │ │ 设备类型统计 │ │
│ │卡片1 │ │  │                                      │   │ │ (饼图)       │ │
│ │机柜  │ │  │        机房3D图片                     │   │ │              │ │
│ │总数  │ │  │     (public/image/room.png)           │   │ │ [ECharts饼图]│ │
│ └──────┘ │  │                                      │   │ └──────────────┘ │
│          │  │      支持交互：                       │   │                  │
│ ┌──────┐ │  │      - 点击机柜查看详情                │   │ ┌──────────────┐ │
│ │概览  │ │  │      - 悬停显示机柜信息                │   │ │ 环境监控      │ │
│ │卡片2 │ │  │      - 机柜状态颜色标识                │   │ │ (温度湿度)    │ │
│ │设备  │ │  │                                      │   │ │              │ │
│ │总数  │ │  │                                      │   │ │ [ECharts折线]│ │
│ └──────┘ │  └──────────────────────────────────────┘   │ └──────────────┘ │
│          │                                              │                  │
│ ┌──────┐ │  ┌──────────────────────────────────────┐   │ ┌──────────────┐ │
│ │机柜  │ │  │  网络设备监控 Top 10                   │   │ │ 容量监控      │ │
│ │U数   │ │  │  [切换按钮: CPU | 内存]                │   │ │ (仪表盘)      │ │
│ │统计  │ │  │                                      │   │ │              │ │
│ │      │ │  │  [横向柱状图]                         │   │ │ U位/功率使用率│ │
│ │[柱状]│ │  │  显示CPU/内存使用率Top 10设备          │   │ │ [仪表盘]      │ │
│ └──────┘ │  │  按使用率从高到低排序                  │   │ └──────────────┘ │
│          │  └──────────────────────────────────────┘   │                  │
│          │                                              │                  │
└──────────┴──────────────────────────────────────────────┴──────────────────┘
```

### 2.2 布局说明

**布局结构**:

- **顶部标题栏**: 固定高度 100px，包含机房选择器、标题、操作按钮
- **左侧栏**: 固定宽度 400px，包含概览卡片（机柜总数、设备总数）和机柜统计图表
- **中间区域**: 自适应宽度，分为上下两部分
  - **上部分**: 显示机房 3D 可视化图片
  - **下部分**: 显示网络设备监控 Top 10 横向柱状图
- **右侧栏**: 固定宽度 400px，包含设备统计、环境监控、容量监控

**中间区域设计**:

- **上部分 - 机房 3D 图片**:

  - 显示机房 3D 图片（`public/image/room.png`）
  - 图片自适应容器大小，保持宽高比
  - 支持图片交互功能：
    - 点击机柜区域可查看机柜详情
    - 悬停显示机柜基本信息
    - 机柜状态通过颜色标识（正常/告警/维护）
    - 支持图片缩放和平移（可选）

- **下部分 - 网络设备监控**:
  - 显示网络设备 CPU/内存使用率 Top 10 排名
  - 使用横向柱状图展示，按使用率从高到低排序
  - 支持 CPU 和内存指标切换
  - 显示设备名称和使用率数值

### 2.3 响应式布局

- **大屏模式 (1920x1080)**: 完整布局，所有模块同时显示
- **标准屏 (1366x768)**: 适当缩小模块尺寸，保持布局结构
- **平板模式**: 部分模块堆叠显示
- **移动端**: 单列布局，模块垂直排列

---

## 三、功能模块设计

### 3.1 顶部标题栏

**位置**: 页面顶部，固定高度 100px

**功能**:

- **机房选择器**: 下拉选择或搜索切换机房
- **标题**: "机房可视化大屏" + 当前机房名称
- **操作按钮**:
  - 刷新：手动刷新数据
  - 全屏：切换全屏模式
  - 设置：大屏配置（刷新间隔、显示模块等）

**设计要点**:

- 深色背景，使用渐变效果
- 标题使用大号字体，加粗
- 机房选择器支持搜索和快速切换

### 3.2 中间区域 - 机房 3D 可视化

**位置**: 页面中间，自适应宽度

**功能**:

- 显示机房 3D 图片（`public/image/room.png`）
- 图片交互功能：
  - 点击机柜区域：弹出机柜详情弹窗或跳转到机柜详情
  - 悬停机柜：显示机柜基本信息（名称、U 位使用率、设备数量等）
  - 机柜状态标识：通过颜色或图标标识机柜状态
    - 正常：绿色边框/图标
    - 告警：红色边框/图标
    - 维护：黄色边框/图标
  - 支持图片缩放和平移（可选，用于查看细节）

**技术实现**:

- 使用 `<img>` 标签显示图片（`public/image/room.png`）
- 图片容器使用相对定位，机柜交互区域使用绝对定位
- 根据机柜坐标配置，在图片上叠加可点击的 `<div>` 元素
- 每个机柜区域根据状态显示不同颜色的边框或背景
- 悬停时显示 Tooltip，点击时触发回调

**实现示例**:

```typescript
// RoomImage 组件实现思路
<div className='room-image-container' style={{ position: 'relative' }}>
  <img src='/image/room.png' alt='机房3D图' style={{ width: '100%', height: '100%' }} />
  {imageConfig?.racks.map((rack) => (
    <div
      key={rack.rackId}
      className='rack-interactive-area'
      style={{
        position: 'absolute',
        left: `${rack.x}%`,
        top: `${rack.y}%`,
        width: `${rack.width}%`,
        height: `${rack.height}%`,
        border: `2px solid ${getRackStatusColor(rack.status)}`,
        cursor: 'pointer',
      }}
      onMouseEnter={() => onRackHover?.(rack.rackId)}
      onClick={() => onRackClick?.(rack.rackId)}
    />
  ))}
</div>
```

**数据来源**:

```typescript
interface RoomImageConfig {
  imageUrl: string; // 图片路径
  racks: Array<{
    rackId: number;
    rackName: string;
    x: number; // 机柜在图片中的X坐标（百分比）
    y: number; // 机柜在图片中的Y坐标（百分比）
    width: number; // 机柜区域宽度（百分比）
    height: number; // 机柜区域高度（百分比）
    status: 'normal' | 'alarm' | 'maintenance';
  }>;
}
```

### 3.3 左侧栏 - 概览卡片和统计

**位置**: 页面左侧，固定宽度 400px

**布局**: 2 个概览卡片垂直排列，机柜统计图表

**卡片内容**:

1. **机柜总数卡片**

   - 标题: "机柜总数"
   - 数值: 大号数字显示
   - 副标题: "已用 / 总数"
   - 图标: 机柜图标
   - 颜色: 蓝色系

2. **设备总数卡片**

   - 标题: "设备总数"
   - 数值: 大号数字显示
   - 副标题: "在线 / 总数"
   - 图标: 设备图标
   - 颜色: 绿色系

**设计要点**:

- 卡片使用玻璃态效果（毛玻璃背景）
- 数值使用大号字体，加粗
- 支持数字动画效果（数字滚动）
- 悬停显示详细信息

### 3.4 左侧栏 - 机柜 U 数统计模块

**位置**: 左侧栏底部

**图表类型**: ECharts 柱状图

**数据展示**:

- X 轴: 机柜编号/名称
- Y 轴: U 数（已用 U / 总 U）
- 显示方式: 堆叠柱状图，显示已用和可用 U 数
- 颜色:
  - 已用 U: 蓝色系
  - 可用 U: 灰色系

**交互**:

- 悬停显示机柜详细信息
- 点击跳转到机柜详情（可选）

**数据来源**:

```typescript
interface RackUStatistics {
  rackId: number;
  rackName: string;
  totalU: number;
  usedU: number;
  availableU: number;
}
```

### 3.5 右侧栏 - 设备类型统计模块

**位置**: 右侧栏顶部

**图表类型**: ECharts 饼图或柱状图（可切换）

**数据展示**:

- 饼图: 显示各设备类型占比
- 柱状图: 显示各设备类型数量
- 设备类型: 服务器、交换机、路由器、防火墙、存储设备等
- 图例: 显示设备类型和数量

**颜色方案**: 使用渐变色，不同设备类型使用不同颜色

**交互**:

- 悬停显示设备类型详细信息
- 点击筛选该类型设备（可选）

**数据来源**:

```typescript
interface DeviceTypeStatistics {
  deviceType: string;
  count: number;
  percentage: number;
}
```

### 3.6 右侧栏 - 容量监控模块

**位置**: 右侧栏底部

**展示方式**: 仪表盘（Gauge Chart）或进度条

**内容**:

1. **U 位使用率仪表盘**

   - 仪表盘显示使用率百分比
   - 颜色根据使用率变化
   - 显示数值: "已用 U / 总 U (XX%)"

2. **功率使用率仪表盘**
   - 仪表盘显示使用率百分比
   - 颜色根据使用率变化
   - 显示数值: "已用功率 / 总容量 (XX%)"

**设计要点**:

- 使用 ECharts 仪表盘组件
- 支持动画效果
- 阈值告警（超过 80%黄色，超过 95%红色）

**数据来源**: `RoomStatistics` 接口

### 3.7 右侧栏 - 环境监控模块

**位置**: 右侧栏中间

**图表类型**: ECharts 折线图（双 Y 轴）

**数据展示**:

- X 轴: 时间（最近 24 小时或自定义时间范围）
- Y 轴 1: 温度（℃）
- Y 轴 2: 湿度（%）
- 两条折线: 温度曲线和湿度曲线

**颜色方案**:

- 温度: 红色系
- 湿度: 蓝色系

**交互**:

- 悬停显示具体数值和时间点
- 支持时间范围选择
- 显示温度/湿度正常范围区域（背景色）

**数据来源**:

```typescript
interface EnvironmentData {
  timestamp: string;
  temperature: number; // 温度（℃）
  humidity: number; // 湿度（%）
}
```

### 3.8 中间区域下部分 - 网络设备监控 Top 10 模块

**位置**: 中间区域下部分，固定高度约 300px

**图表类型**: ECharts 横向柱状图

**功能**:

- **切换按钮**: CPU 利用率 | 内存利用率
- **图表展示**: 根据选择显示 CPU 或内存使用率 Top 10 排名
- **数据展示**:
  - Y 轴: 网络设备名称（交换机、路由器、防火墙等），显示 Top 10
  - X 轴: 使用率百分比（0-100%）
  - 显示方式: 横向柱状图，按使用率从高到低排序
  - 每个柱状图显示设备名称和使用率数值

**颜色方案**:

- CPU: 橙色系渐变
- 内存: 紫色系渐变
- 根据使用率变色（绿色/黄色/橙色/红色）
- Top 3 使用特殊颜色高亮显示

**交互**:

- 悬停显示设备详细信息和使用率
- 点击查看设备详情（可选）
- 柱状图动画效果，按使用率从高到低依次显示

**数据来源**:

```typescript
interface NetworkDeviceMonitor {
  deviceId: number;
  deviceName: string;
  deviceType: string;
  cpuUsage: number; // CPU使用率（%）
  memoryUsage: number; // 内存使用率（%）
  timestamp: string;
}

// Top 10 数据，按使用率排序
interface NetworkDeviceTop10 {
  list: NetworkDeviceMonitor[]; // 已按使用率排序，取前10条
  metric: 'cpu' | 'memory'; // 当前指标类型
}
```

---

## 四、数据接口设计

### 4.1 机房统计接口

**接口**: `GET /cmdb/rooms/:roomId/statistics`

**响应数据**:

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
  alarmCount?: number; // 告警数量
}
```

### 4.2 机柜 U 数统计接口

**接口**: `GET /cmdb/rooms/:roomId/racks/u-statistics`

**响应数据**:

```typescript
interface RackUStatisticsResponse {
  list: Array<{
    rackId: number;
    rackName: string;
    rackCode: string;
    totalU: number;
    usedU: number;
    availableU: number;
    uUsageRate: number;
  }>;
}
```

### 4.3 设备类型统计接口

**接口**: `GET /cmdb/rooms/:roomId/devices/type-statistics`

**响应数据**:

```typescript
interface DeviceTypeStatisticsResponse {
  list: Array<{
    deviceType: string; // 设备类型：server, switch, router, firewall, storage等
    deviceTypeName: string; // 设备类型名称：服务器、交换机、路由器等
    count: number; // 设备数量
    percentage: number; // 占比（0-1）
  }>;
}
```

### 4.4 环境监控接口

**接口**: `GET /cmdb/rooms/:roomId/environment`

**查询参数**:

- `startTime`: 开始时间（可选，默认最近 24 小时）
- `endTime`: 结束时间（可选，默认当前时间）
- `interval`: 数据间隔（可选，默认 1 小时）

**响应数据**:

```typescript
interface EnvironmentDataResponse {
  list: Array<{
    timestamp: string; // 时间戳
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

### 4.5 网络设备监控 Top 10 接口

**接口**: `GET /cmdb/rooms/:roomId/network-devices/top10`

**查询参数**:

- `metric`: 监控指标（cpu | memory，可选，默认 cpu）
- `limit`: 返回数量（可选，默认 10）

**响应数据**:

```typescript
interface NetworkDeviceTop10Response {
  list: Array<{
    deviceId: number;
    deviceName: string;
    deviceType: string;
    deviceTypeName: string;
    cpuUsage: number; // CPU使用率（%）
    memoryUsage: number; // 内存使用率（%）
    timestamp: string;
    rank: number; // 排名（1-10）
  }>; // 已按使用率从高到低排序
  metric: 'cpu' | 'memory'; // 当前指标类型
}
```

### 4.6 机房列表接口（用于机房切换）

**接口**: `GET /cmdb/rooms`

**查询参数**:

- `page`: 页码（可选）
- `pageSize`: 每页数量（可选）
- `status`: 状态筛选（可选）

**响应数据**: 使用现有的 `RoomListResponse` 接口

### 4.7 机房图片配置接口

**接口**: `GET /cmdb/rooms/:roomId/image-config`

**功能**: 获取机房图片中机柜的坐标配置信息

**响应数据**:

```typescript
interface RoomImageConfigResponse {
  imageUrl: string; // 图片路径，如 "/image/room.png"
  racks: Array<{
    rackId: number;
    rackName: string;
    rackCode: string;
    x: number; // 机柜在图片中的X坐标（百分比 0-100）
    y: number; // 机柜在图片中的Y坐标（百分比 0-100）
    width: number; // 机柜区域宽度（百分比 0-100）
    height: number; // 机柜区域高度（百分比 0-100）
    status: 'normal' | 'alarm' | 'maintenance'; // 机柜状态
    uUsageRate?: number; // U位使用率（用于颜色标识）
  }>;
}
```

---

## 五、组件设计

### 5.1 RoomDashboard (大屏主页面)

**路径**: `src/pages/operation/roomDashboard/index.tsx`

**Props**:

```typescript
interface RoomDashboardProps {
  roomId?: number; // 可选，URL参数传入
}
```

**功能**:

- 大屏整体布局
- 数据获取和状态管理
- 自动刷新逻辑
- 全屏切换

**状态管理**:

```typescript
interface DashboardState {
  currentRoomId: number | null;
  roomList: Room[];
  statistics: RoomStatistics | null;
  roomImageConfig: RoomImageConfig | null; // 机房图片配置
  rackUStatistics: RackUStatistics[];
  deviceTypeStatistics: DeviceTypeStatistics[];
  environmentData: EnvironmentData[];
  networkDeviceTop10: NetworkDeviceMonitor[]; // 网络设备Top 10数据
  loading: boolean;
  refreshInterval: number; // 刷新间隔（秒）
  metricType: 'cpu' | 'memory'; // 网络设备监控指标类型
}
```

### 5.2 RoomSelector (机房选择器)

**路径**: `src/pages/operation/roomDashboard/components/RoomSelector/index.tsx`

**Props**:

```typescript
interface RoomSelectorProps {
  roomList: Room[];
  currentRoomId: number | null;
  onRoomChange: (roomId: number) => void;
  loading?: boolean;
}
```

**功能**:

- 下拉选择机房
- 支持搜索
- 显示机房基本信息

### 5.3 RoomImage (机房 3D 图片组件)

**路径**: `src/pages/operation/roomDashboard/components/RoomImage/index.tsx`

**Props**:

```typescript
interface RoomImageProps {
  roomId: number;
  imageConfig: RoomImageConfig | null;
  onRackClick?: (rackId: number) => void;
  onRackHover?: (rackId: number) => void;
  loading?: boolean;
}
```

**功能**:

- 显示机房 3D 图片
- 机柜区域交互（点击、悬停）
- 机柜状态颜色标识
- 支持图片缩放和平移（可选）

**技术实现**:

- 使用绝对定位的 `<div>` 元素作为机柜交互区域
- 或使用 SVG 叠加层实现精确的点击区域
- 机柜坐标数据从后端获取或前端配置

### 5.4 OverviewCards (概览卡片)

**路径**: `src/pages/operation/roomDashboard/components/OverviewCards/index.tsx`

**Props**:

```typescript
interface OverviewCardsProps {
  statistics: RoomStatistics | null;
  loading?: boolean;
}
```

**功能**:

- 显示 2 个概览卡片（垂直排列）：机柜总数、设备总数
- 数字动画效果
- 进度条可视化

### 5.5 RackStatistics (机柜统计)

**路径**: `src/pages/operation/roomDashboard/components/RackStatistics/index.tsx`

**Props**:

```typescript
interface RackStatisticsProps {
  data: RackUStatistics[];
  loading?: boolean;
}
```

**功能**:

- ECharts 柱状图渲染
- 数据更新时图表动画
- 悬停交互

### 5.6 DeviceStatistics (设备统计)

**路径**: `src/pages/operation/roomDashboard/components/DeviceStatistics/index.tsx`

**Props**:

```typescript
interface DeviceStatisticsProps {
  data: DeviceTypeStatistics[];
  chartType?: 'pie' | 'bar'; // 图表类型
  loading?: boolean;
}
```

**功能**:

- ECharts 饼图/柱状图渲染
- 图表类型切换
- 图例交互

### 5.7 CapacityMonitor (容量监控)

**路径**: `src/pages/operation/roomDashboard/components/CapacityMonitor/index.tsx`

**Props**:

```typescript
interface CapacityMonitorProps {
  statistics: RoomStatistics | null;
  loading?: boolean;
}
```

**功能**:

- ECharts 仪表盘渲染
- 阈值告警显示
- 数值动画

### 5.8 EnvironmentMonitor (环境监控)

**路径**: `src/pages/operation/roomDashboard/components/EnvironmentMonitor/index.tsx`

**Props**:

```typescript
interface EnvironmentMonitorProps {
  data: EnvironmentData[];
  current: EnvironmentData | null;
  loading?: boolean;
}
```

**功能**:

- ECharts 折线图渲染（双 Y 轴）
- 时间范围选择
- 实时数据更新

### 5.9 NetworkMonitor (网络设备监控 Top 10)

**路径**: `src/pages/operation/roomDashboard/components/NetworkMonitor/index.tsx`

**Props**:

```typescript
interface NetworkMonitorProps {
  data: NetworkDeviceMonitor[]; // Top 10 数据，已排序
  metricType: 'cpu' | 'memory';
  onMetricChange: (type: 'cpu' | 'memory') => void;
  loading?: boolean;
}
```

**功能**:

- 指标类型切换（CPU/内存）
- ECharts 横向柱状图渲染
- Top 10 排名展示
- 数据更新和动画效果

---

## 六、样式设计

### 6.1 深色主题配色方案

**主色调**:

- 背景色: `#0a0e27` (深蓝黑)
- 卡片背景: `rgba(26, 35, 70, 0.8)` (半透明深蓝)
- 边框色: `rgba(64, 128, 255, 0.3)` (蓝色边框)

**文字颜色**:

- 主标题: `#ffffff` (白色)
- 副标题: `#a0aec0` (浅灰)
- 数值: `#4fd1c7` (青色)
- 警告: `#f6ad55` (橙色)
- 危险: `#fc8181` (红色)

**图表颜色**:

- 主色: `#4fd1c7` (青色)
- 辅助色: `#4299e1` (蓝色)
- 成功: `#48bb78` (绿色)
- 警告: `#f6ad55` (橙色)
- 危险: `#fc8181` (红色)

### 6.2 卡片样式

**玻璃态效果**:

```less
.dashboard-card {
  background: rgba(26, 35, 70, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(64, 128, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
```

**标题样式**:

```less
.card-title {
  font-size: 14px;
  color: #a0aec0;
  margin-bottom: 8px;
}

.card-value {
  font-size: 32px;
  font-weight: bold;
  color: #4fd1c7;
}
```

### 6.3 动画效果

**数字滚动动画**:

- 使用 `react-countup` 或自定义动画
- 数值变化时平滑滚动

**图表动画**:

- ECharts 内置动画
- 数据更新时平滑过渡

**加载动画**:

- 使用 Skeleton 骨架屏
- 数据加载时显示占位符

---

## 七、交互设计

### 7.1 自动刷新

**功能**:

- 默认每 30 秒自动刷新数据
- 可配置刷新间隔（5s、10s、30s、60s、关闭）
- 刷新时显示加载状态，不阻塞界面

**实现**:

```typescript
useEffect(() => {
  if (refreshInterval > 0) {
    const timer = setInterval(() => {
      fetchAllData();
    }, refreshInterval * 1000);
    return () => clearInterval(timer);
  }
}, [refreshInterval, currentRoomId]);
```

### 7.2 机房切换

**交互流程**:

1. 点击机房选择器
2. 显示机房列表（支持搜索）
3. 选择机房后，自动加载该机房数据
4. 更新所有模块数据
5. 显示切换动画

**URL 参数**:

- 支持 URL 参数 `?roomId=1` 指定初始机房
- 切换机房时更新 URL（可选）

### 7.3 全屏模式

**功能**:

- 点击全屏按钮进入全屏
- 隐藏浏览器工具栏和地址栏
- 退出全屏恢复原状

**实现**:

```typescript
const handleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};
```

### 7.4 网络设备监控切换

**交互**:

- 点击"CPU 利用率"或"内存利用率"按钮
- 切换图表数据源，重新获取 Top 10 数据
- 更新横向柱状图显示
- 按钮高亮显示当前选中状态
- 图表动画效果，按排名从高到低依次显示

**横向柱状图设计**:

- Y 轴显示设备名称（Top 10）
- X 轴显示使用率百分比（0-100%）
- 每个柱状图右侧显示具体数值
- Top 3 使用特殊颜色高亮
- 支持悬停显示详细信息

---

## 八、技术实现要点

### 8.1 ECharts 集成

**安装**:

```bash
npm install echarts
```

**使用**:

```typescript
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

const ChartComponent = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark');

      const option = {
        // ECharts配置
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};
```

**横向柱状图配置示例（网络设备 Top 10）**:

```typescript
const getTop10BarOption = (data: NetworkDeviceMonitor[], metric: 'cpu' | 'memory') => {
  // 数据已按使用率从高到低排序，取前10条
  const top10 = data.slice(0, 10);

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    grid: {
      left: '20%',
      right: '10%',
      top: '10%',
      bottom: '10%',
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    yAxis: {
      type: 'category',
      data: top10.map((item) => item.deviceName),
      inverse: true, // 从高到低显示
    },
    series: [
      {
        type: 'bar',
        data: top10.map((item, index) => ({
          value: metric === 'cpu' ? item.cpuUsage : item.memoryUsage,
          itemStyle: {
            color:
              index < 3
                ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#ff6b6b' },
                    { offset: 1, color: '#ee5a6f' },
                  ])
                : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#4ecdc4' },
                    { offset: 1, color: '#44a08d' },
                  ]),
          },
        })),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
        },
        animationDelay: (idx: number) => idx * 100, // 依次动画
      },
    ],
  };
};
```

### 8.2 DataV 集成（可选）

**安装**:

```bash
npm install @jiaminghi/data-view
```

**使用**:

- 边框装饰组件
- 数字翻牌器
- 滚动表格

### 8.3 响应式适配

**使用 CSS 媒体查询**:

```less
@media (max-width: 1920px) {
  .dashboard-container {
    transform: scale(0.9);
  }
}

@media (max-width: 1366px) {
  .dashboard-container {
    transform: scale(0.75);
  }
}
```

**或使用 JavaScript 动态缩放**:

```typescript
const [scale, setScale] = useState(1);

useEffect(() => {
  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const targetWidth = 1920;
    const targetHeight = 1080;
    const scaleX = width / targetWidth;
    const scaleY = height / targetHeight;
    setScale(Math.min(scaleX, scaleY));
  };

  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### 8.4 性能优化

**数据缓存**:

- 使用 React Query 或 SWR 缓存数据
- 减少重复请求

**图表优化**:

- 大量数据时使用数据采样
- 使用 `notMerge: false` 优化更新性能

**组件懒加载**:

- 使用 `React.lazy` 懒加载组件
- 减少初始加载时间

---

## 九、API 服务实现

### 9.1 services.ts

```typescript
import request from '@/utils/request';
import { RoomStatistics, RoomListResponse } from '@/pages/room/types';

// 机房统计
export const getRoomStatistics = async (roomId: number): Promise<RoomStatistics> => {
  const response = await request.get(`/cmdb/rooms/${roomId}/statistics`);
  return response.dat;
};

// 机柜U数统计
export const getRackUStatistics = async (roomId: number) => {
  const response = await request.get(`/cmdb/rooms/${roomId}/racks/u-statistics`);
  return response.dat;
};

// 设备类型统计
export const getDeviceTypeStatistics = async (roomId: number) => {
  const response = await request.get(`/cmdb/rooms/${roomId}/devices/type-statistics`);
  return response.dat;
};

// 环境监控数据
export const getEnvironmentData = async (roomId: number, params?: { startTime?: string; endTime?: string; interval?: string }) => {
  const response = await request.get(`/cmdb/rooms/${roomId}/environment`, { params });
  return response.dat;
};

// 网络设备监控 Top 10
export const getNetworkDeviceTop10 = async (roomId: number, metric: 'cpu' | 'memory' = 'cpu') => {
  const response = await request.get(`/cmdb/rooms/${roomId}/network-devices/top10`, {
    params: { metric, limit: 10 },
  });
  return response.dat;
};

// 机房列表
export const getRoomList = async (params?: any): Promise<RoomListResponse> => {
  const response = await request.get('/cmdb/rooms', { params });
  return response.dat;
};

// 机房图片配置（机柜坐标信息）
export const getRoomImageConfig = async (roomId: number): Promise<RoomImageConfig> => {
  const response = await request.get(`/cmdb/rooms/${roomId}/image-config`);
  return response.dat;
};
```

---

## 十、开发计划

### 阶段一：基础框架（1-2 天）

1. ✅ 创建页面结构和路由
2. ✅ 实现基础布局
3. ✅ 集成 ECharts
4. ✅ 实现深色主题样式

### 阶段二：核心功能（3-5 天）

1. ✅ 实现机房选择器
2. ✅ 实现概览卡片组件
3. ✅ 实现机柜统计图表
4. ✅ 实现设备类型统计图表
5. ✅ 实现容量监控组件

### 阶段三：高级功能（2-3 天）

1. ✅ 实现环境监控图表
2. ✅ 实现网络设备监控（CPU/内存切换）
3. ✅ 实现自动刷新功能
4. ✅ 实现全屏功能

### 阶段四：优化和完善（1-2 天）

1. ✅ 性能优化
2. ✅ 响应式适配
3. ✅ 动画效果优化
4. ✅ 错误处理和加载状态
5. ✅ 测试和 bug 修复

---

## 十一、注意事项

### 11.1 数据更新

- 所有数据接口需要支持实时或准实时数据
- 环境监控数据需要时间序列数据
- 网络设备监控需要实时 CPU/内存数据

### 11.2 错误处理

- 网络错误时显示友好提示
- 数据为空时显示占位内容
- API 错误时记录日志并提示用户

### 11.3 浏览器兼容性

- 支持 Chrome、Firefox、Edge 最新版本
- 全屏 API 需要浏览器支持
- ECharts 需要现代浏览器支持 Canvas

### 11.4 性能要求

- 页面加载时间 < 3 秒
- 数据刷新不阻塞界面
- 图表渲染流畅（60fps）

---

## 十二、扩展功能（可选）

### 12.1 告警展示

- 在概览卡片中显示告警数量
- 告警列表弹窗
- 告警级别颜色区分

### 12.2 历史趋势

- 容量使用趋势图表
- 环境数据历史对比
- 设备性能趋势分析

### 12.3 多机房对比

- 同时显示多个机房数据
- 机房数据对比图表
- 多机房切换视图

### 12.4 自定义配置

- 模块显示/隐藏配置
- 刷新间隔配置
- 图表类型配置
- 颜色主题配置

---

## 十三、总结

本设计文档详细规划了机房可视化大屏的功能、布局、组件设计和实现方案。大屏采用深色主题，使用 DataV+ECharts 进行数据可视化，支持机房切换、自动刷新、全屏等功能。

**核心特点**:

- 信息全面：涵盖机房、机柜、设备、环境、网络等全方位监控
- 可视化强：使用多种图表类型展示数据
- 交互友好：支持机房切换、指标切换、自动刷新
- 性能优化：数据缓存、懒加载、图表优化
- 响应式设计：适配不同屏幕尺寸

**开发建议**:

1. 按照开发计划分阶段实现
2. 先实现核心功能，再完善细节
3. 注意性能优化和用户体验
4. 与后端协调 API 接口设计
5. 充分测试各种场景和边界情况
