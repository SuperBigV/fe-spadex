import React from 'react';
import { Radio, Space } from 'antd';
import { CloudOutlined, HomeOutlined } from '@ant-design/icons';

interface ExecutionModeSelectorProps {
  value?: 'local' | 'remote';
  onChange?: (value: 'local' | 'remote') => void;
  disabled?: boolean;
}

const ExecutionModeSelector: React.FC<ExecutionModeSelectorProps> = ({
  value = 'local',
  onChange,
  disabled = false,
}) => {
  return (
    <Radio.Group
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    >
      <Space>
        <Radio.Button value="local">
          <HomeOutlined /> 本地执行
        </Radio.Button>
        <Radio.Button value="remote">
          <CloudOutlined /> 远程执行
        </Radio.Button>
      </Space>
    </Radio.Group>
  );
};

export default ExecutionModeSelector;
