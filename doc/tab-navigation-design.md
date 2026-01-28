# 导航标签页功能设计文档

## 一、项目概述

### 1.1 功能目标

在 fe-spadex 前端项目中实现导航标签页功能，当用户点击左侧导航菜单时，在内容区顶部（PageLayout）自动显示标签页，让用户可以便捷地在已访问过的页面之间切换。

### 1.2 核心功能

- **自动创建标签页**：点击左侧导航菜单时，自动在顶部创建对应的标签页
- **标签页切换**：点击标签页可快速切换到对应页面
- **标签页关闭**：支持关闭单个标签页或批量关闭
- **当前页标识**：高亮显示当前激活的标签页
- **标签页持久化**：刷新页面后保留已打开的标签页（可选）
- **右键菜单**：支持关闭其他、关闭所有等操作

### 1.3 技术栈

- **框架**: React 17.0 + TypeScript
- **UI 库**: Ant Design 4.23.0 (Tabs 组件)
- **路由**: React Router 5.2.0
- **状态管理**: React Context API + react-hooks-global-state
- **构建工具**: Vite 2.9.18
- **样式**: Less + Tailwind CSS

---

## 二、架构设计

### 2.1 整体架构

```
App.tsx
  └── Router
      └── Content (routers/index.tsx)
          ├── HeaderMenu (SideMenu)
          └── PageLayout (components/pageLayout/index.tsx)
              ├── TabNavigation (新增：标签页组件)
              └── children (页面内容)
```

### 2.2 组件结构

```
src/
├── components/
│   ├── pageLayout/
│   │   ├── index.tsx              # PageLayout 主组件（需改造）
│   │   ├── TabNavigation/         # 标签页组件（新增）
│   │   │   ├── index.tsx          # 标签页主组件
│   │   │   ├── index.less         # 标签页样式
│   │   │   └── TabContextMenu.tsx  # 右键菜单组件
│   │   └── index.less             # PageLayout 样式（需调整）
│   └── menu/
│       └── SideMenu/              # 左侧导航菜单（无需修改）
├── store/
│   └── tabNavigation.ts           # 标签页状态管理（新增）
└── utils/
    └── tabNavigation.ts            # 标签页工具函数（新增）
```

### 2.3 数据流

```
用户点击导航菜单
    ↓
React Router 路由变化
    ↓
TabNavigation 监听路由变化
    ↓
更新标签页状态（添加/激活标签）
    ↓
渲染标签页 UI
    ↓
用户点击标签页
    ↓
路由跳转到对应页面
```

---

## 三、详细设计

### 3.1 状态管理设计

#### 3.1.1 标签页数据结构

```typescript
interface TabItem {
  key: string;              // 唯一标识，使用路由 pathname
  path: string;              // 路由路径
  title: string;              // 标签页标题
  icon?: ReactNode;          // 标签页图标（可选）
  closable?: boolean;         // 是否可关闭（默认 true）
  query?: string;            // URL 查询参数（可选）
  hash?: string;             // URL hash（可选）
  timestamp: number;         // 创建时间戳（用于排序）
}

interface TabNavigationState {
  tabs: TabItem[];           // 标签页列表
  activeKey: string;          // 当前激活的标签页 key
  maxTabs?: number;          // 最大标签页数量（默认 20）
}
```

#### 3.1.2 状态管理实现

使用 `react-hooks-global-state` 创建全局状态：

```typescript
// store/tabNavigation.ts
import { createGlobalState } from 'react-hooks-global-state';

export interface TabItem {
  key: string;
  path: string;
  title: string;
  icon?: ReactNode;
  closable?: boolean;
  query?: string;
  hash?: string;
  timestamp: number;
}

export interface TabNavigationState {
  tabs: TabItem[];
  activeKey: string;
  maxTabs: number;
}

const initialState: TabNavigationState = {
  tabs: [],
  activeKey: '',
  maxTabs: 20,
};

export const { useGlobalState, setGlobalState, getGlobalState } = createGlobalState({
  tabNavigation: initialState,
});
```

### 3.2 标签页组件设计

#### 3.2.1 TabNavigation 组件

```typescript
// components/pageLayout/TabNavigation/index.tsx
interface TabNavigationProps {
  // 是否显示标签页（某些页面可能不需要，如登录页、全屏页面）
  visible?: boolean;
  // 标签页位置（top/bottom）
  position?: 'top' | 'bottom';
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  visible = true,
  position = 'top',
}) => {
  // 实现逻辑
};
```

#### 3.2.2 核心功能实现

**1. 路由监听与标签页创建**

