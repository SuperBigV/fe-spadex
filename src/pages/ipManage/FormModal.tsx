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

import React from 'react';
import { Form, Input, Modal, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { Subnet } from './types';
import Password from './components/Password';

interface Props {
  data?: Subnet;
  title: string;
  typ: string;
  onOk: (data: Subnet) => Promise<void>;
}

function FormModal(props: Props & ModalWrapProps) {
  const { t } = useTranslation('variableConfigs');
  const { visible, destroy, data, typ, title, onOk } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={() => {
        destroy();
      }}
      onOk={() => {
        form.validateFields().then((values) => {
          onOk(values).then(() => {
            destroy();
          });
        });
      }}
    >
      <Form form={form} initialValues={data} layout='vertical'>
        <Form.Item
          name='addr'
          label={t('子网地址')}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input disabled={typ === 'edit'} />
        </Form.Item>
        <Form.Item
          name='mask'
          label={t('掩码位数')}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input disabled={typ === 'edit'} placeholder={t('请输入子网位数,例如:24-32之间')} />
        </Form.Item>
        {/* <Form.Item
          name='vlan'
          label={t('子网掩码')}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item> */}

        <Form.Item name='note' label={t('子网描述')}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<Props>(FormModal);
