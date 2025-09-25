import React from 'react';
import './app.css'; // 引入样式文件

const App = () => {
  const handleBlockTime = (hours) => {
    console.log(`屏蔽时间: ${hours} 小时`);
    // 这里可以添加屏蔽逻辑
  };

  const handleBlockCall = () => {
    console.log('屏蔽电话');
    // 这里可以添加屏蔽电话逻辑
  };

  return (
    <div className='container'>
      <h1>屏蔽设置</h1>
      <div className='button-group'>
        <button onClick={() => handleBlockTime(1)}>屏蔽 1 小时</button>
        <button onClick={() => handleBlockTime(3)}>屏蔽 3 小时</button>
        <button onClick={() => handleBlockTime(6)}>屏蔽 6 小时</button>
        <button onClick={handleBlockCall}>屏蔽电话</button>
      </div>
    </div>
  );
};

export default App;
