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
import React, { useContext, useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Table, Row, Col, Input, Select, Button, Space, message, Popconfirm } from 'antd';
import { SearchOutlined, CodeOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { postRoom, putRoom, deleteRoom } from './services';
import { getRooms } from '@/services/manage';
import PageLayout, { HelpLink } from '@/components/pageLayout';
import FormModal from './FormModal';
import { Room } from './types';

const index = (_props: any) => {
  const [search, setSearch] = useState('');
  const history = useHistory();
  const { t, i18n } = useTranslation('common');
  const [data, setData] = useState<Room[]>([]);
  function fetchData() {
    getRooms().then((res) => {
      setData(res);
    });
  }
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <PageLayout icon={<CodeOutlined />} title={<Space>{'机房管理'}</Space>}>
      <div style={{ display: 'flex' }}>
        {
          <div className='n9e-border-base p2' style={{ flex: 1 }}>
            <Row>
              <Col span={16} className='mb10'>
                <Input
                  style={{ width: 200, marginRight: 10 }}
                  prefix={<SearchOutlined />}
                  placeholder={'机房名称'}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
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
                <Button
                  type='primary'
                  onClick={() => {
                    FormModal({
                      title: t('common:btn.create'),
                      visiable: true,
                      onOk: (values) => {
                        return postRoom(values).then(() => {
                          fetchData();
                          message.success(t('common:success.create'));
                        });
                      },
                    });
                  }}
                >
                  {'创建机房'}
                </Button>
              </Col>
            </Row>
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
                  dataIndex: 'location',
                  title: '位置',
                },
                {
                  dataIndex: 'racks',
                  title: '机柜数量',
                  ellipsis: true,
                  render: (record) => {
                    if (record) {
                      return record.length;
                    }
                    return 0;
                  },
                },
                {
                  title: t('common:table.operations'),
                  width: 140,
                  render: (record) => {
                    return (
                      <Space>
                        <Button
                          size='small'
                          type='link'
                          style={{ padding: 0 }}
                          onClick={() => {
                            history.push(`/room-rack/add?id=${record.id}`);
                          }}
                        >
                          {'配置机柜'}
                        </Button>
                        <Button
                          size='small'
                          type='link'
                          style={{ padding: 0 }}
                          onClick={() => {
                            FormModal({
                              title: t('common:btn.edit'),
                              data: record,
                              visiable: true,
                              onOk: (values) => {
                                return putRoom(record.id, values).then(() => {
                                  fetchData();
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
                            deleteRoom(record.id).then(() => {
                              message.success(t('common:success.delete'));
                              fetchData();
                            });
                          }}
                        >
                          <Button size='small' type='link' danger style={{ padding: 0 }}>
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
                  return _.includes(item.name, search);
                }
                return true;
              })}
            />
          </div>
        }
      </div>
    </PageLayout>
  );
};

export default index;
