import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { Table, Tag, Tooltip, Space, Input, Dropdown, Menu, Button, Modal, message, Select, Checkbox, Timeline, Spin, Divider, Row, Col, Popconfirm } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  DownOutlined,
  ReloadOutlined,
  CopyOutlined,
  ApartmentOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useHistory, Link } from 'react-router-dom';
import { useAntdTable } from 'ahooks';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation, Trans } from 'react-i18next';
import { initTarget, getMonObjectList, postTarget, putTarget, getJumpBusiGroups } from '@/services/targets';
import { timeFormatter } from '@/pages/dashboard/Renderer/utils/valueFormatter';
import { CommonStateContext } from '@/App';
import OrganizeColumns from './OrganizeColumns';
import { getDefaultColumnsConfigs, setDefaultColumnsConfigs } from './utils';
import TargetMetaDrawer from './TargetMetaDrawer';
import categrafInstallationDrawer from './components/categrafInstallationDrawer';
import Explorer from './components/Explorer';
import EditBusinessGroups from './components/EditBusinessGroups';
import { ActionType, ControlType } from '@/store/manageInterface';
// @ts-ignore
import CollectsDrawer from 'plus:/pages/collects/CollectsDrawer';
// @ts-ignore
import UpgradeAgent from 'plus:/parcels/Targets/UpgradeAgent';
// @ts-ignore
import VersionSelect from 'plus:/parcels/Targets/VersionSelect';
// @ts-ignore
import { extraColumns } from 'plus:/parcels/Targets';
import CreateModal from './createModal/host';
import './locale';
export const pageSizeOptions = ['10', '20', '50', '100'];
import { targetControlPost } from '@/pages/assets/List/services';
import ControlModal from '@/pages/assets/List/ControlModal';
import { CmdbLifecycle, spadexLifecycle } from '@/pages/assets/services';
enum OperateType {
  BindTag = 'bindTag',
  UnbindTag = 'unbindTag',
  UpdateBusi = 'updateBusi',
  RemoveBusi = 'removeBusi',
  UpdateNote = 'updateNote',
  Delete = 'delete',
  InitTarget = 'init',
  None = 'none',
}
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
enum OperateLife {
  Offline = 'offline',
  Scrap = 'scrap',
  Maintain = 'maintain',
}

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
interface jumpProps {
  id: string;
  full_value: string;
}
interface IProps {
  editable?: boolean;
  explorable?: boolean;
  gids?: string;
  selectedRows: ITargetProps[];
  setSelectedRows: (selectedRowKeys: ITargetProps[]) => void;
  refreshFlag: string;
  setRefreshFlag: (refreshFlag: string) => void;
  setOperateType?: (operateType: OperateType) => void;
  setOperateLife?: (operateLife: OperateLife) => void;
  component?: string | '';
}

const GREEN_COLOR = '#3FC453';

const YELLOW_COLOR = '#FF9919';
const RED_COLOR = '#FF656B';
const MAINTAIN_COLOR = '#FFDE5C';
const LOST_COLOR_LIGHT = '#CCCCCC';
const LOST_COLOR_DARK = '#929090';
const downtimeOptions = [1, 2, 3, 5, 10, 30];
const Unknown = () => {
  const { t } = useTranslation('targets');
  return <Tooltip title={t('unknown_tip')}>unknown</Tooltip>;
};

