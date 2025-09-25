import React, { useEffect, useState, useRef } from 'react';
import { Table, Spin, message, Dropdown, Menu, Modal, Popconfirm, Button, Row, Col, Input, Image, Tooltip, Space } from 'antd';
import { MoreOutlined, SearchOutlined, DownOutlined } from '@ant-design/icons';
import { getColumnsByGid, getGidDetail, getByGidAssetsList, addAsset, editAsset, targetControlPost, getTargetPassword } from './services'; // 假设这两个函数用于获取表格列和数据
import _, { set } from 'lodash';
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
export const pageSizeOptions = ['10', '20', '50', '100'];
export default function AssetList(props: IProps) {
  const { t } = useTranslation('asset');
  const { isLeaf, gids, setOperateType, setSelectedRows, refreshFlag, selectedRows, isShowOperator } = props;
  const [columns, setColumns] = useState<any[]>([]);
  const [formFields, setFormFields] = useState<any[]>([]);
  // const [data, setData] = useState<any[]>([]);
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [targetPassword, setTargetPassword] = useState('');
  const [tableQueryContent, setTableQueryContent] = useState<string>('');
  const [searchVal, setSearchVal] = useState('');
  const [controlVisible, setControlVisible] = useState(false);
  const [controlAction, setControlAction] = useState<ControlType>();
  const [iconOptions, setIconOptions] = useState<{ name: string; id: number; src: string }[]>([]);
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [busiOptions, setBusiOptions] = useState<any[]>([]);
  const [authOptions, setAuthOptions] = useState<any[]>([]);
  const [rackOptions, setRackOptions] = useState<any[]>([]);
  const [roomOptions, setRoomOptions] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [open, setOpen] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  // const [isShowOperator, setIsShowOperator] = useState(false);
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
      res.list.map((item) => {
        item.data.id = item.id;
        item.data.status = item.status;
        item.data.belong_room = item.belong_room;
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
  const handleClick = (action, asset) => {
    setSelectedAsset(asset);
    setControlAction(action);
    // setControlVisible(true);
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
      const iconOptions = await getIconsByGrpId(_.toNumber(gids) || 0);
      let params = {
        limit: 1000,
      };
      const modelOptions = await getModelTeamList(params);
      const options1 = modelOptions.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setModelOptions(options1);

      const busiOptions = await getBusiGroups();
      const options2 = busiOptions.dat.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setBusiOptions(options2);
      const authOptions = await getAuthConfigs();
      const options3 = authOptions.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setAuthOptions(options3);
      const columnsResponse = await getColumnsByGid(gids?.toString() || '');
      const tableColumns = columnsResponse.filter((item) => item.fields);
      setFormFields(tableColumns);
      // const allFields = columnsResponse.map((item) => item.fields);
      const allFields = columnsResponse
        .filter((item) => item.fields)
        .reduce((acc, item) => {
          return acc.concat(item.fields);
        }, []);
      const columns = allFields
        .filter((field) => field.isShow)
        .map((item) => {
          if (item.uniqueIdentifier === 'model') {
            return {
              title: item.fieldName,
              dataIndex: item.uniqueIdentifier,
              key: item.id,
              render: (text, record) => {
                const model = modelOptions.find((model) => model.id === record.model);
                return <div>{model && model.name}</div>;
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
              render: (text, record) => {
                const model = busiOptions.dat.find((model) => model.id === record.busi);
                return <div>{model && model.name}</div>;
              },
            };
          }
          if (item.uniqueIdentifier === 'auth_snmp') {
            return {
              title: item.fieldName,
              dataIndex: item.uniqueIdentifier,
              key: item.id,
              render: (text, record) => {
                const model = authOptions.find((model) => model.id === record.auth_snmp);
                return <div>{model && model.name}</div>;
              },
            };
          }
          if (item.uniqueIdentifier === 'icon') {
            return {
              title: item.fieldName,
              dataIndex: item.uniqueIdentifier,
              key: item.id,
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
          if (item.uniqueIdentifier === 'name' || item.uniqueIdentifier === 'hostname') {
            return {
              key: item.id,
              title: item.fieldName,
              dataIndex: item.uniqueIdentifier,
              fieldType: item.fieldType,
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

          if (item.uniqueIdentifier === 'ip' || item.uniqueIdentifier === 'Eip') {
            return {
              key: item.id,
              title: item.fieldName,
              dataIndex: item.uniqueIdentifier,
              fieldType: item.fieldType,
              width: 160,
            };
          }

          if (
            item.uniqueIdentifier === 'CreationTime' ||
            item.uniqueIdentifier === 'ExpiredTime' ||
            item.uniqueIdentifier === 'CreateTime' ||
            item.uniqueIdentifier === 'ExpireTime' ||
            item.uniqueIdentifier === 'EndTime'
          ) {
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
          console.log('######', item);
          return {
            key: item.id,
            title: item.fieldName,
            dataIndex: item.uniqueIdentifier,
            fieldType: item.fieldType,
            width: 120,
            ellipsis: {
              showTitle: false,
            },
          };
        });

      setColumns(columns);

      columns.push({
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render(text, reocrd) {
          let result = '正常';
          if (text === '') return <Unknown />;
          let backgroundColor = RED_COLOR;
          if (text === 'normal') {
            backgroundColor = GREEN_COLOR;
            result = '正常';
          }
          if (text === 'maintain') {
            backgroundColor = YELLOW_COLOR;
            result = '维护';
          }
          if (text === 'offline') {
            backgroundColor = RED_COLOR;
            result = '下线';
          }

          return (
            <div
              className='table-td-fullBG'
              style={{
                backgroundColor: backgroundColor,
              }}
            >
              {result}
            </div>
          );
        },
      });
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
                {/* {row.category === '虚拟机' && (
                <Button
                  size='small'
                  type='link'
                  style={{ padding: 0 }}
                  onClick={() => {
                    history.push(`/ident/${row.id}/${row.name}/terminal/${row.category}`);
                  }}
                >
                  {'远程连接'}
                </Button>
              )}
              {row.category === '交换机' && (
                <Button
                  size='small'
                  type='link'
                  style={{ padding: 0 }}
                  onClick={() => {
                    history.push(`/ident/${row.id}/${row.name}/terminal/${row.category}`);
                  }}
                >
                  {'远程连接'}
                </Button>
              )}
              {row.category === '物理机' && (
                <Button
                  size='small'
                  type='link'
                  style={{ padding: 0 }}
                  onClick={() => {
                    history.push(`/ident/${row.id}/${row.name}/terminal/${row.category}`);
                  }}
                >
                  {'远程连接'}
                </Button>
              )}
              {row.category === '云主机' && (
                <Button
                  size='small'
                  type='link'
                  style={{ padding: 0 }}
                  onClick={() => {
                    history.push(`/ident/${row.id}/${row.name}/terminal/${row.category}`);
                  }}
                >
                  {'远程连接'}
                </Button>
              )} */}

                <Dropdown
                  overlay={
                    <Menu>
                      <>
                        {/* <Menu.Item onClick={() => handleClick(ControlType.Restart, row)}>
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
                        </Menu.Item> */}
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
  // useEffect(() => {

  // }, []);

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
                          return addAsset(gids, values).then(() => {
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
      {/* <CollectsDrawer visible={collectsDrawerVisible} setVisiable={setCollectsDrawerVisible} ident={collectsDrawerIdent} /> */}
    </div>
  );
}
