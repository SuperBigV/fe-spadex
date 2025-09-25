import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Radio, Select, Input } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { getMonObjectList } from '@/services/targets';
import { getProjectList } from './services';
import { ScrpTyps } from '@/store/manageInterface';
interface IProps {
  visible: boolean;
  gids: string | undefined;
  selectedRow?: any;
  onOk: (data: any) => Promise<void>;
  destroy: () => void;
  action: string;
  busiTargets?: any[];
  dataSourceList: any[];
}

const ScrapeModal: React.FC<IProps> = (props: IProps) => {
  // const [busiTargets, setBusiTargets] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>('scrp-perf');
  const { visible, onOk, destroy, gids, action, selectedRow, busiTargets, dataSourceList } = props;
  const [form] = Form.useForm();
  const [initValues, setInitialValues] = useState<any>({ env: 'host' });
  const [loading, setLoading] = useState<boolean>(true);
  const dataSourceId = Form.useWatch('datasource_id', form);
  const [isSls, setIsSls] = useState<boolean | null>(true);
  // const [datasourceLists, setDatasourceLists] = useState<any[]>([]);
  const [defaultDataSourceId, setDefaultDataSourceId] = useState<number | null>(0);
  const [projectList, setProjectList] = useState<any[]>([]);
  const { Option } = Select;
  const handleOk = async () => {
    const values: any = await form.validateFields();
    values.collect_type = selectedType;
    onOk(values).then(() => {
      destroy();
    });
  };
  const handleButtonClick = (type: string) => {
    setSelectedType(type);
  };

  useEffect(() => {
    initialValues();
  }, [gids]);
  useEffect(() => {
    const slsPlugins = dataSourceList.filter((item) => item.plugin_type === 'sls');

    // 2. 如果存在符合条件的条目，设置默认 id
    if (slsPlugins.length > 0) {
      setDefaultDataSourceId(slsPlugins[0].id); // 取第一个匹配项的 id
    }
  }, []);
  useEffect(() => {
    if (!dataSourceId) {
      return;
    }
    const foundItem = dataSourceList.find((item) => item.id === dataSourceId);

    getProjectList(dataSourceId, foundItem.plugin_type).then((res) => {
      setProjectList(res);
    });
  }, [dataSourceId]);

  const initialValues = () => {
    if (action === 'edit') {
      setSelectedType(selectedRow.collect_type);
      const curtItem = dataSourceList.find((item) => item.id === selectedRow.datasource_id);
      if (curtItem) {
        setIsSls(curtItem.plugin_type === 'sls');
      }
      setInitialValues(selectedRow);
    }
    setLoading(false);
  };
  const changeDataSource = (value: any) => {
    if (value !== defaultDataSourceId) {
      setIsSls(false);
    } else {
      setIsSls(true);
    }
  };
  // const scrpTyps = [
  //   {
  //     label: '性能采集',
  //     value: 'scrp-perf',
  //   },
  //   {
  //     label: '进程采集',
  //     value: 'scrp-proc',
  //   },
  //   {
  //     label: '日志采集',
  //     value: 'scrp-log',
  //   },
  // ];

  return !loading ? (
    <Modal title='应用采集配置' width={650} open={visible} onOk={handleOk} onCancel={destroy}>
      <Form layout='horizontal' labelAlign='left' form={form} initialValues={initValues} preserve={true}>
        {/* <h4 style={{ fontWeight: 'bold' }}>采集类型</h4> */}
        <div style={{ color: '#333', fontSize: '14px', fontWeight: 700, height: '22px', lineHeight: '22px', marginBottom: '10px' }}>选择应用采集类型</div>
        <Form.Item name='collect_type'>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            {ScrpTyps.map((item) => (
              <Button
                key={item.value}
                className='busi-scrape-btn'
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '185px',
                  height: '56px',
                  border: selectedType === item.value ? '1px solid #0070CB' : '1px solid #E3E4E6',
                  position: 'relative',
                  backgroundColor: 'transparent',
                }}
                onClick={() => handleButtonClick(item.value)}
              >
                {item.label}
                {selectedType === item.value && (
                  <CheckCircleOutlined
                    style={{
                      color: '#0070CB',
                    }}
                  />
                )}
              </Button>
            ))}
          </div>
        </Form.Item>
        <div style={{ color: '#333', fontSize: '14px', fontWeight: 700, height: '22px', lineHeight: '22px', marginBottom: '10px' }}>采集参数</div>
        {selectedType === 'scrp-log' && (
          <>
            <Form.Item label='数据源' name='datasource_id' initialValue={defaultDataSourceId}>
              <Select
                placeholder='请选择数据源'
                onChange={(item) => {
                  changeDataSource(item);
                }}
              >
                {dataSourceList?.map((item, index) => (
                  <Option value={item.id} key={index}>
                    <div>
                      <div>{item.name}</div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {!isSls && (
              <>
                <Form.Item label='日志索引' name='process_name' tooltip={'日志项目, 日志存储logstore默认是模块名称'}>
                  <Select>
                    {projectList?.map((item, index) => (
                      <Option value={item.name} key={index}>
                        <div>
                          <div>{item.name}</div>
                          {/* <div style={{ color: '#8c8c8c' }}>{item.description}</div> */}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label='采集主机' name='collect_idents'>
                  <Select mode='multiple'>
                    {busiTargets?.map((item, index) => (
                      <Option value={item.id} key={index}>
                        <div>
                          <div>{item.ident}</div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label='采集路径' name='collect_target' tooltip={'主机部署请输入日志存储的日志路径,如果是容器部署默认是stdout'} initialValue={''}>
                  <Input placeholder='请输入应用日志路径，例如: /data/log/app.log' />
                </Form.Item>
              </>
            )}
            {isSls && (
              <>
                <Form.Item label='日志项目' name='process_name' tooltip={'日志项目, 日志存储logstore默认是模块名称'}>
                  <Select>
                    {projectList?.map((item, index) => (
                      <Option value={item.projectName} key={index}>
                        <div>
                          <div>{item.projectName}</div>
                          <div style={{ color: '#8c8c8c' }}>{item.description}</div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label='采集路径' name='collect_target' tooltip={'主机部署请输入日志存储的日志路径,如果是容器部署默认是stdout'} initialValue={'stdout'}>
                  <Input placeholder='' />
                </Form.Item>
              </>
            )}
          </>
        )}
        {selectedType === 'scrp-perf' && (
          <>
            {/* <Form.Item label='运行环境' name='env'>
              <Radio.Group
                name='radiogroup'
                options={[
                  { value: 'host', label: '主机' },
                  { value: 'container', label: '容器' },
                ]}
              />
            </Form.Item> */}
            <Form.Item label='进程名称' name='process_name' tooltip={'用于指标的标签,区分不同应用'}>
              <Input placeholder='请输入应用标识，例如ekt-app' />
            </Form.Item>
            <Form.Item label='采集接口' name='collect_target' tooltip={'应用自主暴露的指标采集接口,主机运行的应用要配置http://127.0.0.1:端口/接口'}>
              <Input placeholder='请输入应用采集接口，例如http://127.0.0.1:8080/metrics' />
            </Form.Item>

            <Form.Item label='采集主机' name='collect_idents'>
              <Select mode='multiple'>
                {busiTargets?.map((item, index) => (
                  <Option value={item.id} key={index}>
                    <div>
                      <div>{item.ident}</div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}
        {selectedType === 'scrp-proc' && (
          <>
            <Form.Item label='进程名称' name='collect_target' tooltip={'支持进程名和命令行中包含的字符串匹配'}>
              <Input placeholder='请输入应用标识，例如ekt-app或scrpit.py' />
            </Form.Item>

            <Form.Item label='采集主机' name='collect_idents'>
              <Select mode='multiple'>
                {busiTargets?.map((item, index) => (
                  <Option value={item.id} key={index}>
                    <div>
                      <div>{item.ident}</div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  ) : null;
};

export default ModalHOC<IProps>(ScrapeModal);
// export default ScrapeModal;