export default function List(props: IProps) {
  const { t } = useTranslation('targets');
  const { darkMode } = useContext(CommonStateContext);
  const { editable = true, explorable = true, gids, selectedRows, setSelectedRows, refreshFlag, setRefreshFlag, setOperateType, setOperateLife, component } = props;
  const selectedIdents = _.map(selectedRows, 'ident');
  const isAddTagToQueryInput = useRef(false);
  const [searchVal, setSearchVal] = useState('');
  const history = useHistory();
  const [tableQueryContent, setTableQueryContent] = useState<string>('');
  const [columnsConfigs, setColumnsConfigs] = useState<{ name: string; visible: boolean }[]>(getDefaultColumnsConfigs());
  const [collectsDrawerVisible, setCollectsDrawerVisible] = useState(false);
  const [collectsDrawerIdent, setCollectsDrawerIdent] = useState('');
  const [downtime, setDowntime] = useState();
  const [agentVersions, setAgentVersions] = useState<string>();
  const sorterRef = useRef<any>();
  const [visiable, setVisiable] = useState(false);
  const targetRef = useRef(null as any);
  const [initVisible, setInitVisible] = useState(false);
  const [confirmInitLoading, setConfirmInitLoading] = useState(false);
  const LOST_COLOR = darkMode ? LOST_COLOR_DARK : LOST_COLOR_LIGHT;
  const [loading, setLoading] = useState(false); // 加载状态
  const [isShowTimeline, setIsShowTimeline] = useState(false);
  const [targetPassword, setTargetPassword] = useState('');
  const [controlVisible, setControlVisible] = useState(false);
  const [initProcess, setInitProcess] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  interface TimelineItem {
    label: string;
    status: 'loading' | 'success' | 'error';
  }
  // 定义字典类型
  interface Dictionary {
    [key: string]: string; // 键为字符串，值为数字
  }

  const itemMap: Dictionary = {
    server: '服务器',
    cloud_server: '云主机',
    vm: '虚拟机',
  };
  const columns: ColumnsType<any> = [
    {
      title: (
        <Space>
          {t('common:table.ident')}
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu
                onClick={async ({ key }) => {
                  let tobeCopy = _.map(tableProps.dataSource, (item) => item.ident);
                  if (key === 'all') {
                    try {
                      const result = await featchData({ current: 1, pageSize: tableProps.pagination.total });
                      tobeCopy = _.map(result.list, (item) => item.ident);
                    } catch (error) {
                      console.error(error);
                    }
                  } else if (key === 'selected') {
                    tobeCopy = selectedIdents;
                  }

                  if (_.isEmpty(tobeCopy)) {
                    message.warn(t('copy.no_data'));
                    return;
                  }
                }}
              >
                <Menu.Item key='current_page'>{t('copy.current_page')}</Menu.Item>
                <Menu.Item key='all'>{t('copy.all')}</Menu.Item>
                <Menu.Item key='selected'>{t('copy.selected')}</Menu.Item>
              </Menu>
            }
          >
            <CopyOutlined
              style={{
                cursor: 'pointer',
              }}
            />
          </Dropdown>
        </Space>
      ),
      dataIndex: 'ident',
      width: 180,
      className: 'spadex-hosts-table-column-ident',
      render: (text, record) => {
        return (
          <Space>
            <TargetMetaDrawer ident={text} />
            {import.meta.env['VITE_IS_PRO'] && (
              <Tooltip title='查看关联采集配置'>
                <ApartmentOutlined
                  onClick={() => {
                    setCollectsDrawerVisible(true);
                    setCollectsDrawerIdent(text);
                  }}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  _.forEach(columnsConfigs, (item) => {
    if (!item.visible) return;
    if (item.name === 'host_ip') {
      columns.push({
        title: t('host_ip'),
        width: 140,
        dataIndex: 'host_ip',
        className: 'spadex-hosts-table-column-ip',
      });
    }

    if (item.name === 'life_status') {
      columns.push({
        title: (
          <Space>
            {'运行状态'}
            <Tooltip title={'维护中状态不会告警'}>
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        ),
        width: 100,
        sorter: true,
        dataIndex: 'life_status',
        render: (val, reocrd) => {
          let result = '正常';
          let backgroundColor = GREEN_COLOR;
          if (reocrd.life_status === 'maintain') {
            backgroundColor = MAINTAIN_COLOR;
            result = '维护';
          }

          return (
            <div
              className='table-td-fullBG'
              style={{
                backgroundColor,
              }}
            >
              {result}
            </div>
          );
        },
      });
    }

    if (item.name === 'group_obj') {
      columns.push({
        title: t('group_obj'),
        dataIndex: 'group_objs',
        className: 'spadex-hosts-table-column-tags',
        ellipsis: {
          showTitle: false,
        },
        width: 120,
        render(tagArr) {
          if (_.isEmpty(tagArr)) return t('common:not_grouped');
          const content =
            tagArr &&
            tagArr.map((item) => (
              <Tag color='purple' key={item.name}>
                {item.name}
              </Tag>
            ));
          return (
            tagArr && (
              <Tooltip title={content} placement='topLeft' getPopupContainer={() => document.body}>
                {content}
              </Tooltip>
            )
          );
        },
      });
    }
    if (item.name === 'mem_util') {
      columns.push({
        title: t('内存使用率'),
        dataIndex: 'mem_util',
        width: 100,
        render(text, reocrd) {
          if (reocrd.cpu_num === -1) return <Unknown />;
          let backgroundColor = GREEN_COLOR;
          if (text > 70) {
            backgroundColor = YELLOW_COLOR;
          }
          if (text > 85) {
            backgroundColor = RED_COLOR;
          }
          if (reocrd.target_up === 0) {
            backgroundColor = LOST_COLOR;
          }

          return (
            <div
              className='table-td-fullBG'
              style={{
                backgroundColor: backgroundColor,
              }}
            >
              {_.floor(text, 1)}%
            </div>
          );
        },
      });
    }
    if (item.name === 'cpu_util') {
      columns.push({
        title: t('CPU使用率'),
        width: 100,
        dataIndex: 'cpu_util',
        render(text, reocrd) {
          if (reocrd.cpu_num === -1) return <Unknown />;
          let backgroundColor = GREEN_COLOR;
          if (text > 70) {
            backgroundColor = YELLOW_COLOR;
          }
          if (text > 85) {
            backgroundColor = RED_COLOR;
          }
          if (reocrd.target_up === 0) {
            backgroundColor = LOST_COLOR;
          }
          return (
            <div
              className='table-td-fullBG'
              style={{
                backgroundColor: backgroundColor,
              }}
            >
              {_.floor(text, 1)}%
            </div>
          );
        },
      });
    }

    if (item.name === 'update_at') {
      columns.push({
        title: (
          <Space>
            {'监控状态'}
            <Tooltip title={<Trans ns='targets' i18nKey='update_at_tip' components={{ 1: <br /> }} />}>
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        ),
        width: 120,
        sorter: true,
        dataIndex: 'update_at',
        render: (val, reocrd) => {
          let result = '正常';
          let backgroundColor = GREEN_COLOR;
          if (reocrd.target_up === 0) {
            backgroundColor = RED_COLOR;
            result = '失联';
          } else if (reocrd.target_up === 1) {
            backgroundColor = YELLOW_COLOR;
            result = '异常';
          }
          return (
            <div
              className='table-td-fullBG'
              style={{
                backgroundColor,
              }}
            >
              {result}
            </div>
          );
        },
      });
    }

    extraColumns(item.name, columns);
    if (item.name === 'tags') {
      columns.push({
        title: (
          <Space>
            {t('common:host.tags')}
            <Tooltip title={t('common:host.tags_tip')}>
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        ),
        width: 120,
        dataIndex: 'tags',
        className: 'spadex-hosts-table-column-tags',
        ellipsis: {
          showTitle: false,
        },
        render(tagArr) {
          const content =
            tagArr &&
            tagArr.map((item) => (
              <Tag
                color='purple'
                key={item}
                onClick={(e) => {
                  if (!tableQueryContent.includes(item)) {
                    isAddTagToQueryInput.current = true;
                    const val = tableQueryContent ? `${tableQueryContent.trim()} ${item}` : item;
                    setTableQueryContent(val);
                    setSearchVal(val);
                  }
                }}
              >
                {item}
              </Tag>
            ));
          return (
            tagArr && (
              <Tooltip title={content} placement='topLeft' getPopupContainer={() => document.body} overlayClassName='mon-manage-table-tooltip'>
                {content}
              </Tooltip>
            )
          );
        },
      });
    }
    if (item.name === 'operation') {
      columns.push({
        title: t('操作'),
        width: 100,
        render: (row) => {
          return (
            <>
              <Space>
                <Button
                  size='small'
                  type='link'
                  style={{ padding: 0 }}
                  onClick={() => {
                    history.push(`/ident/${row.asset_id}/${row.ident}/terminal/net_switch`);
                  }}
                >
                  {'远程连接'}
                </Button>
              </Space>
              {row.life_status !== 'maintain' && (
                <Space>
                  <Button
                    onClick={() => {
                      handleLifecycleClick('maintain', row);
                    }}
                    danger
                    className='p0 height-auto'
                    type='link'
                  >
                    {'维护'}
                  </Button>
                </Space>
              )}
              {row.life_status === 'maintain' && (
                <Space>
                  <Button
                    onClick={() => {
                      handleLifecycleClick('normal', row);
                    }}
                    className='p0 height-auto'
                    type='link'
                  >
                    {'恢复'}
                  </Button>
                </Space>
              )}
            </>
          );
        },
      });
    }
  });
  const handleControlOk = async (data) => {
    const res = await targetControlPost(data);
    if (res.err !== '') {
      message.error(res.err);
    } else {
      message.success(t('操作成功'));
    }
    setControlVisible(false);
  };
  const handleLifecycleClick = (life_status, row) => {
    let data = {
      idents: [row.ident],
      lifeStatus: life_status,
    };
    spadexLifecycle(data).then((res) => {
      if (res.err !== '') {
        message.error(res.err);
      } else {
        setRefreshFlag(_.uniqueId('refreshFlag_'));
        CmdbLifecycle(data).then((res) => {
          console.log('cmdb-lifecycle:', res);
          if (res.err !== '') {
            message.error(res.err);
          } else {
            message.success(t('操作成功'));
            setRefreshFlag(_.uniqueId('refreshFlag_'));
          }
        });
      }
    });
  };

  const featchData = ({ current, pageSize, sorter }: { current: number; pageSize: number; sorter?: any }): Promise<any> => {
    const query = {
      query: tableQueryContent,
      gids: gids,
      limit: pageSize,
      p: current,
      downtime,
      agent_versions: _.isEmpty(agentVersions) ? undefined : JSON.stringify(agentVersions),
      order: sorter?.field,
      desc: sorter?.field ? sorter?.order === 'descend' : undefined,
    };
    return getMonObjectList(query).then((res) => {
      return {
        total: res.dat.total,
        list: res.dat.list,
      };
    });
  };
  const isFromBusiLine = (busi: any): boolean => {
    return busi === 'busiline';
  };
  const handleCheckboxChange = (value: string) => {};

  // };

  const handleClick = (action, row) => {
    setSelectedAsset(row);
    setControlVisible(true);
  };

  const showTotal = (total: number) => {
    return t('common:table.total', { total });
  };

  const { tableProps, run } = useAntdTable(featchData, {
    manual: true,
    defaultPageSize: localStorage.getItem('targetsListPageSize') ? _.toNumber(localStorage.getItem('targetsListPageSize')) : 30,
  });
  const gidNumber = Number(gids);
  useEffect(() => {
    run({
      current: 1,
      pageSize: tableProps.pagination.pageSize,
      sorter: sorterRef.current,
    });
  }, [tableQueryContent, gids, downtime, agentVersions]);

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

          <VersionSelect
            value={agentVersions}
            onChange={(val) => {
              setAgentVersions(val);
            }}
          />
        </Space>
      </div>
      <Table
        className='mt8 spadex-hosts-table'
        rowKey='id'
        columns={columns}
        size='small'
        {...tableProps}
        showSorterTooltip={false}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: _.map(selectedRows, 'id'),
          onChange(selectedRowKeys, selectedRows: ITargetProps[]) {
            setSelectedRows(selectedRows);
          },
        }}
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
      <CollectsDrawer visible={collectsDrawerVisible} setVisiable={setCollectsDrawerVisible} ident={collectsDrawerIdent} />
      <ControlModal visible={controlVisible} onOk={handleControlOk} onClose={() => setControlVisible(false)} asset={selectedAsset} action={'rename'} />
      {/* <ControlModal visible={controlVisible} action={controlAction} onClose={handleControlClose} identId={controlIdentId} identType={targetType} /> */}
    </div>
  );
}
