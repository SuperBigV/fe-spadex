import React, { useState, useEffect } from 'react';
import { Form, Card, Space } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { getIndices, getPatternIndices } from '@/pages/explorer/Elasticsearch/services';
import { generateQueryName } from '@/components/QueryName';
import { getBusinessTeamInfo } from '@/services/manage';
import Query from './Query';

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
      getBusinessTeamInfo(bgid).then((res) => {
        const parts = res.name.split('/').filter(Boolean); // 移除空字符串
        if (parts.length < 2) {
          throw new Error('路径格式错误，至少需要两个部分');
        }

        const currentQueries = form.getFieldValue(names) || [];
        const newQuerys = currentQueries.map((item) => ({
          ...item,
          logstore: parts[parts.length - 1],
          project_name: parts[parts.length - 2],
        }));
        form.setFieldValue(names, newQuerys);
      });
      getPatternIndices(datasourceValue).then((res) => {
        setIndexOptions(
          _.map(res, (item) => {
            return {
              value: item.name,
            };
          }),
        );
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
                    date_field: '@timestamp',
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
