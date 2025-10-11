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
import { Modal, message, Button, Form, Input, Select, Space } from 'antd';
import _ from 'lodash';
import { addTarget, editTarget, getAuthConfigs, getModelTeamList, getRooms } from '@/services/manage';
import { TargetModalProps, ActionType, MiddlewareData } from '@/store/manageInterface';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { getMonObjectList } from '@/services/targets';
const { Option } = Select;
function FormModel(props: TargetModalProps & ModalWrapProps) {
  const { visible, action, targetType, onOk, destroy, data } = props;
  const [targetList, setTargetList] = useState<{ id: number; ident: string; ip: string; host_ip: string }[]>([]);
  const [authList, setAuthList] = useState<{ id: number; note: string }[]>([]);
  const [modelList, setModelList] = useState<{ id: number; name: string }[]>([]);
  const [form] = Form.useForm();
  const [locationList, setLocationList] = useState<{ id: number; name: string }[]>([]);

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
    getDeviceModelList();
    getLocationList();
  }, []);

  const getLocationList = () => {
    getRooms().then((res) => {
      setLocationList(res || []);
    });
  };
  const getDeviceModelList = () => {
    getModelTeamList({ typ: targetType }).then((res) => {
      setModelList(res?.dat || []);
    });
  };
  const getAuthConfigList = () => {
    let params = { category: '' };
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
          label={'主机IP'}
          name='host_ip'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={<Space>{'运行位置'}</Space>} name={['attr', 'location_id']}>
          <Select>
            {locationList.map((item, index) => (
              <Option value={item.id} key={index}>
                <div>
                  <div>{item.name}</div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={'认证配置'} name={['attr', 'auth_ids']}>
          <Select mode='multiple'>
            {authList.map((item, index) => (
              <Option value={item.id} key={index}>
                <div>
                  <div>{item.note}</div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label='型号' name={['attr', 'device_model_id']}>
          <Select>
            {modelList.map((item, index) => (
              <Option value={item.id} key={index}>
                <div>
                  <div>{item.name}</div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={'U数'} name={['attr', 'u']}>
          <Input />
        </Form.Item>
        <Form.Item label={'备注'} name='note'>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<TargetModalProps>(FormModel);
