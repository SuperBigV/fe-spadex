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
import React from 'react';
import { Menu } from 'antd';
import { ReloadOutlined, CloseOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface TabContextMenuProps {
  tabKey: string;
  isActive: boolean;
  onClose: (key: string) => void;
  onCloseOthers: (key: string) => void;
  onCloseAll: () => void;
  onRefresh: (key: string) => void;
}

const TabContextMenu: React.FC<TabContextMenuProps> = ({
  tabKey,
  isActive,
  onClose,
  onCloseOthers,
  onCloseAll,
  onRefresh,
}) => {
  const menuItems = [
    {
      key: 'refresh',
      icon: <ReloadOutlined />,
      label: '刷新',
      onClick: () => onRefresh(tabKey),
    },
    {
      key: 'close',
      icon: <CloseOutlined />,
      label: '关闭',
      onClick: () => onClose(tabKey),
    },
    {
      key: 'closeOthers',
      icon: <CloseCircleOutlined />,
      label: '关闭其他',
      onClick: () => onCloseOthers(tabKey),
    },
    {
      key: 'closeAll',
      icon: <CloseCircleOutlined />,
      label: '关闭所有',
      onClick: () => onCloseAll(),
    },
  ];

  return (
    <Menu>
      {menuItems.map(item => (
        <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  );
};

export default TabContextMenu;
