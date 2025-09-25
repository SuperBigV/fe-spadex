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
import { Form, Input, Modal, Switch, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { RsaEncry } from '@/utils/rsa';
import { Encrypt, Decrypt } from '@/utils/des';
import { AuthConfig, RASConfig, AuthTypes } from './types';
import Password from './components/Password';
const { Option } = Select;
interface Props {
  data?: AuthConfig;
  title: string;
  ot: string;
  visiable?: boolean;
  onOk: (data: AuthConfig) => Promise<void>;
}

function FormModal(props: Props & ModalWrapProps) {
  const { t } = useTranslation('variableConfigs');
  const { visiable, destroy, data, title, onOk, ot } = props;
  const [form] = Form.useForm();
  const [authType, setAuthType] = useState<any>('');
  useEffect(() => {
    if (!data) {
      if (authType === 'snmp') {
        form.setFieldsValue({
          port: 161,
          version: 'v2', // 默认版本为 v2
        });
      } else {
        form.setFieldsValue({
          port: 22, // SSH 的默认端口
        });
      }
    }
  }, [authType, form]);

  useEffect(() => {
    console.log('data:', data);
    if (ot === 'edit') {
      setAuthType(data?.auth_type);
    }
  }, [ot]);

  const handleAuthTypeChange = (value) => {
    setAuthType(value);
  };
  return (
    <Modal
      title={title}
      open={visiable}
      onCancel={() => {
        destroy();
      }}
      onOk={() => {
        form.validateFields().then((values) => {
          // const toBeEncrypted = values.toBeEncrypted;
          // values.encrypted = values.encrypted ? 1 : 0;
          // values.category = authType;
          // delete values.toBeEncrypted;
          // if (toBeEncrypted && values.encrypted === 1) {
          //   values.cval = RsaEncry(values.cval, rsaConfig.RSAPublicKey);
          // }
          console.log('###vaules:', values);
          if (values.password !== undefined) {
            values.password = Encrypt(values.password);
          }
          values.port = Number(values.port);
          onOk(values).then(() => {
            destroy();
          });
        });
      }}
    >
      <Form form={form} initialValues={data} layout='vertical'>
        <Form.Item
          name='name'
          label='名称'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='auth_type'
          rules={[
            {
              required: true,
            },
          ]}
          label='凭证类型'
        >
          <Select options={AuthTypes} onChange={handleAuthTypeChange}></Select>
        </Form.Item>
        {authType !== 'snmp' && authType !== '' && (
          <>
            <Form.Item
              name='username'
              label='账号'
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name='password'
              label='密码'
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name='port'
              rules={[
                {
                  required: true,
                },
              ]}
              label='端口'
            >
              <Input />
            </Form.Item>
          </>
        )}
        {authType === 'snmp' && (
          <>
            <Form.Item
              name='public'
              label='团体名'
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name='version'
              label='版本'
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name='port'
              rules={[
                {
                  required: true,
                },
              ]}
              label='端口'
            >
              <Input />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}

export default ModalHOC<Props>(FormModal);
