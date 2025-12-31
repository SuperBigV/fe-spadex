# 机房可视化大屏 - 前端 UI 设计文档

## 一、设计概述

### 1.1 设计目标

参考一卡通综合数据大屏的布局风格和组件样式，设计一个科技感强、深色系的机房可视化大屏，直观展示机房运行状态和关键指标。

### 1.2 设计风格

- **科技感**：采用发光边框、渐变效果、动画过渡
- **深色系**：深蓝黑背景（#0a0e27），半透明卡片
- **数据可视化**：使用 ECharts 图表和 DataV 边框组件
- **现代化**：玻璃态效果、毛玻璃背景、发光文字

### 1.3 参考图片分析

参考图片展示了一卡通综合数据大屏的布局特点：

- **顶部标题栏**：深色背景，标题居中，操作按钮在右侧
- **左中右布局**：左侧和右侧为紧凑的卡片布局，中间为主要展示区域
- **统计卡片**：左侧图标+右侧数据，大号数字显示
- **图表展示**：柱状图、饼图、折线图、仪表盘等多种图表类型
- **颜色方案**：蓝色、橙色、青色为主色调，配合深色背景

---

## 二、整体布局设计

### 2.0 大屏整体样式

**背景图片设置**：

```less
.dashboard-container {
  width: 100%;
  height: 100vh;
  background-image: url('/image/dashboard-bg1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  overflow: hidden;

  // 背景遮罩层（可选，用于增强文字可读性）
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 14, 39, 0.3); // 半透明深色遮罩
    z-index: 0;
  }

  // 确保内容在遮罩层之上
  > * {
    position: relative;
    z-index: 1;
  }
}
```

**说明**：

- 使用 `public/image/dashboard-bg1.png` 作为大屏整体背景图片
- 背景图片覆盖整个屏幕，保持宽高比
- 可选添加半透明遮罩层，增强内容可读性

### 2.1 布局结构（1920x1080 大屏）

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  顶部标题栏 (100px) - 深色背景，发光边框                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  [机房选择器]  机房可视化大屏                    [刷新] [全屏] [设置] │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
├──────────┬──────────────────────────────────────────────┬──────────────────┤
│          │                                              │                  │
│  左侧栏   │              中间区域                        │    右侧栏        │
│  (400px) │                                              │   (400px)       │
│          │                                              │                  │
│ ┌──────┐ │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │ ┌──────────────┐ │
│ │温度  │ │  │ 机房总数 │ │ 机柜总数 │ │ 设备总数 │     │ │ 设备类型统计 │ │
│ │湿度  │ │  │          │ │          │ │          │     │ │ (饼图)       │ │
│ │仪表盘│ │  │  [卡片]  │ │  [卡片]  │ │  [卡片]  │     │ │              │ │
│ │[卡片]│ │  └──────────┘ └──────────┘ └──────────┘     │ │ [ECharts饼图]│ │
│ └──────┘ │                                              │ └──────────────┘ │
│          │  ┌──────────────────────────────────────┐   │                  │
│ ┌──────┐ │  │                                      │   │ ┌──────────────┐ │
│ │设备  │ │  │                                      │   │ │ 环境监控      │ │
│ │使用率│ │  │        机房3D图片                     │   │ │ (温度湿度)    │ │
│ │表格  │ │  │     (public/image/room.png)           │   │ │              │ │
│ │      │ │  │                                      │   │ │ [ECharts折线]│ │
│ │[表格]│ │  │                                      │   │ │              │ │
│ └──────┘ │  └──────────────────────────────────────┘   │ └──────────────┘ │
│          │                                              │                  │
│ ┌──────┐ │                                              │ ┌──────────────┐ │
│ │机柜  │ │                                              │ │ 容量监控      │ │
│ │U数   │ │                                              │ │ (仪表盘)      │ │
│ │统计  │ │                                              │ │              │ │
│ │      │ │                                              │ │ U位/功率使用率│ │
│ │[柱状]│ │                                              │ │ [仪表盘]      │ │
│ └──────┘ │                                              │ └──────────────┘ │
│          │                                              │                  │
│          │  ┌──────────────────────────────────────┐   │                  │
│          │  │  最近告警列表                         │   │                  │
│          │  │  (滚动表格)                           │   │                  │
│          │  │  [DataV表格]                         │   │                  │
│          │  └──────────────────────────────────────┘   │                  │
└──────────┴──────────────────────────────────────────────┴──────────────────┘
```

### 2.2 布局说明

- **顶部标题栏**：固定高度 100px，包含机房选择器、标题、操作按钮
- **左侧栏**：固定宽度 400px，包含：
  - 温度湿度监控卡片（合并在一个卡片中，包含温度仪表盘和湿度仪表盘）
  - 设备使用率表格（设备名、CPU 使用率、内存使用率）
  - 机柜 U 数统计图表（堆叠柱状图）
- **中间区域**：自适应宽度，分为三部分
  - **上部分**：三个统计卡片（机房总数、机柜总数、设备总数），横向等宽排列，高度约 120px
  - **中部分**：机房 3D 图片（占主要高度，约 50-60%），仅展示图片
  - **下部分**：最近告警列表（滚动表格），高度约 250px
- **右侧栏**：固定宽度 400px，包含设备类型统计、环境监控、容量监控

---

## 三、组件设计

### 3.1 顶部标题栏

**样式设计**：

```less
.dashboard-header {
  height: 100px;
  background: linear-gradient(180deg, rgba(10, 14, 39, 0.95) 0%, rgba(10, 14, 39, 0.8) 100%);
  border-bottom: 2px solid rgba(64, 128, 255, 0.5);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  position: relative;

  // 发光边框效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(64, 128, 255, 0.8) 50%, transparent 100%);
    animation: glow 2s ease-in-out infinite;
  }
}

