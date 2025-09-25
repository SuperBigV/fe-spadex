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
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Modal, Form, Input, Alert, Select, Table, Divider, Checkbox, message } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _, { debounce, set } from 'lodash';
import PageLayout from '@/components/pageLayout';
import { CommonStateContext } from '@/App';
import DefaultList from './List';
import ServerList from './List/server';
import NetworkList from './List/network';
import BusinessGroup from '../assetModels/BusinessGroup';
import BusinessGroup2, { getCleanAssetModelIds } from '@/components/BusinessGroup2';
import { CmdbLifecycle, N9eLifecycle, initTarget, getJumpBusiGroups, fetchInitLog, getGidDetail } from './services';
import './locale';
import './index.less';
export { BusinessGroup }; // TODO 部分页面使用的老的业务组组件，后续逐步替换
const { TextArea } = Input;
interface jumpProps {
  id: string;
  full_value: string;
}
enum OperateType {
  Init = 'init',
  Lifecycle = 'lifecycle',
  None = 'none',
}
export interface ITargetProps {
  id: number;
  name: string;
  ip: string;
  category: string;
  port?: string;
  password?: string;
}

interface OperateionModalProps {
  operateType: OperateType;
  setOperateType: any;
  idents: string[];
  reloadList: () => void;
}

const filebeatConfigs = [
  {
    value: 'bjyz',
    label: '北京亦庄',
  },
  {
    value: 'hblf',
    label: '河北廊坊',
  },
  {
    value: 'jxnc',
    label: '江西南昌',
  },
  {
    value: 'shpbs',
    label: '上海鹏博士',
  },
];
const OperationModal: React.FC<OperateionModalProps> = ({ operateType, setOperateType, idents, reloadList }) => {
  const { t } = useTranslation('asset');
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [identList, setIdentList] = useState<string[]>(idents);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [jumpBusiGroups, setJumpBusiGroups] = useState<jumpProps[]>([]);
  const [initText, setInitText] = useState<any>();
  const [timer, setTimer] = useState<any>();

  useEffect(() => {
    getJumpBusiGroups({}).then((res) => {
      setJumpBusiGroups(res.dat);
    });
  }, []);

  const fetchInitText = (data) => {
    const intervalId = setInterval(() => {
      // TODO: 在这里调用后端API获取初始化状态
      // 模拟状态变化
      if (data) {
        fetchInitLog(data).then((res) => {
          setInitText(res?.dat);
          if (res.status === 'success') {
            clearInterval(intervalId);
            setConfirmLoading(false);
          }
        });
      }
    }, 5000);
    setTimer(intervalId);
  };

  useEffect(() => {
    return () => {
      // 清除定时器
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);
  const AssetLifecycle = (data) => {
    N9eLifecycle(data).then((res) => {
      if (res.err !== '') {
        message.error(res.err);
      } else {
        CmdbLifecycle(data).then((res) => {
          if (res.err !== '') {
            message.error(res.err);
          } else {
            message.success(t('操作成功'));
            setConfirmLoading(false);
            setOperateType(OperateType.None);
            reloadList();
          }
        });
      }
    });
  };
  const lifecycleDetail = () => {
    // 校验单个标签格式是否正确

    return {
      operateTitle: '生命周期管理',
      requestFunc: AssetLifecycle,
      isFormItem: true,

      render() {
        return (
          <Form.Item label={t('状态')} name='lifeStatus' initialValue={'maintain'} rules={[{ required: true, message: t('请选择资产状态') }]}>
            <Select
              placeholder={t('bind_tag.placeholder')}
              options={[
                { label: '正常', value: 'normal' },
                { label: '维护', value: 'maintain' },
                { label: '下线', value: 'offline' },
              ]}
            />
          </Form.Item>
        );
      },
    };
  };
  const initTargetHandler = (data) => {
    initTarget(data).then((res) => {
      fetchInitText(res.dat);
      form.resetFields();
      message.success(t('操作成功'));
      setConfirmLoading(false);
      reloadList();
    });
  };
  const initDetail = () => {
    return {
      operateTitle: t('初始化'),
      requestFunc: initTargetHandler,
      isFormItem: true,
      render() {
        return (
          <>
            <Form.Item label={t('过程')} name='process' rules={[{ required: true, message: t('选择初始化过程') }]}>
              <Checkbox.Group onChange={onCheckboxChange}>
                <Checkbox value='sysInit'>系统初始化</Checkbox>
                <Checkbox value='agent'>安装监控Agent</Checkbox>
                <Checkbox value='jump'>同步Jumpserver</Checkbox>
              </Checkbox.Group>
            </Form.Item>
            {checkedValues.includes('sysInit') && (
              <>
                <Form.Item label='初始密码' name='password' initialValue={'Ztth@246810'} rules={[{ required: true, message: '请输入默认密码' }]}>
                  <Input placeholder='请输入初始密码' />
                </Form.Item>
                <Form.Item label='SSH端口' name='port' initialValue={'7922'} rules={[{ required: true, message: '请输入默认密码' }]}>
                  <Input placeholder='请输入SSH端口' />
                </Form.Item>
                <Form.Item label='日志集群' name='filebeatconfig'>
                  <Select
                    allowClear
                    placeholder='选填:初始化filebeat配置,选择自建日志集群'
                    style={{ width: '100%' }} // 使选择框宽度适应父容器
                    dropdownMatchSelectWidth={false}
                    options={filebeatConfigs}
                  />
                </Form.Item>
              </>
            )}
            {checkedValues.includes('jump') && (
              <Form.Item label='业务组' name='busigroup' rules={[{ required: true, message: '请选择挂载到jumpserve业务组' }]}>
                <Select
                  allowClear
                  placeholder='选择业务组'
                  style={{ width: '100%' }} // 使选择框宽度适应父容器
                  dropdownMatchSelectWidth={false}
                  options={_.map(jumpBusiGroups, (item) => ({
                    label: item.full_value,
                    value: item.id,
                  }))}
                />
              </Form.Item>
            )}
            <Divider orientation='left'>初始化过程</Divider>
            {/* <TextArea value={initText} rows={4} /> */}
            <TextArea value={initText} autoSize={{ minRows: 3, maxRows: 10 }} />
          </>
        );
      },
    };
  };
  const operateDetail = {
    lifecycleDetail,
    initDetail,
    noneDetail: () => ({
      operateTitle: '',
      requestFunc() {
        return Promise.resolve();
      },
      isFormItem: false,
      render() {},
    }),
  };
  const { operateTitle, requestFunc, isFormItem, render } = operateDetail[`${operateType}Detail`]();
  const onCheckboxChange = (checkedValues) => {
    setCheckedValues(checkedValues);
  };
  function submitForm() {
    form.validateFields().then((data) => {
      setConfirmLoading(true);
      data.idents = data.idents.split('\n');
      requestFunc(data);
      reloadList();
    });
  }
  function formatValue() {
    const inputValue = form.getFieldValue('idents');
    const formattedIdents = inputValue.split(/[ ,\n]+/).filter((value) => value);
    const formattedValue = formattedIdents.join('\n');
    // 自动格式化表单内容
    if (inputValue !== formattedValue) {
      form.setFieldsValue({
        idents: formattedValue,
      });
    }
    // 当对象标识变更时，更新标识数组
    if (identList.sort().join('\n') !== formattedIdents.sort().join('\n')) {
      setIdentList(formattedIdents);
    }
  }
  useEffect(() => {
    if (operateType !== OperateType.None) {
      setIdentList(idents);
      form.setFieldsValue({
        idents: idents.join('\n'),
      });
    }
  }, [operateType, idents]);
  return (
    <Modal
      open={operateType !== 'none'}
      title={operateTitle}
      confirmLoading={confirmLoading}
      // okButtonProps={{
      //   danger: operateLife === OperateLife.Scrap || operateLife === OperateLife.Offline,
      // }}
      afterClose={() => {
        clearInterval(timer);
        setConfirmLoading(false);
        setCheckedValues([]);
        setInitText('');
      }}
      onOk={submitForm}
      onCancel={() => {
        setOperateType(OperateType.None);
        form.resetFields();
      }}
    >
      {/* 基础展示表单项 */}
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
        <Form.Item label={'资产标识'} name='idents' rules={[{ required: true }]}>
          <TextArea autoSize={{ minRows: 3, maxRows: 10 }} onBlur={formatValue} />
        </Form.Item>
        {isFormItem && render()}
      </Form>
    </Modal>
  );
};

const Targets: React.FC = () => {
  const { t } = useTranslation('targets');
  const { assetModel } = useContext(CommonStateContext);
  const [gids, setGids] = useState<string | undefined>(assetModel.ids);
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const [operateType, setOperateType] = useState<OperateType>(OperateType.None);
  const [selectedRows, setSelectedRows] = useState<ITargetProps[]>([]);
  const [isShowOperator, setIsShowOperator] = useState(false);
  const [isDefaultList, setDefaultList] = useState(false);
  const [isServerList, setServerList] = useState(false);
  const [isNetworkList, setNetworkList] = useState(false);
  const [loading, setLoading] = useState(false);
  // const fetchDetail = async (gids) => {
  //   setIsShowOperator(false);
  //   const res = await getGidDetail(gids);
  //   switch (res.uniqueIdentifier) {
  //     case 'ECS':
  //     case 'phy':
  //     case 'vm':
  //       setDefaultList(false);
  //       setNetworkList(false);
  //       setServerList(true);
  //       break;
  //     case 'switch':
  //     case 'router':
  //     case 'firewall':
  //     case 'relay':
  //       setServerList(false);
  //       setDefaultList(false);
  //       setNetworkList(true);
  //       break;
  //     default:
  //       setServerList(false);
  //       setNetworkList(false);
  //       setDefaultList(true);
  //       break;
  //   }
  //   setGids(assetModel.ids);
  //   setLoading(true);
  // };
  // useEffect(() => {
  //   fetchDetail(gids);
  // }, [assetModel.ids]);

  return (
    <PageLayout icon={<DatabaseOutlined />} title={t('title')}>
      <div className='object-manage-page-content'>
        <BusinessGroup2
          pageKey='targets'
          showSelected={gids !== '0' && gids !== undefined}
          onSelect={(key) => {
            const ids = getCleanAssetModelIds(key);
            setGids(ids);
          }}
        />
        <div
          className='table-area n9e-border-base'
          style={{
            height: '100%',
            overflowY: 'auto',
          }}
        >
          <DefaultList
            gids={gids}
            setOperateType={setOperateType}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            isLeaf={assetModel.isLeaf}
            refreshFlag={refreshFlag}
            isShowOperator={isShowOperator}
            // setRefreshFlag={setRefreshFlag}
          />
          {/* {loading && isServerList && (
            <ServerList
              gids={gids}
              setOperateType={setOperateType}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              isLeaf={assetModel.isLeaf}
              refreshFlag={refreshFlag}
              isShowOperator={isShowOperator}
              // setRefreshFlag={setRefreshFlag}
            />
          )}
          {loading && isNetworkList && (
            <NetworkList
              gids={gids}
              setOperateType={setOperateType}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              isLeaf={assetModel.isLeaf}
              refreshFlag={refreshFlag}
              isShowOperator={isShowOperator}
              // setRefreshFlag={setRefreshFlag}
            />
          )}
          {loading && isDefaultList && (
            <DefaultList
              gids={gids}
              setOperateType={setOperateType}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              isLeaf={assetModel.isLeaf}
              refreshFlag={refreshFlag}
              isShowOperator={isShowOperator}
              // setRefreshFlag={setRefreshFlag}
            />
          )} */}

          {_.includes(_.values(OperateType), operateType) && (
            <OperationModal
              operateType={operateType}
              setOperateType={setOperateType}
              idents={_.map(selectedRows, 'name')}
              reloadList={() => {
                setRefreshFlag(_.uniqueId('refreshFlag_'));
              }}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Targets;
