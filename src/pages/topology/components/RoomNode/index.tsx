/*
 * 机房节点组件 - 可调整大小的矩形
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Input, Button } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { TopologyNode as TopologyNodeType } from '../../types';
import { useTopology } from '../../context/TopologyContext';
import './index.less';

interface CustomNodeData {
  node: TopologyNodeType;
}

const RoomNodeComponent: React.FC<NodeProps<CustomNodeData>> = ({ data, selected, id }) => {
  const { node } = data;
  const { setSelectedItem, updateNode } = useTopology();
  const [isEditing, setIsEditing] = useState(false);
  const [nodeName, setNodeName] = useState(node.name || '机房');
  const nodeRef = useRef<HTMLDivElement>(null);

  // 同步节点名称
  useEffect(() => {
    setNodeName(node.name || '机房');
  }, [node.name]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedItem(node);
    },
    [node, setSelectedItem],
  );

  // 开始编辑名称
  const handleNameClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  // 保存名称
  const handleNameBlur = useCallback(async () => {
    setIsEditing(false);
    if (nodeName.trim() && nodeName !== node.name) {
      try {
        await updateNode(node.id, { name: nodeName.trim() });
      } catch (error) {
        console.error('更新节点名称失败:', error);
        setNodeName(node.name || '机房');
      }
    } else {
      setNodeName(node.name || '机房');
    }
  }, [nodeName, node.id, node.name, updateNode]);

  // 处理名称输入
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeName(e.target.value);
  }, []);

  // 处理名称输入回车
  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleNameBlur();
      } else if (e.key === 'Escape') {
        setNodeName(node.name || '机房');
        setIsEditing(false);
      }
    },
    [handleNameBlur, node.name],
  );

  // 放大节点
  const handleZoomIn = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const currentWidth = node.width || 200;
      const currentHeight = node.height || 150;
      const newWidth = Math.min(2000, currentWidth + 50);
      const newHeight = Math.min(1500, currentHeight + 37.5); // 保持宽高比

      updateNode(node.id, { width: newWidth, height: newHeight }).catch((error) => {
        console.error('放大节点失败:', error);
      });
    },
    [node.id, node.width, node.height, updateNode],
  );

  // 缩小节点
  const handleZoomOut = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const currentWidth = node.width || 200;
      const currentHeight = node.height || 150;
      const newWidth = Math.max(150, currentWidth - 50);
      const newHeight = Math.max(100, currentHeight - 37.5); // 保持宽高比

      updateNode(node.id, { width: newWidth, height: newHeight }).catch((error) => {
        console.error('缩小节点失败:', error);
      });
    },
    [node.id, node.width, node.height, updateNode],
  );

  const width = node.width || 200;
  const height = node.height || 150;

  return (
    <div className='room-node-wrapper'>
      {/* 名称显示在矩形上方 */}
      <div className='room-node-name-container'>
        {isEditing ? (
          <Input
            value={nodeName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            autoFocus
            className='room-node-name-input'
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className='room-node-name' onClick={handleNameClick}>
            {nodeName}
          </div>
        )}
      </div>

      {/* 矩形框 */}
      <div ref={nodeRef} className={`room-node ${selected ? 'selected' : ''}`} onClick={handleClick} style={{ width, height }}>
        {/* 右上角放大缩小按钮 */}
        <div className='room-node-zoom-controls'>
          <Button type='text' size='small' icon={<ZoomInOutlined />} onClick={handleZoomIn} className='room-node-zoom-btn' title='放大' />
          <Button type='text' size='small' icon={<ZoomOutOutlined />} onClick={handleZoomOut} className='room-node-zoom-btn' title='缩小' />
        </div>

        {/* 连接点 - 机房节点不需要连接点，但保留以兼容 */}
        <Handle type='source' position={Position.Right} className='room-node-handle' style={{ display: 'none' }} />
        <Handle type='target' position={Position.Left} className='room-node-handle' style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default RoomNodeComponent;