@keyframes glow {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
```

**组件内容**：

- **左侧**：机房选择器（Select 组件，支持搜索）
- **中间**：标题"机房可视化大屏" + 当前机房名称（大号字体，发光效果）
- **右侧**：操作按钮组（刷新、全屏、设置）

**标题样式**：

```less
.dashboard-title {
  font-size: 36px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(64, 128, 255, 0.8);
  letter-spacing: 2px;
}
```

### 3.2 中间区域统计卡片组件

**布局**：三个统计卡片横向排列，位于机房 3D 图片上方

**卡片布局**：

```tsx
<div className='middle-overview-cards'>
  <div className='overview-card'>
    <div className='card-icon'>
      <HomeOutlined style={{ fontSize: 40, color: '#4fd1c7' }} />
    </div>
    <div className='card-content'>
      <div className='card-label'>机房总数</div>
      <div className='card-value'>{totalRooms}</div>
    </div>
  </div>
  <div className='overview-card'>
    <div className='card-icon'>
      <DatabaseOutlined style={{ fontSize: 40, color: '#4299e1' }} />
    </div>
    <div className='card-content'>
      <div className='card-label'>机柜总数</div>
      <div className='card-value'>{statistics.rackTotal}</div>
      <div className='card-subtitle'>
        已用 {statistics.rackUsed} / 总数 {statistics.rackTotal}
      </div>
    </div>
  </div>
  <div className='overview-card'>
    <div className='card-icon'>
      <ServerOutlined style={{ fontSize: 40, color: '#48bb78' }} />
    </div>
    <div className='card-content'>
      <div className='card-label'>设备总数</div>
      <div className='card-value'>{statistics.deviceTotal}</div>
    </div>
  </div>
</div>
```

**卡片样式**：

```less
.middle-overview-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 0 20px;
}

