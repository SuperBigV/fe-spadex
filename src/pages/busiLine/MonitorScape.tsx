import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { Table, Tag, Tooltip, Space, Input, Dropdown, Menu, Button, Modal, message, Select, Popconfirm } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { SearchOutlined, DownOutlined, ReloadOutlined, CopyOutlined, ApartmentOutlined, InfoCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useAntdTable } from 'ahooks';
import _, { identity } from 'lodash';
import moment from 'moment';
import { useTranslation, Trans } from 'react-i18next';
import { getMonObjectList } from '@/services/targets';
import { CommonStateContext } from '@/App';
import { postBusiScrape, putBusiScrape, getBusiScrapeList, putOpenBusiScrape, putCloseBusiScrape, deleteScrape, getDataSourceList } from './services';
import { getDefaultColumnsConfigs } from './utils';
import TargetMetaDrawer from './TargetMetaDrawer';
import ScrapeModal from './ScrapeModal';
import { ScrpTyps } from '@/store/manageInterface';
import categrafInstallationDrawer from './components/categrafInstallationDrawer';
// @ts-ignore
import CollectsDrawer from 'plus:/pages/collects/CollectsDrawer';
// @ts-ignore
export const pageSizeOptions = ['10', '20', '50', '100'];

export interface ITargetProps {
  id: number;
  cluster: string;
  group_id: number;
  group_objs: object[] | null;
  ident: string;
  note: string;
  tags: string[];
  update_at: number;
}

interface IProps {
  gids?: string;
  refreshFlag: string;
  setRefreshFlag: (refreshFlag: string) => void;
}

const GREEN_COLOR = '#3FC453';

