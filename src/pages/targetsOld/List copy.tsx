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
import InitModal from './controlModal/init';
import { useAntdTable } from 'ahooks';
import _, { set } from 'lodash';
import moment from 'moment';
import { useTranslation, Trans } from 'react-i18next';
import { initTarget, getMonObjectList, postTarget, putTarget, getJumpBusiGroups } from '@/services/targets';
import { timeFormatter } from '@/pages/dashboard/Renderer/utils/valueFormatter';
import { CommonStateContext } from '@/App';
import clipboard from './clipboard';
import { targetControlPost } from '@/pages/assets/List/services';
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
import ControlModal from '@/pages/assets/List/ControlModal';
// import CreateModal from './createModal/host';
import './locale';
export const pageSizeOptions = ['10', '20', '50', '100'];

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
  const { editable = true, explorable = true, gids, selectedRows, setSelectedRows, refreshFlag, setRefreshFlag, component } = props;
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
  const [confirmInitLoading, setConfirmInitLoading] = useState(false);
  const LOST_COLOR = darkMode ? LOST_COLOR_DARK : LOST_COLOR_LIGHT;
  const [loading, setLoading] = useState(false); // 加载状态
  const [isShowTimeline, setIsShowTimeline] = useState(false);
  const [controlVisible, setControlVisible] = useState(false);
  const [controlIdentId, setControlIdentId] = useState(0);
  const [controlAction, setControlAction] = useState<ControlType>();
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
    cloud_server: '云服务器',
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

                  const tobeCopyStr = _.join(tobeCopy, '\n');
                  const copySucceeded = clipboard(tobeCopyStr);

                  if (copySucceeded) {
                    message.success(t('ident_copy_success', { num: tobeCopy.length }));
                  } else {
                    Modal.warning({
                      title: t('host.copy.error'),
                      content: <Input.TextArea defaultValue={tobeCopyStr} />,
                    });
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
      width: 220,
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
    if (item.name === 'ident_type') {
      columns.push({
        title: '类型',
        dataIndex: 'ident_type',
        width: 80,
        className: 'spadex-hosts-table-column-ip',
        render(typ) {
          return (
            <Tag color='purple' key={typ}>
              {itemMap[typ]}
            </Tag>
          );
        },
      });
    }
    if (item.name === 'life_status') {
      columns.push({
        title: (
          <Space>
            {'告警状态'}
            <Tooltip title={'维护中状态不会告警'}>
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        ),
        width: 120,
        sorter: true,
        dataIndex: 'life_status',
        render: (val, reocrd) => {
          let result = '正常';
          let backgroundColor = GREEN_COLOR;
          if (reocrd.life_status === 'maintain') {
            backgroundColor = MAINTAIN_COLOR;
            result = '维护中';
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
    if (item.name === 'host_tags') {
      columns.push({
        title: (
          <Space>
            {t('common:host.host_tags')}
            <Tooltip title={t('common:host.host_tags_tip')}>
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        ),
        width: 100,
        dataIndex: 'host_tags',
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
        title: t('mem_util'),
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
        title: t('cpu_util'),
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
    if (item.name === 'cpu_num') {
      columns.push({
        title: t('cpu_num'),
        width: 100,
        dataIndex: 'cpu_num',
        render: (val, reocrd) => {
          if (reocrd.cpu_num === -1) return <Unknown />;
          return val;
        },
      });
    }
    if (item.name === 'offset') {
      columns.push({
        title: (
          <Space>
            {t('offset')}
            <Tooltip title={t('offset_tip')}>
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        ),
        dataIndex: 'offset',
        render(text, reocrd) {
          if (reocrd.cpu_num === -1) return <Unknown />;
          let backgroundColor = RED_COLOR;
          if (Math.abs(text) < 2000) {
            backgroundColor = YELLOW_COLOR;
          }
          if (Math.abs(text) < 1000) {
            backgroundColor = GREEN_COLOR;
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
              {timeFormatter(text, 'milliseconds', 2)?.text}
            </div>
          );
        },
      });
    }
    if (item.name === 'os') {
      columns.push({
        title: t('os'),
        dataIndex: 'os',
        width: 100,
        render: (val, reocrd) => {
          if (reocrd.cpu_num === -1) return <Unknown />;
          return val;
        },
      });
    }
    if (item.name === 'arch') {
      columns.push({
        title: t('arch'),
        width: 100,
        dataIndex: 'arch',
        render: (val, reocrd) => {
          if (reocrd.cpu_num === -1) return <Unknown />;
          return val;
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
    if (item.name === 'remote_addr') {
      columns.push({
        title: (
          <Space>
            {t('remote_addr')}
            <Tooltip title={t('remote_addr_tip')}>
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        ),
        width: 100,
        dataIndex: 'remote_addr',
        render: (val, reocrd) => {
          if (reocrd.cpu_num === -1) return <Unknown />;
          return val;
        },
      });
    }
    if (item.name === 'operation') {
      columns.push({
        title: t('操作'),
        width: 100,
        render: (val, reocrd) => {
          return (
            <Button
              onClick={() => {
                handleClick('rename', reocrd);
              }}
              className='p0 height-auto'
              type='link'
            >
              {'改名'}
            </Button>
          );
        },
      });
    }
    extraColumns(item.name, columns);
    if (item.name === 'note') {
      columns.push({
        title: t('common:table.note'),
        dataIndex: 'note',
        ellipsis: {
          showTitle: false,
        },
        render(note) {
          return (
            <Tooltip title={note} placement='topLeft' getPopupContainer={() => document.body}>
              {note}
            </Tooltip>
          );
        },
      });
    }
  });

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

  const handleControlOk = async (data) => {
    const res = await targetControlPost(data);
    if (res.err !== '') {
      message.error(res.err);
    } else {
      message.success(t('操作成功'));
    }
    setControlVisible(false);
  };

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

          <Select
            allowClear
            placeholder={t('filterDowntime')}
            style={{ width: 'max-content' }}
            dropdownMatchSelectWidth={false}
            options={[
              {
                label: t('filterDowntimeNegative'),
                options: _.map(downtimeOptions, (item) => {
                  return {
                    label: t('filterDowntimeNegativeMin', { count: item }),
                    value: -(item * 60),
                  };
                }),
              },
              {
                label: t('filterDowntimePositive'),
                options: _.map(downtimeOptions, (item) => {
                  return {
                    label: t('filterDowntimePositiveMin', { count: item }),
                    value: item * 60,
                  };
                }),
              },
            ]}
            value={downtime}
            onChange={(val) => {
              setDowntime(val);
            }}
          />
          <VersionSelect
            value={agentVersions}
            onChange={(val) => {
              setAgentVersions(val);
            }}
          />
        </Space>

        <Space>
          {explorable && <Explorer selectedIdents={selectedIdents} />}
          <Button
            onClick={() => {
              OrganizeColumns({
                value: columnsConfigs,
                onChange: (val) => {
                  setColumnsConfigs(val);
                  setDefaultColumnsConfigs(val);
                },
              });
            }}
            icon={<EyeOutlined />}
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
    </div>
  );
}
