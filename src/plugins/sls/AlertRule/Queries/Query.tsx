import React, { useState, useEffect, useContext } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Row, Col, Form, Tooltip, AutoComplete, Input, InputNumber, Select } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import GroupBy from '@/pages/dashboard/Editor/QueryEditor/Elasticsearch/GroupBy';
import QueryName from '@/components/QueryName';
import DocumentDrawer from '@/components/DocumentDrawer';
import { CommonStateContext } from '@/App';
import { getFullFields } from '@/pages/explorer/Elasticsearch/services';

import GraphPreview from '../GraphPreview';
import Value from './Value';
import DateField from './DateField';
import AdvancedSettings from './AdvancedSettings';

interface Props {
  field: any;
  datasourceValue: number;
  indexOptions: any[];
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function Query(props: Props) {
  const { t, i18n } = useTranslation('alertRules');
  const { darkMode } = useContext(CommonStateContext);
  const { field } = props;
  const { datasourceValue, indexOptions, disabled, children } = props;
  const [indexSearch, setIndexSearch] = useState('');
  const names = ['rule_config', 'queries'];
  const form = Form.useFormInstance();
  const queries = Form.useWatch(names);
  const indexValue = Form.useWatch([...names, field.name, 'index']);
  const { run: onIndexChange } = useDebounceFn(
    (val) => {
      if (datasourceValue && val) {
        getFullFields(datasourceValue, val, {
          type: 'date',
        }).then((res) => {
          const defaultDateField = _.find(res.fields, { name: '@timestamp' })?.name || res.fields[0]?.name;
          const newValues = _.set(_.cloneDeep(form.getFieldsValue()), [...names, field.key, 'date_field'], defaultDateField);
          form.setFieldsValue(newValues);
        });
      }
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    if (indexValue) {
      onIndexChange(indexValue);
    }
  }, [indexValue]);

  return (
    <div key={field.key} className='spadex-fill-color-3' style={{ padding: 10, marginBottom: 10, position: 'relative' }}>
      <Row gutter={8}>
        <Col span={7}>
          <InputGroupWithFormItem
            label={
              <span>
                {t('项目')}
                <Tooltip title={'对应阿里云SLS日志服务器的项目Project名称'}>
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
          >
            <Form.Item
              {...field}
              name={[field.name, 'project_name']}
              rules={[
                {
                  required: true,
                  message: '项目不能为空,请确认是否配置业务SLS日志采集',
                },
              ]}
            >
              <AutoComplete
                style={{ width: '100%' }}
                dropdownMatchSelectWidth={false}
                options={_.filter(indexOptions, (item) => {
                  if (indexSearch) {
                    return item.value.includes(indexSearch);
                  }
                  return true;
                })}
                onSearch={(val) => {
                  setIndexSearch(val);
                }}
                disabled={true}
              />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
        <Col span={7}>
          <InputGroupWithFormItem
            label={
              <span>
                {t('日志库')}{' '}
                <Tooltip title={'对应阿里云SLS日志服务项目中的日志库Logstore'}>
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
          >
            <Form.Item
              {...field}
              name={[field.name, 'logstore']}
              rules={[
                {
                  required: true,
                  message: '日志库不能为空',
                },
              ]}
            >
              <AutoComplete
                style={{ width: '100%' }}
                dropdownMatchSelectWidth={false}
                options={_.filter(indexOptions, (item) => {
                  if (indexSearch) {
                    return item.value.includes(indexSearch);
                  }
                  return true;
                })}
                onSearch={(val) => {
                  setIndexSearch(val);
                }}
                disabled={true}
              />
            </Form.Item>
          </InputGroupWithFormItem>
          {/* 测试 */}
        </Col>
      </Row>
      <Row gutter={8}>
        <Col flex='32px'>
          <Form.Item {...field} name={[field.name, 'ref']}>
            <QueryName existingNames={_.map(queries, 'ref')} />
          </Form.Item>
        </Col>
        <Col flex='auto'>
          <Row gutter={8}>
            <Col span={19}>
              <InputGroupWithFormItem label={<span>{t('datasource:es.filter')} </span>} labelWidth={95}>
                <Form.Item {...field} name={[field.name, 'filter']}>
                  <Input disabled={disabled} />
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
            {/* <Col span={5}> */}
            {/* <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const index = getFieldValue([...names, field.name, 'index']);
                  return <DateField disabled={disabled} datasourceValue={datasourceValue} index={index} prefixField={field} prefixNames={names} />;
                }}
              </Form.Item> */}
            {/* </Col> */}
            <Col span={5}>
              <Input.Group>
                <span className='ant-input-group-addon'>{t('datasource:es.interval')}</span>
                <Form.Item {...field} name={[field.name, 'interval']} noStyle>
                  <InputNumber disabled={disabled} style={{ width: '100%' }} min={0} />
                </Form.Item>
                <span className='ant-input-group-addon'>
                  <Form.Item {...field} name={[field.name, 'interval_unit']} noStyle initialValue='min'>
                    <Select disabled={disabled}>
                      <Select.Option value='second'>{t('common:time.second')}</Select.Option>
                      <Select.Option value='min'>{t('common:time.minute')}</Select.Option>
                      <Select.Option value='hour'>{t('common:time.hour')}</Select.Option>
                    </Select>
                  </Form.Item>
                </span>
              </Input.Group>
            </Col>
          </Row>
        </Col>
      </Row>
      {/* <Value datasourceValue={datasourceValue} index={indexValue} prefixField={field} prefixNames={names} disabled={disabled} /> */}
      <div style={{ marginTop: 8 }}>
        {/* <GroupBy datasourceValue={datasourceValue} index={indexValue} parentNames={names} prefixField={field} prefixFieldNames={[field.name]} disabled={disabled} /> */}
      </div>
      {/* <AdvancedSettings field={field} /> */}
      {/* {children} */}
      <GraphPreview datasourceValue={datasourceValue} />
    </div>
  );
}
