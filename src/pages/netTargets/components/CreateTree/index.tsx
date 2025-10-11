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
import React, { useRef, useState } from 'react';
import { Modal, message, Button } from 'antd';
import _ from 'lodash';
import ModelForm from '../modelForm';
import {
  createUser,
  createTeam,
  changeUserInfo,
  changeTeamInfo,
  changeUserPassword,
  addTeamUser,
  createBusinessTeam,
  changeBusinessTeam,
  addBusinessMember,
} from '@/services/manage';
import { createNetGroup } from '../../services';
import { AssetModalProps, User, Team, UserType, ActionType, Contacts } from '@/store/manageInterface';
import { useTranslation } from 'react-i18next';
import { getRSAConfig } from '@/services/login';
import { RsaEncry } from '@/utils/rsa';

const CreateModal: React.FC<AssetModalProps> = (props: AssetModalProps) => {
  const { t } = useTranslation('user');
  const { visible, userType, onClose, modelId, onSearch, width, grp_type } = props;
  const teamRef = useRef(null as any);

  const onOk = async (val?: string) => {
    let form = teamRef.current.form;
    const { name } = await form.validateFields();
    let params = {
      name,
      grp_type: 'net',
    };
    // createNetGroup(params).then((res) => {
    //   message.success(t('common:success.add'));
    //   onClose('create');
    //   onSearch(res);
    // });
    createBusinessTeam(params).then((res) => {
      message.success(t('common:success.add'));
      onClose('create');
      onSearch(res);
    });
  };

  return (
    <Modal
      title={'创建网络分组'}
      open={visible}
      width={width ? width : 700}
      onCancel={onClose}
      destroyOnClose={true}
      footer={[
        <Button key='back' onClick={onClose}>
          {t('common:btn.cancel')}
        </Button>,
        <Button key='submit' type='primary' onClick={() => onOk()}>
          {t('common:btn.ok')}
        </Button>,
      ]}
    >
      <ModelForm ref={teamRef} modelId={modelId} grp_type={grp_type} />
    </Modal>
  );
};

export default CreateModal;
