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
import React, { useEffect, useState, useImperativeHandle, ReactNode, useCallback, useContext } from 'react';
import { Form, Input, Select, Switch, Tag, Space, Button } from 'antd';
import { MinusCircleOutlined, PlusOutlined, CaretDownOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { getBusinessTeamInfo, getTeamInfoList, getUserInfoList } from '@/services/manage';
import { TeamProps, Team, ActionType } from '@/store/manageInterface';
import { useTranslation, Trans } from 'react-i18next';
import { debounce } from 'lodash';
import { CommonStateContext } from '@/App';
import { getAuthConfigs } from '@/pages/authConfigs/services';
import { getSuppliers, getMaintenanceList } from '@/services/partner';
const { Option } = Select;
const TeamForm = React.forwardRef<ReactNode, TeamProps>((props, ref) => {
  const { siteInfo } = useContext(CommonStateContext);
  const { t } = useTranslation('user');
  const { businessId, action, grp_type } = props;
  const [form] = Form.useForm();
  const [userTeam, setUserTeam] = useState<Team[]>([]);
  const [opserOptions, setOpserOptions] = useState([]);
  const [maintenerOptions, setMaintenerOptions] = useState([]);
  const [users, setUsers] = useState<any>([]);
  const [initialValues, setInitialValues] = useState({
    members: [{ perm_flag: true }],
    attr: { soft_type: 'business' },
    name: '',
    // is_collection_enabled: false,
    // process_name: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refresh, setRefresh] = useState(true);
  // 状态用于控制进程采集开关
  const [isProcessCollectionEnabled, setIsProcessCollectionEnabled] = useState(false);
  const [isLogCollectionEnabled, setIsLogCollectionEnabled] = useState(false);
  const [isMetricCollectionEnabled, setIsMetricCollectionEnabled] = useState(false);
  const [currentSoftType, setCurrentSoftType] = useState('business');
  const [authOptions, setAuthOptions] = useState<any>([]);
  useImperativeHandle(ref, () => ({
    form: form,
  }));
  const getAuthConfig = async () => {
    const authOptions = await getAuthConfigs();
    const options = authOptions.map((item) => ({
      label: item.name,
      value: item.id + ' ' + item.auth_type + ' ' + item.username + ' ' + item.password + ' ' + item.port,
    }));
    setAuthOptions(options);
  };
  useEffect(() => {
    getAuthConfig();
    if (businessId && action === ActionType.EditBusiness) {
      getTeamInfoDetail(businessId);
    } else {
      setLoading(false);
    }
  }, []);
  const changeSoftType = (value: string) => {
    setCurrentSoftType(value);
    // console.log('softType:', value);
  };
  const getTeamInfoDetail = (id: number) => {
    getBusinessTeamInfo(id).then(
      (data: {
        name: string;
        is_collection_enabled: boolean;
        // processName: string;
        // opsUnit: number;
        // maintainUnit: number;
        attr: any;
        user_groups: { perm_flag: string; user_group: { id: number } }[];
      }) => {
        setIsProcessCollectionEnabled(data.attr.is_collection_enabled);
        setIsMetricCollectionEnabled(data.attr.is_metric_collection_enabled);
        if (data.attr.auth) {
          setCurrentSoftType(data.attr.auth.soft_type);
        }
        setInitialValues({
          name: data.name,
          attr: data.attr,
          members: data.user_groups.map((item) => ({
            perm_flag: item.perm_flag === 'rw',
            user_group_id: item.user_group?.id,
          })),
          // is_collection_enabled: data.is_collection_enabled,
          // process_name: data.processName,
        });
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    getList('');
  }, []);

  const getList = (str: string) => {
    getTeamInfoList({ query: str }).then((res) => {
      setUserTeam(res.dat);
    });
    getUserInfoList().then((res) => {
      setUsers(res.dat.list);
    });

    // 供应商
    const params = {
      page: 1,
      pageSize: 10000,
      keyword: undefined,
    };
    getSuppliers(params).then((res) => {
      const options = res.dat?.list.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setOpserOptions(options);
      // setOpserOptions(res.dat?.list || []);
    });
    getMaintenanceList(params).then((res) => {
      const options = res.dat?.list.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setMaintenerOptions(options);
    });
  };

  const debounceFetcher = useCallback(debounce(getList, 800), []);

  return !loading ? (
    <Form layout='vertical' form={form} initialValues={initialValues} preserve={false}>
      {action !== ActionType.AddBusinessMember && (
        <>
          <Form.Item
            label={t('分组类型')}
            rules={[
              {
                required: true,
              },
            ]}
            name={['attr', 'soft_type']}
          >
            <Select
              placeholder={'请选择分组类型'}
              onChange={changeSoftType}
              options={[
                { label: '业务软件', value: 'business' },
                { label: '数据库', value: 'database' },
                { label: '中间件', value: 'middleware' },
              ]}
            ></Select>
          </Form.Item>
          <Form.Item
            label={t('分组名称')}
            name='name'
            rules={[
              {
                required: true,
              },
            ]}
            tooltip={
              siteInfo?.businessGroupDisplayMode === 'list' ? undefined : (
                <Trans
                  ns='user'
                  i18nKey='business.name_tip'
                  components={{ 1: <br /> }}
                  values={{
                    separator: siteInfo?.businessGroupSeparator || '-',
                  }}
                />
              )
            }
          >
            <Input />
          </Form.Item>
          <Form.Item label={t('负责人')} name={['attr', 'manager']}>
            <Select placeholder={'请选择负责人'}>
              {users.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.nickname || item.username}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {currentSoftType === 'business' && (
            <Form.Item label={t('开发语言')} name={['attr', 'language']}>
              <Select
                placeholder={'请选择开发语言'}
                options={[
                  { label: 'Java', value: 'Java' },
                  { label: 'Golang', value: 'Golang' },
                  { label: 'Python', value: 'Python' },
                ]}
              ></Select>
            </Form.Item>
          )}
          {currentSoftType !== 'business' && (
            <Form.Item label={t('认证配置')} name={['attr', 'auth']}>
              <Select options={authOptions}></Select>
            </Form.Item>
          )}
          {/* 添加进程采集开关 */}
          <Form.Item label='进程采集' name={['attr', 'is_collection_enabled']}>
            <Switch checked={isProcessCollectionEnabled} onChange={setIsProcessCollectionEnabled} />
          </Form.Item>

          {/* 根据开关状态显示进程名称输入框 */}
          {isProcessCollectionEnabled && (
            <Form.Item label='进程名称' name={['attr', 'processName']} rules={[{ required: true, message: '请输入进程名称' }]}>
              <Input placeholder='输入软件系统进程名称' />
            </Form.Item>
          )}
          <Form.Item label='指标采集' name={['attr', 'is_metric_collection_enabled']}>
            <Switch checked={isMetricCollectionEnabled} onChange={setIsMetricCollectionEnabled} />
          </Form.Item>

          {/* 根据开关状态显示采集接口输入框 */}
          {isMetricCollectionEnabled && (
            <Form.Item label='采集接口' name={['attr', 'metricEndpoint']} rules={[{ required: true, message: '请输入采集接口' }]}>
              <Input placeholder='http://127.0.0.1/metrics' />
            </Form.Item>
          )}
          <Form.Item label='日志采集' name={['attr', 'is_log_collection_enabled']}>
            <Switch checked={isLogCollectionEnabled} onChange={setIsLogCollectionEnabled} />
          </Form.Item>

          {/* 根据开关状态显示进程名称输入框 */}
          {isLogCollectionEnabled && (
            <Form.Item label='日志路径' name={['attr', 'logPath']} rules={[{ required: true, message: '请输入日志路径' }]}>
              <Input placeholder='输入软件日志路径,自动采集软件日志，例如:/var/log/*.log' />
            </Form.Item>
          )}
          <Form.Item label={t('供应商')} name={['attr', 'opsUnit']}>
            <Select placeholder={'请选择采购供应商,软件告警时会带出采购供应商信息'} options={opserOptions}></Select>
          </Form.Item>
          <Form.Item label={t('维保单位')} name={['attr', 'maintainUnit']}>
            <Select placeholder={'请选择维保单位,软件告警时会带出维保单位信息'} options={maintenerOptions}></Select>
          </Form.Item>
        </>
      )}

      {(action === ActionType.CreateBusiness || action === ActionType.AddBusinessMember) && (
        <Form.Item required>
          <Form.List name='members'>
            {(fields, { add, remove }) => (
              <>
                <div className='mb8'>
                  <Space>
                    {t('business.team_name')}
                    <PlusCircleOutlined
                      onClick={() =>
                        add({
                          perm_flag: true,
                        })
                      }
                    />
                  </Space>
                </div>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
                    <Form.Item style={{ width: 450 }} {...restField} name={[name, 'user_group_id']} rules={[{ required: true, message: t('business.user_group_msg') }]}>
                      <Select
                        suffixIcon={<CaretDownOutlined />}
                        style={{ width: '100%' }}
                        filterOption={false}
                        onSearch={(e) => debounceFetcher(e)}
                        showSearch
                        onBlur={() => getList('')}
                      >
                        {userTeam.map((team) => (
                          <Option key={team.id} value={team.id}>
                            {team.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'perm_flag']}>
                      <Select
                        options={[
                          {
                            label: t('business.perm_flag_1'),
                            value: true,
                          },
                          {
                            label: t('business.perm_flag_0'),
                            value: false,
                          },
                        ]}
                      />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
              </>
            )}
          </Form.List>
        </Form.Item>
      )}
    </Form>
  ) : null;
});
export default TeamForm;
