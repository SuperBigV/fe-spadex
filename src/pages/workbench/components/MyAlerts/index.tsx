import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Space, Empty } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import AlertList from './AlertList';
import { getMyAlerts, MyAlertsParams, MyAlertsResponse } from '../../services';

const { Option } = Select;

interface MyAlertsProps {
  data?: MyAlertsResponse | null;
  loading?: boolean;
  timeRange?: '1h' | '6h' | '24h' | '7d';
  onRefresh?: () => Promise<void>;
}

const MyAlerts: React.FC<MyAlertsProps> = ({ data: externalData, loading: externalLoading, timeRange = '24h', onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<MyAlertsResponse | null>(null);
  const [params, setParams] = useState<MyAlertsParams>({
    page: 1,
    pageSize: 10,
    severity: 'all',
    timeRange,
  });

  // 如果外部提供了数据，使用外部数据；否则自己获取
  const useExternalData = externalData !== undefined;

  // 前端过滤逻辑（当使用外部数据时，如果 API 不支持某些过滤参数，在前端进行过滤）
  const filterData = (alertData: MyAlertsResponse | null): MyAlertsResponse | null => {
    if (!alertData || !alertData.list) {
      return alertData;
    }

    let filteredList = [...alertData.list];

    // 按严重程度过滤
    if (params.severity && params.severity !== 'all') {
      filteredList = filteredList.filter((item) => item.severity === params.severity);
    }

    // 注意：时间范围过滤需要在 API 层面进行，前端无法准确判断

    return {
      ...alertData,
      total: filteredList.length,
      list: filteredList,
    };
  };

  // 应用过滤
  const rawData = useExternalData ? externalData : data;
  const filteredData = useExternalData ? filterData(rawData) : rawData;
  const finalData = filteredData;
  const finalLoading = useExternalData ? externalLoading || false : loading;

  const fetchData = async () => {
    if (useExternalData) {
      // 如果使用外部数据，调用外部刷新方法
      if (onRefresh) {
        setRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
        }
      }
      return;
    }

    setLoading(true);
    try {
      const result = await getMyAlerts(params);
      setData(result);
    } catch (error) {
      console.error('获取告警列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!useExternalData) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, timeRange, useExternalData]);

  useEffect(() => {
    // 当 timeRange prop 变化时，同步更新 params
    setParams((prev) => {
      if (prev.timeRange !== timeRange) {
        return { ...prev, timeRange };
      }
      return prev;
    });
  }, [timeRange]);

  const handleSeverityChange = (severity: string) => {
    setParams({ ...params, severity: severity as any, page: 1 });
    // 如果不使用外部数据，params 变化会自动触发 fetchData（通过 useEffect）
    // 如果使用外部数据，前端过滤会自动应用
  };

  const handleTimeRangeChange = (newTimeRange: string) => {
    setParams({ ...params, timeRange: newTimeRange as any, page: 1 });
    // 时间范围变化时，如果使用外部数据，触发刷新（因为 refreshAlerts 支持 timeRange）
    if (useExternalData && onRefresh) {
      onRefresh();
    }
    // 如果不使用外部数据，params 变化会自动触发 fetchData（通过 useEffect）
  };

  // 检查是否有过滤条件（除了默认值）
  const hasFilters = params.severity !== 'all';

  return (
    <Card
      title='我的告警'
      extra={
        <Space>
          <Select value={params.severity} onChange={handleSeverityChange} style={{ width: 100 }} size='small' placeholder='告警等级'>
            <Option value='all'>全部</Option>
            <Option value='critical'>严重</Option>
            <Option value='warning'>警告</Option>
            <Option value='info'>通知</Option>
          </Select>
          <Select value={params.timeRange} onChange={handleTimeRangeChange} style={{ width: 100 }} size='small' placeholder='时间范围'>
            <Option value='1h'>最近1小时</Option>
            <Option value='6h'>最近6小时</Option>
            <Option value='24h'>最近24小时</Option>
            <Option value='7d'>最近7天</Option>
          </Select>
          <Button icon={<ReloadOutlined />} size='small' onClick={fetchData} loading={useExternalData ? refreshing : loading}>
            刷新
          </Button>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      {/* 告警列表 */}
      {finalData && finalData.list.length > 0 ? (
        <AlertList data={finalData} loading={finalLoading} />
      ) : (
        <Empty description={hasFilters ? '没有符合条件的告警数据' : '暂无告警数据'} />
      )}
    </Card>
  );
};

export default MyAlerts;
