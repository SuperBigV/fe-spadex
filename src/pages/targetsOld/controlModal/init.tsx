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
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import React, { useState, useEffect } from 'react';
import { Modal, Checkbox, Input, Select, Button, Spin } from 'antd';
import { getJumpBusiGroups } from '@/services/targets';
import _ from 'lodash';
interface initProps {
  visible: boolean;
  onClose: any;
}
interface jumpProps {
  id: string;
  full_value: string;
}
const InitModal: React.FC<initProps> = (props: initProps) => {
  const { visible, onClose } = props;

  const [checkedValues, setCheckedValues] = useState(['systemInit', 'installClient', 'syncJumpserver']);
  const [defaultPassword, setDefaultPassword] = useState('Ztth@246810');
  const [businessGroup, setBusinessGroup] = useState('');
  const [jumpBusiGroups, setJumpBusiGroups] = useState<jumpProps[]>([]);
  const [initStatus, setInitStatus] = useState('初始化中...');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState<any>();

  const onChange = (checkedValues) => {
    setCheckedValues(checkedValues);
  };
  useEffect(() => {
    getJumpBusiGroups({}).then((res) => {
      setJumpBusiGroups(res.dat);
    });
  }, []);
  const handleConfirm = () => {
    setLoading(true);
    // 启动定时器，模拟后端状态获取
    const intervalId = setInterval(() => {
      // TODO: 在这里调用后端API获取初始化状态
      // 模拟状态变化
      setInitStatus((prev) => (prev === '初始化中...' ? '初始化完成' : '初始化中...'));
    }, 2000);
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

  return (
    <Modal title='初始化功能' open={visible} onCancel={onClose} footer={null} width={600}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1 }}>
          <Checkbox.Group value={checkedValues} onChange={onChange}>
            <Checkbox value='systemInit'>系统初始化</Checkbox>
            <Checkbox value='installClient'>安装监控Agent</Checkbox>
            <Checkbox value='syncJumpserver'>同步Jumpserver</Checkbox>
          </Checkbox.Group>

          {checkedValues.includes('systemInit') && (
            <Input placeholder='请输入默认密码' value={defaultPassword} onChange={(e) => setDefaultPassword(e.target.value)} style={{ marginTop: 10 }} />
          )}

          {checkedValues.includes('installClient') && (
            // <Select placeholder='选择业务分组' value={businessGroup} onChange={(value) => setBusinessGroup(value)} style={{ width: '100%', marginTop: 10 }}>
            //   <Option value='group1'>业务分组 1</Option>
            //   <Option value='group2'>业务分组 2</Option>
            //   <Option value='group3'>业务分组 3</Option>
            // </Select>
            <Select
              allowClear
              placeholder='选择业务组'
              style={{ width: '100%' }} // 使选择框宽度适应父容器
              dropdownMatchSelectWidth={false}
              options={_.map(jumpBusiGroups, (item) => ({
                label: item.full_value,
                value: item.id,
              }))}
              onChange={(val) => {
                setBusinessGroup(val);
              }}
            />
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loading ? (
            <Spin tip={initStatus} />
          ) : (
            <Button type='primary' onClick={handleConfirm}>
              确认
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalHOC<initProps>(InitModal);
