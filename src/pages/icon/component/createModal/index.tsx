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
import MetricForm from '../metricForm';
import BusinessForm from '../businessForm';
import { createIconGroup, getIconGroups, editIconGroup } from '../../services';
import { ModalProps, ModelMetric, Team, UserType, ActionType, Contacts } from '@/store/manageInterface';
import { useTranslation } from 'react-i18next';

const CreateModal: React.FC<ModalProps> = (props: ModalProps) => {
  const { t } = useTranslation('deviceModel');
  const { visible, userType, onClose, action, modelMetricId, teamId, modelType, onSearch, width } = props;
  const metricRef = useRef(null as any);
  const teamRef = useRef(null as any);
  const isModelForm = true;
  const onOk = async (val?: string) => {
    if (isModelForm) {
      let form = teamRef.current.form;
      const { name, common } = await form.validateFields();
      let params = {
        name,
        common,
      };

      if (action === ActionType.CreateIconGroup) {
        createIconGroup(params).then((res) => {
          message.success(t('common:success.add'));
          onClose('create');
          onSearch(res);
        });
      }

      if (action === ActionType.EditIconGroup && teamId) {
        editIconGroup(teamId, params).then((_) => {
          message.success(t('common:success.modify'));
          onClose('update');
        });
      }
    }
  };

  const actionLabel = () => {
    if (action === ActionType.CreateModel) {
      return t('model.create');
    }
    if (action === ActionType.AddModelMetric) {
      return t('model.add_metric');
    }
    if (action === ActionType.EditModel) {
      return t('model.edit');
    }
    if (action === ActionType.EditModelMetric) {
      return t('model.edit_metric');
    }
  };

  return (
    <Modal
      title={actionLabel()}
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
        action === ActionType.CreateTeam && (
          <Button type='primary' onClick={() => onOk('search')}>
            {t('ok_and_search')}
          </Button>
        ),
      ]}
    >
      {isModelForm && <BusinessForm ref={teamRef} businessId={teamId} action={action} />}
    </Modal>
  );
};

export default CreateModal;
