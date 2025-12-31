# 机房可视化大屏

## 功能说明

这是一个深色系科技感的机房可视化大屏，用于展示机房的运行状态和关键指标。

## 主要功能

1. **机房选择**：支持选择不同机房查看数据
2. **统计概览**：显示机房总数、机柜总数、设备总数
3. **环境监控**：温度湿度仪表盘实时监控
4. **设备使用率**：设备CPU和内存使用率表格
5. **机柜U数统计**：堆叠柱状图展示机柜U位使用情况
6. **设备类型统计**：饼图展示设备类型分布
7. **环境监控趋势**：温度湿度折线图展示历史趋势
8. **容量监控**：U位和功率使用率仪表盘
9. **告警列表**：最近告警信息展示

## Mock数据

默认使用Mock数据，可在 `services.ts` 中修改 `USE_MOCK` 常量切换：

```typescript
const USE_MOCK = true; // 使用Mock数据
const USE_MOCK = false; // 使用真实API
```

## 访问路径

- 路由：`/room-dashboard`
- 菜单：运维大屏 > 机房大屏

## 技术栈

- React 17.0
- TypeScript
- Ant Design 4.23.0
- ECharts 6.0.0
- Less

## 组件结构

```
roomDashboard/
├── index.tsx              # 主页面
├── index.less             # 主样式
├── types.ts               # 类型定义
├── services.ts            # API服务（含Mock）
├── mockData.ts            # Mock数据
└── components/            # 组件目录
    ├── OverviewCards/     # 统计卡片
    ├── RoomImage/         # 机房3D图片
    ├── TemperatureHumidityCard/  # 温度湿度监控
    ├── DeviceUsageTable/  # 设备使用率表格
    ├── RackStatisticsChart/  # 机柜U数统计
    ├── DeviceTypeChart/   # 设备类型统计
    ├── EnvironmentChart/  # 环境监控图表
    ├── CapacityMonitor/   # 容量监控
    └── AlarmList/         # 告警列表
```

## 样式特点

- 深色系科技感设计
- 发光边框和渐变效果
- 玻璃态卡片效果
- 响应式布局
- 支持全屏模式

## 背景图片

使用 `public/image/dashboard-bg1.png` 作为大屏背景图片。
