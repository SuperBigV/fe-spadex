/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Tabs, Dropdown } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useGlobalState, setGlobalState, getGlobalState, TabItem, saveTabNavigationState } from '@/store/tabNavigation';
import { shouldCreateTab, createTabFromRoute, getTabTitleWithTranslation, generateTabKey, getTabIconFromMenu } from '@/utils/tabNavigation';
import TabContextMenu from './TabContextMenu';
import './index.less';

const { TabPane } = Tabs;

interface TabNavigationProps {
  visible?: boolean;
  position?: 'top' | 'bottom';
}

const TabNavigation: React.FC<TabNavigationProps> = ({ visible = true, position = 'top' }) => {
  const { t } = useTranslation('menu');
  const history = useHistory();
  const location = useLocation();
  const [tabNavigation] = useGlobalState('tabNavigation');
  const [contextMenuTab, setContextMenuTab] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // 添加标签页
  const addTab = useCallback((tab: TabItem) => {
    const currentState = getGlobalState('tabNavigation');
    const existingIndex = currentState.tabs.findIndex((t) => t.key === tab.key);

    if (existingIndex >= 0) {
      // 标签页已存在，只更新激活状态
      setGlobalState('tabNavigation', {
        ...currentState,
        activeKey: tab.key,
      });
      saveTabNavigationState();
      return;
    }

    // 检查标签页数量限制
    let newTabs = [...currentState.tabs, tab];
    if (newTabs.length > currentState.maxTabs) {
      // 移除最旧的标签页（按时间戳排序）
      newTabs = newTabs.sort((a, b) => a.timestamp - b.timestamp).slice(1);
      // 重新按时间戳排序，保持最新顺序
      newTabs = newTabs.sort((a, b) => b.timestamp - a.timestamp);
      newTabs.push(tab);
    }

    setGlobalState('tabNavigation', {
      ...currentState,
      tabs: newTabs,
      activeKey: tab.key,
    });
    saveTabNavigationState();
  }, []);

  // 关闭标签页
  const closeTab = useCallback(
    (tabKey: string) => {
      const currentState = getGlobalState('tabNavigation');
      const index = currentState.tabs.findIndex((tab) => tab.key === tabKey);

      if (index === -1) return;

      const newTabs = currentState.tabs.filter((tab) => tab.key !== tabKey);
      let newActiveKey = currentState.activeKey;

      // 如果关闭的是当前激活的标签页，切换到相邻标签页
      if (tabKey === currentState.activeKey) {
        if (newTabs.length > 0) {
          // 优先切换到前一个标签页，如果没有则切换到后一个
          newActiveKey = newTabs[Math.max(0, index - 1)]?.key || newTabs[0]?.key;
        } else {
          // 如果没有标签页了，跳转到首页
          newActiveKey = '';
          history.push('/');
        }
      }

      setGlobalState('tabNavigation', {
        ...currentState,
        tabs: newTabs,
        activeKey: newActiveKey,
      });
      saveTabNavigationState();

      // 如果切换了标签页，跳转到对应路由
      if (newActiveKey && newActiveKey !== currentState.activeKey) {
        const targetTab = newTabs.find((tab) => tab.key === newActiveKey);
        if (targetTab) {
          const fullPath = targetTab.path + (targetTab.query || '') + (targetTab.hash || '');
          history.push(fullPath);
        }
      }
    },
    [history],
  );

  // 关闭其他标签页
  const closeOthers = useCallback(
    (tabKey: string) => {
      const currentState = getGlobalState('tabNavigation');
      const targetTab = currentState.tabs.find((tab) => tab.key === tabKey);
      if (!targetTab) return;

      setGlobalState('tabNavigation', {
        ...currentState,
        tabs: [targetTab],
        activeKey: tabKey,
      });
      saveTabNavigationState();

      // 跳转到目标标签页
      const fullPath = targetTab.path + (targetTab.query || '') + (targetTab.hash || '');
      history.push(fullPath);
    },
    [history],
  );

  // 关闭所有标签页
  const closeAll = useCallback(() => {
    setGlobalState('tabNavigation', {
      tabs: [],
      activeKey: '',
      maxTabs: tabNavigation.maxTabs,
    });
    saveTabNavigationState();
    history.push('/');
  }, [history, tabNavigation.maxTabs]);

  // 刷新标签页
  const refreshTab = useCallback(
    (tabKey: string) => {
      const currentState = getGlobalState('tabNavigation');
      const targetTab = currentState.tabs.find((tab) => tab.key === tabKey);
      if (!targetTab) return;

      // 重新加载当前页面
      const fullPath = targetTab.path + (targetTab.query || '') + (targetTab.hash || '');
      history.push(fullPath);
      // 触发页面刷新（通过重新设置状态）
      window.location.reload();
    },
    [history],
  );

  // 切换标签页
  const handleTabChange = useCallback(
    (activeKey: string) => {
      const currentState = getGlobalState('tabNavigation');
      const targetTab = currentState.tabs.find((tab) => tab.key === activeKey);
      if (!targetTab) return;

      setGlobalState('tabNavigation', {
        ...currentState,
        activeKey,
      });
      saveTabNavigationState();

      // 跳转到目标路由
      const fullPath = targetTab.path + (targetTab.query || '') + (targetTab.hash || '');
      history.push(fullPath);
    },
    [history],
  );

  // 页面加载时恢复持久化的标签页
  useEffect(() => {
    if (!visible) return;

    const currentState = getGlobalState('tabNavigation');
    const { pathname, search, hash } = location;
    const currentTabKey = generateTabKey(pathname, search, hash);

    // 如果当前路由对应的标签页不存在，创建它
    if (shouldCreateTab(pathname, search)) {
      const existingTab = currentState.tabs.find((tab) => tab.key === currentTabKey);

      if (!existingTab) {
        // 创建新标签页
        const title = getTabTitleWithTranslation(pathname, t);
        const icon = getTabIconFromMenu(pathname, t);
        const tab = createTabFromRoute(pathname, search, hash, title, icon);
        addTab(tab);
      } else if (currentState.activeKey !== currentTabKey) {
        // 标签页已存在但未激活，更新激活状态
        setGlobalState('tabNavigation', {
          ...currentState,
          activeKey: currentTabKey,
        });
        saveTabNavigationState();
      }
    }
  }, []); // 只在组件挂载时执行一次

  // 监听路由变化，自动创建/激活标签页
  useEffect(() => {
    if (!visible) return;

    const { pathname, search, hash } = location;

    // 判断是否需要创建标签页
    if (!shouldCreateTab(pathname, search)) {
      // 如果当前路由不需要标签页，但存在于标签页列表中，移除它
      const currentState = getGlobalState('tabNavigation');
      const tabKey = generateTabKey(pathname, search, hash);
      const existingTab = currentState.tabs.find((tab) => tab.key === tabKey);
      if (existingTab) {
        closeTab(tabKey);
      }
      return;
    }

    // 生成标签页 key
    const tabKey = generateTabKey(pathname, search, hash);

    // 检查标签页是否已存在
    const currentState = getGlobalState('tabNavigation');
    const existingTab = currentState.tabs.find((tab) => tab.key === tabKey);

    if (existingTab) {
      // 标签页已存在，更新激活状态；若当前 URL 的 query/hash 变化（如 /embedded-dashboards 页面内部 replace 了 ?id=xxx），同步到 tab 以便点击标签时跳转正确
      const needUpdateActive = currentState.activeKey !== tabKey;
      const needUpdateQuery = existingTab.query !== search || existingTab.hash !== hash;
      if (needUpdateActive || needUpdateQuery) {
        if (needUpdateQuery) {
          const updatedTabs = currentState.tabs.map((tab) => (tab.key === tabKey ? { ...tab, query: search, hash: hash, timestamp: Date.now() } : tab));
          setGlobalState('tabNavigation', {
            ...currentState,
            tabs: updatedTabs,
            ...(needUpdateActive ? { activeKey: tabKey } : {}),
          });
        } else {
          setGlobalState('tabNavigation', {
            ...currentState,
            activeKey: tabKey,
          });
        }
        saveTabNavigationState();
      }
    } else {
      // 检查是否存在相同路径但不同查询参数的标签页
      // 如果存在，只更新查询参数，不创建新标签页（用于页面内部导航，如 BusinessGroup2）
      const samePathTab = currentState.tabs.find((tab) => tab.path === pathname && tab.key !== tabKey);

      if (samePathTab) {
        // 更新现有标签页的查询参数和激活状态
        const updatedTabs = currentState.tabs.map((tab) => {
          if (tab.key === samePathTab.key) {
            return {
              ...tab,
              key: tabKey,
              query: search,
              hash: hash,
              timestamp: Date.now(), // 更新时间戳
            };
          }
          return tab;
        });

        setGlobalState('tabNavigation', {
          ...currentState,
          tabs: updatedTabs,
          activeKey: tabKey,
        });
        saveTabNavigationState();
      } else {
        // 创建新标签页（路径不同，是真正的页面切换）
        const title = getTabTitleWithTranslation(pathname, t);
        const icon = getTabIconFromMenu(pathname, t);
        const tab = createTabFromRoute(pathname, search, hash, title, icon);
        addTab(tab);
      }
    }
  }, [location.pathname, location.search, location.hash, visible, t, addTab, closeTab]);

  // 键盘快捷键支持
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+数字键：切换到第 N 个标签页
      if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        const currentState = getGlobalState('tabNavigation');
        if (currentState.tabs[index]) {
          e.preventDefault();
          handleTabChange(currentState.tabs[index].key);
        }
      }

      // Ctrl+W：关闭当前标签页
      if (e.ctrlKey && e.key === 'w') {
        const currentState = getGlobalState('tabNavigation');
        if (currentState.activeKey && currentState.tabs.length > 1) {
          e.preventDefault();
          closeTab(currentState.activeKey);
        }
      }

      // Ctrl+Shift+T：恢复最近关闭的标签页（暂不实现，需要维护关闭历史）
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, handleTabChange, closeTab]);

  // 自动滚动到当前激活的标签页
  useEffect(() => {
    if (!tabsRef.current || !tabNavigation.activeKey) return;

    const activeTabElement = tabsRef.current.querySelector(`[data-tab-key="${tabNavigation.activeKey}"]`);
    if (activeTabElement) {
      activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [tabNavigation.activeKey]);

  if (!visible || tabNavigation.tabs.length === 0) {
    return null;
  }

  return (
    <div className='tab-navigation-container' ref={tabsRef}>
      <Tabs
        type='editable-card'
        activeKey={tabNavigation.activeKey}
        onChange={handleTabChange}
        hideAdd
        onEdit={(targetKey, action) => {
          if (action === 'remove') {
            closeTab(targetKey as string);
          }
        }}
        className='tab-navigation-tabs'
      >
        {tabNavigation.tabs.map((tab) => (
          <TabPane
            key={tab.key}
            tab={
              <Dropdown
                overlay={
                  <TabContextMenu
                    tabKey={tab.key}
                    isActive={tab.key === tabNavigation.activeKey}
                    onClose={closeTab}
                    onCloseOthers={closeOthers}
                    onCloseAll={closeAll}
                    onRefresh={refreshTab}
                  />
                }
                trigger={['contextMenu']}
              >
                <span data-tab-key={tab.key} style={{ display: 'inline-flex', alignItems: 'center', userSelect: 'none', cursor: 'pointer' }}>
                  {tab.icon && <span style={{ marginRight: 4 }}>{tab.icon}</span>}
                  <span>{tab.title}</span>
                </span>
              </Dropdown>
            }
            closable={tab.closable !== false && tabNavigation.tabs.length > 1}
          />
        ))}
      </Tabs>
    </div>
  );
};

export default TabNavigation;
