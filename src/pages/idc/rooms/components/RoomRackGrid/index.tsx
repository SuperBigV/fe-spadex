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

import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Row, Col } from 'antd';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
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

const RoomRackGrid = forwardRef<RoomRackGridRef, RoomRackGridProps>(({ roomId, layout, selectedRackId, onRackSelect, onRackDoubleClick, onLayoutChange, onRefresh }, ref) => {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 根据布局数据排序机柜列表（按坐标排序：先按 y，再按 x）
  const sortRacksByLayout = useCallback((racksToSort: Rack[], layoutData: RoomLayout | null): Rack[] => {
    if (!layoutData?.rackLayouts || layoutData.rackLayouts.length === 0) {
      return racksToSort;
    }

    // 创建 rackId 到坐标的映射
    const rackLayoutMap = new Map<number, { x: number; y: number }>();
    layoutData.rackLayouts.forEach((item) => {
      rackLayoutMap.set(item.rackId, { x: item.x, y: item.y });
    });

    // 按照坐标排序：先按 y 坐标（从上到下），再按 x 坐标（从左到右）
    return [...racksToSort].sort((a, b) => {
      const layoutA = rackLayoutMap.get(a.id);
      const layoutB = rackLayoutMap.get(b.id);

      // 如果布局中没有，放到最后
      if (!layoutA && !layoutB) return 0;
      if (!layoutA) return 1;
      if (!layoutB) return -1;

      // 先按 y 坐标排序（从上到下）
      if (layoutA.y !== layoutB.y) {
        return layoutA.y - layoutB.y;
      }
      // y 坐标相同，按 x 坐标排序（从左到右）
      return layoutA.x - layoutB.x;
    });
  }, []);

  // 原始机柜列表（未排序）
  const [rawRacks, setRawRacks] = useState<Rack[]>([]);

  // 获取机柜列表
  const fetchRacks = useCallback(async () => {
    try {
      const response = await getRackList({ roomId, page: 1, pageSize: 1000 });
      setRawRacks(response.list);
    } catch (error) {
      console.error('获取机柜列表失败', error);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRacks();
  }, [fetchRacks]);

  // 根据布局坐标排序机柜列表（使用 useMemo 确保排序逻辑正确执行）
  const sortedRacks = useMemo(() => {
    if (rawRacks.length === 0) {
      return rawRacks;
    }
    const sorted = sortRacksByLayout(rawRacks, layout);
    // 调试日志：验证排序是否生效
    if (layout?.rackLayouts && layout.rackLayouts.length > 0) {
      console.log(
        '机柜排序结果:',
        sorted.map((r) => ({ id: r.id, name: r.name })),
      );
      console.log(
        '布局坐标:',
        layout.rackLayouts.map((l) => ({ rackId: l.rackId, x: l.x, y: l.y })),
      );
    }
    return sorted;
  }, [rawRacks, layout, sortRacksByLayout]);

  // 同步排序后的结果到 racks 状态（用于拖拽操作）
  useEffect(() => {
    setRacks((currentRacks) => {
      // 只有当排序后的结果与当前 racks 不同时才更新
      const isOrderDifferent = sortedRacks.some((rack, index) => rack.id !== currentRacks[index]?.id);
      return isOrderDifferent ? sortedRacks : currentRacks;
    });
  }, [sortedRacks]);

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
    }),
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
      // 同时更新 racks 和 rawRacks，确保排序逻辑正确
      setRacks(newRacks);
      setRawRacks(newRacks);

      // 保存新的顺序到布局
      await saveRackOrder(newRacks);
    }
  };

  // 保存机柜顺序
  const saveRackOrder = async (orderedRacks: Rack[]) => {
    try {
      // 更新布局中的机柜顺序（通过更新 rackLayouts）
      // 根据拖拽后的新位置更新坐标，而不是保持原有坐标
      const rackLayouts = orderedRacks.map((rack, index) => {
        // 查找原有布局数据，保留 rotation 信息
        const existingLayout = layout?.rackLayouts?.find((item) => item.rackId === rack.id);
        // 根据新的索引位置计算新的坐标（网格布局：每行6个）
        const newX = (index % 6) * 1.5;
        const newY = Math.floor(index / 6) * 1.5;

        return {
          rackId: rack.id,
          x: newX,
          y: newY,
          rotation: existingLayout?.rotation ?? 0, // 保留原有的旋转角度
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
          // createdAt: new Date().toISOString(),
          // updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('保存机柜顺序失败', error);
    }
  };

  const activeRack = activeId ? racks.find((rack) => rack.id === activeId) : null;

  return (
    <div className='room-rack-grid' ref={containerRef}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
          <RackCard rack={rack} selected={selected} onClick={onClick} onDoubleClick={onDoubleClick} isDragging={isDragging} />
        </div>
      </div>
    </Col>
  );
};

export default RoomRackGrid;
