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
import { Progress } from 'antd';
import { Rack } from '@/pages/room/types';
import './RackElement.less';

interface RackElementProps {
  rack: Rack;
  position: { x: number; y: number; rotation: number };
  selected: boolean;
  dragging?: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onDrag: (e: React.MouseEvent) => void;
  onDragEnd: () => void;
  getUsageColor: (rack: Rack) => string;
}

const RackElement: React.FC<RackElementProps> = ({
  rack,
  position,
  selected,
  dragging = false,
  onSelect,
  onDoubleClick,
  onDragStart,
  onDrag,
  onDragEnd,
  getUsageColor,
}) => {
  const rate = (rack.usedU || 0) / rack.totalU;
  const color = getUsageColor(rack);

  // 将米转换为像素（1米 = 80像素，缩小间距）
  const x = position.x * 80;
  const y = position.y * 80;
  const width = 50; // 机柜宽度（像素）- 缩小尺寸
  const height = 80; // 机柜深度（像素）- 缩小尺寸

  return (
    <div
      className={`rack-element ${selected ? 'selected' : ''} ${dragging ? 'dragging' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${position.rotation}deg)`,
        borderColor: color,
      }}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      onMouseDown={onDragStart}
      onMouseMove={onDrag}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
    >
      <div className='rack-element-header'>{rack.name}</div>
      <div className='rack-element-body' style={{ backgroundColor: color, opacity: 0.3 }}>
        <div className='rack-element-info'>
          <div>{rack.usedU || 0}/{rack.totalU}U</div>
          <Progress
            percent={rate * 100}
            strokeColor={color}
            size='small'
            showInfo={false}
            style={{ marginTop: 4 }}
          />
        </div>
      </div>
    </div>
  );
};

export default RackElement;

