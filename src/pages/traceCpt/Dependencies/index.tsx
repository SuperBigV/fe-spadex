import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import _ from 'lodash';
import { Select, Space, Empty, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { RadialGraph } from '@ant-design/graphs';
import PageLayout from '@/components/pageLayout';
import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { getTraceDependencies, getTraceServices } from '../services';
import { getRadialData } from './utils';

interface DependenciesProps {
  processName?: string; // 进程名，用于自动过滤链路拓扑
  hideServiceSelector?: boolean; // 是否隐藏服务选择器
}

export default function index(props: DependenciesProps = {}) {
  const { processName, hideServiceSelector = false } = props;
  const { t } = useTranslation('trace');
  const { groupedDatasourceList, darkMode } = useContext(CommonStateContext);
  const [datasourceValue, setDatasourceValue] = useState<number | undefined>(_.get(groupedDatasourceList, 'jaeger[0].id') as any);
  const [serviceList, setServiceList] = useState<string[]>([]);
  // 默认选择"全部服务"，展示所有服务依赖关系链路
  // 如果有 processName，则自动设置为该进程名
  const [selectedService, setSelectedService] = useState<string>(processName || 'all');
  const [rawDependencies, setRawDependencies] = useState<{ parent: string; child: string; callCount: number }[]>([]);
  const [data, setData] = useState<{ nodes: { id: string; label: string }[]; edges: { source: string; target: string; value: number }[] }>({
    nodes: [],
    edges: [],
  });
  const [redrawKey, setRedrawKey] = useState<string>(_.uniqueId('redrawKey_'));
  const [loading, setLoading] = useState<boolean>(false);
  const chartRef = useRef<any>(null);
  const config = useMemo(
    () => ({
      data: data,
      autoFit: true,
      theme: {
        styleSheet: {
          backgroundColor: '#000',
        },
      },
      layout: {
        type: 'radial',
        // 根据节点数量动态调整半径，确保所有节点在可见范围内
        // 节点少时使用较小半径，节点多时使用较大半径，但不超过合理范围
        unitRadius: data.nodes.length <= 5 ? 60 : data.nodes.length <= 10 ? 80 : data.nodes.length <= 20 ? 100 : 120,
        nodeSize: 20,
        nodeSpacing: 10,
        preventOverlap: true,
        // 确保节点不会重叠
        nodeSpacingFunc: () => 10,
      },
      style: {
        backgroundColor: darkMode ? '#272a38' : '#fff',
      },
      nodeCfg: {
        size: 20,
        asyncData: () => {
          // TODO: 非得有个 asyncData，不然就会报错，这个 antd graphs 真是一堆问题
          return Promise.resolve({
            nodes: [],
            edges: [],
          });
        },
        style: {
          fill: darkMode ? '#a192c8' : '#d9cbff',
          stroke: darkMode ? '#a192c8' : '#d9cbff',
        },
        labelCfg: {
          style: {
            fontSize: 6,
            fill: darkMode ? '#fff' : '#000',
          },
        },
        nodeStateStyles: {
          hover: {
            stroke: '#6C53B1',
            lineWidth: 2,
          },
        },
      },
      edgeCfg: {
        style: {
          lineWidth: 1,
          fontSize: 6,
        },
        label: {
          style: {
            fontSize: 6,
            fill: darkMode ? '#ccc' : '#666',
          },
        },
        endArrow: {
          d: 10,
          size: 2,
        },
        edgeStateStyles: {
          hover: {
            stroke: '#6C53B1',
            lineWidth: 1,
          },
        },
      },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
      onReady: (graph) => {
        chartRef.current = graph;
      },
    }),
    [data, darkMode],
  );

  // 当 processName 变化时，自动设置为 selectedService
  useEffect(() => {
    if (processName) {
      setSelectedService(processName);
    } else {
      setSelectedService('all');
    }
  }, [processName]);

  // 获取服务列表
  useEffect(() => {
    if (datasourceValue) {
      getTraceServices(datasourceValue)
        .then((res) => {
          setServiceList(res || []);
        })
        .catch(() => {
          setServiceList([]);
        });
    } else {
      setServiceList([]);
    }
  }, [datasourceValue]);

  // 获取依赖关系数据
  useEffect(() => {
    if (datasourceValue) {
      getTraceDependencies(datasourceValue)
        .then((res) => {
          setRawDependencies(res || []);
        })
        .catch(() => {
          setRawDependencies([]);
        });
    } else {
      setRawDependencies([]);
    }
  }, [datasourceValue]);

  // 根据选择的服务过滤数据
  // 默认 selectedService 为 'all'，展示所有服务依赖关系链路
  // 选择特定服务时，只显示与该服务相关的依赖关系（作为 parent 或 child）
  useEffect(() => {
    let filteredDependencies = rawDependencies;
    if (selectedService && selectedService !== 'all') {
      // 过滤出包含选中服务的依赖关系（该服务作为调用方或被调用方）
      filteredDependencies = rawDependencies.filter((item) => item.parent === selectedService || item.child === selectedService);
    }
    // selectedService === 'all' 时，filteredDependencies 就是 rawDependencies，展示所有依赖关系
    setData(getRadialData(filteredDependencies));
  }, [rawDependencies, selectedService]);

  // 当服务切换导致数据更新时，更新 redrawKey 以重新渲染图表并适配视图
  useEffect(() => {
    if (data.nodes.length > 0) {
      // 数据更新时，更新 redrawKey 以触发图表重新渲染
      // 这样可以利用 autoFit 配置自动适配视图
      setRedrawKey(_.uniqueId('redrawKey_'));
    }
  }, [selectedService]);

  useEffect(() => {
    setRedrawKey(_.uniqueId('redrawKey_'));
  }, [darkMode]);

  // 刷新数据
  const handleRefresh = async () => {
    if (!datasourceValue) return;
    setLoading(true);
    try {
      // 并行获取服务列表和依赖关系数据
      const [servicesRes, dependenciesRes] = await Promise.all([getTraceServices(datasourceValue).catch(() => []), getTraceDependencies(datasourceValue).catch(() => [])]);
      setServiceList(servicesRes || []);
      setRawDependencies(dependenciesRes || []);
    } catch (error) {
      console.error('刷新数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div style={{ height: hideServiceSelector ? '100%' : 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className='n9e-border-base p2' style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {!hideServiceSelector && (
          <Space style={{ marginBottom: 16, flexShrink: 0 }}>
            {/* <InputGroupWithFormItem label={t('common:datasource.type')}>
              <Select dropdownMatchSelectWidth={false} style={{ width: 90 }} value='jaeger'>
                {_.map(
                  [
                    {
                      label: 'Jaeger',
                      value: 'jaeger',
                    },
                  ],
                  (item) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.label}
                    </Select.Option>
                  ),
                )}
              </Select>
            </InputGroupWithFormItem>
            <InputGroupWithFormItem label={t('common:datasource.id')}>
              <Select
                style={{ width: 100 }}
                value={datasourceValue}
                onChange={(val) => {
                  setDatasourceValue(val);
                  setSelectedService('all'); // 切换数据源时重置服务选择
                }}
              >
                {_.map(groupedDatasourceList.jaeger, (item) => {
                  return (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  );
                })}
              </Select>
            </InputGroupWithFormItem> */}
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} title='刷新数据'>
              刷新
            </Button>
            <InputGroupWithFormItem label={'选择服务'}>
              <Select
                style={{ width: 150 }}
                value={selectedService}
                onChange={(val) => {
                  setSelectedService(val);
                }}
                placeholder={'选择服务'}
              >
                <Select.Option value='all'>{'全部服务'}</Select.Option>
                {_.map(serviceList, (service) => {
                  return (
                    <Select.Option key={service} value={service}>
                      {service}
                    </Select.Option>
                  );
                })}
              </Select>
            </InputGroupWithFormItem>
          </Space>
        )}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {data.nodes.length > 0 && data.edges.length > 0 ? (
            <RadialGraph key={redrawKey} {...config} />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          )}
        </div>
      </div>
    </div>
  );

  // 如果 hideServiceSelector 为 true，返回不带 PageLayout 的内容（用于嵌入到其他页面）
  if (hideServiceSelector) {
    return content;
  }

  // 否则返回带 PageLayout 的完整页面
  return <PageLayout title={t('dependencies')}>{content}</PageLayout>;
}
