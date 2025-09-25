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
import React, { useEffect, useState, useImperativeHandle, ReactNode } from 'react';
import { Form, Input, Select, Space } from 'antd';
import { getUserInfo, getModelMetricInfoDetail, getBuiltinMetrics } from '@/services/manage';
import { ModelMetricFormProps, ContactsItem, User } from '@/store/manageInterface';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';

const { Option } = Select;
const UserForm = React.forwardRef<ReactNode, ModelMetricFormProps>((props, ref) => {
  // const { t } = useTranslation();
  const { modelMetricId, modelType, action } = props;
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState<{ id: string; metric_id: string; oid: string; method: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [builtInMetricList, setBuiltInMetricList] = useState<{ id: number; name: string; note: string }[]>([]);
  const methodList = [
    {
      name: 'Walk',
      note: '用snmpwalk获取数据的oid',
    },
    {
      name: 'Get',
      note: '使用snmpget可以获取到值的oid',
    },
  ];
  useImperativeHandle(ref, () => ({
    form: form,
  }));

  useEffect(() => {
    if (modelMetricId) {
      getModelMetricInfo(modelMetricId);
    } else {
      setLoading(false);
    }
    getBuiltinMetrics({ typ: 'SNMP', limit: 2000 }).then((res) => setBuiltInMetricList(res));
  }, []);

  const getModelMetricInfo = (id: string) => {
    getModelMetricInfoDetail(id).then((data: { metric_id: string; oid: string; method: string }) => {
      console.log(data.oid);
      setInitialValues({
        id: id,
        metric_id: data.metric_id,
        oid: data.oid,
        method: data.method,
      });
      setLoading(false);
    });
  };

  return !loading ? (
    <Form layout='vertical' form={form} initialValues={initialValues} preserve={false}>
      <Form.Item
        label={'指标'}
        name='metric_id'
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select>
          {builtInMetricList.map((item, index) => (
            <Option value={item.id} key={index}>
              <div>
                <div>{item.name}</div>
                <div style={{ color: '#8c8c8c' }}>{item.note}</div>
              </div>
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label={'oid'} name='oid'>
        <Input />
      </Form.Item>
      <Form.Item label={'查询方法'} name='method'>
        <Select>
          {methodList.map((item, index) => (
            <Option value={item.name} key={index}>
              <div>
                <div>{item.name}</div>
                <div style={{ color: '#8c8c8c' }}>{item.note}</div>
              </div>
            </Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  ) : null;
});
export default UserForm;
