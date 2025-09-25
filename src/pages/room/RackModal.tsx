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
import { Rack } from './types';

interface Props {
  data?: Rack;
  title: string;
  visiable?: boolean;
  onOk: (data: Rack) => Promise<void>;
}

function FormModal(props: Props & ModalWrapProps) {
  const { visiable, destroy, data, title, onOk } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      title={title}
      open={visiable}
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
        {/* <Form.Item
          name='name'
          label='名称'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input placeholder='请输入机柜名称' />
        </Form.Item> */}
        <Form.Item
          name='unicode'
          label='机柜编号'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input placeholder='请输入机柜唯一编号' />
        </Form.Item>
        <Form.Item
          name='u'
          label='容量'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input placeholder='请输入机柜容量(U数)' suffix='U' />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<Props>(FormModal);
