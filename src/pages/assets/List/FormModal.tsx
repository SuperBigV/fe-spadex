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

import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, Modal, Switch, Select, Image, Steps, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { Encrypt, Decrypt } from '@/utils/des';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
const { TextArea } = Input;

import { CommonStateContext } from '@/App';
import { getColumnsByGid, getModelOptions, getAssetDetail, getRacksByRoomId } from './services';
import { getAuthConfigs } from '@/pages/authConfigs/services';
import { getModelTeamList } from '@/services/manage';
import { getIconsByGrpId } from '@/pages/icon/services';
import { getBusiGroups } from '@/services/common';
const { Option } = Select;
const { Step } = Steps;
export interface Field {
  id: number;
  fieldName: string;
  uniqueIdentifier: string;
  fieldType: string;
  optionList?: string[];
  buildIn: boolean;
  required: boolean;
  tip: string;
  relatedModel?: number;
}
export interface Group {
  id: number;
  model_id: number;
  name: string;
  fields: Field[];
}
interface Asset {
  id: number;
  name: string;
  category: string;
  password?: string;
  port: string;
  ip: string;
}
interface Props {
  rowId: number;
  operateType: string;
  groups: Group[];
  title: string;
  gid: number;
  visiable?: boolean;
  modelOptions?: any[];
  busiOptions?: any[];
  authOptions?: any[];
  onOk: (data: any) => Promise<void>;
}

function FormModal(props: Props & ModalWrapProps) {
  const { modelOptions, busiOptions, authOptions, visiable, destroy, groups, rowId, gid, operateType, title, onOk, toBeEncrypted } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitalValues] = useState<any>({});
  const [relationOptions, setRelationOptions] = useState<any[]>([]);
  const [iconOptions, setIconOptions] = useState<{ name: string; id: number; src: string }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  // const [modelOptions, setModelOptions] = useState<any[]>([]);
  // const [busiOptions, setBusiOptions] = useState<any[]>([]);
  // const [authOptions, setAuthOptions] = useState<any[]>([]);
  const [rackOptions, setRackOptions] = useState<any[]>([]);
  const [roomOptions, setRoomOptions] = useState<any[]>([]);
  const getGroupIcons = async (id) => {
    await getIconsByGrpId(id).then((data) => {
      setIconOptions(data);
    });
  };

  const allGroups = groups
    .filter((item) => item.fields)
    .map((item) => ({
      stepName: item.name,
      fields: item.fields, // 只保留 isShow 为 true 的字段
    }));
  const allFields = groups.reduce((acc: Field[], item) => {
    return acc.concat(item.fields);
  }, []);

  const getAssetInfoDetail = async (id) => {
    await getAssetDetail(id).then((data) => {
      if (data.data.password) {
        data.data.password = Decrypt(data.data.password);
      }
      setInitalValues(data.data);
    });
    setLoading(false);
  };
  useEffect(() => {
    getGroupIcons(gid);
    if (rowId !== 0) {
      getAssetInfoDetail(rowId);
    } else {
      setLoading(false);
    }
    allFields.map((field) => {
      if (field.uniqueIdentifier === 'belong_room') {
        getModelOptions(field.relatedModel).then((res) => {
          const options = res.map((item) => ({
            label: item.name,
            value: item.id,
          }));
          setRoomOptions(options);
        });
      }
    });
  }, []);

  const onChange = (value: number) => {
    setCurrentStep(value);
  };
  const handleNext = () => {
    if (currentStep < allGroups.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  const handleRelationChange = (value) => {
    console.log('value', value);
  };
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (values.data.password !== undefined) {
        values.data.password = Encrypt(values.data.password);
      }
      onOk(values).then(() => {
        destroy();
      });
    });
  };
  const handleRelationRoomChange = (value) => {
    getRacksByRoomId(value).then((data) => {
      const options = data.dat.map((item) => ({
        label: item.data.name,
        value: item.name,
      }));
      setRackOptions(options);
    });
  };
  return (
    <Modal
      title={title}
      open={visiable}
      footer={null}
      onCancel={() => {
        destroy();
      }}
    >
      {!loading && (
        <>
          <Steps current={currentStep} onChange={onChange}>
            {allGroups?.map((item, index) => (
              <Step key={index} title={item.stepName} />
            ))}
          </Steps>
          <Form form={form} layout='vertical' style={{ marginTop: '20px' }} initialValues={{ data: initialValues }}>
            {/* 渲染所有字段，但通过样式控制显示当前步骤的字段 */}
            {allGroups.map((group, groupIndex) => (
              <div key={groupIndex} style={{ display: groupIndex === currentStep ? 'block' : 'none' }}>
                {group.fields.map((field) => {
                  const { id, fieldName, uniqueIdentifier, fieldType, required, optionList, tip, relatedModel } = field;
                  const options = optionList?.map((item) => ({
                    label: item,
                    value: item,
                  }));
                  let inputComponent;
                  switch (fieldType) {
                    case 'text':
                      inputComponent = <Input />;
                      break;
                    case 'password':
                      inputComponent = (
                        <Input.Password
                        // onChange={() => {
                        //   form.setFieldsValue({
                        //     toBeEncrypted: true,
                        //   });
                        // }}
                        />
                      );

                      break;
                    case 'icon':
                      inputComponent = (
                        <Select placeholder='选择一个图标' allowClear>
                          {iconOptions?.map((icon) => (
                            <Option key={icon.name} value={icon.id}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Image
                                  src={icon.src}
                                  preview={false} // 禁用预览
                                  style={{ width: '20px', height: '20px', marginRight: '8px' }} // 设置图标大小
                                />
                                {icon.name}
                              </div>
                            </Option>
                          ))}
                        </Select>
                      );
                      break;
                    case 'textarea':
                      inputComponent = <TextArea rows={4} />;
                      break;
                    case 'select':
                      inputComponent = <Select options={options}></Select>;
                      break;
                    case 'relation':
                      if (uniqueIdentifier === 'belong_room') {
                        inputComponent = <Select options={roomOptions} onChange={handleRelationRoomChange}></Select>;
                      } else if (uniqueIdentifier === 'belong_rack') {
                        inputComponent = <Select options={rackOptions}></Select>;
                      } else if (relatedModel === -1) {
                        inputComponent = <Select options={modelOptions}></Select>;
                      } else if (relatedModel === -2 && uniqueIdentifier == 'busi') {
                        inputComponent = <Select mode='multiple' allowClear options={busiOptions}></Select>;
                      } else if (relatedModel === -3) {
                        inputComponent = <Select options={authOptions}></Select>;
                      } else {
                        inputComponent = <Select options={relationOptions}></Select>;
                      }
                      break;
                    default:
                      inputComponent = <Input />;
                  }

                  return (
                    <>
                      <Form.Item label={fieldName} tooltip={tip} name={['data', uniqueIdentifier]} key={id} required={required}>
                        {inputComponent}
                      </Form.Item>
                      <Form.Item name='toBeEncrypted' hidden>
                        <div />
                      </Form.Item>
                    </>
                  );
                })}
              </div>
            ))}
          </Form>
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            {currentStep > 0 && (
              <Button style={{ marginRight: 8 }} onClick={handlePrev}>
                上一步
              </Button>
            )}
            {currentStep < allGroups.length - 1 ? (
              <Button type='primary' onClick={handleNext}>
                下一步
              </Button>
            ) : (
              <Button type='primary' onClick={handleSubmit}>
                确认
              </Button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

export default ModalHOC<Props>(FormModal);