.overview-card {
  flex: 1;
  background: rgba(26, 35, 70, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(64, 128, 255, 0.3);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(64, 128, 255, 0.6);
    box-shadow: 0 6px 30px rgba(64, 128, 255, 0.2);
    transform: translateY(-2px);
  }

  .card-icon {
    margin-right: 20px;
  }

  .card-content {
    flex: 1;
  }

  .card-label {
    font-size: 14px;
    color: #a0aec0;
    margin-bottom: 8px;
  }

  .card-value {
    font-size: 42px;
    font-weight: bold;
    color: #4fd1c7;
    text-shadow: 0 0 10px rgba(79, 209, 199, 0.5);
    margin-bottom: 4px;
  }

  .card-subtitle {
    font-size: 12px;
    color: #718096;
  }
}
```

**说明**：

- 三个卡片等宽，横向排列
- 卡片 1：机房总数（青色图标）
- 卡片 2：机柜总数（蓝色图标），显示已用/总数
- 卡片 3：设备总数（绿色图标）

### 3.3 中间区域 - 机房 3D 图片组件

**样式设计**：

```less
.room-image-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: rgba(10, 14, 39, 0.5);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(64, 128, 255, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
```

**说明**：

- 仅显示机房 3D 图片，不支持机柜交互功能
- 图片自适应容器大小，保持宽高比

### 3.4 左侧栏 - 温度湿度监控卡片

**组件类型**：合并在一个卡片中，包含温度仪表盘和湿度仪表盘

**组件实现**：

```tsx
<div className='temperature-humidity-card'>
  <div className='card-header'>
    <span className='card-title'>环境监控</span>
  </div>
  <div className='gauges-container'>
    {/* 温度仪表盘 */}
    <div className='gauge-item'>
      <div className='gauge-header'>
        <span className='gauge-title'>当前温度</span>
        <span className='gauge-unit'>℃</span>
      </div>
      <div className='gauge-chart' ref={temperatureChartRef} />
      <div className='gauge-footer'>
        <span className='gauge-value'>{currentTemperature}℃</span>
        <span className='gauge-status'>{getTemperatureStatus(currentTemperature)}</span>
      </div>
    </div>

    {/* 湿度仪表盘 */}
    <div className='gauge-item'>
      <div className='gauge-header'>
        <span className='gauge-title'>当前湿度</span>
        <span className='gauge-unit'>%</span>
      </div>
      <div className='gauge-chart' ref={humidityChartRef} />
      <div className='gauge-footer'>
        <span className='gauge-value'>{currentHumidity}%</span>
        <span className='gauge-status'>{getHumidityStatus(currentHumidity)}</span>
      </div>
    </div>
  </div>
</div>
```

**样式设计**：

```less
.temperature-humidity-card {
  background: rgba(26, 35, 70, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(64, 128, 255, 0.3);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  .card-header {
    margin-bottom: 20px;

    .card-title {
      font-size: 18px;
      font-weight: bold;
      color: #ffffff;
    }
  }

  .gauges-container {
    display: flex;
    gap: 20px;
  }

  .gauge-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    .gauge-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-bottom: 10px;

      .gauge-title {
        font-size: 14px;
        color: #a0aec0;
      }

      .gauge-unit {
        font-size: 12px;
        color: #718096;
      }
    }

    .gauge-chart {
      width: 100%;
      height: 150px;
    }

    .gauge-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-top: 10px;

      .gauge-value {
        font-size: 20px;
        font-weight: bold;
        color: #4fd1c7;
        text-shadow: 0 0 10px rgba(79, 209, 199, 0.5);
      }

      .gauge-status {
        font-size: 12px;
        color: #718096;
      }
    }
  }
}
```

**ECharts Gauge 配置**：

```typescript
// 温度仪表盘配置
const temperatureOption = {
  backgroundColor: 'transparent',
  series: [
    {
      type: 'gauge',
      center: ['50%', '60%'],
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 50,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 12,
          color: [
            [0.4, '#48bb78'], // 0-20℃ 绿色
            [0.6, '#f6ad55'], // 20-30℃ 橙色
            [1, '#fc8181'], // 30-50℃ 红色
          ],
        },
      },
      pointer: {
        itemStyle: { color: '#4fd1c7' },
      },
      detail: {
        fontSize: 16,
        offsetCenter: [0, '70%'],
        valueAnimation: true,
        formatter: '{value}℃',
        color: '#4fd1c7',
      },
      data: [
        {
          value: currentTemperature,
          name: '温度',
        },
      ],
    },
  ],
};

