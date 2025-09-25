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
import { Button, Input, Table, Space, message, Popconfirm, Drawer, Descriptions, Avatar, Tooltip } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import { postSubnet, deleteSubnet, putSubnet, getSubnets, getSubnetDetail } from './services';
import { Subnet } from './types';
import FormModal from './FormModal';
import './locale';

export default function index() {
  const { t, i18n } = useTranslation('variableConfigs');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<Subnet[]>([]);
  const [subnetData, setSubnetData] = useState<Subnet>();
  const [visible, setVisible] = useState(false);
  const fetchData = () => {
    getSubnets().then((res) => {
      setData(res);
    });
  };
  const showDrawer = (item: Subnet) => {
    getSubnetDetail(item.id).then((res) => {
      setSubnetData(res);
    });
    setSubnetData(item);
    setVisible(true);
  };
  const sortedIps = subnetData?.ips?.sort((a, b) => {
    const lastOctetA = parseInt(a.ip.split('.').pop() || '0', 10);
    const lastOctetB = parseInt(b.ip.split('.').pop() || '0', 10);
    return lastOctetA - lastOctetB; // 从小到大排序
  });
  const usedCount = subnetData?.ips?.filter((ip) => ip.status === 'used').length || 0;
  const unusedCount = subnetData?.ips?.filter((ip) => ip.status === 'unused').length || 0;
  const freeCount = subnetData?.ips?.filter((ip) => ip.status === 'free').length || 0;
  useEffect(() => {
    fetchData();
  }, []);
  const onClose = () => {
    setVisible(false);
  };
  return (
    <PageLayout title={<Space>{t('IP管理')}</Space>} icon={<SettingOutlined />}>
      <div>
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
              placeholder={t('输入网段地址或备注信息')}
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
                  typ: 'create',
                  title: t('common:btn.create'),
                  onOk: (values) => {
                    return postSubnet(values).then(() => {
                      fetchData();
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
                dataIndex: 'addr',
                title: t('子网地址'),
                width: 120,
              },
              {
                dataIndex: 'mask',
                width: 80,
                title: t('掩码位数'),
              },
              {
                dataIndex: 'netmask',
                width: 120,
                title: t('子网掩码'),
              },
              {
                dataIndex: 'ips',
                title: '有效IP数量',
                width: 100,
                render: (text, record) => {
                  // return <span style={{ color: 'green' }}>{record.ips.length}</span>;
                  return <div className='table-td-fullBG'>{record.ips?.length}</div>;
                },
              },
              {
                dataIndex: 'ips',
                title: '已用IP数量',
                width: 100,
                render: (text, record) => {
                  // return <span style={{ color: 'green' }}>{record.ips.length}</span>;
                  return <div className='table-td-fullBG'>{record?.ips?.filter((ip) => ip.status === 'used').length || 0}</div>;
                },
              },
              {
                dataIndex: 'ips',
                title: '可用IP数量',
                width: 100,
                render: (text, record) => {
                  // return <span style={{ color: 'green' }}>{record.ips.length}</span>;
                  return <div className='table-td-fullBG'>{record?.ips?.filter((ip) => ip.status === 'unused').length || 0}</div>;
                },
              },
              {
                dataIndex: 'ips',
                title: '游离IP数量',
                width: 100,
                render: (text, record) => {
                  // return <span style={{ color: 'green' }}>{record.ips.length}</span>;
                  return <div className='table-td-fullBG'>{record?.ips?.filter((ip) => ip.status === 'free').length || 0}</div>;
                },
              },
              {
                title: t('创建人'),
                dataIndex: 'create_by',
                width: 60,
              },
              {
                title: t('描述'),
                dataIndex: 'note',
              },
              {
                title: t('common:table.operations'),
                width: 160,

                render: (record) => {
                  return (
                    <Space>
                      <Button
                        size='small'
                        type='link'
                        style={{ padding: 0 }}
                        onClick={() => {
                          showDrawer(record);
                        }}
                      >
                        {t('详情')}
                      </Button>
                      <Button
                        size='small'
                        type='link'
                        style={{ padding: 0 }}
                        onClick={() => {
                          FormModal({
                            title: t('common:btn.edit'),
                            data: record,
                            typ: 'edit',
                            onOk: (values) => {
                              return putSubnet(record.id, values).then(() => {
                                fetchData();
                                message.success(t('common:success.edit'));
                              });
                            },
                          });
                        }}
                      >
                        {t('编辑')}
                      </Button>
                      <Popconfirm
                        title={t('common:confirm.delete')}
                        onConfirm={() => {
                          deleteSubnet(record.id).then(() => {
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
                return _.includes(item.addr, search) || _.includes(item.note, search);
              }
              return true;
            })}
          />
        </div>
        <Drawer title='子网详情' size={'large'} placement='right' onClose={onClose} open={visible} width={800}>
          {/* 描述信息部分 */}
          <Descriptions>
            <Descriptions.Item label='子网地址'>{subnetData?.addr}</Descriptions.Item>
            <Descriptions.Item label='子网掩码'>{subnetData?.netmask}</Descriptions.Item>
            <Descriptions.Item label='子网位数'>{subnetData?.mask}</Descriptions.Item>
            <Descriptions.Item label='网络地址'>{subnetData?.network_addr}</Descriptions.Item>
            <Descriptions.Item label='广播地址'>{subnetData?.broadcast}</Descriptions.Item>
            <Descriptions.Item label='子网描述'>{subnetData?.note}</Descriptions.Item>
            <Descriptions.Item label='可用 IP 数量'>{subnetData?.ips?.length || 0}</Descriptions.Item>
          </Descriptions>

          {/* IP 使用状态部分 */}
          <h3 style={{ marginTop: '20px' }}>IP 使用状态</h3>
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
              <Avatar
                style={{
                  backgroundColor: 'green',
                  marginRight: '5px',
                  width: '15px',
                  height: '15px',
                }}
                size='small'
              />
              <Tooltip placement='top' title={'ping通,资产管理存在'}>
                <span>使用中: {usedCount}</span>
              </Tooltip>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
              <Avatar
                style={{
                  backgroundColor: 'orange',
                  marginRight: '5px',
                  width: '15px',
                  height: '15px',
                }}
                size='small'
              />
              <Tooltip placement='top' title={'ping不通,资产也不存在'}>
                <span>未使用: {unusedCount}</span>
              </Tooltip>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                style={{
                  backgroundColor: 'gray',
                  marginRight: '5px',
                  width: '15px',
                  height: '15px',
                }}
                size='small'
              />
              <Tooltip placement='top' title={'ping通,资产管理不存在'}>
                <span>游离: {freeCount}</span>
              </Tooltip>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {sortedIps?.map((item, index) => {
              const lastOctet = item.ip.split('.').pop(); // 获取IP地址最后一位
              return (
                <Tooltip placement='top' title={item.ip}>
                  <Avatar
                    key={index}
                    shape='square'
                    style={{
                      backgroundColor:
                        item.status === 'used'
                          ? 'green' // 当状态为 used 时显示绿色
                          : item.status === 'unused'
                          ? 'orange' // 当状态为 unused 时显示橙色
                          : 'gray', // 默认背景色（可选）
                      margin: '2.5px', // 每个Avatar间距5px
                      width: '30px', // 设置宽度
                      height: '30px', // 设置高度
                    }}
                    size='small'
                  >
                    {lastOctet}
                  </Avatar>
                </Tooltip>
              );
            })}
          </div>
        </Drawer>
      </div>
    </PageLayout>
  );
}
