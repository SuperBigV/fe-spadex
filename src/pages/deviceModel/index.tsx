/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import _ from 'lodash';
import classNames from 'classnames';
import PageLayout, { HelpLink } from '@/components/pageLayout';
import { Button, Table, Input, message, Row, Col, Modal, Space } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import UserInfoModal from './component/createModal';
import { getModelTeamList, getModelInfo, deleteModel, deleteModelMetric } from '@/services/manage';
import { User, Team, UserType, ActionType, TeamInfo } from '@/store/manageInterface';
import { CommonStateContext } from '@/App';
import { ColumnsType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@/utils';
import { listToTree, getCollapsedKeys, getLocaleExpandedKeys, setLocaleExpandedKeys, getDefaultModel } from '@/components/ModelGroup';
import Tree from '@/components/BusinessGroup/components/Tree';
import '@/components/BlankBusinessPlaceholder/index.less';
import './index.less';
import './locale';

const { confirm } = Modal;
export const PAGE_SIZE = 5000;

const Resource: React.FC = () => {
  const { setModelGroups, siteInfo, setModelGroup } = useContext(CommonStateContext);
  const { t } = useTranslation('deviceModel');
  const urlQuery = useQuery();
  const id = urlQuery.get('id');
  const [visible, setVisible] = useState<boolean>(false);
  const [action, setAction] = useState<ActionType>();
  const [modelId, setmodelId] = useState<string>(id || '');
  const [metricList, setMetricList] = useState<{ metric: any }[]>([]);
  const [modelInfo, setModelInfo] = useState<{ name: string; id: number; typ: string; create_by: string; create_at: number }>();
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [currentMetric, setCurrentMetric] = useState<{ id: string }>();
  const [memberLoading, setMemberLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [operTyp, setOperTyp] = useState<string>('deviceModel');
  const [searchMemberValue, setSearchMemberValue] = useState<string>('');
  const metricColumns: ColumnsType<any> = [
    {
      title: '指标名称',
      dataIndex: ['metric', 'name'],
      ellipsis: true,
    },
    {
      title: 'Oid',
      dataIndex: 'oid',
    },
    {
      title: '说明',
      dataIndex: ['metric', 'note'],
      ellipsis: true,
    },
    {
      title: t('common:table.operations'),
      width: '120px',
      render: (text: string, record) => (
        <>
          <Button
            type='link'
            onClick={() => {
              setCurrentMetric(record.id);
              handleClick(ActionType.EditModelMetric);
            }}
          >
            编辑
          </Button>
          <Button
            type='link'
            onClick={() => {
              confirm({
                title: t('common:confirm.delete'),
                onOk: () => {
                  deleteModelMetric(record.id).then(() => {
                    message.success(t('common:success.delete'));
                    getTeamList();
                  });
                },
                onCancel: () => {},
              });
            }}
          >
            {t('common:btn.delete')}
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    modelId && getModelInfoDetail(modelId);
  }, [modelId]);

  // useEffect(() => {
  //   getTeamList();
  // }, []);

  useEffect(() => {
    getTeamList();
  }, []);

  const getList = (action) => {
    getTeamList(undefined, action === 'delete');
  };

  // 获取业务组列表
  const getTeamList = (search?: string, isDelete?: boolean) => {
    let params = {
      query: search,
      limit: PAGE_SIZE,
    };
    getModelTeamList(params).then((data) => {
      setTeamList(_.sortBy(data.dat, (item) => _.lowerCase(item.name)));
      if (
        (!modelId ||
          isDelete ||
          _.every(data.dat, (item) => {
            return _.toNumber(item.id) !== _.toNumber(modelId);
          })) &&
        data.dat.length > 0
      ) {
        setmodelId(data.dat[0].id);
      } else {
        modelId && getModelInfoDetail(modelId);
      }
      setModelGroups(data.dat || []);
      setModelGroup(getDefaultModel(data.dat));
    });
  };

  // 获取型号组详情
  const getModelInfoDetail = (id: string) => {
    setMemberLoading(true);
    getModelInfo(Number(id)).then((data) => {
      setModelInfo(data);
      setMetricList(data.metrics);
      setMemberLoading(false);
    });
  };
  const handleSearch = (query?: string) => {
    getModelInfo(Number(modelId)).then((data) => {
      let metrics = data.metrics;
      const filteredData = metrics.filter((item) => item.metric.name.includes(query));
      setMetricList(filteredData);
    });
  };

  const handleClick = (type: ActionType) => {
    switch (type) {
      case ActionType.AddModelMetric:
        setOperTyp('modelMetric');
        break;
      case ActionType.EditModelMetric:
        setOperTyp('modelMetric');
        break;
      default:
        setOperTyp('deviceModel');
        break;
    }
    setAction(type);
    setVisible(true);
  };
  // 弹窗关闭回调
  const handleClose = (action) => {
    setVisible(false);
    if (['create', 'delete', 'update', 'add'].includes(action)) {
      getList(action);
    }
  };

  return (
    <PageLayout title={<Space>{t('model.title')}</Space>} icon={<UserOutlined />}>
      <div className='user-manage-content'>
        <div style={{ display: 'flex', gap: 10, height: '100%', background: 'unset' }}>
          <div className='left-tree-area'>
            <div className='sub-title'>
              {t('model.list')}
              <Button
                style={{
                  height: '30px',
                }}
                size='small'
                type='link'
                onClick={() => {
                  handleClick(ActionType.CreateModel);
                }}
              >
                {t('common:btn.add')}
              </Button>
            </div>
            <div style={{ display: 'flex', margin: '5px 0px 12px' }}>
              <Input
                prefix={<SearchOutlined />}
                placeholder={t('model.search_placeholder')}
                onPressEnter={(e: any) => {
                  getTeamList(e.target.value);
                }}
                onBlur={(e: any) => {
                  getTeamList(e.target.value);
                }}
              />
            </div>
            {siteInfo?.businessGroupDisplayMode == 'list' ? (
              <div className='radio-list' style={{ overflowY: 'auto' }}>
                {_.map(teamList, (item) => {
                  return (
                    <div
                      className={classNames({
                        'n9e-metric-views-list-content-item': true,
                        active: _.toNumber(item.id) === _.toNumber(modelId),
                      })}
                      key={item.id}
                      onClick={() => {
                        if (_.toNumber(item.id) !== _.toNumber(modelId)) {
                          setmodelId(item.id as any);
                        }
                      }}
                    >
                      <span className='name'>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='radio-list' style={{ overflowY: 'auto' }}>
                {!_.isEmpty(teamList) && (
                  <Tree
                    defaultExpandedKeys={getCollapsedKeys(listToTree(teamList as any, siteInfo?.businessGroupSeparator), getLocaleExpandedKeys(), modelId as any)}
                    selectedKeys={modelId ? [_.toString(modelId)] : []}
                    onSelect={(_selectedKeys, e: any) => {
                      const nodeId = e.node.id;
                      setmodelId(nodeId as any);
                    }}
                    onExpand={(expandedKeys: string[]) => {
                      setLocaleExpandedKeys(expandedKeys);
                    }}
                    treeData={listToTree(teamList as any, siteInfo?.businessGroupSeparator)}
                  />
                )}
              </div>
            )}
          </div>
          {teamList.length > 0 ? (
            <div className='resource-table-content'>
              <Row className='team-info'>
                <Col
                  span='24'
                  style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'inline',
                  }}
                >
                  {modelInfo && modelInfo.name}
                  <EditOutlined
                    style={{
                      marginLeft: '8px',
                      fontSize: '14px',
                    }}
                    onClick={() => handleClick(ActionType.EditModel)}
                  ></EditOutlined>
                  <DeleteOutlined
                    style={{
                      marginLeft: '8px',
                      fontSize: '14px',
                    }}
                    onClick={() => {
                      confirm({
                        title: t('common:confirm.delete'),
                        onOk: () => {
                          deleteModel(modelId).then((_) => {
                            message.success(t('common:success.delete'));
                            handleClose('delete');
                          });
                        },
                        onCancel: () => {},
                      });
                    }}
                  />
                </Col>
                <Col
                  style={{
                    marginTop: '8px',
                    // color: '#666',
                  }}
                >
                  <Space>
                    <span>ID：{modelInfo?.id}</span>
                    <span>设备类型：{modelInfo?.typ === 'switch' ? '交换机' : modelInfo?.typ === 'server' ? '服务器' : modelInfo?.typ === 'store' ? '存储' : '未知设备类型'}</span>
                    {/* <span>
                      {t('common:table.note')}：{t('model.note_content')}
                    </span> */}
                    <span>
                      {t('common:table.create_by')}：{modelInfo?.create_by ? modelInfo.create_by : '-'}
                    </span>
                    <span>
                      {t('common:table.create_at')}：{modelInfo?.create_at ? moment.unix(modelInfo.create_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
                    </span>
                  </Space>
                </Col>
              </Row>
              <Row justify='space-between' align='middle'>
                <Col span='12'>
                  <Input
                    prefix={<SearchOutlined />}
                    className={'searchInput'}
                    onPressEnter={(e: any) => {
                      handleSearch(e.target.value);
                    }}
                    placeholder={t('model.oid_search_placeholder')}
                  />
                </Col>
                <Button
                  type='primary'
                  onClick={() => {
                    handleClick(ActionType.AddModelMetric);
                  }}
                >
                  {t('model.add_metric')}
                </Button>
              </Row>

              <Table
                className='mt8'
                size='small'
                rowKey='id'
                columns={metricColumns}
                dataSource={metricList && metricList.length > 0 ? metricList.filter((item) => item) : []}
                loading={memberLoading}
              />
            </div>
          ) : (
            // dataSource={metricList && metricList.length > 0 ? metricList.filter((item) => item.user_group && item.user_group.name.indexOf(searchMemberValue) !== -1) : []}
            <div className='blank-busi-holder'>
              <p style={{ textAlign: 'left', fontWeight: 'bold' }}>
                <InfoCircleOutlined style={{ color: '#1473ff' }} /> {t('Tips')}
              </p>
              <p>
                {t('business.empty')}&nbsp;
                <a onClick={() => handleClick(ActionType.CreateModel)}>{t('model.create')}</a>
              </p>
            </div>
          )}
        </div>
      </div>
      <UserInfoModal
        visible={visible}
        action={action as ActionType}
        userType={operTyp}
        modelType={modelInfo?.typ}
        modelMetricId={currentMetric}
        onClose={handleClose}
        teamId={Number(modelId)}
        onSearch={(val) => {
          setmodelId(val);
        }}
      />
    </PageLayout>
  );
};

export default Resource;