// 湿度仪表盘配置
const humidityOption = {
  backgroundColor: 'transparent',
  series: [
    {
      type: 'gauge',
      center: ['50%', '60%'],
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 12,
          color: [
            [0.3, '#4299e1'], // 0-30% 蓝色
            [0.6, '#f6ad55'], // 30-60% 橙色
            [1, '#fc8181'], // 60-100% 红色
          ],
        },
      },
      pointer: {
        itemStyle: { color: '#4fd1c7' },
      },
      detail: {
        fontSize: 16,
        offsetCenter: [0, '70%'],
        valueAnimation: true,
        formatter: '{value}%',
        color: '#4fd1c7',
      },
      data: [
        {
          value: currentHumidity,
          name: '湿度',
        },
      ],
    },
  ],
};
```

### 3.5 左侧栏 - 设备使用率表格

**组件类型**：Ant Design Table 或 DataV 滚动表格

**组件实现**：

```tsx
<div className='device-usage-table-card'>
  <div className='card-header'>
    <span className='card-title'>设备使用率</span>
  </div>
  <Table dataSource={deviceUsageList} columns={columns} pagination={false} size='small' scroll={{ y: 300 }} rowClassName={(record) => getUsageRowClassName(record)} />
</div>
```

**表格列配置**：

```typescript
const columns = [
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    key: 'deviceName',
    width: 150,
    ellipsis: true,
    render: (text: string) => <span style={{ color: '#ffffff' }}>{text}</span>,
  },
  {
    title: 'CPU使用率',
    dataIndex: 'cpuUsage',
    key: 'cpuUsage',
    width: 100,
    align: 'right' as const,
    render: (value: number) => <span style={{ color: getUsageColor(value) }}>{value.toFixed(1)}%</span>,
  },
  {
    title: '内存使用率',
    dataIndex: 'memoryUsage',
    key: 'memoryUsage',
    width: 100,
    align: 'right' as const,
    render: (value: number) => <span style={{ color: getUsageColor(value) }}>{value.toFixed(1)}%</span>,
  },
];

const getUsageColor = (usage: number) => {
  if (usage < 50) return '#48bb78'; // 绿色
  if (usage < 80) return '#f6ad55'; // 橙色
  return '#fc8181'; // 红色
};

