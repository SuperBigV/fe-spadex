import React, { useEffect, useState, useRef } from 'react';
import { Table, Spin, message, Dropdown, Menu, Modal, Tag, Popconfirm, Checkbox, Button, Row, Col, Input, Image, Tooltip, Space } from 'antd';
import { MoreOutlined, SearchOutlined, DownOutlined, InfoCircleOutlined } from '@ant-design/icons';

import { getColumnsByGid, getGidDetail, getByGidAssetsList, addAsset, addAssetToN9e, editAsset, targetControlPost, getTargetPassword, getRacks } from './services'; // 假设这两个函数用于获取表格列和数据
import _, { includes, set } from 'lodash';
import moment from 'moment';
import { ColumnsType } from 'antd/es/table';
import { useHistory, Link } from 'react-router-dom';
import { useAntdTable } from 'ahooks';
import { useTranslation, Trans } from 'react-i18next';
import { ActionType, ControlType } from '@/store/manageInterface';
import FormModal from './FormModal';
import ControlModal from './ControlModal';
import TargetMetaDrawer from './TargetMetaDrawer';
import { json } from 'd3';
import { fromTheme } from 'tailwind-merge';
import { getAuthConfigs } from '@/pages/authConfigs/services';
import { getModelTeamList } from '@/services/manage';
import { getIconsByGrpId } from '@/pages/icon/services';
import { getBusiGroups } from '@/services/common';
import { table } from 'console';
import { timeFormatter } from '@/pages/dashboard/Renderer/utils/valueFormatter';

export interface ITargetProps {
  id: number;
  name: string;
  ip: string;
  category: string;
  port?: string;
  password?: string;
}

