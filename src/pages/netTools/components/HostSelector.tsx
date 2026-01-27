import React from 'react';
import { Select, AutoComplete } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { Host } from '../types';

interface HostSelectorProps {
  hosts: Host[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  allowInput?: boolean; // 是否允许手动输入
}

const HostSelector: React.FC<HostSelectorProps> = ({
  hosts,
  value,
  onChange,
  placeholder = '选择或输入主机',
  allowInput = true,
}) => {
  const options = hosts.map((host) => ({
    value: host.ip,
    label: `${host.ip} (${host.ident})`,
    host,
  }));

  if (allowInput) {
    return (
      <AutoComplete
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        filterOption={(inputValue, option) =>
          option?.label?.toLowerCase().includes(inputValue.toLowerCase()) || false
        }
        style={{ width: 400 }}
        suffixIcon={<SearchOutlined />}
      />
    );
  }

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      showSearch
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      style={{ width: 400 }}
    />
  );
};

export default HostSelector;
