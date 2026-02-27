import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Space, Empty } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import BusiGroupList from './BusiGroupList';
import { getMyBusiGroupsNew, MyBusiGroupsResponse } from '../../services';

const { Search } = Input;

interface MyBusiGroupsProps {
  data?: MyBusiGroupsResponse | null;
  loading?: boolean;
  onRefresh?: () => Promise<void>;
}

const MyBusiGroups: React.FC<MyBusiGroupsProps> = ({ data: externalData, loading: externalLoading, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<MyBusiGroupsResponse | null>(null);
  const [keyword, setKeyword] = useState('');

  // 如果外部提供了数据，使用外部数据；否则自己获取
  const useExternalData = externalData !== undefined;

  // 前端过滤逻辑（当使用外部数据时，搜索在前端进行）
  const filterData = (busiGroupData: MyBusiGroupsResponse | null, searchKeyword?: string): MyBusiGroupsResponse | null => {
    if (!busiGroupData || !busiGroupData.list) {
      return busiGroupData;
    }

    // 如果没有搜索关键词，直接返回
    if (!searchKeyword || searchKeyword.trim() === '') {
      return busiGroupData;
    }

    const keyword = searchKeyword.toLowerCase().trim();
    const filteredList = busiGroupData.list.filter((item) => {
      // 搜索业务组名称
      return item.name?.toLowerCase().includes(keyword);
    });

    return {
      ...busiGroupData,
      list: filteredList,
    };
  };

  // 应用过滤
  const rawData = useExternalData ? externalData : data;
  const filteredData = useExternalData ? filterData(rawData, keyword) : rawData;
  const finalData = filteredData;
  const finalLoading = useExternalData ? externalLoading || false : loading;

  const fetchData = async (searchKeyword?: string) => {
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
      const finalKeyword = searchKeyword !== undefined ? searchKeyword : keyword;
      const result = await getMyBusiGroupsNew({ keyword: finalKeyword || undefined });
      setData(result);
    } catch (error) {
      console.error('获取业务组列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 只在组件挂载时或 useExternalData 变化时获取数据（无搜索关键词时）
    if (!useExternalData && !keyword) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useExternalData]);

  const handleSearch = (value: string) => {
    const trimmedValue = value.trim();
    setKeyword(trimmedValue);
    // 如果不使用外部数据，触发 API 调用（使用新的搜索关键词）
    if (!useExternalData) {
      fetchData(trimmedValue);
    }
    // 如果使用外部数据，前端过滤会自动应用（通过 filterData）
  };

  const handleSearchChange = (value: string) => {
    // 实时更新搜索关键词
    setKeyword(value);
    // 如果使用外部数据，前端过滤会自动应用（通过 filterData）
    // 如果不使用外部数据，需要点击搜索按钮或按回车才会触发 API 调用
  };

  const totalCount = rawData?.list?.length ?? 0;

  return (
    <Card
      title={
        <>
          我的业务组
          <span className='workbench-card-title-count'>({totalCount})</span>
        </>
      }
      extra={
        <Button icon={<ReloadOutlined />} size='small' onClick={() => fetchData()} loading={useExternalData ? refreshing : loading}>
          刷新
        </Button>
      }
      style={{ marginBottom: 16 }}
    >
      <Space direction='vertical' style={{ width: '100%' }} size='middle'>
        <Search
          placeholder='搜索业务组名称'
          value={keyword}
          onSearch={handleSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          size='small'
          allowClear
          enterButton={<SearchOutlined />}
        />
        {finalData && finalData.list.length > 0 ? (
          <BusiGroupList data={finalData} loading={finalLoading} />
        ) : (
          <Empty description={keyword ? '没有找到匹配的业务组' : '暂无业务组数据'} />
        )}
      </Space>
    </Card>
  );
};

export default MyBusiGroups;
