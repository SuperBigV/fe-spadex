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
import querystring from 'query-string';
import { IMenuItem } from '@/components/menu/SideMenu/types';
import { getMenuList } from '@/components/menu/SideMenu';
import { TabItem } from '@/store/tabNavigation';
import React from 'react';

// 路由黑名单：这些路由不需要创建标签页
const TAB_BLACKLIST = [
  '/login',
  '/callback',
  '/403',
  '/404',
  '/out-of-service',
  '/chart/', // 图表分享页
  '/dashboards/share/', // 大盘分享页
];

/**
 * 判断是否需要为路由创建标签页
 */
export const shouldCreateTab = (pathname: string, search?: string): boolean => {
  // 检查是否在黑名单中
  if (TAB_BLACKLIST.some(path => pathname.startsWith(path))) {
    return false;
  }

  // 检查全屏模式
  if (search) {
    const query = querystring.parse(search);
    if (query?.viewMode === 'fullscreen') {
      return false;
    }
  }

  return true;
};

/**
 * 生成标签页的唯一标识
 */
export const generateTabKey = (pathname: string, search?: string, hash?: string): string => {
  return `${pathname}${search || ''}${hash || ''}`;
};

/**
 * 从路由信息创建标签页
 */
export const createTabFromRoute = (
  pathname: string,
  search?: string,
  hash?: string,
  title?: string,
  icon?: React.ReactNode,
): TabItem => {
  const key = generateTabKey(pathname, search, hash);
  return {
    key,
    path: pathname,
    title: title || getTabTitle(pathname),
    icon,
    closable: true,
    query: search,
    hash: hash,
    timestamp: Date.now(),
  };
};

/**
 * 从菜单配置中获取标签页标题（不使用翻译）
 */
export const getTabTitle = (path: string): string => {
  // 默认使用路径的最后一段，或整个路径
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0) {
    // 尝试将路径转换为可读的标题
    const lastSegment = segments[segments.length - 1];
    // 如果是数字，可能是 ID，使用前一段作为标题
    if (/^\d+$/.test(lastSegment) && segments.length > 1) {
      return segments[segments.length - 2];
    }
    return lastSegment;
  }

  return path || '首页';
};

/**
 * 在菜单配置中查找菜单项（支持翻译）
 */
export const findMenuItemByPathWithTranslation = (path: string, t: (key: string) => string): IMenuItem | null => {
  try {
    const menuList = getMenuList(t);

    const findInMenu = (items: IMenuItem[]): IMenuItem | null => {
      for (const item of items) {
        // 精确匹配
        if (item.key === path) {
          return item;
        }
        // 检查子菜单
        if (item.children && item.children.length > 0) {
          for (const child of item.children) {
            // 精确匹配子菜单
            if (child.key === path) {
              return child;
            }
            // 路径前缀匹配（处理动态路由）
            if (path.startsWith(child.key + '/') || path === child.key) {
              return child;
            }
          }
        }
      }
      return null;
    };

    return findInMenu(menuList);
  } catch (e) {
    console.error('Failed to find menu item with translation:', e);
    return null;
  }
};

/**
 * 使用翻译函数从菜单配置中获取标题和图标
 */
export const getTabTitleWithTranslation = (path: string, t: (key: string) => string): string => {
  const menuItem = findMenuItemByPathWithTranslation(path, t);
  if (menuItem) {
    return menuItem.label || path;
  }

  // 降级到默认方法
  return getTabTitle(path);
};

/**
 * 从菜单配置中获取图标
 */
export const getTabIconFromMenu = (path: string, t: (key: string) => string): React.ReactNode | undefined => {
  const menuItem = findMenuItemByPathWithTranslation(path, t);
  if (menuItem) {
    return menuItem.icon;
  }
  return undefined;
};
