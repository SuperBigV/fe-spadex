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
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Button, Input, Table, Space, message, Popconfirm, Tabs } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import moment from 'moment';
import DocumentDrawer from '@/components/DocumentDrawer';
import { getAuthConfigs } from './services';
import { TabPans, AuthConfig, RASConfig, AuthTypes } from './types';
import { Encrypt, Decrypt } from '@/utils/des';
import FormModal from './FormModal';
import { postAuthConfigs, putAuthConfigs, deleteAuthConfigs, getAuthConfig } from './services';
import './locale';

export default function index() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<AuthConfig[]>([]);
  const [authType, setAuthType] = useState('1');
  const { t } = useTranslation('authConfigs');
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  useEffect(() => {
    reload();
  }, [refreshFlag]);

  const reload = () => {
    getAuthConfigs().then((res) => {
      if (res) {
        for (let i = 0; i < res.length; i++) {
          if (res[i].password) {
            res[i].password = Decrypt(res[i].password);
          }
        }
        setData(res);
      }
    });
  };
  return (
    <PageLayout title={<Space>{'凭证管理'}</Space>} icon={<SettingOutlined />}>
      <div
        className='n9e-border-base'
        style={{
          padding: 16,
        }}
      >
        <div
          className='mb8'
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Input
            placeholder={'输入名称或凭证类型搜索'}
            style={{ width: 300 }}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
          <Button
            type='primary'
            onClick={() => {
              FormModal({
                title: t('common:btn.create'),
                visiable: true,
                ot: 'create',
                onOk: (values) => {
                  return postAuthConfigs(values).then(() => {
                    // fetchData();
                    setRefreshFlag(_.uniqueId('refreshFlag_'));
                    message.success(t('common:success.create'));
                  });
                },
              });
            }}
          >
            {t('common:btn.create')}
          </Button>
        </div>
        <Table
          className='mt8'
          rowKey='id'
          size='small'
          columns={[
            {
              dataIndex: 'name',
              title: '名称',
            },
            {
              dataIndex: 'auth_type',
              title: '凭证类型',
              ellipsis: true,
              render: (val, record) => {
                return AuthTypes.find((item) => item.value === record.auth_type)?.label;
              },
            },
            {
              dataIndex: 'password',
              title: '密码',
              ellipsis: true,
              render: (val, record) => {
                return '******';
              },
            },

            {
              dataIndex: 'create_by',
              title: '创建人',
            },
            // {
            //   dataIndex: 'username',
            //   title: '用户名',
            // },
            // {
            //   dataIndex: 'password',
            //   title: '密码',
            //   ellipsis: true,
            //   render: (val, record) => {
            //     return '******';
            //   },
            // },
            // {
            //   dataIndex: 'port',
            //   title: '端口',
            // },
            {
              title: t('common:table.operations'),
              width: 140,
              render: (record) => {
                return (
                  <Space>
                    {/* <Popconfirm title={authSecret} showCancel={false} okText='ok'>
                    <Button
                      disabled={record.version === 'premiss'}
                      size='small'
                      type='link'
                      danger
                      style={{ padding: 0 }}
                      onClick={() => {
                        getAuthConfig(record.id).then((res) => {
                          setAuthSecret(res.decval);
                        });
                      }}
                    >
                      {t('密码')}
                    </Button>
                  </Popconfirm> */}
                    <Button
                      size='small'
                      type='link'
                      style={{ padding: 0 }}
                      onClick={() => {
                        FormModal({
                          title: t('common:btn.edit'),
                          data: record,
                          visiable: true,
                          ot: 'edit',
                          onOk: (values) => {
                            return putAuthConfigs(record.id, values).then(() => {
                              setRefreshFlag(_.uniqueId('refreshFlag_'));
                              message.success(t('common:success.edit'));
                            });
                          },
                        });
                      }}
                    >
                      {t('common:btn.edit')}
                    </Button>
                    <Popconfirm
                      title={t('common:confirm.delete')}
                      onConfirm={() => {
                        deleteAuthConfigs(record.id).then(() => {
                          message.success(t('common:success.delete'));
                          setRefreshFlag(_.uniqueId('refreshFlag_'));
                        });
                      }}
                    >
                      <Button disabled={record.version === 'premiss'} size='small' type='link' danger style={{ padding: 0 }}>
                        {t('common:btn.delete')}
                      </Button>
                    </Popconfirm>
                  </Space>
                );
              },
            },
          ]}
          dataSource={_.filter(data, (item) => {
            if (search) {
              return _.includes(item.name, search) || _.includes(item.auth_type, search);
            }
            return true;
          })}
        />
      </div>
    </PageLayout>
  );
}
