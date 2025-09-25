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
import React, { useState, useEffect, useContext } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Button, Spin, Row, Col, Card, Alert, message, Table, Space, Tag, Input, Popconfirm } from 'antd';
import { RollbackOutlined, SearchOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import { getRoom, getRacks, putRack, deleteRack, postRack } from './services';
import { Rack } from './types';
import RackModal from './RackModal';

const Add = (props: any) => {
  const { t } = useTranslation('authConfigs');
  const history = useHistory();
  const query = queryString.parse(_.get(props, 'location.search'));
  const [data, setData] = useState<Rack[]>([]);
  const [search, setSearch] = useState('');
  const [roomObj, setRoomObj] = useState<any>({});

  useEffect(() => {
    getRoom(query.id).then((res) => {
      setRoomObj(res);
      setData(res.racks);
    });
  }, []);
  function fetchData() {
    getRacks().then((res) => {
      setData(res);
    });
  }
  return (
    <PageLayout
      title={
        <>
          <RollbackOutlined className='back' onClick={() => history.push('/rooms')} />
          {roomObj?.name}
        </>
      }
    >
      <div style={{ display: 'flex' }}>
        <div className='n9e-border-base p2' style={{ flex: 1 }}>
          <Row>
            <Col span={16} className='mb10'>
              <Input
                style={{ width: 200, marginRight: 10 }}
                prefix={<SearchOutlined />}
                placeholder={'请输入机柜编号'}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <Button
                type='primary'
                onClick={() => {
                  RackModal({
                    title: t('common:btn.create'),
                    visiable: true,
                    onOk: (values) => {
                      return postRack(values).then(() => {
                        fetchData();
                        values.room_id = roomObj.id;
                        message.success(t('common:success.create'));
                      });
                    },
                  });
                }}
              >
                {'创建机柜'}
              </Button>
            </Col>
          </Row>
          <Table
            className='mt8'
            rowKey='id'
            size='small'
            columns={[
              {
                dataIndex: 'unicode',
                title: '机柜编号',
              },
              {
                dataIndex: 'u',
                title: '机柜容量(U)',
              },
              {
                dataIndex: 'idelU',
                title: '可用容量(U)',
              },
              {
                dataIndex: 'devices',
                title: '设备数量',
                ellipsis: true,
                render: (record) => {
                  if (record) {
                    return record.length;
                  }
                  return 0;
                },
              },
              {
                title: '操作',
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
                          RackModal({
                            title: t('common:btn.edit'),
                            data: record,
                            visiable: true,
                            onOk: (values) => {
                              return putRack(record.id, values).then(() => {
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
                          deleteRack(record.id).then(() => {
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
                return _.includes(item.unicode, search);
              }
              return true;
            })}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default Add;