const getUsageRowClassName = (record: DeviceUsage) => {
  const maxUsage = Math.max(record.cpuUsage, record.memoryUsage);
  if (maxUsage >= 90) return 'usage-critical';
  if (maxUsage >= 70) return 'usage-warning';
  return '';
};
```

**样式设计**：

```less
.device-usage-table-card {
  background: rgba(26, 35, 70, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(64, 128, 255, 0.3);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  .card-header {
    margin-bottom: 15px;

    .card-title {
      font-size: 18px;
      font-weight: bold;
      color: #ffffff;
    }
  }

  :global {
    .ant-table {
      background: transparent;
      color: #ffffff;

      .ant-table-thead > tr > th {
        background: rgba(64, 128, 255, 0.1);
        border-bottom: 1px solid rgba(64, 128, 255, 0.3);
        color: #a0aec0;
        font-weight: bold;
      }

      .ant-table-tbody > tr {
        background: transparent;

        &:hover {
          background: rgba(64, 128, 255, 0.1);
        }

        &.usage-critical {
          background: rgba(252, 129, 129, 0.1);
          border-left: 3px solid #fc8181;
        }

        &.usage-warning {
          background: rgba(246, 173, 85, 0.1);
          border-left: 3px solid #f6ad55;
        }
      }

      .ant-table-tbody > tr > td {
        border-bottom: 1px solid rgba(64, 128, 255, 0.2);
        color: #ffffff;
      }
    }
  }
}
```

**数据接口**：

```typescript
interface DeviceUsage {
  deviceId: number;
  deviceName: string;
  deviceType: string;
  cpuUsage: number; // CPU使用率（%）
  memoryUsage: number; // 内存使用率（%）
}
```

### 3.6 左侧栏 - 机柜 U 数统计图表

**图表类型**：ECharts 堆叠柱状图

**ECharts 配置**：

```typescript
const option = {
  backgroundColor: 'transparent',
  grid: {
    left: '15%',
    right: '10%',
    top: '10%',
    bottom: '15%',
  },
  xAxis: {
    type: 'category',
    data: rackList.map((r) => r.rackName),
    axisLine: { lineStyle: { color: '#4a5568' } },
    axisLabel: { color: '#a0aec0', fontSize: 12 },
  },
  yAxis: {
    type: 'value',
    name: 'U数',
    axisLine: { lineStyle: { color: '#4a5568' } },
    axisLabel: { color: '#a0aec0' },
    splitLine: { lineStyle: { color: '#2d3748', type: 'dashed' } },
  },
  series: [
    {
      name: '已用U',
      type: 'bar',
      stack: 'total',
      data: rackList.map((r) => r.usedU),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#4fd1c7' },
          { offset: 1, color: '#2c7a7b' },
        ]),
      },
    },
    {
      name: '可用U',
      type: 'bar',
      stack: 'total',
      data: rackList.map((r) => r.availableU),
      itemStyle: { color: '#4a5568' },
    },
  ],
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(26, 35, 70, 0.9)',
    borderColor: 'rgba(64, 128, 255, 0.5)',
    textStyle: { color: '#ffffff' },
  },
};
```

### 3.7 设备类型统计图表

**图表类型**：ECharts 饼图

**ECharts 配置**：

```typescript
const option = {
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
    backgroundColor: 'rgba(26, 35, 70, 0.9)',
    borderColor: 'rgba(64, 128, 255, 0.5)',
    textStyle: { color: '#ffffff' },
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: { color: '#a0aec0' },
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#0a0e27',
        borderWidth: 2,
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        color: '#ffffff',
        fontSize: 12,
      },
      emphasis: {
        label: { fontSize: 14, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' },
      },
      data: deviceTypeList.map((item) => ({
        value: item.count,
        name: item.deviceTypeName,
        itemStyle: { color: getDeviceTypeColor(item.deviceType) },
      })),
    },
  ],
};
```

### 3.8 环境监控图表

**图表类型**：ECharts 折线图（双 Y 轴）

**ECharts 配置**：

```typescript
const option = {
  backgroundColor: 'transparent',
  grid: {
    left: '10%',
    right: '10%',
    top: '15%',
    bottom: '15%',
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(26, 35, 70, 0.9)',
    borderColor: 'rgba(64, 128, 255, 0.5)',
    textStyle: { color: '#ffffff' },
  },
  legend: {
    data: ['温度', '湿度'],
    top: 10,
    textStyle: { color: '#a0aec0' },
  },
  xAxis: {
    type: 'category',
    data: timeList,
    axisLine: { lineStyle: { color: '#4a5568' } },
    axisLabel: { color: '#a0aec0', fontSize: 12 },
  },
  yAxis: [
    {
      type: 'value',
      name: '温度(℃)',
      position: 'left',
      axisLine: { lineStyle: { color: '#fc8181' } },
      axisLabel: { color: '#fc8181' },
      splitLine: { lineStyle: { color: '#2d3748', type: 'dashed' } },
    },
    {
      type: 'value',
      name: '湿度(%)',
      position: 'right',
      axisLine: { lineStyle: { color: '#4299e1' } },
      axisLabel: { color: '#4299e1' },
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: '温度',
      type: 'line',
      yAxisIndex: 0,
      data: temperatureList,
      smooth: true,
      lineStyle: { color: '#fc8181', width: 2 },
      itemStyle: { color: '#fc8181' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(252, 129, 129, 0.3)' },
          { offset: 1, color: 'rgba(252, 129, 129, 0.1)' },
        ]),
      },
    },
    {
      name: '湿度',
      type: 'line',
      yAxisIndex: 1,
      data: humidityList,
      smooth: true,
      lineStyle: { color: '#4299e1', width: 2 },
      itemStyle: { color: '#4299e1' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(66, 153, 225, 0.3)' },
          { offset: 1, color: 'rgba(66, 153, 225, 0.1)' },
        ]),
      },
    },
  ],
};
```

### 3.9 容量监控仪表盘

**图表类型**：ECharts 仪表盘（Gauge）

**ECharts 配置**：

```typescript
// U位使用率仪表盘
const uUsageOption = {
  backgroundColor: 'transparent',
  series: [
    {
      type: 'gauge',
      center: ['50%', '60%'],
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 15,
          color: [
            [0.3, '#48bb78'],
            [0.7, '#f6ad55'],
            [1, '#fc8181'],
          ],
        },
      },
      pointer: {
        itemStyle: { color: '#4fd1c7' },
      },
      axisTick: { show: false },
      splitLine: {
        length: 15,
        lineStyle: { color: '#4a5568' },
      },
      axisLabel: {
        color: '#a0aec0',
        fontSize: 12,
        distance: -40,
      },
      title: {
        offsetCenter: [0, '-20%'],
        fontSize: 16,
        color: '#a0aec0',
      },
      detail: {
        fontSize: 30,
        offsetCenter: [0, '0%'],
        valueAnimation: true,
        formatter: '{value}%',
        color: '#4fd1c7',
      },
      data: [
        {
          value: uUsageRate * 100,
          name: 'U位使用率',
        },
      ],
    },
  ],
};
```

### 3.10 中间区域底部 - 告警列表组件

**位置**：中间区域底部，位于网络设备监控 Top 10 下方

**样式设计**：使用 DataV 滚动表格或 Ant Design Table

**组件实现**：

```tsx
<div className='middle-alarm-list'>
  <div className='alarm-header'>
    <span className='title'>最近告警</span>
    <Badge count={alarmList.length} showZero />
  </div>
  <Table dataSource={alarmList} columns={columns} pagination={false} size='small' scroll={{ y: 200 }} rowClassName={(record) => `alarm-row alarm-${record.level}`} />
