import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { DesktopOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
// 自定义节点组件 - 带有动态句柄
export default function CustomNode({ data, isConnectable }) {
  return (
    <div>
      <Tooltip title={data.label} placement='top'>
        <div className='node-icon' style={{ marginBottom: '8px' }}>
          {/* 如果图标路径为空，使用默认图标 */}
          {data.icon ? <img src={data.icon} alt={data.label} width={40} height={40} /> : <DesktopOutlined style={{ fontSize: '40px', color: '#1890ff' }} />}
        </div>
      </Tooltip>

      {/* 动态显示连接句柄 */}
      <>
        <Handle
          type='source'
          position={Position.Bottom}
          id='bottom-source'
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
          // style={{
          //   width: 8,
          //   height: 8,
          //   background: '#1890ff',
          //   border: '2px solid white',
          //   bottom: -4,
          // }}
        />
        <Handle
          type='target'
          position={Position.Top}
          id='top-target'
          isConnectable={isConnectable}
          onConnect={(params) => console.log('handle onConnect', params)}
          // style={{
          //   width: 8,
          //   height: 8,
          //   background: '#52c41a',
          //   border: '2px solid white',
          //   top: -4,
          // }}
        />
      </>
    </div>
  );
}
