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
import React, { useEffect, useState, useImperativeHandle, ReactNode, useCallback, useContext } from 'react';
import { Form, Input, Select, Switch, Tag, Space, Button } from 'antd';
import { MinusCircleOutlined, PlusOutlined, CaretDownOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { ModelProps, Team, ActionType } from '@/store/manageInterface';
import { useTranslation, Trans } from 'react-i18next';
import { debounce } from 'lodash';
import { CommonStateContext } from '@/App';
import { getAssetModelInfoDetail } from '../../services';

const { Option } = Select;
const TeamForm = React.forwardRef<ReactNode, ModelProps>((props, ref) => {
  const { siteInfo } = useContext(CommonStateContext);
  const { t } = useTranslation('assets');
  const { modelId, grp_type } = props;
  const [isEdit, setIsEdit] = useState(false);
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState({
    id: 0,
    name: '',
    uniqueIdentifier: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refresh, setRefresh] = useState(true);
  useImperativeHandle(ref, () => ({
    form: form,
  }));

  useEffect(() => {
    if (modelId) {
      getModelInfoDetail(modelId);
    } else {
      setLoading(false);
    }
  }, []);
  const getModelInfoDetail = async (id: number) => {
    const data = await getAssetModelInfoDetail(id);
    setInitialValues({
      id: data.id,
      name: data.name,
      uniqueIdentifier: data.uniqueIdentifier,
    });
    if (grp_type === 'edit') {
      setIsEdit(true);
    }
    setLoading(false);
  };

  // useEffect(() => {
  //   getList('');
  // }, []);

  // const getList = (str: string) => {
  //   getTeamInfoList({ query: str }).then((res) => {
  //     setUserTeam(res.dat);
  //   });
  // };

  return !loading ? (
    <Form layout='vertical' form={form} initialValues={initialValues} preserve={false}>
      <>
        <Form.Item
          label={t('model.name')}
          name='name'
          rules={[
            {
              required: true,
            },
          ]}
          tooltip={
            siteInfo?.businessGroupDisplayMode === 'list' ? undefined : (
              <Trans
                ns='assets'
                i18nKey='model.name_tip'
                components={{ 1: <br /> }}
                values={{
                  separator: siteInfo?.businessGroupSeparator || '-',
                }}
              />
            )
          }
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('model.uniqueIdentifier')}
          name='uniqueIdentifier'
          rules={[
            {
              required: true,
            },
          ]}
          tooltip={siteInfo?.businessGroupDisplayMode === 'list' ? undefined : <Trans ns='assets' i18nKey='model.uniqueIdentifier_tip' components={{ 1: <br /> }} />}
        >
          <Input disabled={isEdit} />
        </Form.Item>
      </>
    </Form>
  ) : null;
});
export default TeamForm;
