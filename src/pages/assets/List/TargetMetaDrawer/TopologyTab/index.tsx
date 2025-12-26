import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import TopologyTypeSelector, { TopologyType } from './TopologyTypeSelector';
import TopologyCanvas from './TopologyCanvas';
import { TopologyData } from '../mockData';
import { getAssetTopology } from '../../services';

interface IProps {
  ident: string;
}

export default function TopologyTab(props: IProps) {
  const { ident } = props;
  const [topologyType, setTopologyType] = useState<TopologyType>('all');
  const [data, setData] = useState<TopologyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ident) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getAssetTopology(ident)
      .then((res) => {
        console.log('Topology data from API:', res);
        if (res && res.nodes && res.edges) {
          setData({
            nodes: res.nodes || [],
            edges: res.edges || [],
          });
        } else {
          setData(null);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch topology data:', error);
        message.error('获取拓扑数据失败');
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ident]);

  return (
    <div>
      <TopologyTypeSelector value={topologyType} onChange={setTopologyType} />
      <TopologyCanvas data={data} topologyType={topologyType} loading={loading} />
    </div>
  );
}
