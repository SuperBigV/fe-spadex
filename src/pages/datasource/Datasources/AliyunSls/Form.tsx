import React, { useRef } from 'react';
import { Form, Select, InputNumber, Tooltip, Row, Col, Card, Space, Switch, Input } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { scrollToFirstError } from '@/utils';
import Name from '../../components/items/Name';
import HTTP from '../../components/items/HTTP';
import Auth from '../../components/items/Auth';
import SkipTLSVerify from '../../components/items/SkipTLSVerify';
import Headers from '../../components/items/Headers';
import Description from '../../components/items/Description';
import Footer from '../../components/items/Footer';
import Cluster from '../../components/items/Cluster';

export default function FormCpt({ action, data, onFinish, submitLoading }: any) {
  const { t } = useTranslation('datasourceManage');
  const [form] = Form.useForm();
  const clusterRef = useRef<any>();

  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={(values) => {
        onFinish(values, clusterRef.current);
      }}
      onFinishFailed={() => {
        scrollToFirstError();
      }}
      initialValues={data}
      className='settings-source-form'
    >
      <Card title={t(`${action}_title`)}>
        <Name />
        {/* <HTTP placeholder='cn-beijing' multipleUrls /> */}
        <Form.Item label={'访问域名'} name={['http', 'url']} initialValue={'cn-beijing-intranet.log.aliyuncs.com'}>
          <Input placeholder={'cn-beijing-intranet.log.aliyuncs.com'} style={{ width: '100%' }} />
        </Form.Item>
        <Auth namePrefix={'auth'} type='ali' />

        {/* <SkipTLSVerify /> */}
        {/* <Headers /> */}

        <Description />
      </Card>
      <Footer id={data?.id} submitLoading={submitLoading} />
    </Form>
  );
}