```typescript
useEffect(() => {
  const location = useLocation();
  const history = useHistory();
  
  // 监听路由变化
  const handleRouteChange = () => {
    const { pathname, search, hash } = location;
    
    // 判断是否需要创建标签页
    if (shouldCreateTab(pathname)) {
      const tab = createTabFromRoute(pathname, search, hash);
      addTab(tab);
      setActiveTab(tab.key);
    }
  };
  
  handleRouteChange();
}, [location]);
```

**2. 标签页标题获取**

```typescript
// 从菜单配置中获取标题
const getTabTitle = (path: string): string => {
  // 1. 从菜单配置中查找
  const menuItem = findMenuItemByPath(path);
  if (menuItem) {
    return menuItem.label;
  }
  
  // 2. 从路由配置中获取
  const route = findRouteByPath(path);
  if (route?.title) {
    return route.title;
  }
  
  // 3. 从页面组件中获取（通过 PageLayout 的 title prop）
  // 4. 默认使用路径的最后一段
  return path.split('/').pop() || path;
};
```

**3. 标签页操作**

- **添加标签页**：路由变化时自动添加
- **切换标签页**：点击标签页，使用 `history.push()` 跳转
- **关闭标签页**：点击关闭按钮，移除标签并跳转到相邻标签
- **关闭其他**：右键菜单，关闭除当前外的所有标签
- **关闭所有**：右键菜单，关闭所有标签并跳转到首页

### 3.3 PageLayout 改造

#### 3.3.1 结构调整

在 `page-top-header` 下方添加标签页区域：

```tsx
<div className={'page-wrapper'}>
  {!embed && (
    <>
      {customArea ? (
        <div className={'page-top-header'}>{customArea}</div>
      ) : (
        <div className={'page-top-header'}>
          {/* 原有的 header 内容 */}
          <div className={`page-header-content ...`}>
            {/* ... */}
          </div>
        </div>
      )}
      {/* 新增：标签页区域 */}
      <TabNavigation visible={!hideTabs} />
    </>
  )}
  {children && children}
</div>
```

#### 3.3.2 样式调整

```less
.page-wrapper {
  .page-top-header {
    // 原有样式
  }
  
  // 新增：标签页区域样式
  .tab-navigation-container {
    border-bottom: 1px solid var(--fc-border-color);
    background-color: var(--fc-fill-2);
    padding: 0 16px;
    height: 40px;
    display: flex;
    align-items: center;
  }
  
  & + div {
    // 调整内容区域高度，为标签页留出空间
  }
}
```

### 3.4 菜单配置集成

#### 3.4.1 菜单项扩展

在菜单配置中添加标签页相关元数据：

```typescript
interface IMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  children?: IMenuItem[];
  // 新增字段
  tabConfig?: {
    closable?: boolean;      // 是否可关闭
    persistent?: boolean;    // 是否持久化
    maxInstances?: number;   // 同一路由最大标签数
  };
}
```

#### 3.4.2 路由白名单

某些路由不需要创建标签页：

```typescript
const TAB_BLACKLIST = [
  '/login',
  '/callback',
  '/403',
  '/404',
  '/out-of-service',
  '/chart/',              // 图表分享页
  '/dashboards/share/',   // 大盘分享页
];

const shouldCreateTab = (pathname: string): boolean => {
  // 检查是否在黑名单中
  if (TAB_BLACKLIST.some(path => pathname.startsWith(path))) {
    return false;
  }
  
  // 检查全屏模式
  const query = querystring.parse(location.search);
  if (query?.viewMode === 'fullscreen') {
    return false;
  }
  
  return true;
};
```

---

## 四、功能特性

### 4.1 基础功能

1. **自动创建标签页**
   - 点击导航菜单时自动创建
   - 同一路由只创建一个标签页（或根据配置允许多个）
   - 标签页标题从菜单配置或路由配置中获取

2. **标签页切换**
   - 点击标签页切换到对应页面
   - 当前激活的标签页高亮显示
   - 支持键盘快捷键（Ctrl+数字键切换）

3. **标签页关闭**
   - 每个标签页显示关闭按钮（最后一个标签页不可关闭）
   - 关闭后自动切换到相邻标签页
   - 如果关闭的是当前页，切换到前一个标签页

### 4.2 高级功能

1. **右键菜单**
   - 关闭当前标签页
   - 关闭其他标签页
   - 关闭所有标签页
   - 刷新当前标签页

2. **标签页持久化**
   - 将标签页状态保存到 localStorage
   - 页面刷新后恢复标签页
   - 支持配置是否启用持久化

3. **标签页限制**
   - 设置最大标签页数量（默认 20）
   - 超过限制时，关闭最旧的标签页
   - 或提示用户关闭部分标签页

