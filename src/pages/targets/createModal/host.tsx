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
import _, { set } from 'lodash';
import { addTarget, editTarget, getAuthConfigs, getModelTeamList, getRooms } from '@/services/manage';
import { TargetModalProps, ActionType, TargetFormProps } from '@/store/manageInterface';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { getMonObjectList } from '@/services/targets';
import { ConsoleSqlOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
const { Option } = Select;
function FormModel(props: TargetModalProps & ModalWrapProps) {
  const { visible, action, targetType, onOk, destroy, data } = props;
  const [targetList, setTargetList] = useState<{ id: number; ident: string; ip: string; host_ip: string }[]>([]);
  // const [authList, setAuthList] = useState<{ id: number; note: string }[]>([]);
  const [locationList, setLocationList] = useState<{ id: number; name: string }[]>([]);
  const [modelList, setModelList] = useState<{ id: number; name: string }[]>([]);
  const [initValues, setInitialValues] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [form] = Form.useForm();
  const identTypes = [
    { name: 'server', label: '服务器' },
    { name: 'cloud_server', label: '云服务器' },
    { name: 'vm', label: '虚拟机' },
  ];

  const actionLabel = () => {
    if (action === ActionType.AddTarget) {
      return '创建';
    }
    if (action === ActionType.EditTarget) {
      return '编辑';
    }
  };
  const initialValues = () => {
    if (action === ActionType.AddTarget) {
      setInitialValues({
        ident_type: identTypes[0].name,
      });
    }
    if (action === ActionType.EditTarget) {
      setInitialValues(data);
    }
    setLoading(false);
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

    getLocationList();
    // getAuthConfigList();
    getDeviceModelList();
    initialValues();
  }, []);

  const getDeviceModelList = () => {
    getModelTeamList({ typ: 'server' }).then((res) => {
      setModelList(res?.dat || []);
    });
  };
  // const getAuthConfigList = () => {
  //   let params = { query: '' };
  //   getAuthConfigs(params).then((res) => {
  //     setAuthList(res || []);
  //   });
  // };
  const getLocationList = () => {
    getRooms().then((res) => {
      setLocationList(res || []);
    });
  };
  return !loading ? (
    <Modal
      title={actionLabel()}
      open={visible}
      onCancel={() => {
        destroy();
      }}
      destroyOnClose
      onOk={() => {
        form.validateFields().then((values) => {
          const finalData = {
            ...initValues,
            ...values,
            attr: {
              ...initValues.attr,
              ...values.attr,
            },
          };
          onOk(finalData).then(() => {
            destroy();
          });
        });
      }}
    >
      <Form layout='vertical' form={form} initialValues={initValues} preserve={true}>
        <Form.Item
          label={'名称'}
          name='ident'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input disabled={action === ActionType.EditTarget} />
        </Form.Item>
        <Form.Item
          label={'主机IP'}
          name={'host_ip'}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label='主机类型' name={'ident_type'}>
          <Select>
            {identTypes.map((item, index) => (
              <Option value={item.name} key={index}>
                <div>
                  <div>{item.label}</div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={<Space>{'运行位置'}</Space>} name={['attr', 'location_id']} tooltip={'主机运行位置比如机房、云区等, 用于根据不同环境匹配Kafka日志采集机器'}>
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
        <Form.Item
          label={
            <Space>
              {'SSH端口'}
              {/* <Link to='/auth-configs' target='_blank'> */}
              {/* {'前往添加认证配置'} */}
              {/* </Link> */}
            </Space>
          }
          name={['attr', 'ssh_port']}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={
            <Space>
              {'型号'}
              <Link to='/device-models' target='_blank'>
                {'前往添加型号'}
              </Link>
            </Space>
          }
          name={['attr', 'device_model_id']}
          tooltip={'配置型号后会自动根据型号关联的oid进行监控指标采集'}
        >
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
        <Form.Item label={'备注'} name='noteModalHOC'>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  ) : null;
}

export default ModalHOC<TargetModalProps>(FormModel);
