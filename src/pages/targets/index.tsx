import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Modal, Tag, Form, Input, Alert, Select, Tooltip, Table, message, Checkbox, Spin, Divider, Tabs, Button, Space, Row, Col, Dropdown } from 'antd';
import { DatabaseOutlined, QuestionCircleOutlined, SearchOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _, { debounce } from 'lodash';
import classNames from 'classnames';
import {
  bindTags,
  unbindTags,
  moveTargetBusi,
  deleteTargetBusi,
  updateTargetNote,
  deleteTargets,
  getTargetTags,
  offlineTarget,
  maintainTarget,
  initTarget,
  fetchInitLog,
} from '@/services/targets';
import { getBusinessTeamInfo } from '@/services/manage';
const { TabPane } = Tabs;
import PageLayout from '@/components/pageLayout';
import { getBusiGroups } from '@/services/common';
import { CommonStateContext } from '@/App';
import List, { ITargetProps } from './List';
import BusinessGroup from './BusinessGroup';
import BusiDetail from '@/pages/dashboard/Detail/BusiDetail';
import BusinessGroup2, { getCleanBusinessGroupIds } from '@/components/BusinessGroup';
import './locale';
import { useLocation } from 'react-router-dom';
import { IDashboard } from '@/pages/dashboard/types';
import './index.less';
import AlertRuleList from '@/pages/alertRules/List';
import HistoryEvents from '@/pages/historyEvents/busiEvents';
import { getDashboard, updateDashboardConfigs, getDashboardPure, getBusiGroupsDashboards } from '@/services/dashboardV2';
import Dependencies from '@/pages/traceCpt/Dependencies';
import EventTable from '@/pages/event/Table';
import { deleteAlertEventsModal } from '@/pages/event';
import { AutoRefresh } from '@/components/TimeRangePicker';
import TimeRangePicker, { getDefaultValue } from '@/components/TimeRangePicker';
import DatasourceSelect from '@/components/DatasourceSelect/DatasourceSelect';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';
import { getProdOptions } from '@/pages/alertRules/Form/components/ProdSelect';
import { IS_ENT } from '@/utils/constant';
import queryString from 'query-string';
export { BusinessGroup }; // TODO 部分页面使用的老的业务组组件，后续逐步替换
interface jumpProps {
  id: string;
  full_value: string;
}
interface URLParam {
  did: string;
}
enum OperateType {
  BindTag = 'bindTag',
  UnbindTag = 'unbindTag',
  UpdateBusi = 'updateBusi',
  RemoveBusi = 'removeBusi',
  UpdateNote = 'updateNote',
  InitTarget = 'init',
  Delete = 'delete',
  None = 'none',
}

enum OperateLife {
  Online = 'online',
  Offline = 'offline',
  Scrap = 'scrap',
  Maintain = 'maintain',
  None = 'none',
}

interface OperateionModalProps {
  operateType: OperateType;
  setOperateType: any;
  idents: string[];
  reloadList: () => void;
}

const { TextArea } = Input;

/*************  ✨ Codeium Command ⭐  *************/
/**
 * 操作确认弹窗
 * @param operateType 操作类型
 * @param setOperateType 设置操作类型
 * @param idents 监控对象列表
 * @param reloadList 刷新列表
 */
/******  18e529ac-328f-4111-8dd3-c000c539fe44  *******/
const OperationModal: React.FC<OperateionModalProps> = ({ operateType, setOperateType, idents, reloadList }) => {
  const { t } = useTranslation('targets');
  const { busiGroups, businessGroup } = useContext(CommonStateContext);
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [identList, setIdentList] = useState<string[]>(idents);
  const [tagsList, setTagsList] = useState<string[]>([]);
  const detailProp = operateType === OperateType.UnbindTag ? tagsList : busiGroups;
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [jumpBusiGroups, setJumpBusiGroups] = useState<jumpProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [initText, setInitText] = useState<any>();
  const [timer, setTimer] = useState<any>();

  useEffect(() => {
    return () => {
      // 清除定时器
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);
  // 绑定标签弹窗内容
  const bindTagDetail = () => {
    // 校验单个标签格式是否正确
    function isTagValid(tag) {
      const contentRegExp = /^[a-zA-Z_][\w]*={1}[^=]+$/;
      return {
        isCorrectFormat: contentRegExp.test(tag.toString()),
        isLengthAllowed: tag.toString().length <= 64,
      };
    }

    // 渲染标签
    function tagRender(content) {
      const { isCorrectFormat, isLengthAllowed } = isTagValid(content.value);
      return isCorrectFormat && isLengthAllowed ? (
        <Tag closable={content.closable} onClose={content.onClose}>
          {content.value}
        </Tag>
      ) : (
        <Tooltip title={isCorrectFormat ? t('bind_tag.render_tip1') : t('bind_tag.render_tip2')}>
          <Tag color='error' closable={content.closable} onClose={content.onClose} style={{ marginTop: '2px' }}>
            {content.value}
          </Tag>
        </Tooltip>
      );
    }

    // 校验所有标签格式
    function isValidFormat() {
      return {
        validator(_, value) {
          const isInvalid = value.some((tag) => {
            const { isCorrectFormat, isLengthAllowed } = isTagValid(tag);
            if (!isCorrectFormat || !isLengthAllowed) {
              return true;
            }
          });
          const tagkeys = value.map((tag) => {
            const tagkey = tag.split('=')[0];
            return tagkey;
          });
          const isDuplicateKey = tagkeys.some((tagkey, index) => {
            return tagkeys.indexOf(tagkey) !== index;
          });
          if (isInvalid) {
            return Promise.reject(new Error(t('bind_tag.msg2')));
          }
          if (isDuplicateKey) {
            return Promise.reject(new Error(t('bind_tag.msg3')));
          }
          return Promise.resolve();
        },
      };
    }

    return {
      operateTitle: t('bind_tag.title'),
      requestFunc: bindTags,
      isFormItem: true,
      render() {
        return (
          <Form.Item label={t('common:table.tag')} name='tags' rules={[{ required: true, message: t('bind_tag.msg1') }, isValidFormat]}>
            <Select mode='tags' tokenSeparators={[' ']} open={false} placeholder={t('bind_tag.placeholder')} tagRender={tagRender} />
          </Form.Item>
        );
      },
    };
  };

  // 解绑标签弹窗内容
  const unbindTagDetail = (tagsList) => {
    return {
      operateTitle: t('unbind_tag.title'),
      requestFunc: unbindTags,
      isFormItem: true,
      render() {
        return (
          <Form.Item label={t('common:table.tag')} name='tags' rules={[{ required: true, message: t('unbind_tag.msg') }]}>
            <Select mode='multiple' showArrow={true} placeholder={t('unbind_tag.placeholder')} options={tagsList.map((tag) => ({ label: tag, value: tag }))} />
          </Form.Item>
        );
      },
    };
  };
  const onCheckboxChange = (checkedValues) => {
    setCheckedValues(checkedValues);
  };
  const initDetail = (tagsList) => {
    return {
      operateTitle: t('初始化'),
      requestFunc: initTarget,
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
              <Form.Item label='默认密码' name='password' initialValue={'Ztth@246810'} rules={[{ required: true, message: '请输入默认密码' }]}>
                <Input placeholder='请输入默认密码' defaultValue='Ztth@246810' />
              </Form.Item>
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

  // 移出业务组弹窗内容
  const removeBusiDetail = () => {
    return {
      operateTitle: t('remove_busi.title'),
      requestFunc: deleteTargetBusi,
      isFormItem: true,
      render() {
        return (
          <>
            <Form.Item name='bgids' hidden initialValue={[businessGroup.id]}>
              <div />
            </Form.Item>
            <Alert message={t('remove_busi.msg')} type='error' />
          </>
        );
      },
    };
  };

  // 修改备注弹窗内容
  const updateNoteDetail = () => {
    return {
      operateTitle: t('update_note.title'),
      requestFunc: updateTargetNote,
      isFormItem: true,
      render() {
        return (
          <Form.Item label={t('common:table.note')} name='note'>
            <Input maxLength={64} placeholder={t('update_note.placeholder')} />
          </Form.Item>
        );
      },
    };
  };

  // 批量删除弹窗内容
  const deleteDetail = () => {
    return {
      operateTitle: t('batch_delete.title'),
      requestFunc: deleteTargets,
      isFormItem: false,
      render() {
        return <Alert message={t('batch_delete.msg')} type='error' />;
      },
    };
  };

  // 修改业务组弹窗内容
  const updateBusiDetail = (busiGroups) => {
    return {
      operateTitle: t('update_busi.title'),
      requestFunc: moveTargetBusi,
      isFormItem: true,
      render() {
        return (
          <Form.Item label={t('update_busi.label')} name='bgids' rules={[{ required: true }]}>
            <Select
              showSearch
              style={{ width: '100%' }}
              options={filteredBusiGroups.map(({ id, name }) => ({
                label: name,
                value: id,
              }))}
              optionFilterProp='label'
              filterOption={false}
              mode='multiple'
              onSearch={handleSearch}
              onFocus={() => {
                getBusiGroups('', 5000, 'asset').then((res) => {
                  setFilteredBusiGroups(res.dat || []);
                });
              }}
              onClear={() => {
                getBusiGroups('', 5000, 'asset').then((res) => {
                  setFilteredBusiGroups(res.dat || []);
                });
              }}
            />
          </Form.Item>
        );
      },
    };
  };

  const operateDetail = {
    bindTagDetail,
    unbindTagDetail,
    updateBusiDetail,
    removeBusiDetail,
    initDetail,
    updateNoteDetail,
    deleteDetail,
    noneDetail: () => ({
      operateTitle: '',
      requestFunc() {
        return Promise.resolve();
      },
      isFormItem: false,
      render() {},
    }),
  };
  const { operateTitle, requestFunc, isFormItem, render } = operateDetail[`${operateType}Detail`](detailProp);
  const [filteredBusiGroups, setFilteredBusiGroups] = useState(busiGroups);
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

  // 提交表单
  function submitForm() {
    form.validateFields().then((data) => {
      setConfirmLoading(true);
      data.idents = data.idents.split('\n');
      requestFunc(data)
        .then((res) => {
          message.success(t('操作成功'));
          setConfirmLoading(false);
          // setConfirmLoading(false);
          reloadList();
          setOperateType(OperateType.None);
        })
        .catch(() => setConfirmLoading(false));
    });
  }

  // 初始化展示所有业务组
  useEffect(() => {
    if (!filteredBusiGroups.length) {
      setFilteredBusiGroups(busiGroups);
    }
  }, [busiGroups]);

  const fetchBusiGroup = (e) => {
    getBusiGroups(e).then((res) => {
      setFilteredBusiGroups(res.dat || []);
    });
  };
  const handleSearch = useCallback(debounce(fetchBusiGroup, 800), []);

  // 点击批量操作时，初始化默认监控对象列表
  // 解绑标签时，根据输入框监控对象动态获取标签列表
  useEffect(() => {
    if (operateType !== OperateType.None) {
      setIdentList(idents);
      form.setFieldsValue({
        idents: idents.join('\n'),
      });
    }
  }, [operateType, idents]);

  // 解绑标签时，根据输入框监控对象动态获取标签列表
  useEffect(() => {
    if (operateType === OperateType.UnbindTag && identList.length) {
      getTargetTags({ idents: identList.join(','), ignore_host_tag: true }).then(({ dat }) => {
        // 删除多余的选中标签
        const curSelectedTags = form.getFieldValue('tags') || [];
        form.setFieldsValue({
          tags: curSelectedTags.filter((tag) => dat.includes(tag)),
        });

        setTagsList(dat);
      });
    }
  }, [operateType, identList]);

  return (
    <Modal
      open={operateType !== 'none'}
      title={operateTitle}
      confirmLoading={confirmLoading}
      afterClose={() => {
        clearInterval(timer);
        setConfirmLoading(false);
        setCheckedValues([]);
        setInitText('');
      }}
      okButtonProps={{
        danger: operateType === OperateType.RemoveBusi || operateType === OperateType.Delete,
      }}
      okText={operateType === OperateType.RemoveBusi ? t('remove_busi.btn') : operateType === OperateType.Delete ? t('batch_delete.btn') : t('common:btn.ok')}
      onOk={submitForm}
      onCancel={() => {
        setOperateType(OperateType.None);
        form.resetFields();
      }}
    >
      {/* 基础展示表单项 */}
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
        <Form.Item label={t('资产对象')} name='idents' rules={[{ required: true }]}>
          <TextArea autoSize={{ minRows: 3, maxRows: 10 }} placeholder={t('target_life_placeholder')} onBlur={formatValue} />
        </Form.Item>
        {isFormItem && render()}
      </Form>
      {!isFormItem && render()}
    </Modal>
  );
};

const Targets: React.FC = () => {
  const { t } = useTranslation('targets');
  const { businessGroup, feats } = useContext(CommonStateContext);
  const [gids, setGids] = useState<string | undefined>(businessGroup.ids);
  const [operateType, setOperateType] = useState<OperateType>(OperateType.None);
  const [operateLife, setOperateLife] = useState<OperateLife>(OperateLife.None);
  const [selectedRows, setSelectedRows] = useState<ITargetProps[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  // useEffect(() => {InitTarget
  //   getBusinessTeamInfo(assetGroup.id).then((res) => {
  //     // setLabelValue(res?.label_value || '');
  //     // setLabelKey(res?.label_key || '');
  //   });
  // }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [activeKey, setActiveKey] = useState('2');
  const [dashboardId, setDashboardId] = useState<number>(0);
  const [dashboardList, setDashboardList] = useState<IDashboard[]>([]);
  const [processName, setProcessName] = useState<string | undefined>(undefined);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const did = params.get('did');

  // 正在告警 TabPane 相关状态
  const CACHE_KEY = 'alert_active_events_range';
  const query = queryString.parse(location.search);
  const getEventFilter = (query, currentGids?: string) => {
    // 优先使用 gids，如果 gids 不存在或为 '0'，则使用 query 中的 bgid
    let bgidValue: number | undefined = undefined;
    if (currentGids && currentGids !== '0' && currentGids !== '-2') {
      bgidValue = Number(currentGids);
    } else if (query.bgid) {
      bgidValue = Number(query.bgid);
    }
    return {
      range: getDefaultValue(CACHE_KEY, undefined),
      datasource_ids: query.datasource_ids ? _.split(query.datasource_ids, ',').map(Number) : [],
      bgid: bgidValue,
      severity: query.severity ? Number(query.severity) : undefined,
      query: query.query,
      is_recovered: query.is_recovered ? Number(query.is_recovered) : undefined,
      rule_prods: query.rule_prods ? _.split(query.rule_prods, ',') : [],
    };
  };
  const [eventFilter, setEventFilter] = useState(getEventFilter(query, gids));
  const [eventRefreshFlag, setEventRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [eventSelectedRowKeys, setEventSelectedRowKeys] = useState<number[]>([]);
  let prodOptions = getProdOptions(feats);
  if (IS_ENT) {
    prodOptions = [
      ...prodOptions,
      {
        label: t('AlertHisEvents:rule_prod.firemap'),
        value: 'firemap',
        pro: false,
      },
      {
        label: t('AlertHisEvents:rule_prod.northstar'),
        value: 'northstar',
        pro: false,
      },
    ];
  }

  // 正在告警 TabPane 的 header 渲染函数
  const { t: tEvent } = useTranslation('AlertCurEvents');
  function renderEventHeader() {
    return (
      <Row justify='space-between' style={{ width: '100%' }}>
        <Space>
          <TimeRangePicker
            allowClear
            localKey={CACHE_KEY}
            value={eventFilter.range}
            onChange={(val) => {
              setEventFilter({
                ...eventFilter,
                range: val,
              });
            }}
            dateFormat='YYYY-MM-DD HH:mm:ss'
          />
          <Select
            allowClear
            placeholder={tEvent('prod')}
            style={{ minWidth: 80 }}
            value={eventFilter.rule_prods}
            mode='multiple'
            onChange={(val) => {
              setEventFilter({
                ...eventFilter,
                rule_prods: val,
              });
            }}
            dropdownMatchSelectWidth={false}
          >
            {prodOptions.map((item) => {
              return (
                <Select.Option value={item.value} key={item.value}>
                  {item.label}
                </Select.Option>
              );
            })}
          </Select>
          <DatasourceSelect
            style={{ width: 100 }}
            filterKey='alertRule'
            value={eventFilter.datasource_ids}
            onChange={(val: number[]) => {
              setEventFilter({
                ...eventFilter,
                datasource_ids: val,
              });
            }}
          />
          <BusinessGroupSelectWithAll
            value={eventFilter.bgid}
            onChange={(val: number) => {
              setEventFilter({
                ...eventFilter,
                bgid: val,
              });
            }}
          />
          <Select
            allowClear
            style={{ minWidth: 80 }}
            placeholder={tEvent('severity')}
            value={eventFilter.severity}
            onChange={(val) => {
              setEventFilter({
                ...eventFilter,
                severity: val,
              });
            }}
            dropdownMatchSelectWidth={false}
          >
            <Select.Option value={1}>严重</Select.Option>
            <Select.Option value={2}>警告</Select.Option>
            <Select.Option value={3}>通知</Select.Option>
          </Select>
          <Input
            className='search-input'
            prefix={<SearchOutlined />}
            placeholder={tEvent('search_placeholder')}
            value={eventFilter.query}
            onChange={(e) => {
              setEventFilter({
                ...eventFilter,
                query: e.target.value,
              });
            }}
          />
        </Space>
        <Col
          flex='100px'
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Dropdown
            overlay={
              <ul className='ant-dropdown-menu'>
                <li
                  className='ant-dropdown-menu-item'
                  onClick={() =>
                    deleteAlertEventsModal(
                      eventSelectedRowKeys,
                      () => {
                        setEventSelectedRowKeys([]);
                        setEventRefreshFlag(_.uniqueId('refresh_'));
                      },
                      tEvent,
                    )
                  }
                >
                  {tEvent('common:btn.batch_delete')}
                </li>
              </ul>
            }
            trigger={['click']}
          >
            <Button style={{ marginRight: 8 }} disabled={eventSelectedRowKeys.length === 0}>
              {tEvent('batch_btn')}
            </Button>
          </Dropdown>
          <AutoRefresh
            onRefresh={() => {
              setEventRefreshFlag(_.uniqueId('refresh_'));
            }}
          />
        </Col>
      </Row>
    );
  }

  const onChange = (key) => {
    setActiveKey(key);
    switch (key) {
      case '3':
        setIsLoading(false);
        getBusiGroupsDashboards(gids)
          .then((res) => {
            setDashboardList(res);
            if (res && res.length > 0) {
              const id = res[0].id;
              setDashboardId(id);
              setIsLoading(true);
            }
          })
          .catch(() => {
            setIsLoading(false);
          });
        break;
      case '7':
        // 切换到链路拓扑 tab 时，获取业务信息并提取 processName
        if (gids && gids !== '0') {
          getBusinessTeamInfo(gids)
            .then((res) => {
              const processNameValue = res?.attr?.processName;
              setProcessName(processNameValue || undefined);
            })
            .catch(() => {
              setProcessName(undefined);
            });
        } else {
          setProcessName(undefined);
        }
        break;
    }
  };
  useEffect(() => {
    if (did) {
      setDashboardId(Number(did));
      setActiveKey('3');
      setIsLoading(true);
    }
    // 注意：当 did 不存在时，由 gids 和 activeKey 的 useEffect 处理
  }, [did]);
  useEffect(() => {
    // 当业务组变化时，如果当前在监控态势 tab，重新获取 dashboard 列表
    if (activeKey === '3') {
      setIsLoading(false);
      getBusiGroupsDashboards(gids)
        .then((res) => {
          setDashboardList(res);
          if (res && res.length > 0) {
            const id = res[0].id;
            setDashboardId(id);
            setIsLoading(true);
          }
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
    // 当业务组变化时，如果当前在链路拓扑 tab，重新获取 processName
    if (activeKey === '7' && gids && gids !== '0') {
      getBusinessTeamInfo(gids)
        .then((res) => {
          const processNameValue = res?.attr?.processName;
          setProcessName(processNameValue || undefined);
        })
        .catch(() => {
          setProcessName(undefined);
        });
    } else if (activeKey === '7' && (!gids || gids === '0')) {
      setProcessName(undefined);
    }
  }, [gids, activeKey]);

  // 当 gids 变化时，更新 eventFilter 的 bgid
  useEffect(() => {
    setEventFilter((prevFilter) => {
      let newBgid: number | undefined = undefined;
      if (gids && gids !== '0' && gids !== '-2') {
        newBgid = Number(gids);
      }
      // 只有当 bgid 真正变化时才更新
      if (prevFilter.bgid !== newBgid) {
        return {
          ...prevFilter,
          bgid: newBgid,
        };
      }
      return prevFilter;
    });
  }, [gids]);

  return (
    <PageLayout icon={<DatabaseOutlined />} title={t('软件洞察')}>
      <div className='object-manage-page-content'>
        <BusinessGroup2
          showSelected={gids !== '0' && gids !== undefined}
          onSelect={(key) => {
            const ids = getCleanBusinessGroupIds(key);
            setActiveKey('2');
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
          <Tabs activeKey={activeKey} onChange={onChange}>
            {/* <TabPane tab='软件概览' key='1'>
            </TabPane> */}
            <TabPane tab='主机列表' key='2'>
              <List
                gids={gids}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                // targetType={labelValue}
                refreshFlag={refreshFlag}
                setRefreshFlag={setRefreshFlag}
                setOperateType={setOperateType}
              />
            </TabPane>
            <TabPane tab='监控态势' key='3'>
              {/* <MonitoringStatus /> */}

              {isLoading && <BusiDetail dashboardId={_.toString(dashboardId)} />}
            </TabPane>
            <TabPane tab='告警规则' key='4'>
              {/* <AlarmRules /> */}
              <AlertRuleList gids={gids} />
            </TabPane>
            <TabPane tab='正在告警' key='5'>
              {(() => {
                const eventFilterObj = Object.assign(
                  { range: eventFilter.range },
                  eventFilter.datasource_ids.length ? { datasource_ids: eventFilter.datasource_ids } : {},
                  eventFilter.severity ? { severity: eventFilter.severity } : {},
                  eventFilter.query ? { query: eventFilter.query } : {},
                  { bgid: eventFilter.bgid },
                  eventFilter.rule_prods.length ? { rule_prods: _.join(eventFilter.rule_prods, ',') } : {},
                );
                return (
                  <EventTable
                    header={renderEventHeader()}
                    filter={eventFilter}
                    filterObj={eventFilterObj}
                    setFilter={setEventFilter}
                    refreshFlag={eventRefreshFlag}
                    selectedRowKeys={eventSelectedRowKeys}
                    setSelectedRowKeys={setEventSelectedRowKeys}
                  />
                );
              })()}
            </TabPane>
            <TabPane tab='历史告警' key='6'>
              {/* <AlarmHistory /> */}
              <HistoryEvents></HistoryEvents>
            </TabPane>
            <TabPane tab='链路拓扑' key='7'>
              <Dependencies processName={processName} hideServiceSelector={true} />
            </TabPane>
          </Tabs>
        </div>
      </div>
      {_.includes(_.values(OperateType), operateType) && (
        <OperationModal
          operateType={operateType}
          setOperateType={setOperateType}
          idents={_.map(selectedRows, 'ident')}
          reloadList={() => {
            setRefreshFlag(_.uniqueId('refreshFlag_'));
          }}
        />
      )}
    </PageLayout>
  );
};

export default Targets;
