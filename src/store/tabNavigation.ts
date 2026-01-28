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
import { createGlobalState } from 'react-hooks-global-state';
import { ReactNode } from 'react';

export interface TabItem {
  key: string; // 唯一标识，使用路由 pathname + search + hash
  path: string; // 路由路径
  title: string; // 标签页标题
  icon?: ReactNode; // 标签页图标（可选）
  closable?: boolean; // 是否可关闭（默认 true）
  query?: string; // URL 查询参数（可选）
  hash?: string; // URL hash（可选）
  timestamp: number; // 创建时间戳（用于排序）
}

export interface TabNavigationState {
  tabs: TabItem[];
  activeKey: string;
  maxTabs: number;
}

const STORAGE_KEY = 'tab-navigation-state';
const MAX_TABS = 20;

// 从 localStorage 恢复初始状态
const getInitialState = (): TabNavigationState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // 只恢复基本结构，不恢复 ReactNode
      return {
        tabs: parsed.tabs || [],
        activeKey: parsed.activeKey || '',
        maxTabs: parsed.maxTabs || MAX_TABS,
      };
    }
  } catch (e) {
    console.error('Failed to restore tab navigation state:', e);
  }
  return {
    tabs: [],
    activeKey: '',
    maxTabs: MAX_TABS,
  };
};

const initialState: TabNavigationState = getInitialState();

export const { useGlobalState, setGlobalState, getGlobalState } = createGlobalState({
  tabNavigation: initialState,
});

// 保存状态到 localStorage
export const saveTabNavigationState = () => {
  try {
    const state = getGlobalState('tabNavigation');
    const stateToSave = {
      tabs: state.tabs.map(tab => ({
        key: tab.key,
        path: tab.path,
        title: tab.title,
        closable: tab.closable,
        query: tab.query,
        hash: tab.hash,
        timestamp: tab.timestamp,
      })),
      activeKey: state.activeKey,
      maxTabs: state.maxTabs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (e) {
    console.error('Failed to save tab navigation state:', e);
  }
};

// 清除持久化状态
export const clearTabNavigationState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear tab navigation state:', e);
  }
};
