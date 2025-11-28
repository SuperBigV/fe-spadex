import React, { useState } from 'react';
import PageLayout, { HelpLink } from '@/components/pageLayout';
import { Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './index.less';
const AiKnowlage: React.FC = () => {
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');

  const handleQuestionSubmit = async () => {
    // 这里可以添加调用后端 API 的逻辑，获取答案
    // 例如：
    // const response = await fetch('/api/qa', {
    //   method: 'POST',
    //   body: JSON.stringify({ question }),
    // });
    // const data = await response.json();
    // setAnswer(data.answer);

    // 模拟一个简单的回答
    setAnswer(`您的问题是：“${question}”。这是模拟的回答。`);
  };

  return (
    <PageLayout
      title={
        <Space>
          {'AI知识库'}
          {/* <HelpLink src='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/personnel-permissions/user-management/' /> */}
        </Space>
      }
      icon={<UserOutlined />}
    >
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 嵌入 iframe */}
        <iframe
          src='http://127.0.0.1/next-chats/share?shared_id=c0be2754c38111f0b3971a934f5ce897&from=chat&auth=NiNjExNWM2YzM2OTExZjA5NDM5YmVjZD'
          style={{ width: '100%', height: '100%', minHeight: '600px' }}
          // frameborder="0"
        ></iframe>
      </div>
    </PageLayout>
  );
};

export default AiKnowlage;