4. **标签页滚动**
   - 标签页过多时，支持横向滚动
   - 显示滚动按钮（左右箭头）
   - 自动滚动到当前激活的标签页

### 4.3 特殊场景处理

1. **动态路由参数**
   - 支持带参数的路由（如 `/dashboard/:id`）
   - 相同路由不同参数创建不同标签页
   - 标签页标题显示参数信息

2. **查询参数和 Hash**
   - 保存 URL 的 query 和 hash
   - 切换标签页时恢复完整的 URL

3. **页面刷新**
   - 刷新页面时，根据当前路由恢复标签页
   - 如果启用了持久化，恢复所有标签页

4. **浏览器前进后退**
   - 监听浏览器前进后退事件
   - 同步更新标签页激活状态

---

## 五、实现步骤

### 5.1 第一阶段：基础功能

1. **创建状态管理**
   - 创建 `store/tabNavigation.ts`
   - 定义标签页数据结构和状态

2. **创建标签页组件**
   - 创建 `TabNavigation` 组件
   - 实现基础的标签页 UI（使用 Ant Design Tabs）

3. **集成到 PageLayout**
   - 在 PageLayout 中添加标签页组件
   - 调整布局和样式

4. **路由监听**
   - 监听路由变化
   - 自动创建和激活标签页

### 5.2 第二阶段：完善功能

1. **标签页操作**
   - 实现关闭功能
   - 实现切换功能
   - 实现右键菜单

2. **标题获取**
   - 从菜单配置获取标题
   - 从路由配置获取标题
   - 从页面组件获取标题

3. **样式优化**
   - 优化标签页样式
   - 适配深色模式
   - 响应式设计

### 5.3 第三阶段：高级功能

1. **持久化功能**
   - 实现 localStorage 存储
   - 实现页面刷新恢复

2. **性能优化**
   - 标签页数量限制
   - 虚拟滚动（如果标签页过多）

3. **用户体验优化**
   - 键盘快捷键
   - 动画效果
   - 拖拽排序（可选）

---

## 六、技术细节

### 6.1 路由监听

使用 React Router 的 `useLocation` 和 `useHistory` hooks：

```typescript
const location = useLocation();
const history = useHistory();

useEffect(() => {
  // 处理路由变化
}, [location.pathname, location.search, location.hash]);
```

### 6.2 菜单配置解析

从菜单配置中提取路由和标题信息：

```typescript
const menuList = getMenuList(t); // 从 SideMenu 获取菜单配置

const findMenuItemByPath = (path: string): IMenuItem | null => {
  // 递归查找菜单项
  const findInMenu = (items: IMenuItem[]): IMenuItem | null => {
    for (const item of items) {
      if (item.key === path) {
        return item;
      }
      if (item.children) {
        const found = findInMenu(item.children);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findInMenu(menuList);
};
```

### 6.3 标签页唯一标识

使用路由路径 + 查询参数 + hash 作为唯一标识：

```typescript
const generateTabKey = (pathname: string, search?: string, hash?: string): string => {
  return `${pathname}${search || ''}${hash || ''}`;
};
```

### 6.4 标签页关闭逻辑

```typescript
const closeTab = (tabKey: string) => {
  const { tabs, activeKey } = getGlobalState('tabNavigation');
  
  // 找到要关闭的标签页索引
  const index = tabs.findIndex(tab => tab.key === tabKey);
  if (index === -1) return;
  
  // 移除标签页
  const newTabs = tabs.filter(tab => tab.key !== tabKey);
  
  // 如果关闭的是当前激活的标签页，切换到相邻标签页
  let newActiveKey = activeKey;
  if (tabKey === activeKey) {
    if (newTabs.length > 0) {
      // 优先切换到前一个标签页，如果没有则切换到后一个
      newActiveKey = newTabs[Math.max(0, index - 1)]?.key || newTabs[0]?.key;
    } else {
      // 如果没有标签页了，跳转到首页
      newActiveKey = '';
      history.push('/');
    }
  }
  
  // 更新状态
  setGlobalState('tabNavigation', {
    tabs: newTabs,
    activeKey: newActiveKey,
  });
  
  // 如果切换了标签页，跳转到对应路由
  if (newActiveKey && newActiveKey !== activeKey) {
    const targetTab = newTabs.find(tab => tab.key === newActiveKey);
    if (targetTab) {
      history.push(targetTab.path + (targetTab.query || '') + (targetTab.hash || ''));
    }
  }
};
```

---

## 七、样式设计

### 7.1 标签页样式