</div>
```

**表格样式**：

```less
.middle-alarm-list {
  margin-top: 20px;
  background: rgba(26, 35, 70, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(64, 128, 255, 0.3);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  .alarm-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    .title {
      font-size: 18px;
      font-weight: bold;
      color: #ffffff;
    }
  }

  .alarm-row {
    &.alarm-critical {
      background: rgba(252, 129, 129, 0.1);
      border-left: 3px solid #fc8181;
    }
    &.alarm-warning {
      background: rgba(246, 173, 85, 0.1);
      border-left: 3px solid #f6ad55;
    }
    &.alarm-info {
      background: rgba(66, 153, 225, 0.1);
      border-left: 3px solid #4299e1;
    }
  }
}
```

---

## 四、DataV 边框组件

### 4.1 边框样式

使用 DataV 的边框装饰组件，为每个卡片添加科技感边框：

```tsx
import { BorderBox1, BorderBox2, BorderBox3 } from '@jiaminghi/data-view-react';

<BorderBox1 className='dashboard-card-border'>{/* 卡片内容 */}</BorderBox1>;
```

### 4.2 自定义边框样式

如果不想使用 DataV，可以自定义边框：

```less
.dashboard-card {
  position: relative;
  background: rgba(26, 35, 70, 0.8);
  border: 1px solid rgba(64, 128, 255, 0.3);

  // 四角装饰
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(64, 128, 255, 0.8);
  }

  &::before {
    top: 0;
    left: 0;
    border-right: none;
    border-bottom: none;
  }

  &::after {
    bottom: 0;
    right: 0;
    border-left: none;
    border-top: none;
  }

  // 发光边框动画
  &:hover {
    border-color: rgba(64, 128, 255, 0.6);
    box-shadow: 0 0 20px rgba(64, 128, 255, 0.3);
  }
}
```

---

## 五、颜色方案

### 5.1 主色调

- **背景色**：`#0a0e27` (深蓝黑)
- **卡片背景**：`rgba(26, 35, 70, 0.8)` (半透明深蓝)
- **边框色**：`rgba(64, 128, 255, 0.3)` (蓝色边框)
- **发光色**：`rgba(64, 128, 255, 0.8)` (蓝色发光)

