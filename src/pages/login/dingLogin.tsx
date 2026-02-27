import React, { useEffect } from 'react';
import { authDingLogin } from '@/services/login';
import { IDTLoginFrameParams, IDTLoginLoginParams, IDTLoginSuccess } from './ding';
import { set } from 'lodash';

const DingTalkLogin: React.FC = () => {
  const [isOnload, setOnload] = React.useState(false);
  const frameParams: IDTLoginFrameParams = {
    id: 'dtFrameContainer', // 包裹容器元素ID
    width: 300, // 二维码iframe元素宽度
    height: 300, // 二维码iframe元素高度
  };

  const loginParams: IDTLoginLoginParams = {
    // redirect_uri: encodeURIComponent('http://127.0.0.1:8765/api/spadex/auth/ding/login'), // 替换为你的重定向URI
    redirect_uri: encodeURIComponent('http://zops.icsoc.net/api/spadex/auth/ding/login'), // 替换为你的重定向URI
    response_type: 'code',
    client_id: 'dingl5q0kdldvovw2gry', // 替换为你的钉钉应用ID
    scope: 'openid', // 替换为你的scope
    prompt: 'consent',
  };

  const handleSuccess = (result: IDTLoginSuccess) => {
    // 在这里处理成功登录后的逻辑，比如重定向或保存 authCode
    authDingLogin(result.redirectUrl).then((res) => {
      const { dat, err } = res;
      if (!err) {
        const { access_token, refresh_token } = dat;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        window.location.href = '/';
      }
    });
    // window.location.href = '/';
    // window.location.href = result.redirectUrl; // 重定向到登录成功页面
  };

  const handleError = (errorMsg: string) => {
    console.error('登录失败:', errorMsg);
    // 在这里处理登录失败的逻辑
  };

  useEffect(() => {
    // 动态加载钉钉的 JavaScript SDK
    const script = document.createElement('script');
    script.src = 'https://g.alicdn.com/dingding/h5-dingtalk-login/0.21.0/ddlogin.js';
    script.async = true;
    script.onload = () => {
      // 确保 SDK 加载完成后调用登录方法
      setOnload(true);
    };
    document.body.appendChild(script);

    // 清理函数
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (window.DTFrameLogin) {
      window.DTFrameLogin(frameParams, loginParams, handleSuccess, handleError);
    } else {
      console.error('DTFrameLogin 方法未定义');
    }
  }, [isOnload]);

  return (
    <div id={frameParams.id} style={{ width: frameParams.width, height: frameParams.height }}>
      <h1>钉钉扫码登录</h1>
      <p>请使用钉钉扫码登录。</p>
    </div>
  );
};

export default DingTalkLogin;