export default function List(props: IProps) {
  const { t } = useTranslation('targets');
  const [busiTargets, setBusiTargets] = useState<any[]>([]);
  const { darkMode } = useContext(CommonStateContext);
  const { gids, refreshFlag, setRefreshFlag } = props;
  const [searchVal, setSearchVal] = useState('');
  const [tableQueryContent, setTableQueryContent] = useState<string>('');
  const [columnsConfigs, setColumnsConfigs] = useState<{ name: string; visible: boolean }[]>(getDefaultColumnsConfigs());
  const sorterRef = useRef<any>();
  const [datasourceLists, setDatasourceLists] = useState<any[]>([]);
  const [visiable, setVisiable] = useState(false);
  // 定义字典类型
  interface Dictionary {
    [key: string]: string; // 键为字符串，值为数字
  }
  const Unknown = () => {
    return <span>-</span>;
  };
  useEffect(() => {
    getDataSourceList().then((res) => {
      const slsPlugins = res.filter((item) => item.plugin_type === 'sls');

      // 2. 如果存在符合条件的条目，设置默认 id
      // if (slsPlugins.length > 0) {
      //   setDefaultDataSourceId(slsPlugins[0].id); // 取第一个匹配项的 id
      // }
      setDatasourceLists(res);
    });
  }, []);

  const confirmDelete = async (id: any) => {
    await deleteScrape(id).then(() => {
      message.success('删除成功');
    });
    run({
      current: tableProps.pagination.current,
      pageSize: tableProps.pagination.pageSize,
    });
  };
  const columns: ColumnsType<any> = [
    {
      title: '采集类型',
      dataIndex: 'collect_type',
      className: 'n9e-hosts-table-column-ip',
      render(value) {
        const found = ScrpTyps.find((item) => item.value === value);
        return found ? found.label : value;
      },
    },
    {
      title: '采集状态',
      dataIndex: 'status',
      className: 'n9e-hosts-table-column-ip',
      width: 120,
      render: (val, reocrd) => {
        if (!reocrd.status) {
          return (
            <div
              className='table-td-fullBG'
              style={{
                backgroundColor: 'gray',
              }}
            >
              未采集
            </div>
          );
        } else if (reocrd.status) {
          return (
            <div
              className='table-td-fullBG'
              style={{
                backgroundColor: GREEN_COLOR,
              }}
            >
              采集中
            </div>
          );
        }
      },
    },
    // {
    //   title: '数据源',
    //   dataIndex: 'collect_source',
    //   className: 'n9e-hosts-table-column-ip',

    //   render(item) {
    //     const content = (
    //       <Tag color='purple' key={item.name}>
    //         {item.name}
    //       </Tag>
    //     );
    //     return (
    //       <Tooltip title={content} placement='topLeft' getPopupContainer={() => document.body}>
    //         {content}
    //       </Tooltip>
    //     );
    //   },
    // },
    {
      title: '采集主机',
      dataIndex: 'collect_idents',
      className: 'n9e-hosts-table-column-tags',

      render(identArr) {
        if (!identArr) return <Unknown />;
        if (identArr?.length === 0) return <Unknown />;
        if (_.isEmpty(identArr)) return t('common:not_grouped');
        const names = identArr.map((value) => {
          const found = busiTargets.find((item) => item.id === value);
          return found ? found.ident : value;
        });
        const content = names.map((item) => (
          <Tag color='purple' key={item.id}>
            {item}
          </Tag>
        ));

        return (
          identArr && (
            <Tooltip title={content} placement='topLeft' getPopupContainer={() => document.body}>
              {content}
            </Tooltip>
          )
        );
      },
    },
    {
      title: '采集目标',
      dataIndex: 'collect_target',
      className: 'n9e-hosts-table-column-tags',
    },
    {
      title: '数据源',
      dataIndex: 'datasource_id',
      className: 'n9e-hosts-table-column-tags',
      render(value) {
        const found = datasourceLists.find((item) => item.id === value);
        return found ? found.name : '-';
      },
    },

    {
      title: '更新时间',
      width: 200,
      sorter: true,
      dataIndex: 'update_at',
      render: (val, reocrd) => {
        let result = moment.unix(val).format('YYYY-MM-DD HH:mm:ss');
        return <div>{result}</div>;
      },
    },
    {
      title: '操作',
      ellipsis: {
        showTitle: false,
      },
      render(row) {
        return (
          <>
            {row.status && (
              <Button
                size='small'
                type='link'
                style={{ padding: 0 }}
                onClick={() => {
                  handleChangeStatus(row.id, false);
                }}
              >
                {'关闭'}
              </Button>
            )}
            {!row.status && (
              <Button
                size='small'
                type='link'
                style={{ padding: 0 }}
                onClick={() => {
                  handleChangeStatus(row.id, true);
                }}
              >
                {'开启'}
              </Button>
            )}

            <Button
              size='small'
              type='link'
              style={{ padding: 0 }}
              onClick={() => {
                ScrapeModal({
                  gids: gids,
                  selectedRow: row,
                  busiTargets: busiTargets,
                  visible: true,
                  dataSourceList: datasourceLists,
                  action: 'edit',
                  destroy: () => setVisiable(false),
                  onOk: (values) => {
                    values.group_id = Number(gids);
                    return putBusiScrape(row.id, values).then(() => {
                      setRefreshFlag(_.uniqueId('refreshFlag_'));
                      message.success(t('common:success.add'));
                    });
                  },
                });
              }}
            >
              {t('common:btn.edit')}
            </Button>

            {/* <Button
              size='small'
              type='link'
              style={{ padding: 0 }}
              onClick={() => {
                deleteScrape(row.id);
              }}
            > */}
            <Popconfirm title={'是否确认删除采集配置?'} onConfirm={() => confirmDelete(row.id)} okText='确定' cancelText='取消'>
              <Button size='small' type='link' danger>
                删除
              </Button>
            </Popconfirm>
            {/* </Button> */}
          </>
        );
      },
    },
  ];

  const featchData = (): Promise<any> => {
    const query = {
      gids: gids,
    };
    return getBusiScrapeList(query).then((res) => {
      return {
        list: res.dat,
      };
    });
  };
  const handleChangeStatus = async (id, status) => {
    if (status) {
      await putOpenBusiScrape(id);
    } else {
      await putCloseBusiScrape(id);
    }
    // featchData();
    run({
      current: tableProps.pagination.current,
      pageSize: tableProps.pagination.pageSize,
    });
    // setRefreshFlag(_.uniqueId('refreshFlag_'));
  };
  const showTotal = (total: number) => {
    return t('common:table.total', { total });
  };

  const { tableProps, run } = useAntdTable(featchData, {
    manual: true,
    defaultPageSize: 20,
  });
  useEffect(() => {
    run({
      current: tableProps.pagination.current,
      pageSize: tableProps.pagination.pageSize,
    });
    getMonObjectList({ gids: gids }).then((res) => {
      setBusiTargets(res.dat.list);
    });
  }, [tableQueryContent, gids]);

  useEffect(() => {
    run({
      current: tableProps.pagination.current,
      pageSize: tableProps.pagination.pageSize,
      sorter: sorterRef.current,
    });
  }, [refreshFlag]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setRefreshFlag(_.uniqueId('refreshFlag_'));
            }}
          />
          <Input
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            placeholder={t('search_placeholder')}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onPressEnter={() => {
              setTableQueryContent(searchVal);
            }}
            onBlur={() => {
              setTableQueryContent(searchVal);
            }}
          />
        </Space>
        <Space>
          <Button
            type='primary'
            onClick={() => {
              ScrapeModal({
                gids: gids,
                busiTargets: busiTargets,
                visible: true,
                dataSourceList: datasourceLists,
                action: 'create',
                destroy: () => setVisiable(false),
                onOk: (values) => {
                  values.group_id = Number(gids);
                  return postBusiScrape(values).then(() => {
                    setRefreshFlag(_.uniqueId('refreshFlag_'));
                    message.success(t('common:success.add'));
                  });
                },
              });
            }}
          >
            创建
          </Button>
        </Space>
      </div>
      <Table
        className='mt8 n9e-hosts-table'
        rowKey='id'
        columns={columns}
        size='small'
        {...tableProps}
        showSorterTooltip={false}
        pagination={{
          ...tableProps.pagination,
          showTotal: showTotal,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: pageSizeOptions,
          onChange(page, pageSize) {
            localStorage.setItem('targetsListPageSize', _.toString(pageSize));
          },
        }}
        scroll={{ x: 'max-content' }}
        locale={{
          emptyText:
            gids === undefined ? (
              <Trans
                ns='targets'
                i18nKey='all_no_data'
                components={{
                  a: (
                    <a
                      onClick={() => {
                        categrafInstallationDrawer({ darkMode });
                      }}
                    />
                  ),
                }}
              />
            ) : undefined,
        }}
        onChange={(pagination, filters, sorter) => {
          sorterRef.current = sorter;
          tableProps.onChange(pagination, filters, sorter);
        }}
      />
      {/* <CollectsDrawer visible={collectsDrawerVisible} setVisiable={setCollectsDrawerVisible} ident={collectsDrawerIdent} /> */}
    </div>
  );
}
