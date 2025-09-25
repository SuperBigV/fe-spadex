import React, { useState, useRef, useEffect, useContext } from 'react';
import { Input, Space, Switch, Card, Button, Modal, Form, message, Select, Collapse, Popconfirm } from 'antd';
import { MinusCircleOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import _, { set } from 'lodash';
import moment from 'moment';
import { useTranslation, Trans } from 'react-i18next';
import { getAssetModelList, deleteAssetModelField, createFieldGroup, updateFieldGroup, deleteFieldGroup } from './services';
import { timeFormatter } from '@/pages/dashboard/Renderer/utils/valueFormatter';
import { CommonStateContext } from '@/App';
import CreateModal from './components/CreateModal';
const { confirm } = Modal;
export const pageSizeOptions = ['10', '20', '50', '100'];
const { Option } = Select;
const { Panel } = Collapse;
export interface IProps {
  editable?: boolean;
  explorable?: boolean;
  isLeaf?: boolean;
  gids?: string;
  refreshFlag: string;
  setRefreshFlag: (refreshFlag: string) => void;
}
export interface ModelField {
  id: number;
  gid: number;
  fieldName: string;
  fieldType: string;
  uniqueIdentifier: string;
  buildIn: boolean;
  isShow: boolean;
  optionList: string[];
  relatedModel: number;
  createAt?: number;
  createBy?: number;
  updateAt?: number;
  updateBy?: number;
}
export interface ModelFieldGroup {
  id: number;
  name: string;
  fields: ModelField[];
}
export default function List(props: IProps) {
  const { assetModels } = useContext(CommonStateContext);
  const { editable = true, explorable = true, isLeaf, gids } = props;
  const { t, i18n } = useTranslation('targets');
  const [visible, setVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const [fieldId, setFieldId] = useState(0);
  const [gid, setGid] = useState(0);
  const [form] = Form.useForm();
  const [action, setAction] = useState('');
  const [groups, setGroups] = useState<ModelFieldGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [editingGroupIndex, setEditingGroupIndex] = useState(-1);
  const [fieldGroupId, setFieldGroupId] = useState(0);
  const [activeKey, setActiveKey] = useState<string[]>(['0']);

  const result = gids?.split(',') || [];

  const showFieldModal = (fieldGroupId) => {
    setFieldGroupId(fieldGroupId);
    setAction('create');
    setVisible(true);
  };

  const showEditModal = (field) => {
    setFieldId(field.id);
    setAction('edit');
    setVisible(true);
  };
  const handleClose = () => {
    setVisible(false);
    setRefreshFlag(_.uniqueId('refreshFlag_'));
  };

  const onChange = (key) => {
    setActiveKey(key);
  };
  const addGroup = async () => {
    const intGid = parseInt(result[0], 10);
    if (!groupName) return;
    const res = await createFieldGroup(intGid, { name: groupName });
    setGroups([...groups, res]);
    setRefreshFlag(_.uniqueId('refreshFlag_'));
  };

  const editGroupName = (id) => {
    updateFieldGroup(id, { name: newGroupName }).then(() => {
      setRefreshFlag(_.uniqueId('refreshFlag_'));
    });
    setEditingGroupIndex(-1);
  };

  const deleteGroup = (group: ModelFieldGroup) => {
    if (group.fields.length > 0) {
      message.error('请先删除该分组下的字段');
      return;
    }
    deleteFieldGroup(group.id).then(() => {
      setRefreshFlag(_.uniqueId('refreshFlag_'));
    });
  };

  const fetchData = ({ gids }: { gids: string | undefined }): Promise<any> => {
    const query = {
      gids: gids,
    };
    return getAssetModelList(query).then((res) => {
      setGroups(res.dat);
    });
  };

  useEffect(() => {
    if (isLeaf) {
      fetchData({
        gids: gids,
      });
    }
  }, [refreshFlag, gids]);
  return (
    <div>
      {isLeaf && (
        // <Button type='primary' onClick={() => setVisible(true)}>
        //   创建模型字段
        // </Button>
        <Space style={{ marginBottom: '20px' }}>
          <Input
            placeholder='输入模型分组名称'
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            style={{ width: '200px' }} // 设置宽度
          />
          <Button type='primary' onClick={addGroup}>
            添加模型分组
          </Button>
        </Space>
      )}

      <Collapse defaultActiveKey={activeKey} onChange={onChange}>
        {groups.map((group, index) => (
          <Panel
            header={
              <Space>
                {editingGroupIndex === index ? (
                  <Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} onPressEnter={() => editGroupName(group.id)} style={{ width: '200px' }} />
                ) : (
                  <span>{group.name}</span>
                )}
                <Button
                  type='text'
                  size='small'
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingGroupIndex(index);
                    setNewGroupName(group.name);
                  }}
                />
                <Popconfirm title='确认删除该分组吗？' onConfirm={() => deleteGroup(group)} okText='是' cancelText='否'>
                  <Button type='text' size='small' icon={<DeleteOutlined />} />
                </Popconfirm>
                <Button type='text' size='small' icon={<PlusOutlined />} onClick={() => showFieldModal(group.id)} />
              </Space>
            }
            key={index}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 10 }}>
              {group.fields?.length > 0 &&
                group.fields.map((model, index) => (
                  <Card
                    key={index}
                    title={model.fieldName}
                    extra={
                      <>
                        <Button type='link' onClick={() => showEditModal(model)}>
                          编辑
                        </Button>
                        <Button
                          disabled={model.buildIn}
                          type='link'
                          onClick={() => {
                            confirm({
                              title: t('common:confirm.delete'),
                              onOk: () => {
                                deleteAssetModelField(model.id).then((res) => {
                                  setRefreshFlag(_.uniqueId('refreshFlag_'));
                                  message.success('删除成功');
                                });
                              },
                            });
                          }}
                        >
                          删除
                        </Button>
                      </>
                    }
                    style={{ width: 220, margin: '5px' }}
                  >
                    <p>唯一标识: {model.uniqueIdentifier}</p>
                    <p>内置字段: {model.buildIn ? '是' : '否'}</p>
                  </Card>
                ))}
            </div>
          </Panel>
        ))}
      </Collapse>
      <CreateModal visible={visible} action={action} onClose={handleClose} fieldGroupId={fieldGroupId} fieldId={fieldId} gid={gid} />
    </div>
  );
}