### 5.2 文字颜色

- **主标题**：`#ffffff` (白色)
- **副标题**：`#a0aec0` (浅灰)
- **数值**：`#4fd1c7` (青色)
- **标签**：`#718096` (灰色)

### 5.3 图表颜色

- **主色**：`#4fd1c7` (青色)
- **辅助色**：`#4299e1` (蓝色)
- **成功**：`#48bb78` (绿色)
- **警告**：`#f6ad55` (橙色)
- **危险**：`#fc8181` (红色)

### 5.4 状态颜色

- **正常**：`#48bb78` (绿色)
- **告警**：`#fc8181` (红色)
- **维护**：`#f6ad55` (橙色)

---

## 六、响应式设计

### 6.1 大屏适配（1920x1080）

- 完整布局，所有模块同时显示
- 字体和图表大小按设计稿

### 6.2 标准屏适配（1366x768）

```less
@media (max-width: 1920px) {
  .dashboard-container {
    transform: scale(0.9);
    transform-origin: top left;
  }
}
```

### 6.3 动态缩放

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
    setScale(Math.min(scaleX, scaleY, 1)); // 不放大，只缩小
  };

  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## 七、动画效果

### 7.1 数字滚动动画

使用 `react-countup` 或自定义动画：

```tsx
import CountUp from 'react-countup';

<CountUp end={statistics.rackTotal} duration={1.5} separator=',' />;
```

### 7.2 图表动画

ECharts 内置动画，配置 `animation: true` 和 `animationDuration: 1000`

### 7.3 卡片悬停动画

```less
.dashboard-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(64, 128, 255, 0.3);
  }
}
```

### 7.4 加载动画

使用 Ant Design 的 Skeleton 组件：

```tsx
<Skeleton active paragraph={{ rows: 4 }} />
```

---

## 八、交互设计

### 8.1 机房切换

- 点击机房选择器，显示下拉列表
- 支持搜索过滤
- 选择后自动刷新所有数据
- 显示加载状态

### 8.2 全屏模式

```typescript
const handleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};
```

### 8.3 自动刷新

- 默认 30 秒自动刷新
- 可配置刷新间隔（5s、10s、30s、60s、关闭）
- 刷新时显示加载状态，不阻塞界面

---

## 九、技术实现要点

### 9.1 ECharts 主题

使用深色主题：

```typescript
import * as echarts from 'echarts';

// 注册深色主题
echarts.registerTheme('dark', {
  backgroundColor: 'transparent',
  textStyle: { color: '#a0aec0' },
});

const chart = echarts.init(chartRef.current, 'dark');
```

### 9.2 响应式图表

```typescript
useEffect(() => {
  const handleResize = () => {
    chartInstance.current?.resize();
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### 9.3 性能优化

- 使用 `React.memo` 优化组件渲染
- 图表数据更新使用 `notMerge: false`
- 大量数据时使用数据采样
- 使用 `useMemo` 缓存计算结果

---

## 十、总结

本 UI 设计文档详细规划了机房可视化大屏的前端界面设计，参考一卡通综合数据大屏的布局风格，采用深色系、科技感的设计风格，使用 ECharts 和 DataV 组件实现数据可视化。

**核心特点**：

- 左中右布局，紧凑美观
- 深色主题，科技感强
- 多种图表类型，数据展示丰富
- 交互友好，支持机房切换、自动刷新、全屏
- 响应式设计，适配不同屏幕

**开发建议**：

1. 先实现基础布局和样式
2. 逐步集成各个图表组件
3. 优化动画效果和交互体验
4. 注意性能优化和响应式适配
