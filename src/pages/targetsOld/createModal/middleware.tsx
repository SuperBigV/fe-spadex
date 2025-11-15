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
import React, { useRef, useState, useImperativeHandle, useEffect } from 'react';
import { Modal, message, Button, Form, Input, Select } from 'antd';
import _ from 'lodash';
import { addTarget, editTarget, getAuthConfigs } from '@/services/manage';
import { TargetModalProps, ActionType, MiddlewareData } from '@/store/manageInterface';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { getMonObjectList } from '@/services/targets';
const { Option } = Select;
function FormModel(props: TargetModalProps & ModalWrapProps) {
  const { visible, action, targetType, onOk, destroy, data } = props;
  const [targetList, setTargetList] = useState<{ id: number; ident: string; ip: string; host_ip: string }[]>([]);
  const [authList, setAuthList] = useState<{ id: number; note: string }[]>([]);

  const [form] = Form.useForm();

  const actionLabel = () => {
    if (action === ActionType.AddTarget) {
      return '创建';
    }
    if (action === ActionType.EditTarget) {
      return '编辑';
    }
  };
  useEffect(() => {
    // getTargetList({ typ: "host", limit: 2000 }).then((res) => setTargetList(res));
    getMonObjectList({
      p: 1,
      limit: 5000,
      typ: 'host',
    })
      .then((res) => {
        setTargetList(res?.dat?.list || []);
      })
      .catch(() => {
        setTargetList([]);
      });
    if (action === ActionType.AddTarget) {
      // setInitialValues({
      // id: targetId,
      // attr.target_id: targetId,
      // });
    }
    getAuthConfigList();
  }, []);

  const getAuthConfigList = () => {
    let params = { category: targetType };
    getAuthConfigs(params).then((res) => {
      setAuthList(res || []);
    });
  };
  return (
    <Modal
      title={actionLabel()}
      open={visible}
      onCancel={() => {
        destroy();
      }}
      onOk={() => {
        form.validateFields().then((values) => {
          values.ident_type = targetType;
          onOk(values).then(() => {
            destroy();
          });
        });
      }}
    >
      <Form layout='vertical' form={form} initialValues={data} preserve={false}>
        <Form.Item
          label={'名称'}
          name='ident'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={'部署主机'}
          name={['attr', 'target_id']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select>
            {targetList.map((item, index) => (
              <Option value={item.id} key={index}>
                <div>
                  <div>
                    {item.ident}-{item.host_ip}
                  </div>
                  <div style={{ color: '#8c8c8c' }}>{item.host_ip}</div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={'认证配置'} name={['attr', 'auth_id']}>
          <Select>
            {authList.map((item, index) => (
              <Option value={item.id} key={index}>
                <div>
                  <div>{item.note}</div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={'备注'} name='note'>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<TargetModalProps>(FormModel);
