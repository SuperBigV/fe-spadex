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
import { getModelInfo } from '@/services/manage';
import { TeamProps, Team, ActionType } from '@/store/manageInterface';
import { useTranslation, Trans } from 'react-i18next';
import { debounce } from 'lodash';
import { CommonStateContext } from '@/App';

const { Option } = Select;
const TeamForm = React.forwardRef<ReactNode, TeamProps>((props, ref) => {
  const { siteInfo } = useContext(CommonStateContext);
  const { t } = useTranslation('deviceModel');
  const { businessId, action } = props;
  const [form] = Form.useForm();
  const [userTeam, setUserTeam] = useState<Team[]>([]);
  const [initialValues, setInitialValues] = useState({
    name: '',
    typ: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refresh, setRefresh] = useState(true);
  const deviceTypes = [
    {
      value: 'host_server',
      label: '服务器',
    },
    {
      value: 'net_firewall',
      label: '防火墙',
    },
    {
      value: 'net_router',
      label: '路由器',
    },
    {
      value: 'net_switch',
      label: '交换机',
    },
    {
      value: 'new_ap',
      label: '无线AP',
    },
    {
      value: 'host_store',
      label: '存储设备',
    },
  ];
  useImperativeHandle(ref, () => ({
    form: form,
  }));

  useEffect(() => {
    if (businessId && action === ActionType.EditModel) {
      getModelInfoDetail(businessId);
    } else {
      setLoading(false);
    }
  }, []);

  const getModelInfoDetail = (id: number) => {
    getModelInfo(id).then((data: { name: string; typ: string }) => {
      setInitialValues({
        name: data.name,
        typ: data.typ,
      });
      setLoading(false);
    });
  };

  return !loading ? (
    <Form layout='vertical' form={form} initialValues={initialValues} preserve={false}>
      {action !== ActionType.AddBusinessMember && (
        <>
          <Form.Item
            label={t('model.name')}
            name='name'
            rules={[
              {
                required: true,
              },
            ]}
            tooltip={
              siteInfo?.businessGroupDisplayMode === 'list' ? undefined : (
                <Trans
                  ns='deviceModel'
                  i18nKey='model.name_tip'
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
          <Form.Item
            label={'设备类型'}
            name='typ'
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select>
              {deviceTypes.map((item) => (
                <Option value={item.value} key={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}
    </Form>
  ) : null;
});
export default TeamForm;