```less
.tab-navigation-container {
  height: 40px;
  background-color: var(--fc-fill-2);
  border-bottom: 1px solid var(--fc-border-color);
  padding: 0 16px;
  display: flex;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  
  // 隐藏滚动条但保持滚动功能
  scrollbar-width: thin;
  scrollbar-color: var(--fc-border-color) transparent;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--fc-border-color);
    border-radius: 2px;
  }
  
  .ant-tabs {
    height: 100%;
    
    .ant-tabs-bar {
      margin: 0;
      border-bottom: none;
    }
    
    .ant-tabs-tab {
      padding: 8px 16px;
      margin: 0 4px;
      border-radius: 4px 4px 0 0;
      
      &.ant-tabs-tab-active {
        background-color: var(--fc-fill-1);
      }
      
      .ant-tabs-tab-remove {
        margin-left: 8px;
        opacity: 0.6;
        
        &:hover {
          opacity: 1;
        }
      }
    }
  }
}
```

### 7.2 深色模式适配

使用 CSS 变量，自动适配深色模式：

```less
// 在 theme-dark 下自动使用深色样式
.theme-dark {
  .tab-navigation-container {
    background-color: var(--fc-fill-2-dark);
    border-bottom-color: var(--fc-border-color-dark);
  }
}
```

---

## 八、测试计划

### 8.1 功能测试

1. **标签页创建**
   - 点击不同菜单项，验证标签页是否正确创建
   - 验证同一路由是否只创建一个标签页
   - 验证标签页标题是否正确

2. **标签页切换**
   - 点击标签页，验证是否正确跳转
   - 验证当前激活标签页是否正确高亮

3. **标签页关闭**
   - 点击关闭按钮，验证标签页是否关闭
   - 验证关闭后是否正确切换到相邻标签页
   - 验证最后一个标签页是否不可关闭

4. **右键菜单**
   - 验证右键菜单是否正确显示
   - 验证各项功能是否正常工作

### 8.2 兼容性测试

1. **路由兼容**
   - 测试动态路由
   - 测试带查询参数的路由
   - 测试带 hash 的路由

2. **浏览器兼容**
   - Chrome/Edge（最新版）
   - Firefox（最新版）
   - Safari（最新版）

3. **响应式测试**
   - 不同屏幕尺寸下的显示效果
   - 标签页过多时的滚动效果

### 8.3 性能测试

1. **标签页数量**
   - 测试大量标签页（20+）时的性能
   - 测试标签页切换的响应速度

2. **内存占用**
   - 监控标签页功能的内存占用
   - 验证是否有内存泄漏

---

## 九、注意事项

### 9.1 路由黑名单

某些页面不应该创建标签页：
- 登录页
- 错误页（403、404）
- 分享页（图表分享、大盘分享）
- 全屏模式页面

### 9.2 标签页数量限制

- 建议设置最大标签页数量（如 20 个）
- 超过限制时，自动关闭最旧的标签页
- 或提示用户关闭部分标签页

### 9.3 持久化策略

- 持久化功能可选，默认关闭
- 如果启用，需要考虑数据大小限制
- 刷新页面时，只恢复当前路由的标签页，其他标签页按需恢复

### 9.4 性能考虑

- 标签页状态更新使用防抖或节流
- 大量标签页时考虑虚拟滚动
- 避免不必要的重渲染

---

## 十、后续优化

### 10.1 功能增强

1. **标签页分组**
   - 按业务模块分组标签页
   - 支持折叠/展开分组

2. **标签页搜索**
   - 快速搜索已打开的标签页
   - 支持快捷键打开搜索

3. **标签页拖拽排序**
   - 支持拖拽调整标签页顺序
   - 保存排序结果

4. **标签页固定**
   - 支持固定重要标签页
   - 固定的标签页不可关闭

### 10.2 用户体验优化

1. **动画效果**
   - 标签页切换动画
   - 标签页关闭动画

2. **快捷键支持**
   - Ctrl+数字键：切换到第 N 个标签页
   - Ctrl+W：关闭当前标签页
   - Ctrl+Shift+T：恢复最近关闭的标签页

3. **标签页预览**
   - 鼠标悬停显示页面预览
   - 显示页面标题和图标

---

## 十一、参考资料

- [Ant Design Tabs 组件文档](https://4x.ant.design/components/tabs-cn/)
- [React Router 文档](https://reactrouter.com/web/guides/quick-start)
- [react-hooks-global-state 文档](https://github.com/dai-shi/react-hooks-global-state)

---

## 十二、总结

本文档详细描述了导航标签页功能的设计方案，包括架构设计、功能特性、实现步骤等。该功能将显著提升用户在多个页面间切换的效率，改善用户体验。

实现时建议分阶段进行，先实现基础功能，再逐步完善高级功能，确保功能的稳定性和可维护性。
