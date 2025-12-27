/*
 * 拓扑节点组件
 */

import React, { useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from 'antd';
import { TopologyNode as TopologyNodeType } from '../../types';
import { useTopology } from '../../context/TopologyContext';
import DeviceIcon from '../DeviceIcon';
import StatusIndicator from '../StatusIndicator';
import './index.less';

interface CustomNodeData {
  node: TopologyNodeType;
}

const TopologyNodeComponent: React.FC<NodeProps<CustomNodeData>> = ({ data, selected }) => {
  const { node } = data;
  const { setSelectedItem } = useTopology();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // 阻止事件冒泡，避免与 ReactFlow 的 onNodeClick 冲突
      e.stopPropagation();
      setSelectedItem(node);
    },
    [node, setSelectedItem],
  );

  return (
    <div className={`topology-node ${selected ? 'selected' : ''}`} onClick={handleClick}>
      <div className='node-content'>
        <div className='node-icon'>
          <DeviceIcon type={node.deviceIcon} />
        </div>
        <div className='node-name'>{node.name}</div>
        <div className='node-info'>
          <StatusIndicator status={node.status} type='device' />
          {node.alarmCount > 0 && <Badge count={node.alarmCount} size='small' style={{ marginLeft: 4 }} />}
        </div>
        <div className='node-ip'>{node.ip}</div>
      </div>

      {/* 使用默认的 Handle - 每个节点只有一个 source 和 target Handle */}
      <Handle type='source' position={Position.Right} className='default-handle default-handle-source' />
      <Handle type='target' position={Position.Left} className='default-handle default-handle-target' />
    </div>
  );
};

export default TopologyNodeComponent;
