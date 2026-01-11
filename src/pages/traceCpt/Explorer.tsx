import React from 'react';
import PageLayout from '@/components/pageLayout';
import { useTranslation } from 'react-i18next';
import Trace from './index';
import Dependencies from './Dependencies';
import './locale';

export { Dependencies };

export default function index() {
  const { t } = useTranslation('trace');

  return (
    <PageLayout title={'链路追踪查询'}>
      <div>
        <div className='n9e-border-base p2'>
          <Trace />
        </div>
      </div>
    </PageLayout>
  );
}
