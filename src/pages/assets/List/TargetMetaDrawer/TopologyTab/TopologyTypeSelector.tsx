import React from 'react';
import { Segmented } from 'antd';

export type TopologyType = 'all' | 'location' | 'deployment';

interface IProps {
  value: TopologyType;
  onChange: (value: TopologyType) => void;
}

export default function TopologyTypeSelector(props: IProps) {
  const { value, onChange } = props;

  return (
    <div style={{ marginBottom: 16 }}>
      <Segmented
        value={value}
        onChange={(val) => onChange(val as TopologyType)}
        options={[
          { label: '全部拓扑', value: 'all' },
          { label: '位置拓扑', value: 'location' },
          { label: '部署拓扑', value: 'deployment' },
        ]}
      />
    </div>
  );
}

