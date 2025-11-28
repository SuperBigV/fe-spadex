import React, { useState, useRef, useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import './Group.less';

const Group = ({ group, isSelected, onDragStart, onResizeStart, onSelect, deleteGroup }) => {
  const groupRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      onDragStart(e, group);
    }
  };

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    onResizeStart(e, group);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    // 删除逻辑由父组件处理
    console.log('删除组:', group.id);
    deleteGroup();
  };

  return (
    <div
      ref={groupRef}
      className={`group-room ${isSelected ? 'selected' : ''}`}
      style={{
        left: group.x,
        top: group.y,
        width: group.width,
        height: group.height,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {isSelected && (
        <div className='delete-button' onClick={handleDelete}>
          <CloseOutlined />
        </div>
      )}

      <div className='group-header'>
        <div className='group-name'>{group.name || '机房'}</div>
        {/* 移除设备计数，组不再包含设备 */}
      </div>

      {/* 移除组内容区域，不再渲染设备 */}

      {isSelected && <div className='resize-handle' onMouseDown={handleResizeMouseDown} />}
    </div>
  );
};

export default Group;
