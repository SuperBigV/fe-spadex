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
import { getRackList, updateRoomLayout } from '@/pages/room/services';
import { RoomLayout, Rack, RoomLayoutData } from '@/pages/room/types';
import RackElement from './RackElement';
import './index.less';

interface RoomCanvasProps {
  roomId: number;
  layout: RoomLayout | null;
  selectedRackId: number | null;
  onRackSelect: (rackId: number) => void;
  onRackDoubleClick: (rackId: number) => void;
  onLayoutChange: (layout: RoomLayout) => void;
  onRefresh?: () => void;
}

export interface RoomCanvasRef {
  refresh: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
}

const RoomCanvas = forwardRef<RoomCanvasRef, RoomCanvasProps>(({ roomId, layout, selectedRackId, onRackSelect, onRackDoubleClick, onLayoutChange, onRefresh }, ref) => {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasX, setCanvasX] = useState(0);
  const [canvasY, setCanvasY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingRackId, setDraggingRackId] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取机柜列表
  const fetchRacks = useCallback(async () => {
    try {
      const response = await getRackList({ roomId, page: 1, pageSize: 1000 });
      setRacks(response.list);
      // 自动排列由 useEffect 处理，这里不需要重复调用
    } catch (error) {
      console.error('获取机柜列表失败', error);
    }
  }, [roomId]);

  // 自动排列机柜，让它们显示在可见区域内
  const autoArrangeRacks = useCallback(() => {
    if (racks.length === 0) return;

    const rackWidth = 0.625; // 50px / 80 = 0.625米
    const rackHeight = 1.0; // 80px / 80 = 1.0米
    const spacing = 0.875; // 70px / 80 = 0.875米（机柜间距，缩小了）
    const startX = 0.5; // 起始X位置（米）- 从可见区域开始
    const startY = 0.5; // 起始Y位置（米）- 从可见区域开始
    const racksPerRow = 10; // 每行机柜数量（增加以容纳更多机柜）

    const updatedRacks = racks.map((rack, index) => {
      // 如果机柜已有位置，保持原位置
      if (rack.positionX !== undefined && rack.positionY !== undefined) {
        return rack;
      }

      const row = Math.floor(index / racksPerRow);
      const col = index % racksPerRow;
      const x = startX + col * (rackWidth + spacing);
      const y = startY + row * (rackHeight + spacing);

      return {
        ...rack,
        positionX: x,
        positionY: y,
      };
    });

    setRacks(updatedRacks);

    // 保存自动排列的布局
    const rackLayouts = updatedRacks.map((rack) => ({
      rackId: rack.id,
      x: rack.positionX || 0,
      y: rack.positionY || 0,
      rotation: rack.rotation || 0,
    }));

    const layoutData: RoomLayoutData = {
      canvasScale: 1,
      canvasX: 0,
      canvasY: 0,
      rackLayouts,
    };

    updateRoomLayout(roomId, layoutData).then(() => {
      if (layout) {
        onLayoutChange({
          ...layout,
          canvasScale: 1,
          canvasX: 0,
          canvasY: 0,
          rackLayouts,
        });
      } else {
        // 如果没有布局，创建一个新的
        onLayoutChange({
          id: roomId,
          roomId,
          canvasScale: 1,
          canvasX: 0,
          canvasY: 0,
          rackLayouts,
        });
      }
    });
  }, [racks, layout, roomId, onLayoutChange]);

  useEffect(() => {
    if (layout) {
      setCanvasScale(layout.canvasScale || 1);
      setCanvasX(layout.canvasX || 0);
      setCanvasY(layout.canvasY || 0);
    } else {
      // 如果没有布局，初始化画布位置，让机柜显示在可见区域
      setCanvasScale(1);
      setCanvasX(0);
      setCanvasY(0);
    }
  }, [layout]);

  useEffect(() => {
    fetchRacks();
  }, [fetchRacks]);

  // 当机柜列表变化时，自动调整位置让机柜显示在可见区域
  useEffect(() => {
    if (racks.length > 0 && !layout && racks.every((rack) => rack.positionX === undefined && rack.positionY === undefined)) {
      // 如果没有布局数据且所有机柜都没有位置，自动排列机柜
      setTimeout(() => {
        autoArrangeRacks();
      }, 100);
    }
  }, [racks.length, layout, autoArrangeRacks]);

  // 暴露刷新方法给父组件
  useEffect(() => {
    if (onRefresh) {
      // 将刷新方法暴露给父组件
      (window as any).refreshRacks = fetchRacks;
    }
  }, [onRefresh, fetchRacks]);

  // 画布拖拽
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // 如果点击的是机柜元素，不触发画布拖拽
    if (target.closest('.rack-element')) {
      return;
    }
    if (target === canvasRef.current || target.classList.contains('room-canvas')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasX, y: e.clientY - canvasY });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !draggingRackId) {
      setCanvasX(e.clientX - dragStart.x);
      setCanvasY(e.clientY - dragStart.y);
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDragging && !draggingRackId) {
      saveCanvasLayout();
    }
    setIsDragging(false);
    setDraggingRackId(null);
  };

  // 机柜拖拽
  const handleRackDragStart = (rackId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingRackId(rackId);
    setIsDragging(false); // 停止画布拖拽
    const rack = racks.find((r) => r.id === rackId);
    if (rack) {
      const position = getRackPosition(rack);
      // 计算相对于画布的鼠标位置
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        // 使用80像素/米的比例
        setDragStart({
          x: mouseX / canvasScale - position.x * 80 - canvasX / canvasScale,
          y: mouseY / canvasScale - position.y * 80 - canvasY / canvasScale,
        });
      }
    }
  };

  const handleRackDrag = (rackId: number, e: React.MouseEvent) => {
    if (draggingRackId === rackId) {
      e.stopPropagation();
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = (e.clientX - rect.left) / canvasScale;
        const mouseY = (e.clientY - rect.top) / canvasScale;
        // 使用80像素/米的比例
        const newX = (mouseX - dragStart.x - canvasX / canvasScale) / 80;
        const newY = (mouseY - dragStart.y - canvasY / canvasScale) / 80;
        updateRackPosition(rackId, Math.max(0, newX), Math.max(0, newY));
      }
    }
  };

  const handleRackDragEnd = (rackId: number) => {
    if (draggingRackId === rackId) {
      saveRackLayout(rackId);
      setDraggingRackId(null);
    }
  };

  const updateRackPosition = (rackId: number, x: number, y: number) => {
    setRacks((prevRacks) => prevRacks.map((rack) => (rack.id === rackId ? { ...rack, positionX: x, positionY: y } : rack)));
  };

  const getRackPosition = (rack: Rack) => {
    if (layout) {
      const layoutItem = layout.rackLayouts.find((item) => item.rackId === rack.id);
      if (layoutItem) {
        return { x: layoutItem.x, y: layoutItem.y, rotation: layoutItem.rotation || 0 };
      }
    }
    // 如果没有布局数据，使用机柜的positionX/Y，如果没有则使用默认值
    return {
      x: rack.positionX ?? 0.5,
      y: rack.positionY ?? 0.5,
      rotation: rack.rotation || 0,
    };
  };

  const saveCanvasLayout = async () => {
    if (!layout) return;
    try {
      const layoutData: RoomLayoutData = {
        canvasScale,
        canvasX,
        canvasY,
        rackLayouts: layout.rackLayouts,
      };
      await updateRoomLayout(roomId, layoutData);
      onLayoutChange({ ...layout, canvasScale, canvasX, canvasY });
    } catch (error) {
      console.error('保存画布布局失败', error);
    }
  };

  const saveRackLayout = async (rackId: number) => {
    if (!layout) return;
    const rack = racks.find((r) => r.id === rackId);
    if (!rack) return;

    const position = getRackPosition(rack);
    const updatedRackLayouts = layout.rackLayouts.filter((item) => item.rackId !== rackId);
    updatedRackLayouts.push({
      rackId,
      x: position.x,
      y: position.y,
      rotation: position.rotation,
    });

    try {
      const layoutData: RoomLayoutData = {
        canvasScale,
        canvasX,
        canvasY,
        rackLayouts: updatedRackLayouts,
      };
      await updateRoomLayout(roomId, layoutData);
      onLayoutChange({ ...layout, rackLayouts: updatedRackLayouts });
    } catch (error) {
      console.error('保存机柜布局失败', error);
    }
  };

  // 缩放功能
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(2, canvasScale + delta));
    setCanvasScale(newScale);
  };

  const getUsageColor = (rack: Rack) => {
    const rate = (rack.usedU || 0) / rack.totalU;
    if (rate < 0.5) return 'var(--fc-green-6-color)';
    if (rate < 0.8) return 'var(--fc-geekblue-5-color)';
    if (rate < 0.95) return 'var(--fc-gold-6-color)';
    return 'var(--fc-red-5-color)';
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    refresh: fetchRacks,
    zoomIn: () => setCanvasScale((prev) => Math.min(2, prev + 0.1)),
    zoomOut: () => setCanvasScale((prev) => Math.max(0.5, prev - 0.1)),
    reset: () => {
      setCanvasScale(1);
      setCanvasX(0);
      setCanvasY(0);
      saveCanvasLayout();
    },
  }));

  return (
    <div
      className='room-canvas-container'
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
      onWheel={handleWheel}
    >
      <div
        ref={canvasRef}
        className='room-canvas'
        style={{
          transform: `translate(${canvasX}px, ${canvasY}px) scale(${canvasScale})`,
          transformOrigin: '0 0',
        }}
      >
        {racks.map((rack) => {
          const position = getRackPosition(rack);
          return (
            <RackElement
              key={rack.id}
              rack={rack}
              position={position}
              selected={selectedRackId === rack.id}
              dragging={draggingRackId === rack.id}
              onSelect={() => onRackSelect(rack.id)}
              onDoubleClick={() => onRackDoubleClick(rack.id)}
              onDragStart={(e) => handleRackDragStart(rack.id, e)}
              onDrag={(e) => handleRackDrag(rack.id, e)}
              onDragEnd={() => handleRackDragEnd(rack.id)}
              getUsageColor={getUsageColor}
            />
          );
        })}
        {racks.length === 0 && (
          <div className='canvas-empty-tip'>
            <div>暂无机柜，请点击左侧工具栏"添加机柜"按钮添加机柜</div>
          </div>
        )}
      </div>
      <div className='canvas-scale-info'>缩放: {(canvasScale * 100).toFixed(0)}%</div>
    </div>
  );
});

RoomCanvas.displayName = 'RoomCanvas';

export default RoomCanvas;
