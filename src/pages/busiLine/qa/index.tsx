import React, { useState } from 'react';

const BusiLineQA: React.FC = () => {
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
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 嵌入 iframe */}
      <iframe src='http://127.0.0.1/chat/9lRL7Ah0euEo9oZ0' style={{ width: '100%', height: '100%', minHeight: '700px' }} frameBorder='0' allow='microphone' />
    </div>
  );
};

export default BusiLineQA;
