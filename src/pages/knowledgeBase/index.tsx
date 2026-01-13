/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React, { useState } from 'react';
import { Row, Col, Empty } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import KnowledgeBaseList from '@/components/KnowledgeBase/KnowledgeBaseList';
import DocumentList from '@/components/Document/DocumentList';
import './index.less';

const KnowledgeBasePage: React.FC = () => {
  const [selectedKBId, setSelectedKBId] = useState<number | null>(null);

  const handleSelect = (id: number | null) => {
    setSelectedKBId(id);
  };

  return (
    <PageLayout icon={<BookOutlined />} title='知识库管理'>
      <div className='knowledge-base-page'>
        <Row gutter={16} style={{ height: '100%' }}>
          <Col span={4}>
            <KnowledgeBaseList selectedId={selectedKBId} onSelect={handleSelect} />
          </Col>
          <Col span={20}>{selectedKBId ? <DocumentList knowledgeBaseId={selectedKBId} /> : <Empty description='请选择一个知识库' style={{ marginTop: 100 }} />}</Col>
        </Row>
      </div>
    </PageLayout>
  );
};

export default KnowledgeBasePage;
