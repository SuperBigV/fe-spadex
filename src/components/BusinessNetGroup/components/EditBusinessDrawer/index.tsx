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
import React, { useContext, useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Col, Drawer, Input, Row, Space, Button, message, Table, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CloseOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';

import { ActionType } from '@/store/manageInterface';
import { getDefaultBusiness } from '@/components/BusinessGroup';
import { CommonStateContext } from '@/App';
import ModelForm from '../modelForm';
import { changeBusinessTeam, getBusinessTeamInfo, deleteBusinessTeam, getBusinessTeamList } from '@/services/manage';
interface Props {
  open?: boolean;
  id: number;
  onCloseDrawer: () => void;
}

export default function index(props: Props) {
  const { setBusiGroups, setBusiGroup } = useContext(CommonStateContext);
  const { t } = useTranslation();
  const { confirm } = Modal;
  const PAGE_SIZE = 5000;
  const { open, id, onCloseDrawer } = props;
  const [netGroup, setNetGroup] = useState<{ name: string; id: number; update_by: string; update_at: number }>();
  const [businessModalVisible, setBusinessModalVisible] = useState<boolean>(false);
  const [action, setAction] = useState<ActionType>();
  const [netGroupId, setNetGroupId] = useState<number>(0);
  const teamRef = useRef(null as any);
  const onOk = async (val?: string) => {
    let form = teamRef.current.form;
    const { name, uniqueIdentifier } = await form.validateFields();
    let params = {
      name,
    };
    // changeAssetModel(assetModelId, params).then((_) => {
    //   message.success(t('common:success.modify'));
    //   onCloseDrawer();
    // });
    changeBusinessTeam(netGroupId, params).then((_) => {
      message.success(t('common:success.modify'));
      onCloseDrawer();
    });
  };
  useEffect(() => {
    getTeamInfoDetail(_.toString(id));
    setNetGroupId(id);
  }, [id]);

  const handleCloseEdit = () => {
    setBusinessModalVisible(false);
  };
  const getTeamInfoDetail = (id: string) => {
    getBusinessTeamInfo(id).then((data) => {
      setNetGroup(data);
    });
  };
  // 弹窗关闭回调
  const handleClose = (action: string) => {
    setBusinessModalVisible(false);
    if (['create', 'delete', 'update'].includes(action)) {
      getBusinessTeamList({
        limit: PAGE_SIZE,
        typ: 'net',
      }).then((data: any) => {
        const results = data.dat || [];
        setBusiGroups(results);
        setBusiGroup(getDefaultBusiness(results));
      });
    }
    if (netGroupId && ['update', 'addMember'].includes(action)) {
      getTeamInfoDetail(_.toString(netGroupId));
    }
  };
  return (
    <Drawer width={960} closable={false} title={t('common:btn.edit')} destroyOnClose extra={<CloseOutlined onClick={onCloseDrawer} />} onClose={onCloseDrawer} visible={open}>
      <div>
        <Row className='team-info'>
          <Col
            span='24'
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'inline',
            }}
          >
            {netGroup && netGroup.name}
            <EditOutlined
              style={{
                marginLeft: '8px',
                fontSize: '14px',
              }}
              onClick={() => {
                setAction(ActionType.EditBusiness);
                setBusinessModalVisible(true);
              }}
            ></EditOutlined>
            <DeleteOutlined
              style={{
                marginLeft: '8px',
                fontSize: '14px',
              }}
              onClick={() => {
                confirm({
                  title: t('common:btn.delete'),
                  onOk: () => {
                    deleteBusinessTeam(_.toString(netGroupId)).then((_) => {
                      message.success(t('common:success.delete'));
                      handleClose('delete');
                      onCloseDrawer();
                    });
                  },
                  onCancel: () => {},
                });
              }}
            />
          </Col>
          <Col
            style={{
              marginTop: '8px',
            }}
          >
            <Space wrap>
              <span>ID：{netGroup?.id}</span>

              <span>
                {t('common:table.update_by')}：{netGroup?.update_by ? netGroup.update_by : '-'}
              </span>
              <span>
                {t('common:table.update_at')}：{netGroup?.update_at ? moment.unix(netGroup.update_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </span>
            </Space>
          </Col>
        </Row>
      </div>

      {/* <BusinessModal width={600} visible={businessModalVisible} action={action as ActionType}  onClose={handleClose} teamId={assetModelId} /> */}
      <Modal
        title={'修改网络分组'}
        open={businessModalVisible}
        width={700}
        onCancel={handleCloseEdit}
        destroyOnClose={true}
        footer={[
          <Button key='back' onClick={handleCloseEdit}>
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
        <ModelForm ref={teamRef} modelId={netGroupId} grp_type={'edit'} />
      </Modal>
    </Drawer>
  );
}
