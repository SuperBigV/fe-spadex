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
import { Button, Space, Divider, message } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import './index.less';

interface RoomToolbarProps {
  onAddRack: () => void;
  onRefresh?: () => void;
  gridRef?: React.RefObject<{ refresh: () => void }>;
}

const RoomToolbar: React.FC<RoomToolbarProps> = ({ onAddRack, onRefresh, gridRef }) => {
  const handleRefresh = () => {
    gridRef?.current?.refresh();
    if (onRefresh) {
      onRefresh();
    }
    message.success('已刷新');
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <div className='room-toolbar'>
      <div className='toolbar-section'>
        <h4>工具</h4>
        <Space direction='vertical' style={{ width: '100%' }}>
          <Button type='primary' icon={<PlusOutlined />} block onClick={onAddRack}>
            添加机柜
          </Button>
          <Button icon={<ReloadOutlined />} block onClick={handleRefresh}>
            刷新
          </Button>
          <Button icon={<FullscreenOutlined />} block onClick={handleFullscreen}>
            全屏
          </Button>
        </Space>
      </div>
      <Divider />
      <div className='toolbar-section'>
        <h4>操作提示</h4>
        <div className='toolbar-tips'>
          <div className='tip-item'>• 拖拽机柜卡片：调整机柜顺序</div>
          <div className='tip-item'>• 点击机柜：选中机柜</div>
          <div className='tip-item'>• 双击机柜：查看详情</div>
          <div className='tip-item'>• 布局自动保存</div>
        </div>
      </div>
    </div>
  );
};

export default RoomToolbar;

