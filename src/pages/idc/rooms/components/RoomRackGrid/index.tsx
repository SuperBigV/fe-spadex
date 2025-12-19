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

import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Row, Col } from 'antd';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getRackList, updateRoomLayout } from '@/pages/room/services';
import { RoomLayout, Rack, RoomLayoutData } from '@/pages/room/types';
import RackCard from './RackCard';
import './index.less';

interface RoomRackGridProps {
  roomId: number;
  layout: RoomLayout | null;
  selectedRackId: number | null;
  onRackSelect: (rackId: number) => void;
  onRackDoubleClick: (rackId: number) => void;
  onLayoutChange: (layout: RoomLayout) => void;
  onRefresh?: () => void;
}

export interface RoomRackGridRef {
  refresh: () => void;
}

const RoomRackGrid = forwardRef<RoomRackGridRef, RoomRackGridProps>(({
  roomId,
  layout,
  selectedRackId,
  onRackSelect,
  onRackDoubleClick,
  onLayoutChange,
  onRefresh,
}, ref) => {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取机柜列表
  const fetchRacks = useCallback(async () => {
    try {
      const response = await getRackList({ roomId, page: 1, pageSize: 1000 });
      setRacks(response.list);
    } catch (error) {
      console.error('获取机柜列表失败', error);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRacks();
  }, [fetchRacks]);

  // 暴露刷新方法给父组件
  useImperativeHandle(ref, () => ({
    refresh: fetchRacks,
  }));

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 移动8px后才开始拖拽，避免与点击冲突
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 拖拽开始
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  // 拖拽结束
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = racks.findIndex((rack) => rack.id === active.id);
      const newIndex = racks.findIndex((rack) => rack.id === over.id);
      const newRacks = arrayMove(racks, oldIndex, newIndex);
      setRacks(newRacks);

      // 保存新的顺序到布局
      await saveRackOrder(newRacks);
    }
  };

  // 保存机柜顺序
  const saveRackOrder = async (orderedRacks: Rack[]) => {
    try {
      // 更新布局中的机柜顺序（通过更新 rackLayouts）
      const rackLayouts = orderedRacks.map((rack, index) => {
        // 如果已有布局数据，保持原有位置信息
        const existingLayout = layout?.rackLayouts.find((item) => item.rackId === rack.id);
        if (existingLayout) {
          return existingLayout;
        }
        // 否则创建新的布局信息（使用索引作为位置）
        return {
          rackId: rack.id,
          x: (index % 6) * 1.5, // 简单的网格布局
          y: Math.floor(index / 6) * 1.5,
          rotation: 0,
        };
      });

      const layoutData: RoomLayoutData = {
        canvasScale: 1,
        canvasX: 0,
        canvasY: 0,
        rackLayouts,
      };

      await updateRoomLayout(roomId, layoutData);

      if (layout) {
        onLayoutChange({
          ...layout,
          rackLayouts,
        });
      } else {
        onLayoutChange({
          id: roomId,
          roomId,
          canvasScale: 1,
          canvasX: 0,
          canvasY: 0,
          rackLayouts,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('保存机柜顺序失败', error);
    }
  };

  const activeRack = activeId ? racks.find((rack) => rack.id === activeId) : null;

  return (
    <div className='room-rack-grid' ref={containerRef}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={racks.map((r) => r.id)} strategy={rectSortingStrategy}>
          <Row gutter={[16, 16]}>
            {racks.map((rack) => (
              <SortableRackCard
                key={rack.id}
                rack={rack}
                selected={selectedRackId === rack.id}
                onClick={() => onRackSelect(rack.id)}
                onDoubleClick={() => onRackDoubleClick(rack.id)}
              />
            ))}
          </Row>
        </SortableContext>
        <DragOverlay>
          {activeRack ? (
            <div style={{ transform: 'rotate(3deg)', opacity: 0.9 }}>
              <RackCard rack={activeRack} selected={false} isDragging={true} />
            </div>
          ) : null}
        </DragOverlay>
        {racks.length === 0 && (
          <div className='grid-empty-tip'>
            <div>暂无机柜，请点击左侧工具栏"添加机柜"按钮添加机柜</div>
          </div>
        )}
      </DndContext>
    </div>
  );
});

RoomRackGrid.displayName = 'RoomRackGrid';

// Sortable Rack Card 组件
interface SortableRackCardProps {
  rack: Rack;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

const SortableRackCard: React.FC<SortableRackCardProps> = ({ rack, selected, onClick, onDoubleClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rack.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Col xs={24} sm={12} md={8} lg={6} xl={4}>
      <div ref={setNodeRef} style={style} {...attributes}>
        <div {...listeners} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
          <RackCard
            rack={rack}
            selected={selected}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            isDragging={isDragging}
          />
        </div>
      </div>
    </Col>
  );
};

export default RoomRackGrid;

