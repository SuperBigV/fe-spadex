import React, { useState, useEffect } from 'react';
import { Form, Card, Space } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { getBusiScrapeInfo } from '../services';
import { generateQueryName } from '@/components/QueryName';
import Query from './Query';
import Field from '@/pages/explorer/Elasticsearch/FieldsSidebar/Field';

interface IProps {
  datasourceValue: number;
  form: any;
  disabled?: boolean;
  bgid?: any;
}

export default function index(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { datasourceValue, form, disabled, bgid } = props;
  const [indexOptions, setIndexOptions] = useState<any[]>([]);
  const names = ['rule_config', 'queries'];
  const queries = Form.useWatch(names);

  useEffect(() => {
    if (datasourceValue !== undefined) {
      getBusiScrapeInfo(datasourceValue, bgid).then((res) => {
        const currentQueries = form.getFieldValue(names) || [];
        const newQuerys = currentQueries.map((item) => ({
          ...item,
          logstore: res.logstore,
          project_name: res.project_name,
        }));
        form.setFieldValue(names, newQuerys);
      });
    }
  }, [datasourceValue]);

  return (
    <Form.List name={names}>
      {(fields, { add, remove }) => (
        <Card
          title={
            <Space>
              <span>{t('datasource:es.alert.query.title')}</span>
              <PlusCircleOutlined
                disabled={disabled}
                onClick={() =>
                  add({
                    ref: generateQueryName(_.map(queries, 'ref')),
                    interval_unit: 'min',
                    interval: 5,
                    date_field: 'time',
                    value: {
                      func: 'count',
                    },
                  })
                }
              />
            </Space>
          }
          size='small'
        >
          {fields.map((field) => {
            return (
              <>
                <Query key={field.key} field={field} datasourceValue={datasourceValue} indexOptions={indexOptions} disabled={disabled}>
                  {fields.length > 1 && (
                    <CloseCircleOutlined
                      style={{ position: 'absolute', right: -4, top: -4 }}
                      onClick={() => {
                        remove(field.name);
                      }}
                      disabled={disabled}
                    />
                  )}
                </Query>
              </>
            );
          })}
        </Card>
      )}
    </Form.List>
  );
}
