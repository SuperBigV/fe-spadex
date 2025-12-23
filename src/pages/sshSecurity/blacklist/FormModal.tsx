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
import { Form, Input, Modal, Switch, Select, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { getBlacklistDetail } from './services';

const { TextArea } = Input;
const { Option } = Select;

export interface BlacklistItem {
  id: number;
  command: string;
  pattern?: string;
  match_type: 'exact' | 'regex';
  enabled: boolean;
  remark?: string;
  create_at?: number;
  create_by?: string;
  update_at?: number;
  update_by?: string;
}

interface Props {
  id?: number;
  title: string;
  onOk: (data: Partial<BlacklistItem>) => Promise<void>;
}

function FormModal(props: Props & ModalWrapProps) {
  const { t } = useTranslation('sshSecurityBlacklist');
  const { visible, destroy, id, title, onOk } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [matchType, setMatchType] = useState<'exact' | 'regex'>('exact');

  useEffect(() => {
    if (visible) {
      if (id) {
        setLoading(true);
        getBlacklistDetail(id)
          .then((data) => {
            form.setFieldsValue({
              command: data.command,
              pattern: data.pattern || '',
              match_type: data.match_type || 'exact',
              enabled: data.enabled !== undefined ? data.enabled : true,
              remark: data.remark || '',
            });
            setMatchType(data.match_type || 'exact');
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        form.resetFields();
        form.setFieldsValue({
          match_type: 'exact',
          enabled: true,
        });
        setMatchType('exact');
      }
    }
  }, [visible, id, form]);

  const handleMatchTypeChange = (e: any) => {
    const value = e.target.value;
    setMatchType(value);
    if (value === 'exact') {
      form.setFieldsValue({ pattern: '' });
    }
  };

  const validatePattern = (_: any, value: string) => {
    if (matchType === 'regex' && !value) {
      return Promise.reject(new Error(t('pattern_required')));
    }
    if (matchType === 'regex' && value) {
      try {
        new RegExp(value);
      } catch (e) {
        return Promise.reject(new Error(t('pattern_invalid')));
      }
    }
    return Promise.resolve();
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const submitData: Partial<BlacklistItem> = {
        command: values.command,
        match_type: values.match_type,
        enabled: values.enabled !== undefined ? values.enabled : true,
        remark: values.remark || '',
      };
      if (values.match_type === 'regex' && values.pattern) {
        submitData.pattern = values.pattern;
      }
      onOk(submitData).then(() => {
        destroy();
      });
    });
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={() => {
        destroy();
      }}
      onOk={handleOk}
      confirmLoading={loading}
    >
      <Form form={form} layout='vertical' initialValues={{ match_type: 'exact', enabled: true }}>
        <Form.Item
          name='command'
          label={t('command')}
          rules={[
            {
              required: true,
              message: t('command_required'),
            },
            {
              max: 512,
              message: '命令内容最大长度为512字符',
            },
          ]}
        >
          <Input placeholder={t('command')} />
        </Form.Item>

        <Form.Item
          name='match_type'
          label={t('match_type')}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Radio.Group onChange={handleMatchTypeChange}>
            <Radio value='exact'>{t('exact_match')}</Radio>
            <Radio value='regex'>{t('regex_match')}</Radio>
          </Radio.Group>
        </Form.Item>

        {matchType === 'regex' && (
          <Form.Item
            name='pattern'
            label={t('pattern')}
            rules={[
              {
                required: true,
                message: t('pattern_required'),
              },
              {
                validator: validatePattern,
              },
            ]}
          >
            <Input placeholder={t('pattern')} />
          </Form.Item>
        )}

        <Form.Item name='enabled' label={t('enabled_status')} valuePropName='checked'>
          <Switch checkedChildren={t('switch_enabled')} unCheckedChildren={t('switch_disabled')} />
        </Form.Item>

        <Form.Item
          name='remark'
          label={t('remark')}
          rules={[
            {
              max: 500,
              message: '备注最大长度为500字符',
            },
          ]}
        >
          <TextArea rows={3} placeholder={t('remark')} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<Props>(FormModal);