enum OperateType {
  Init = 'init',
  Lifecycle = 'lifecycle',
  None = 'none',
  BindTag = 'bindTag',
  UnbindTag = 'unbindTag',
}
export interface IProps {
  isLeaf?: boolean;
  isShowOperator: boolean;
  gids?: string;
  refreshFlag: string;
  // setRefreshFlag: (refreshFlag: string) => void;
  selectedRows: ITargetProps[];
  setSelectedRows: (selectedRowKeys: ITargetProps[]) => void;
  setOperateType?: (operateType: OperateType) => void;
}
export interface IAsset {
  id: number;
  gid: number;
  name: string;
}
export interface Field {
  id: number;
  fieldName: string;
  uniqueIdentifier: string;
  fieldType: string;
  isShow: boolean;
  optionList?: string[];
  buildIn: boolean;
  required: boolean;
  tip: string;
  relatedModel?: number;
  render: (text: any, record: any) => React.JSX.Element;
}
export interface ColumnType {
  title: string;
  width?: number;
  ellipsis?: any;
  key?: number;
  fieldType: string;
  fixed?: string;
  dataIndex: string;
}
export const pageSizeOptions = ['10', '20', '50', '100'];
const LOST_COLOR_DARK = '#929090';
export default function AssetList(props: IProps) {
  const { t } = useTranslation('asset');
  const { isLeaf, gids, setOperateType, setSelectedRows, refreshFlag, selectedRows, isShowOperator } = props;
  const [columns, setColumns] = useState<ColumnsType<ColumnType>>([]);
  const [formFields, setFormFields] = useState<any[]>([]);
  // const [data, setData] = useState<any[]>([]);
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const isAddTagToQueryInput = useRef(false);
  const [targetPassword, setTargetPassword] = useState('');
  const [tableQueryContent, setTableQueryContent] = useState<string>('');
  const [searchVal, setSearchVal] = useState('');
  const [assetModel, setAssetModel] = useState<any>();
  const [controlVisible, setControlVisible] = useState(false);
  const [controlAction, setControlAction] = useState<ControlType>();
  const [iconOptions, setIconOptions] = useState<{ name: string; id: number; src: string }[]>([]);
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [busiOptions, setBusiOptions] = useState<any[]>([]);
  const [authOptions, setAuthOptions] = useState<any[]>([]);
  const [rackOptions, setRackOptions] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [allFields, setAllFields] = useState<Field[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const GREEN_COLOR = '#3FC453';
  const YELLOW_COLOR = '#FF9919';
  const RED_COLOR = '#FF656B';
  const GRAY_COLOR = '#929090';
  const isShowOperatorRef = useRef(isShowOperator);
  const Unknown = () => {
    const { t } = useTranslation('asset');
    return (
      <Tooltip title={t('unknown_tip')}>
        {' '}
        <div
          className='table-td-fullBG'
          style={{
            backgroundColor: GRAY_COLOR,
          }}
        >
          unknown
        </div>
      </Tooltip>
    );
  };
  const showTotal = (total: number) => {
    return t('common:table.total', { total });
  };
  const handleControlOk = async (data) => {
    const res = await targetControlPost(data);
    if (res.err !== '') {
      message.error(res.err);
    } else {
      message.success(t('操作成功'));
    }
    setControlVisible(false); // 在请求完成后关闭控制面板
  };
  const featchData = ({ current, pageSize, sorter }: { current: number; pageSize: number; sorter?: any }): Promise<any> => {
    const query = {
      query: tableQueryContent,
      gids: gids,
      limit: pageSize,
      p: current,
      order: 'create_at',
      desc: true,
    };
    return getByGidAssetsList(query).then((res) => {
      const assetList: any[] = [];
      if (res.list.length === 0) {
        return {
          total: 0,
          list: assetList,
        };
      }
      res.list.map((item) => {
        item.data.id = item.id;
        item.data.status = item.status;
        item.data.belong_room = item.belong_room;
        item.data.tags = item.tags;
        item.data.mem_util = item.mem_util;
        item.data.cpu_util = item.cpu_util;
        item.data.offset = item.offset;
        assetList.push(item.data);
      });
      return {
        total: res.total,
        list: assetList,
      };
    });
  };
  const { tableProps, run } = useAntdTable(featchData, {
    manual: true,
    defaultPageSize: localStorage.getItem('targetsListPageSize') ? _.toNumber(localStorage.getItem('targetsListPageSize')) : 30,
  });
  useEffect(() => {
    run({
      current: 1,
      pageSize: tableProps.pagination.pageSize,
      sorter: tableProps.sorter,
    });
  }, [tableQueryContent]);
  const handleFieldChange = (checkedValues) => {
    setSelectedFields(checkedValues);
  };

  const handleOk = () => {
    const newColumns: any[] = allFields
      .filter((field) => selectedFields.includes(field.uniqueIdentifier))
      .filter((field) => field.isShow)
      .map((item) => {
        if (item.uniqueIdentifier === 'model') {
          return {
            title: item.fieldName,
            dataIndex: item.uniqueIdentifier,
            key: item.id,
            render: (text, record) => {
              const model = modelOptions.find((model) => model.value === record.model);
              return <div>{model && model.label}</div>;
            },
          };
        }
        if (item.uniqueIdentifier.includes('status')) {
        }
        if (item.uniqueIdentifier.includes('rack')) {
          return {
            title: item.fieldName,
            dataIndex: item.uniqueIdentifier,
            key: item.id,
            render: (text, record) => {
              const model = rackOptions.find((model) => model.value === record.belong_rack);
              return <div>{model && model.label}</div>;
            },
          };
        }
        if (item.uniqueIdentifier === 'busi') {
          return {
            title: item.fieldName,
            dataIndex: item.uniqueIdentifier,
            key: item.id,
            width: 120,
            ellipsis: {
              showTitle: false,
            },
            // render: (text, record) => {
            //   const model = busiOptions.find((model) => model.value === record.busi);
            //   return <div>{model && model.label}</div>;
            // },
            render: (text, record) => {
              const content =
                record.busi &&
                record.busi.map((item) => {
                  const model = busiOptions.find((model) => model.value === item);
                  return (
                    <Tag color='purple' key={item}>
                      {model && model.label}
                    </Tag>
                  );
                });
              return (
                record.busi && (
                  <Tooltip title={content} placement='topLeft' getPopupContainer={() => document.body}>
                    {content}
                  </Tooltip>
                )
              );
            },
          };
        }
        if (item.uniqueIdentifier === 'auth_snmp') {
          return {
            title: item.fieldName,
            dataIndex: item.uniqueIdentifier,
            key: item.id,
            render: (text, record) => {
              const model = authOptions.find((model) => model.value === record.auth_snmp);
              return <div>{model && model.label}</div>;
            },
          };
        }
        if (item.uniqueIdentifier === 'icon') {
          return {
            title: item.fieldName,
            dataIndex: item.uniqueIdentifier,
            key: item.id,
            width: 100,
            align: 'left',
            render: (iconId: number) => {
              const icon = iconOptions.find((icon) => icon.id === iconId);
              return icon ? (
                <Image
                  src={icon.src}
                  preview={false} // 禁用预览
                  style={{ width: '40px', height: '40px' }} // 设置图标大小
                />
              ) : (
                '未知图标' // 如果未找到图标，返回默认值
              );
            },
            // <Image
            //   src={src}
            //   preview={false} // 禁用预览
            //   style={{ width: '50px', height: '50px', objectFit: 'contain' }} // 设置缩略图大小
            // />
          };
        }
        if (item.uniqueIdentifier.includes('name')) {
          return {
            key: item.id,
            title: item.fieldName,
            dataIndex: item.uniqueIdentifier,
            fieldType: item.fieldType,
            align: 'left',
            width: 220,
            render: (text, record) => {
              return (
                <Space>
                  <TargetMetaDrawer ident={text} />
                </Space>
              );
            },
          };
        }

        if (item.uniqueIdentifier.includes('ip')) {
          return {
            key: item.id,
            title: item.fieldName,
            dataIndex: item.uniqueIdentifier,
            fieldType: item.fieldType,
            align: 'left',
            width: 160,
          };
        }
        if (item.uniqueIdentifier === 'offset') {
          return {
            title: '监控状态',
            dataIndex: 'offset',
            width: 100,
            render(text, reocrd) {
              if (reocrd.cpu_num === -1) return <Unknown />;
              let result = '异常';
              let backgroundColor = RED_COLOR;
              if (Math.abs(text) > 1) {
                result = '正常';
                backgroundColor = GREEN_COLOR;
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
          };
        }
        if (item.uniqueIdentifier === 'cpu_util') {
          return {
            title: 'CPU使用率',
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
          };
        }
        if (item.uniqueIdentifier === 'mem_util') {
          return {
            title: '内存使用率',
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
          };
        }
        if (item.uniqueIdentifier === 'tags') {
          return {
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
            className: 'n9e-hosts-table-column-tags',
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
          };
        }
        if (item.uniqueIdentifier.includes('Time')) {
          return {
            key: item.id,
            title: item.fieldName,
            dataIndex: item.uniqueIdentifier,
            fieldType: item.fieldType,
            width: 200,
            render: (val, reocrd) => {
              let result = moment(val).format('YYYY-MM-DD HH:mm:ss');
              return <div>{result}</div>;
            },
          };
        }
        return {
          key: item.id,
          title: item.fieldName,
          dataIndex: item.uniqueIdentifier,
          fieldType: item.fieldType,
          align: 'left',
          // fixed:'none',
          width: 120,
          ellipsis: {
            showTitle: false,
          },
        };
      });

    // newColumns.push({
    //   title: '状态',
    //   dataIndex: 'status',
    //   width: 100,
    //   key: 10000000,
    //   fieldType: 'string',
    //   render(text, reocrd) {
    //     let result = '正常';
    //     if (text === '') return <Unknown />;
    //     let backgroundColor = RED_COLOR;
    //     if (text === 'normal') {
    //       backgroundColor = GREEN_COLOR;
    //       result = '正常';
    //     }
    //     if (text === 'maintain') {
    //       backgroundColor = YELLOW_COLOR;
    //       result = '维护';
    //     }
    //     if (text === 'offline') {
    //       backgroundColor = RED_COLOR;
    //       result = '下线';
    //     }

    //     return (
    //       <div
    //         className='table-td-fullBG'
    //         style={{
    //           backgroundColor: backgroundColor,
    //         }}
    //       >
    //         {result}
    //       </div>
    //     );
    //   },
    // });
    newColumns.push({
      title: '操作',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      dataIndex: 'operator',
      fixed: 'right',
      render(row) {
        return (
          <>
            <Button
              size='small'
              type='link'
              onClick={() => {
                FormModal({
                  title: t('common:btn.edit'),
                  visiable: true,
                  operateType: 'edit',
                  // data: row,
                  gid: _.toNumber(gids),
                  rowId: row.id,
                  groups: formFields,
                  onOk: (values) => {
                    return editAsset(row.id, values).then(() => {
                      run({
                        current: tableProps.pagination.current,
                        pageSize: tableProps.pagination.pageSize,
                      });
                      message.success(t('common:success.create'));
                    });
                  },
                });
              }}
            >
              {'编辑'}
            </Button>
            {assetModel.uniqueIdentifier.includes('host_') && (
              <Button
                size='small'
                type='link'
                style={{ padding: 0 }}
                onClick={() => {
                  history.push(`/ident/${row.id}/${row.name}/terminal/${assetModel.uniqueIdentifier}`);
                }}
              >
                {'远程连接'}
              </Button>
            )}
            {assetModel.uniqueIdentifier.includes('net_') && (
              <Button
                size='small'
                type='link'
                style={{ padding: 0 }}
                onClick={() => {
                  history.push(`/ident/${row.id}/${row.name}/terminal/${assetModel.uniqueIdentifier}`);
                }}
              >
                {'远程连接'}
              </Button>
            )}
            <Dropdown
              overlay={
                <Menu>
                  <>
                    {assetModel.uniqueIdentifier.includes('host_') && (
                      <>
                        <Menu.Item onClick={() => handleClick(ControlType.Restart, row)}>
                          <Button className='p0 height-auto' type='link'>
                            {'重启'}
                          </Button>
                        </Menu.Item>
                        <Menu.Item onClick={() => handleClick(ControlType.Start, row)}>
                          <Button className='p0 height-auto' type='link'>
                            {'启动'}
                          </Button>
                        </Menu.Item>
                        <Menu.Item onClick={() => handleClick(ControlType.Stop, row)}>
                          <Button className='p0 height-auto' type='link'>
                            {'停止'}
                          </Button>
                        </Menu.Item>
                        <Menu.Item onClick={() => handleClick(ControlType.Rename, row)}>
                          <Button className='p0 height-auto' type='link'>
                            {'改名'}
                          </Button>
                        </Menu.Item>
                        <Menu.Item onClick={() => handleClick(ControlType.Showpassword, row.id)}>
                          <Button size='small' type='link' style={{ padding: 0 }} onClick={() => showPassword(row.id)}>
                            {'查看密码'}
                          </Button>
                        </Menu.Item>
                      </>
                    )}
                  </>
                </Menu>
              }
            >
              <Button type='link' icon={<MoreOutlined />} />
            </Dropdown>
          </>
        );
      },
    });
    setColumns(newColumns);

    setVisible(false);
  };
  const handleClick = (action, asset) => {
    setSelectedAsset(asset);
    setControlAction(action);
    setControlVisible(true);
  };
  // const getTargetPassword = async (id) => {
  //   // 模拟获取密码的异步函数
  //   return { dat: 'your-password' }; // 替换为实际的获取逻辑
  // };
  const initAssetTable = async () => {
    setLoading(true);
    try {
      // 获取表格列
      if (!isLeaf) {
        return;
      }
      const modelGroupDetail = await getGidDetail(gids?.toString() || '');
      setAssetModel(modelGroupDetail);

      const iconOptions = await getIconsByGrpId(_.toNumber(gids) || 0);

      setIconOptions(iconOptions);
      let params = {
        limit: 1000,
      };
      const modelOptions = await getModelTeamList(params);
      const options1 = modelOptions.dat.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setModelOptions(options1);
      const rackOptions = await getRacks();
      const options4 = rackOptions.map((item) => ({
        label: item.data.name,
        value: item.id,
      }));
      setRackOptions(options4);
      let busiOptions;
      let options2;
      if (modelGroupDetail && modelGroupDetail.uniqueIdentifier.includes('net_')) {
        busiOptions = await getBusiGroups('', 1000, 'net');
        options2 = busiOptions.dat.map((item) => ({
          label: item.name,
          value: item.id,
        }));
        setBusiOptions(options2);
      } else {
        busiOptions = await getBusiGroups();
        options2 = busiOptions.dat.map((item) => ({
          label: item.name,
          value: item.id,
        }));
        setBusiOptions(options2);
      }

      const authOptions = await getAuthConfigs();
      const options3 = authOptions.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setAuthOptions(options3);
      const columnsResponse = await getColumnsByGid(gids?.toString() || '');
      const tableColumns = columnsResponse.filter((item) => item.fields);
      // tableColumns.push({
      //   name: '监控状态',
      //   uniqueIdentifier: 'offset',
      // });
      // tableColumns.push({
      //   name: '内存使用率',
      //   uniqueIdentifier: 'mem_util',
      // });
      setFormFields(tableColumns);
      // const allFields = columnsResponse.map((item) => item.fields);
      const allFields = columnsResponse
        .filter((item) => item.fields)
        .reduce((acc, item) => {
          return acc.concat(item.fields);
        }, []);
      if (modelGroupDetail.uniqueIdentifier.includes('net_')) {
        allFields.splice(
          2,
          0,
          { name: '监控状态', uniqueIdentifier: 'offset', isShow: true },
          {
            name: 'CPU使用率',
            uniqueIdentifier: 'cpu_util',
            isShow: true,
          },
          {
            name: '内存使用率',
            uniqueIdentifier: 'mem_util',
            isShow: true,
          },
        );
      }
      if (modelGroupDetail.uniqueIdentifier.includes('host_')) {
        allFields.splice(
          2,
          0,
          { name: '监控状态', uniqueIdentifier: 'offset', isShow: true },
          {
            name: 'CPU使用率',
            uniqueIdentifier: 'cpu_util',
            isShow: true,
          },
          {
            name: '内存使用率',
            uniqueIdentifier: 'mem_util',
            isShow: true,
          },
        );
      }
      const columns = allFields
        .filter((field) => field.isShow)
        .map((item) => {
          if (item.uniqueIdentifier === 'model') {
            return {
              title: item.fieldName,
              dataIndex: item.uniqueIdentifier,
              key: item.id,
              align: 'left',
              render: (text, record) => {
                const model = modelOptions.dat.find((model) => model.id === record.model);
                return <div>{model && model.name}</div>;
              },
            };
          }

          if (item.uniqueIdentifier.includes('rack')) {
            return {
              title: item.fieldName,
              dataIndex: item.uniqueIdentifier,
              key: item.id,
              align: 'left',
              render: (text, record) => {
                const model = rackOptions.find((model) => model.id === record.belong_rack);
                return <div>{model && model.data.name}</div>;
              },
            };
          }
          if (item.uniqueIdentifier === 'tags') {
            return {
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
              className: 'n9e-hosts-table-column-tags',
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
            };
          }
          if (item.uniqueIdentifier === 'busi') {
            return {
              title: item.fieldName,
              dataIndex: item.uniqueIdentifier,
              key: item.id,
              className: 'n9e-hosts-table-column-tags',
              width: 120,
              align: 'left',
              ellipsis: {
                showTitle: false,
              },
              render: (text, record) => {
                const content =
                  record.busi &&
                  record.busi.map((item) => {
                    const model = busiOptions.dat.find((model) => model.id === item);
                    return (
                      <Tag color='purple' key={item}>
                        {model && model.name}
                      </Tag>
                    );
                  });
                return (
                  record.busi && (
                    <Tooltip title={content} placement='topLeft' getPopupContainer={() => document.body}>
                      {content}
                    </Tooltip>
                  )
                );
              },
            };
          }
          if (item.uniqueIdentifier === 'auth_snmp') {
            return {
              title: item.fieldName,
              dataIndex: item.uniqueIdentifier,
              key: item.id,
              align: 'left',
              render: (text, record) => {
                const model = authOptions.find((model) => model.id === record.auth_snmp);
                return <div>{model && model.name}</div>;
              },
            };
          }
          if (item.uniqueIdentifier === 'auth_telnet') {
            return {
              title: item.fieldName,
              dataIndex: item.uniqueIdentifier,
              key: item.id,
              align: 'left',
              render: (text, record) => {
                const model = authOptions.find((model) => model.id === record.auth_telnet);
                return <div>{model && model.name}</div>;
              },
            };
          }
          if (item.uniqueIdentifier === 'icon') {
            return {
              title: item.fieldName,
              dataIndex: item.uniqueIdentifier,
              key: item.id,
              width: 100,
              render: (iconId: number) => {
                const icon = iconOptions.find((icon) => icon.id === iconId);
                return icon ? (
                  <Image
                    src={icon.src}
                    preview={false} // 禁用预览
                    style={{ width: '40px', height: '40px' }} // 设置图标大小
                  />
                ) : (
                  '未知图标' // 如果未找到图标，返回默认值
                );
              },
              // <Image
              //   src={src}
              //   preview={false} // 禁用预览
              //   style={{ width: '50px', height: '50px', objectFit: 'contain' }} // 设置缩略图大小
              // />
            };
          }
          if (item.uniqueIdentifier.includes('name')) {
            return {
              key: item.id,
              title: item.fieldName,
              dataIndex: item.uniqueIdentifier,
              fieldType: item.fieldType,
              width: 200,
              align: 'left',
              render: (text, record) => {
                return (
                  <Space>
                    <TargetMetaDrawer ident={text} />
                  </Space>
                );
              },
            };
          }

          if (item.uniqueIdentifier.includes('ip')) {
            return {
              key: item.id,
              title: item.fieldName,
              dataIndex: item.uniqueIdentifier,
              fieldType: item.fieldType,
              className: 'n9e-hosts-table-column-ip',
              width: 140,
            };
          }
          if (item.uniqueIdentifier === 'offset') {
            return {
              title: '监控状态',
              dataIndex: 'offset',
              width: 100,
              render(text, reocrd) {
                if (reocrd.cpu_num === -1) return <Unknown />;
                let result = '异常';
                let backgroundColor = RED_COLOR;
                if (Math.abs(text) > 1) {
                  result = '正常';
                  backgroundColor = GREEN_COLOR;
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
            };
          }
          if (item.uniqueIdentifier === 'cpu_util') {
            return {
              title: 'CPU使用率',
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
            };
          }
          if (item.uniqueIdentifier === 'mem_util') {
            return {
              title: '内存使用率',
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
            };
          }

          if (item.uniqueIdentifier.includes('Time')) {
            return {
              key: item.id,
              title: item.fieldName,
              dataIndex: item.uniqueIdentifier,
              fieldType: item.fieldType,
              width: 200,
              render: (val, reocrd) => {
                let result = moment(val).format('YYYY-MM-DD HH:mm:ss');
                return <div>{result}</div>;
              },
            };
          }
          return {
            key: item.id,
            title: item.fieldName,
            dataIndex: item.uniqueIdentifier,
            fieldType: item.fieldType,
            align: 'left',
            width: 120,
            ellipsis: {
              showTitle: false,
            },
          };
        });
      setColumns(columns);
      {
        columns.push({
          title: '操作',
          width: 150,
          ellipsis: {
            showTitle: false,
          },
          fixed: 'right',
          render(row) {
            return (
              <>
                <Button
                  size='small'
                  type='link'
                  onClick={() => {
                    FormModal({
                      title: t('common:btn.edit'),
                      visiable: true,
                      operateType: 'edit',
                      // data: row,
                      gid: _.toNumber(gids),
                      rowId: row.id,
                      modelOptions: options1,
                      busiOptions: options2,
                      authOptions: options3,
                      groups: tableColumns,
                      onOk: (values) => {
                        return editAsset(row.id, values).then(() => {
                          run({
                            current: tableProps.pagination.current,
                            pageSize: tableProps.pagination.pageSize,
                          });
                          message.success(t('common:success.create'));
                        });
                      },
                    });
                  }}
                >
                  {'编辑'}
                </Button>
                {modelGroupDetail.uniqueIdentifier.includes('host_') && (
                  <Button
                    size='small'
                    type='link'
                    style={{ padding: 0 }}
                    onClick={() => {
                      history.push(`/ident/${row.id}/${row.name}/terminal/${modelGroupDetail.uniqueIdentifier}`);
                    }}
                  >
                    {'远程连接'}
                  </Button>
                )}
                {modelGroupDetail.uniqueIdentifier.includes('net_') && (
                  <Button
                    size='small'
                    type='link'
                    style={{ padding: 0 }}
                    onClick={() => {
                      history.push(`/ident/${row.id}/${row.name}/terminal/${modelGroupDetail.uniqueIdentifier}`);
                    }}
                  >
                    {'远程连接'}
                  </Button>
                )}
                <Dropdown
                  overlay={
                    <Menu>
                      <>
                        {modelGroupDetail.uniqueIdentifier.includes('host_') && (
                          <>
                            <Menu.Item onClick={() => handleClick(ControlType.Restart, row)}>
                              <Button className='p0 height-auto' type='link'>
                                {'重启'}
                              </Button>
                            </Menu.Item>
                            <Menu.Item onClick={() => handleClick(ControlType.Start, row)}>
                              <Button className='p0 height-auto' type='link'>
                                {'启动'}
                              </Button>
                            </Menu.Item>
                            <Menu.Item onClick={() => handleClick(ControlType.Stop, row)}>
                              <Button className='p0 height-auto' type='link'>
                                {'停止'}
                              </Button>
                            </Menu.Item>
                            <Menu.Item onClick={() => handleClick(ControlType.Rename, row)}>
                              <Button className='p0 height-auto' type='link'>
                                {'改名'}
                              </Button>
                            </Menu.Item>
                            <Menu.Item>
                              <Button size='small' type='link' style={{ padding: 0 }} onClick={() => showPassword(row.id)}>
                                {'查看密码'}
                              </Button>
                            </Menu.Item>
                          </>
                        )}
                      </>
                    </Menu>
                  }
                >
                  <Button type='link' icon={<MoreOutlined />} />
                </Dropdown>
              </>
            );
          },
        });
      }
      // 获取表格数据
      const dataResponse = await run({
        current: 1,
        pageSize: tableProps.pagination.pageSize,
      });
      setAllFields(allFields);
      setSelectedFields(allFields.map((field) => field.uniqueIdentifier));
    } catch (error) {
      message.error('获取数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const showPassword = async (id) => {
    await getTargetPassword(id).then((res) => {
      let password = res.dat;
      if (password === '') {
        password = '密码为空';
      }
      setTargetPassword(password);
    });
    setOpen(true);
  };

  useEffect(() => {
    if (gids) {
      initAssetTable();
    }
    // getGroupIcons(gids);
    setTableLoading(true);
  }, [gids, refreshFlag]);
  useEffect(() => {
    isShowOperatorRef.current = isShowOperator;
  }, [isShowOperator]);
  return (
    <div>
      {loading ? (
        <Spin tip='加载中...' />
      ) : (
        <>
          {isLeaf && (
            <Row className='mb10'>
              <Col span={16} className='mb10'>
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
              </Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                {/* <Button
                  type='primary'
                  onClick={() => {
                    history.push('/room-rack/add');
                  }}
                > */}
                <Space>
                  <Button onClick={() => setVisible(true)}>设置字段</Button>
                  <Dropdown
                    trigger={['click']}
                    overlay={
                      <Menu
                        onClick={({ key }) => {
                          if (key && setOperateType) {
                            setOperateType(key as OperateType);
                          }
                        }}
                      >
                        <Menu.Item key={OperateType.BindTag}>{'绑定标签'}</Menu.Item>
                        <Menu.Item key={OperateType.UnbindTag}>{'解绑标签'}</Menu.Item>
                        <Menu.Item key={OperateType.Init}>{'初始化'}</Menu.Item>
                        <Menu.Item key={OperateType.Lifecycle}>{'生命周期'}</Menu.Item>
                      </Menu>
                    }
                  >
                    <Button>
                      {'批量操作'} <DownOutlined />
                    </Button>
                  </Dropdown>
                  <Button
                    type='primary'
                    onClick={() => {
                      FormModal({
                        title: t('common:btn.create'),
                        visiable: true,
                        groups: formFields,
                        rowId: 0,
                        modelOptions,
                        busiOptions,
                        authOptions,
                        gid: _.toNumber(gids),
                        operateType: 'create',
                        onOk: (values) => {
                          // values.data.category = groupName;
                          let id;
                          return addAsset(gids, values).then((data) => {
                            id = data.dat;
                            run({
                              current: tableProps.pagination.current,
                              pageSize: tableProps.pagination.pageSize,
                            });
                            message.success(t('common:success.create'));
                            addAssetToN9e(id, assetModel.uniqueIdentifier, values);
                          });
                        },
                      });
                    }}
                  >
                    {'创建资产'}
                  </Button>
                </Space>
              </Col>
            </Row>
          )}
          {tableLoading && (
            <Table
              className='mt8 n9e-hosts-table'
              size='small'
              {...tableProps}
              rowSelection={{
                type: 'checkbox',

                selectedRowKeys: _.map(selectedRows, 'id'),
                onChange(selectedRowKeys, selectedRows: any[]) {
                  setSelectedRows(selectedRows);
                },
              }}
              columns={columns}
              scroll={{ x: 'max-content' }}
              rowKey='id' // 假设数据中有唯一标识 id
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
            />
          )}
        </>
      )}
      <ControlModal visible={controlVisible} onOk={handleControlOk} onClose={() => setControlVisible(false)} asset={selectedAsset} action={controlAction} />
      <Modal
        title='密码'
        open={open}
        okText='复制'
        onCancel={() => setOpen(false)}
        onOk={() => {
          navigator.clipboard
            .writeText(targetPassword)
            .then(() => {
              Modal.success({ content: '复制成功' });
            })
            .catch((err) => {
              Modal.error({ content: '复制失败' });
            });
        }}
      >
        <p>{targetPassword}</p>
      </Modal>
      <Modal title='设置显示字段' open={visible} onCancel={() => setVisible(false)} onOk={handleOk}>
        <Checkbox.Group options={allFields.map((field) => ({ label: field.fieldName, value: field.uniqueIdentifier }))} value={selectedFields} onChange={handleFieldChange} />
      </Modal>
      {/* <CollectsDrawer visible={collectsDrawerVisible} setVisiable={setCollectsDrawerVisible} ident={collectsDrawerIdent} /> */}
    </div>
  );
}
