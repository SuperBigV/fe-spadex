import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Button, Space, Empty, Pagination } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import AssetList from './AssetList';
import { getMyAssets, MyAssetsParams, MyAssetsResponse } from '../../services';

const { Search } = Input;
const { Option } = Select;

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface MyAssetsProps {
  data?: MyAssetsResponse | null;
  loading?: boolean;
  /** 刷新或按页请求：(page?, pageSize?) => 不传则用当前页/每页条数 */
  onRefresh?: (page?: number, pageSize?: number) => Promise<void>;
  /** 工作台注入数据时的当前页码（服务端分页） */
  externalPage?: number;
  /** 工作台注入数据时的每页条数 */
  externalPageSize?: number;
}

const MyAssets: React.FC<MyAssetsProps> = ({ data: externalData, loading: externalLoading, onRefresh, externalPage, externalPageSize }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<MyAssetsResponse | null>(null);
  const [params, setParams] = useState<MyAssetsParams>({
    page: 1,
    pageSize: 10,
    status: 'all',
  });
  // 外部数据模式下且未传 externalPage 时的前端分页（仅当工作台未联动时使用）
  const [clientPage, setClientPage] = useState(1);
  const [clientPageSize, setClientPageSize] = useState(10);

  // 如果外部提供了数据，使用外部数据；否则自己获取
  const useExternalData = externalData !== undefined;
  // 工作台服务端分页：传了 externalPage/externalPageSize 则翻页、刷新均请求后端
  const useServerPagination = useExternalData && externalPage !== undefined && externalPageSize !== undefined;

  // 前端过滤逻辑（当使用外部数据时，搜索和状态过滤在前端进行）
  const filterData = (assetData: MyAssetsResponse | null, searchKeyword?: string, status?: 'all' | 'online' | 'offline' | 'abnormal'): MyAssetsResponse | null => {
    if (!assetData || !assetData.list) {
      return assetData;
    }

    let filteredList = [...assetData.list];

    // 按状态过滤
    if (status && status !== 'all') {
      filteredList = filteredList.filter((item) => item.status === status);
    }

    // 按搜索关键词过滤
    if (searchKeyword && searchKeyword.trim() !== '') {
      const keyword = searchKeyword.toLowerCase().trim();
      filteredList = filteredList.filter((item) => {
        // 搜索名称或IP
        const nameMatch = item.name?.toLowerCase().includes(keyword);
        const ipMatch = item.ip?.toLowerCase().includes(keyword);
        return nameMatch || ipMatch;
      });
    }

    return {
      ...assetData,
      total: filteredList.length,
      list: filteredList,
    };
  };

  // 应用过滤
  const rawData = useExternalData ? externalData : data;
  const searchKeyword = params.keyword || '';
  const statusFilter = params.status || 'all';
  const filteredData = useExternalData ? filterData(rawData, searchKeyword, statusFilter as any) : rawData;
  const finalData = filteredData;
  const finalLoading = useExternalData ? externalLoading || false : loading;

  // 检查是否有过滤条件
  const hasFilters = searchKeyword !== '' || statusFilter !== 'all';

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
      const result = await getMyAssets(params);
      setData(result);
    } catch (error) {
      console.error('获取资产列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!useExternalData) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, useExternalData]);

  // 外部数据模式且非服务端分页时，筛选条件变化重置到第一页
  useEffect(() => {
    if (useExternalData && !useServerPagination) {
      setClientPage(1);
    }
  }, [useExternalData, useServerPagination, searchKeyword, statusFilter]);

  const handleStatusChange = (status: string) => {
    setParams({ ...params, status: status as any, page: 1 });
    // 如果不使用外部数据，params 变化会自动触发 fetchData（通过 useEffect）
    // 如果使用外部数据，前端过滤会自动应用（通过 filterData）
  };

  const handleSearch = (keyword: string) => {
    const trimmedKeyword = keyword.trim() || undefined;
    setParams({ ...params, keyword: trimmedKeyword, page: 1 });
    // 如果不使用外部数据，params 变化会自动触发 fetchData（通过 useEffect）
    // 如果使用外部数据，前端过滤会自动应用（通过 filterData）
  };

  const handleSearchChange = (value: string) => {
    // 实时更新搜索关键词
    setParams({ ...params, keyword: value || undefined });
    // 如果使用外部数据，前端过滤会自动应用（通过 filterData）
    // 如果不使用外部数据，需要点击搜索按钮或按回车才会触发 API 调用
  };

  const totalCount = rawData?.total ?? rawData?.list?.length ?? 0;

  // 分页：工作台服务端分页 > 外部数据前端分页 > 自请求服务端分页
  const paginationTotal = useServerPagination ? rawData?.total ?? 0 : useExternalData ? finalData?.list?.length ?? 0 : rawData?.total ?? 0;
  const currentPage = useServerPagination ? externalPage ?? 1 : useExternalData ? clientPage : params.page;
  const currentPageSize = useServerPagination ? externalPageSize ?? 10 : useExternalData ? clientPageSize : params.pageSize;
  const listToShow = useServerPagination
    ? finalData?.list ?? []
    : useExternalData
    ? finalData?.list?.slice((clientPage - 1) * clientPageSize, clientPage * clientPageSize) ?? []
    : finalData?.list ?? [];
  const displayData = finalData ? { ...finalData, list: listToShow } : null;

  const handlePageChange = (page: number, pageSize: number) => {
    if (useServerPagination && onRefresh) {
      onRefresh(page, pageSize);
    } else if (useExternalData) {
      setClientPage(page);
      setClientPageSize(pageSize);
    } else {
      setParams({ ...params, page, pageSize });
    }
  };

  return (
    <Card
      title={
        <>
          我的资产
          <span className='workbench-card-title-count'>({totalCount})</span>
        </>
      }
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} size='small' onClick={fetchData} loading={useExternalData ? refreshing : loading}>
            刷新
          </Button>
          <Button type='link' size='small' onClick={() => (window.location.href = '/targets')}>
            查看全部
          </Button>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      <Space direction='vertical' style={{ width: '100%' }} size='middle'>
        <Space>
          <Select value={params.status} onChange={handleStatusChange} style={{ width: 100 }} size='small'>
            <Option value='all'>全部</Option>
            <Option value='online'>在线</Option>
            <Option value='offline'>离线</Option>
          </Select>
          <Search
            placeholder='搜索名称或IP'
            value={params.keyword || ''}
            onSearch={handleSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            size='small'
            style={{ flex: 1 }}
            allowClear
          />
        </Space>
        {finalData && finalData.list.length > 0 ? (
          <>
            <AssetList data={displayData} loading={finalLoading} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Pagination
                size='small'
                current={currentPage}
                pageSize={currentPageSize}
                total={paginationTotal}
                showSizeChanger
                showTotal={(total) => `共 ${total} 条`}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onChange={handlePageChange}
              />
            </div>
          </>
        ) : (
          <Empty description={hasFilters ? '没有找到匹配的资产' : '暂无资产数据'} />
        )}
      </Space>
    </Card>
  );
};

export default MyAssets;
