import React, { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import _, { set } from 'lodash';
import classNames from 'classnames';
import PageLayout, { HelpLink } from '@/components/pageLayout';
import { Button, Table, Input, message, Row, Col, Modal, Form, Space, Upload, Card, Image } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined, UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import UserInfoModal from './component/createModal';
import { getIconsByGrpId, getIconGroupInfo, addIcon, deleteIcon } from './services';
import { User, Team, UserType, ActionType, TeamInfo } from '@/store/manageInterface';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@/utils';
import { CommonStateContext } from '@/App';
import { listToTree, getCollapsedKeys, getLocaleExpandedKeys, setLocaleExpandedKeys, getDefaultModel } from '@/components/ModelGroup';
import Tree from '@/components/BusinessGroup/components/Tree';
import '@/components/BlankBusinessPlaceholder/index.less';
import './index.less';
import './locale';

const { confirm } = Modal;
export const PAGE_SIZE = 5000;

const Resource: React.FC = () => {
  // const { setModelGroups, siteInfo, setModelGroup } = useContext(CommonStateContext);
  const { t } = useTranslation('deviceModel');
  const urlQuery = useQuery();
  const id = urlQuery.get('id');
  const [visible, setVisible] = useState<boolean>(false);
  const [action, setAction] = useState<string>();
  const { assetModels, assetModel } = useContext(CommonStateContext);
  const [iconGroupId, setIconGroupId] = useState<number | undefined>(assetModel?.id);
  const [iconList, setIconList] = useState<{ name: string; id: number; src: string; create_by: string; create_at: number }[]>([]);
  const [iconGroupInfo, setIconGroupInfo] = useState<{ name: string; id: number; common: string; create_by: string; create_at: number }>();
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [currentMetric, setCurrentMetric] = useState<{ id: string }>();
  const [searchValue, setSearchValue] = useState<string>('');
  const [operTyp, setOperTyp] = useState<string>('deviceModel');
  const [iconVisible, setIconVisible] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileList, setFileList] = useState<any[]>([]); // 管理文件列表
  const [form] = Form.useForm();
  useEffect(() => {
    iconGroupId && getGroupIcons(iconGroupId);
  }, [iconGroupId]);

  // useEffect(() => {
  //   getTeamList();
  // }, []);

  useEffect(() => {
    // getTeamList();
    console.log(assetModel);
    setIconGroupId(assetModel?.id);
  }, []);

  // 获取业务组列表
  // 获取型号组详情
  const getGroupIcons = (id: any) => {
    getIconsByGrpId(id).then((data) => {
      console.log(data);
      setIconList(data);
    });
  };
  const handleSearch = (query?: string) => {
    // getModelInfo(Number(modelId)).then((data) => {
    //   let metrics = data.metrics;
    //   const filteredData = metrics.filter((item) => item.metric.name.includes(query));
    //   setMetricList(filteredData);
    // });
  };

  const handleClick = (action: string) => {
    setAction(action);
    setVisible(true);
  };
  // 弹窗关闭回调
  const handleClose = (action) => {
    if (['create', 'delete', 'update'].includes(action)) {
      // getTeamList();
    }
    if (['update'].includes(action)) {
      // getIconGroupDetail(iconGroupId);
    }

    setVisible(false);
  };
  const handleFileChange = (info: any) => {
    let newFileList = info.fileList.slice(-1); // 只保留最新的文件
    setFileList(newFileList); // 更新文件列表

    const file = newFileList[0]; // 获取最新的文件
    if (file && file.originFileObj) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string); // 设置缩略图
      };
      reader.readAsDataURL(file.originFileObj); // 使用 originFileObj
    } else {
      setPreviewImage(null); // 清除缩略图
    }
  };
  const handleUpload = async (values: any) => {
    const { name } = values;

    if (fileList.length > 0) {
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64String = reader.result;

        const response = await addIcon(Number(iconGroupId), { name, src: base64String });
        if (response.err === '') {
          message.success(`上传成功`);
          setIconVisible(false);
          form.resetFields();
          setPreviewImage(null); // 重置缩略图
          setFileList([]); // 清空文件列表
          getGroupIcons(iconGroupId);
        } else {
          message.error('上传失败，请重试');
        }
      };

      reader.readAsDataURL(fileList[0].originFileObj); // 使用 fileList[0].originFileObj
    } else {
      message.error('请上传图标文件');
    }
  };

  const handleDelete = async (id) => {
    confirm({
      title: '确定要删除这个图标吗?',
      onOk: async () => {
        try {
          await deleteIcon(id); // 等待删除操作完成
          message.success('图标删除成功');
          getGroupIcons(iconGroupId); // 重新获取图标列表
        } catch (error) {
          message.error('删除失败，请重试');
        }
      },
      onCancel: () => {},
    });
  };

  return (
    <PageLayout title={<Space>{t('图标管理')}</Space>} icon={<UserOutlined />}>
      <div className='user-manage-content'>
        <div style={{ display: 'flex', gap: 10, height: '100%', background: 'unset' }}>
          <div className='left-tree-area'>
            <div className='sub-title'>
              {t('图标分组')}
              <Button
                style={{
                  height: '30px',
                }}
                size='small'
                type='link'
                onClick={() => {
                  handleClick(ActionType.CreateIconGroup);
                }}
              >
                {t('common:btn.add')}
              </Button>
            </div>
            {/* <div style={{ display: 'flex', margin: '5px 0px 12px' }}>
              <Input
                prefix={<SearchOutlined />}
                placeholder={t('model.search_placeholder')}
                onPressEnter={(e: any) => {
                  getTeamList(e.target.value);
                }}
                onBlur={(e: any) => {
                  getTeamList(e.target.value);
                }}
              />
            </div> */}

            <div className='radio-list' style={{ overflowY: 'auto' }}>
              {!_.isEmpty(assetModels) && (
                <Tree
                  defaultExpandedKeys={getCollapsedKeys(listToTree(assetModels as any, '/'), getLocaleExpandedKeys(), iconGroupId as any)}
                  selectedKeys={iconGroupId ? [_.toString(iconGroupId)] : []}
                  onSelect={(_selectedKeys, e: any) => {
                    const nodeId = e.node.id;
                    setIconGroupId(nodeId as any);
                  }}
                  onExpand={(expandedKeys: string[]) => {
                    setLocaleExpandedKeys(expandedKeys);
                  }}
                  treeData={listToTree(assetModels as any, '/')}
                />
              )}
            </div>
          </div>
          <div className='resource-table-content'>
            <Row justify='space-between' align='middle'>
              <Button type='primary' onClick={() => setIconVisible(true)}>
                添加图标
              </Button>

              <Modal title='添加图标' open={iconVisible} onCancel={() => setIconVisible(false)} footer={null}>
                <Form form={form} layout='vertical' onFinish={handleUpload}>
                  <Form.Item name='name' label='图标名称' rules={[{ required: true, message: '请输入图标名称' }]}>
                    <Input placeholder='请输入图标名称' />
                  </Form.Item>
                  <Form.Item name='iconFile' label='上传图标' rules={[{ required: true, message: '请上传图标' }]}>
                    <Upload
                      beforeUpload={() => false} // 阻止默认上传行为
                      accept='image/*'
                      showUploadList={false}
                      maxCount={1}
                      fileList={fileList} // 使用 fileList 属性
                      onChange={handleFileChange}
                    >
                      <Button icon={<UploadOutlined />}>选择文件</Button>
                    </Upload>
                  </Form.Item>
                  {previewImage && ( // 显示缩略图
                    <Image
                      preview={false}
                      src={previewImage}
                      alt='图标预览'
                      style={{ marginTop: 10, width: '40px', height: '40px' }} // 设置缩略图的大小
                    />
                  )}
                  <Form.Item>
                    <Button type='primary' htmlType='submit'>
                      提交
                    </Button>
                  </Form.Item>
                </Form>
              </Modal>
            </Row>

            <div style={{ marginTop: '20px' }}>
              <Row gutter={[16, 16]} justify='start'>
                {iconList.map((icon) => (
                  <Col
                    key={icon.id}
                    xs={12} // 超小屏幕：每行2个
                    sm={8} // 小屏幕：每行3个
                    md={6} // 中等屏幕：每行4个
                    lg={4} // 大屏幕：每行6个
                    xl={4} // 超大屏幕：每行6个
                  >
                    <Card
                      hoverable
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      bodyStyle={{
                        padding: '12px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                      cover={
                        <div
                          style={{
                            height: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px',
                          }}
                        >
                          <img
                            alt={icon.name}
                            src={icon.src}
                            style={{
                              maxHeight: '100%',
                              maxWidth: '100%',
                              objectFit: 'contain',
                            }}
                          />
                        </div>
                      }
                      actions={[
                        <Button type='text' icon={<DeleteOutlined />} onClick={() => handleDelete(icon.id)} style={{ fontSize: '12px' }}>
                          删除
                        </Button>,
                      ]}
                    >
                      <Card.Meta
                        title={
                          <div
                            style={{
                              fontSize: '14px',
                              textAlign: 'center',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {icon.name}
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* 添加空状态提示 */}
              {iconList.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 0',
                    color: '#999',
                  }}
                >
                  <InfoCircleOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                  <div>暂无图标，请点击上方按钮添加</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <UserInfoModal
        visible={visible}
        action={action as ActionType}
        userType={operTyp}
        modelType={iconGroupInfo?.name}
        modelMetricId={currentMetric}
        onClose={handleClose}
        teamId={_.toNumber(iconGroupId)}
        onSearch={(val) => {
          setIconGroupId(val);
        }}
      />
    </PageLayout>
  );
};

export default Resource;
