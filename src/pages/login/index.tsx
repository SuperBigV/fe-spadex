import React, { useState, useEffect, useRef, useContext } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { PictureOutlined, UserOutlined, LockOutlined, DingtalkOutlined, LoginOutlined } from '@ant-design/icons';
import { ifShowCaptcha, getCaptcha, getSsoConfig, getRedirectURL, getRedirectURLCAS, getRedirectURLOAuth, authLogin, getRSAConfig } from '@/services/login';
import './login.less';
import { useTranslation } from 'react-i18next';
import { RsaEncry } from '@/utils/rsa';
import { CommonStateContext } from '@/App';
import { AccessTokenKey } from '@/utils/constant';
import DingTalkLogin from './dingLogin'; // 引入钉钉扫码登录组件

export interface DisplayName {
  oidc: string;
  cas: string;
  oauth: string;
}

export default function Login() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const history = useHistory();
  const location = useLocation();
  const { siteInfo } = useContext(CommonStateContext);
  const redirect = location.search && new URLSearchParams(location.search).get('redirect');
  const [displayName, setDis] = useState<DisplayName>({
    oidc: 'OIDC',
    cas: 'CAS',
    oauth: 'OAuth',
  });
  const [showcaptcha, setShowcaptcha] = useState(false);
  const [showDingTalkLogin, setShowDingTalkLogin] = useState(false); // 新增状态
  const verifyimgRef = useRef<HTMLImageElement>(null);
  const captchaidRef = useRef<string>();

  const refreshCaptcha = () => {
    getCaptcha().then((res) => {
      if (res.dat && verifyimgRef.current) {
        verifyimgRef.current.src = res.dat.imgdata;
        captchaidRef.current = res.dat.captchaid;
      } else {
        message.warning('获取验证码失败');
      }
    });
  };

  useEffect(() => {
    getSsoConfig().then((res) => {
      if (res.dat) {
        setDis({
          oidc: res.dat.oidcDisplayName,
          cas: res.dat.casDisplayName,
          oauth: res.dat.oauthDisplayName,
        });
      }
    });

    ifShowCaptcha().then((res) => {
      setShowcaptcha(res?.dat?.show);
      if (res?.dat?.show) {
        getCaptcha().then((res) => {
          if (res.dat && verifyimgRef.current) {
            verifyimgRef.current.src = res.dat.imgdata;
            captchaidRef.current = res.dat.captchaid;
          } else {
            message.warning('获取验证码失败');
          }
        });
      }
    });
  }, []);

  const handleSubmit = () => {
    form.validateFields().then(() => {
      login();
    });
  };

  const login = async () => {
    let { username, password, verifyvalue } = form.getFieldsValue();
    const rsaConf = await getRSAConfig();
    const {
      dat: { OpenRSA, RSAPublicKey },
    } = rsaConf;
    const authPassWord = OpenRSA ? RsaEncry(password, RSAPublicKey) : password;
    authLogin(username, authPassWord, captchaidRef.current!, verifyvalue)
      .then((res) => {
        const { dat, err } = res;
        //{err: '用户名或密码错误', success: true} 提示用户名或密码错误
        if (err) {
          message.error(err);
          return;
        }
        const { access_token, refresh_token } = dat;
        localStorage.setItem(AccessTokenKey, access_token);
        localStorage.setItem('refresh_token', refresh_token);
        if (!err) {
          window.location.href = redirect || '/';
        }
      })
      .catch(() => {
        if (showcaptcha) {
          refreshCaptcha();
        }
      });
  };

  return (
    <div className='login-warp'>
      <div className='banner integration'>
        {/* <img src={'/image/login-dashboard.svg'} style={{ margin: '0 60px', zIndex: 5, width: 632 }}></img> */}
        <img src={'/image/login-dashboard2.png'} style={{ zIndex: 5, width: 900 }}></img>
      </div>
      <div className='login-panel'>
        <div className='login-main integration'>
          <div className='login-title'>
            <img src={siteInfo?.login_page_logo_url || '/image/login-logo.png'} style={{ width: '200px' }} />
          </div>

          {showDingTalkLogin ? ( // 根据状态显示钉钉登录组件
            <DingTalkLogin />
          ) : (
            <Form form={form} layout='vertical' requiredMark={true}>
              <Form.Item
                label='账户'
                name='username'
                rules={[
                  {
                    required: true,
                    message: t('请输入用户名'),
                  },
                ]}
              >
                <Input placeholder={t('请输入用户名')} prefix={<UserOutlined className='site-form-item-icon' />} />
              </Form.Item>
              <Form.Item
                label='密码'
                name='password'
                rules={[
                  {
                    required: true,
                    message: t('请输入密码'),
                  },
                ]}
              >
                <Input type='password' placeholder={t('请输入密码')} onPressEnter={handleSubmit} prefix={<LockOutlined className='site-form-item-icon' />} />
              </Form.Item>

              <div className='verifyimg-div'>
                <Form.Item
                  label='验证码'
                  name='verifyvalue'
                  rules={[
                    {
                      required: showcaptcha,
                      message: t('请输入验证码'),
                    },
                  ]}
                  hidden={!showcaptcha}
                >
                  <Input placeholder={t('请输入验证码')} onPressEnter={handleSubmit} prefix={<PictureOutlined className='site-form-item-icon' />} />
                </Form.Item>

                <img
                  ref={verifyimgRef}
                  style={{
                    display: showcaptcha ? 'inline-block' : 'none',
                    marginBottom: 16,
                  }}
                  onClick={refreshCaptcha}
                  alt='点击获取验证码'
                />
              </div>

              <Form.Item>
                <Button type='primary' onClick={handleSubmit}>
                  {t('登录')}
                </Button>
              </Form.Item>
            </Form>
          )}

          {/* <div className='login-other'>
            <strong>其他登录方式：</strong>
            {showDingTalkLogin ? ( // 根据状态显示账号密码登录图标
              <LockOutlined
                style={{ color: '#1877F2', fontSize: '28px' }}
                onClick={() => {
                  setShowDingTalkLogin(false); // 点击账号密码图标时返回登录表单
                }}
              />
            ) : (
              <DingtalkOutlined style={{ color: '#1877F2', fontSize: '28px' }} onClick={() => setShowDingTalkLogin(true)} />
            )}
            <a
              onClick={() => {
                getRedirectURL().then((res) => {
                  if (res.dat) {
                    window.location.href = res.dat;
                  } else {
                    message.warning('没有配置 OIDC 登录地址！');
                  }
                });
              }}
            >
              {displayName.oidc}
            </a>
            &nbsp;&nbsp;
            <a
              onClick={() => {
                getRedirectURLCAS().then((res) => {
                  if (res.dat) {
                    window.location.href = res.dat.redirect;
                    localStorage.setItem('CAS_state', res.dat.state);
                  } else {
                    message.warning('没有配置 CAS 登录地址！');
                  }
                });
              }}
            >
              {displayName.cas}
            </a>
            &nbsp;&nbsp;
            <a
              onClick={() => {
                getRedirectURLOAuth().then((res) => {
                  if (res.dat) {
                    window.location.href = res.dat;
                  } else {
                    message.warning('没有配置 OAuth 登录地址！');
                  }
                });
              }}
            >
              {displayName.oauth}
            </a>
          </div> */}
        </div>
      </div>
    </div>
  );
}
