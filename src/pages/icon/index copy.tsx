import React, { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import _, { set } from 'lodash';
import classNames from 'classnames';
import PageLayout, { HelpLink } from '@/components/pageLayout';
import { Button, Table, Input, message, Row, Col, Modal, Form, Space, Upload, Card, Image } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined, UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import UserInfoModal from './component/createModal';
import { getIconGroups, getIconGroupInfo, deleteIconGroup, addIcon, deleteIcon } from './services';
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
    iconGroupId && getIconGroupDetail(iconGroupId);
  }, [iconGroupId]);

  // useEffect(() => {
  //   getTeamList();
  // }, []);

  useEffect(() => {
    // getTeamList();
    setIconGroupId(assetModel?.id);
  }, []);

  // 获取业务组列表
  const getTeamList = (search?: string, isDelete?: boolean) => {
    let params = {
      query: search,
      limit: PAGE_SIZE,
    };
    getIconGroups(params).then((data) => {
      setTeamList(_.sortBy(data.dat, (item) => _.lowerCase(item.name)));
      if (
        (!iconGroupId ||
          isDelete ||
          _.every(data.dat, (item) => {
            return _.toNumber(item.id) !== _.toNumber(iconGroupId);
          })) &&
        data.dat.length > 0
      ) {
        setIconGroupId(data.dat[0].id);
      } else {
        iconGroupId && getIconGroups(iconGroupId);
      }
      // setModelGroups(data.dat || []);
      // setModelGroup(getDefaultModel(data.dat));
    });
  };

  // 获取型号组详情
  const getIconGroupDetail = (id: any) => {
    getIconGroupInfo(Number(id)).then((data) => {
      setIconGroupInfo(data);
      setIconList(data.icons);
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
        console.log('REsponse:', response);
        if (response.err === '') {
          message.success(`上传成功`);
          setIconVisible(false);
          form.resetFields();
          setPreviewImage(null); // 重置缩略图
          setFileList([]); // 清空文件列表
          getIconGroupDetail(iconGroupId);
        } else {
          message.error('上传失败，请重试');
        }
      };

      reader.readAsDataURL(fileList[0].originFileObj); // 使用 fileList[0].originFileObj
    } else {
      message.error('请上传图标文件');
    }
  };
  const handleIconEdit = (icon: any) => {
    form.setFieldsValue({ name: icon.name, id: icon.id, src: icon.src }); // 设置编辑表单的初始值
    setIconVisible(true);
  };

  const handleDelete = async (id) => {
    confirm({
      title: '确定要删除这个图标吗?',
      onOk: async () => {
        try {
          await deleteIcon(id); // 等待删除操作完成
          message.success('图标删除成功');
          getIconGroupDetail(iconGroupId); // 重新获取图标列表
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
          {teamList.length > 0 ? (
            <div className='resource-table-content'>
              <Row className='team-info'>
                <Col
                  span='24'
                  style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'inline',
                  }}
                >
                  {iconGroupInfo && iconGroupInfo.name}
                  <EditOutlined
                    style={{
                      marginLeft: '8px',
                      fontSize: '14px',
                    }}
                    onClick={() => handleClick(ActionType.EditIconGroup)}
                  ></EditOutlined>
                  {/* <DeleteOutlined
                    style={{
                      marginLeft: '8px',
                      fontSize: '14px',
                    }}
                    onClick={() => {
                      confirm({
                        title: t('common:confirm.delete'),
                        onOk: () => {
                          deleteIconGroup(iconGroupId).then((_) => {
                            message.success(t('common:success.delete'));
                            handleClose('delete');
                          });
                        },
                        onCancel: () => {},
                      });
                    }}
                  /> */}
                </Col>
                <Col
                  style={{
                    marginTop: '8px',
                    // color: '#666',
                  }}
                >
                  <Space>
                    <span>ID：{iconGroupInfo?.id}</span>
                    <span>描述: {iconGroupInfo?.common}</span>
                    {/* <span>
                      {t('common:table.note')}：{t('model.note_content')}
                    </span> */}
                    <span>
                      {t('common:table.create_by')}：{iconGroupInfo?.create_by ? iconGroupInfo.create_by : '-'}
                    </span>
                    <span>
                      {t('common:table.create_at')}：{iconGroupInfo?.create_at ? moment.unix(iconGroupInfo.create_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
                    </span>
                  </Space>
                </Col>
              </Row>
              <Row justify='space-between' align='middle'>
                <Col span='12'>
                  <Input
                    prefix={<SearchOutlined />}
                    className={'searchInput'}
                    onPressEnter={(e: any) => {
                      handleSearch(e.target.value);
                    }}
                    placeholder={t('图标名称')}
                  />
                </Col>
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
                        style={{ marginTop: 10, width: '100px', height: '100px' }} // 设置缩略图的大小
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
              <Row gutter={48} style={{ marginTop: '20px' }}>
                {iconList.map((icon) => (
                  <Col span={6} key={icon.id}>
                    <Card
                      hoverable
                      style={{ width: 'auto', display: 'inline-block' }} // 自适应宽度
                      cover={
                        <img
                          alt={icon.name}
                          src={icon.src}
                          style={{
                            maxHeight: '80px', // 设置最大高度
                            width: '120px', // 设置最大宽度
                            objectFit: 'contain', // 保持比例
                          }}
                        />
                      }
                      actions={[
                        // <Button type='text' icon={<EditOutlined />} onClick={() => handleIconEdit(icon)} />,
                        <Button type='text' icon={<DeleteOutlined />} onClick={() => handleDelete(icon.id)} />,
                      ]}
                    >
                      <Card.Meta title={icon.name} />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ) : (
            // dataSource={metricList && metricList.length > 0 ? metricList.filter((item) => item.user_group && item.user_group.name.indexOf(searchMemberValue) !== -1) : []}
            <div className='blank-busi-holder'>
              <p style={{ textAlign: 'left', fontWeight: 'bold' }}>
                <InfoCircleOutlined style={{ color: '#1473ff' }} /> {t('Tips')}
              </p>
              <p>
                {t('图标分组不存在,请先创建分组')}&nbsp;
                <a onClick={() => handleClick(ActionType.CreateIconGroup)}>{t('创建分组')}</a>
              </p>
            </div>
          )}
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
