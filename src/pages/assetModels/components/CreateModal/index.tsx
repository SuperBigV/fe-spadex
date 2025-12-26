import React, { useRef, useState, useContext, useEffect } from 'react';
import { Input, Space, Switch, Card, Button, Modal, Form, message, Select, Collapse } from 'antd';
import { MinusCircleOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import _, { set } from 'lodash';
import { CommonStateContext } from '@/App';
import ModelForm from '../modelForm';
import { createAssetModelField, updateAssetModelField, getAssetModelFieldDetail } from '../../services';

import { createAssetModel } from '../../services';
import { useTranslation } from 'react-i18next';
import { getRSAConfig } from '@/services/login';
import { RsaEncry } from '@/utils/rsa';

export interface ModelField {
  id: number;
  gid: number;
  fieldName: string;
  fieldType: string;
  uniqueIdentifier: string;
  buildIn: boolean;
  isShow: boolean;
  optionList: string[];
  tip: string;
  relatedModel: number;
  createAt?: number;
  createBy?: number;
  updateAt?: number;
  updateBy?: number;
}

const FieldTypes = [
  { id: 1, name: '字符串', value: 'text' },
  { id: 2, name: '数字', value: 'number' },
  { id: 3, name: '关联模型', value: 'relation' },
  { id: 6, name: '下拉选择', value: 'select' },
  { id: 4, name: '密码', value: 'password' },
  { id: 5, name: '文本框', value: 'textares' },
  { id: 7, name: '图标', value: 'icon' },
];

export interface AssetModalProps {
  fieldId: number;
  visible: boolean;
  gid: number;
  action?: string;
  fieldGroupId: number;
  onClose?: any;
  onSearch?: any;
}

const CreateModal: React.FC<AssetModalProps> = (props: AssetModalProps) => {
  const { t } = useTranslation('user');
  const { assetModels } = useContext(CommonStateContext);
  const { visible, action, onClose, fieldGroupId, gid, fieldId } = props;
  const teamRef = useRef(null as any);
  const [form] = Form.useForm();
  const [fieldSelect, setFieldSelect] = useState(false);
  const [fieldRelation, setFieldRelation] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialValues, setInitialValues] = useState<ModelField>({
    id: 0,
    gid: 0,
    fieldName: '',
    uniqueIdentifier: '',
    tip: '',
    buildIn: false,
    fieldType: 'text',
    relatedModel: -2,
    isShow: true,
    optionList: [],
  });
  useEffect(() => {
    if (initialValues.id !== 0) {
      form.setFieldsValue(initialValues);

      // 根据字段类型设置状态
      setFieldRelation(initialValues.fieldType === 'relation');
      setFieldSelect(initialValues.fieldType === 'select');
    }
  }, [initialValues, form]);
  // 修改 useEffect，同时监听 fieldObj 和 visible 的变化
  useEffect(() => {
    if (fieldId) {
      getFieldDetail(fieldId);
    } else {
      setLoading(false);
    }
  }, [fieldId]);

  const getFieldDetail = async (id) => {
    await getAssetModelFieldDetail(id).then((res) => {
      console.log(res);
      setInitialValues(res);
      setLoading(false);
    });
  };

  const handleOk = async () => {
    try {
      const { fieldName, uniqueIdentifier, buildIn, required, fieldType, relatedModel, optionList, isShow } = await form.validateFields();
      let params = {
        gid: fieldGroupId,
        fieldName,
        uniqueIdentifier,
        buildIn,
        isShow,
        required,
        fieldType,
        optionList: optionList || [],
        relatedModel: relatedModel || 0,
      };
      await createAssetModelField(params);
      message.success(t('common:success.add'));
      onClose();
    } catch (error) {
      message.error(t('common:error.add'));
    }
    setFieldSelect(false);
    setFieldRelation(false);
  };

  const handleEditOk = async () => {
    try {
      const { fieldName, uniqueIdentifier, buildIn, required, fieldType, relatedModel, optionList, isShow, tip } = await form.validateFields();
      let params = {
        id: fieldId,
        gid: gid,
        tip,
        fieldName,
        uniqueIdentifier,
        buildIn,
        isShow,
        required,
        fieldType,
        relatedModel: relatedModel || 0,
        optionList: optionList || [],
      };
      await updateAssetModelField(fieldId, params);
      message.success(t('common:success.edit'));
      onClose();
    } catch (error) {
      message.error(t('common:error.edit'));
    }
    setFieldSelect(false);
    setFieldRelation(false);
  };

  const onOk = async () => {
    if (action === 'edit') {
      handleEditOk();
    } else {
      handleOk();
    }
    setInitialValues({
      id: 0,
      gid: 0,
      fieldName: '',
      tip: '',
      uniqueIdentifier: '',
      buildIn: false,
      fieldType: 'text',
      relatedModel: -1,
      isShow: true,
      optionList: [],
    });
  };

  const actionLabel = () => {
    if (action === 'edit') {
      return t('编辑模型字段');
    }
    if (action === 'create') {
      return t('创建模型字段');
    }
  };

  return (
    <Modal title={actionLabel()} open={visible} onOk={onOk} onCancel={onClose} forceRender>
      {!loading && (
        <Form form={form} layout='vertical' initialValues={initialValues}>
          <Form.Item name='fieldName' label='字段名称' rules={[{ required: true, message: '请输入字段名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name='uniqueIdentifier' label='唯一标识' rules={[{ required: true, message: '请输入唯一标识' }]}>
            <Input />
          </Form.Item>
          <Form.Item name='buildIn' label='内置字段' valuePropName='checked'>
            <Switch checkedChildren='开启' unCheckedChildren='关闭' />
          </Form.Item>
          <Form.Item name='required' label='是否必填' valuePropName='checked'>
            <Switch checkedChildren='开启' unCheckedChildren='关闭' />
          </Form.Item>
          <Form.Item name='isShow' label='是否显示' valuePropName='checked'>
            <Switch checkedChildren='显示' unCheckedChildren='隐藏' />
          </Form.Item>
          <Form.Item name='tip' label='提示信息'>
            <Input />
          </Form.Item>
          <Form.Item name='fieldType' label='字段类型' rules={[{ required: true, message: '请选择字段类型' }]}>
            <Select
              onChange={(value) => {
                setFieldRelation(value === 'relation');
                setFieldSelect(value === 'select');
              }}
            >
              {FieldTypes.map((item) => (
                <Select.Option key={item.id} value={item.value}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {fieldRelation && (
            <Form.Item name='relatedModel' label='关联模型'>
              <Select>
                {[
                  { id: -1, name: '设备型号' },
                  { id: -2, name: '业务分组' },
                  { id: -3, name: '认证配置' },
                  { id: -4, name: '采购供应商' },
                  { id: -5, name: '维保单位' },
                ]
                  .concat(assetModels)
                  .filter((model) => !_.toString(gid)?.includes(model.id.toString()))
                  .map((model) => (
                    <Select.Option key={model.id} value={model.id}>
                      {model.name}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          )}
          {fieldSelect && (
            <Form.List name='optionList'>
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item label={index === 0 ? '选项' : ''} required={false} key={field.key}>
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: '请输入下拉选项值',
                          },
                        ]}
                        noStyle
                      >
                        <Input style={{ width: '60%' }} />
                      </Form.Item>
                      {fields.length > 1 ? <MinusCircleOutlined className='dynamic-delete-button' onClick={() => remove(field.name)} /> : null}
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button type='dashed' onClick={() => add()} style={{ width: '60%' }} icon={<PlusOutlined />}>
                      添加选项
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
          )}
        </Form>
      )}
    </Modal>
  );
};

export default CreateModal;
