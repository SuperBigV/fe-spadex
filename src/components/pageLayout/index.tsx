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
import React, { ReactNode, useContext, useState, useEffect, useRef } from 'react';
import { useHistory, Link, useLocation } from 'react-router-dom';
import querystring from 'query-string';
import { useTranslation } from 'react-i18next';
import { Menu, Dropdown, Space, Drawer } from 'antd';
import { DownOutlined, RollbackOutlined } from '@ant-design/icons';
import { Logout } from '@/services/login';
import AdvancedWrap, { License } from '@/components/AdvancedWrap';
import { CommonStateContext } from '@/App';
import { AccessTokenKey, IS_ENT } from '@/utils/constant';
import DarkModeSelect from '@/components/DarkModeSelect';
import Version from './Version';
import AlertIndicator from './AlertIndicator';
import SideMenuColorSetting from './SideMenuColorSetting';
import HelpLink from './HelpLink';
import TabNavigation from './TabNavigation';
import './index.less';
import './locale';

export { HelpLink };

// @ts-ignore
import FeatureNotification from 'plus:/pages/FeatureNotification';
interface IPageLayoutProps {
  icon?: ReactNode;
  title?: String | JSX.Element;
  children?: ReactNode;
  introIcon?: ReactNode;
  rightArea?: ReactNode;
  customArea?: ReactNode;
  showBack?: Boolean;
  backPath?: string;
  docFn?: Function;
}

const i18nMap = {
  zh_CN: '简体',
  zh_HK: '繁體',
  en_US: 'En',
  ja_JP: '日本語',
};

const PageLayout: React.FC<IPageLayoutProps> = ({ icon, title, rightArea, introIcon, children, customArea, showBack, backPath, docFn }) => {
  const { t, i18n } = useTranslation('pageLayout');
  const history = useHistory();
  const location = useLocation();
  const query = querystring.parse(location.search);
  const { profile, siteInfo } = useContext(CommonStateContext);
  const embed = localStorage.getItem('embed') === '1' && window.self !== window.top;

  // 判断是否显示标签页
  const shouldShowTabs =
    !embed &&
    query.viewMode !== 'fullscreen' &&
    !location.pathname.startsWith('/login') &&
    !location.pathname.startsWith('/callback') &&
    !location.pathname.startsWith('/chart/') &&
    !location.pathname.startsWith('/dashboards/share/') &&
    location.pathname !== '/403' &&
    location.pathname !== '/404' &&
    location.pathname !== '/out-of-service';
  const [curLanguage, setCurLanguage] = useState(i18nMap[i18n.language] || '中文');
  const [themeVisible, setThemeVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const chatRef = useRef<any>(null);
  useEffect(() => {
    setCurLanguage(i18nMap[i18n.language] || '中文');
  }, [i18n.language]);
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.origin !== 'http://127.0.0.1') return;

      if (e.data.type === 'CREATE_CHAT_WINDOW') {
        if (document.getElementById('chat-win')) return;

        const iframe = document.createElement('iframe');
        iframe.id = 'chat-win';
        iframe.src = e.data.src;
        iframe.style.cssText = 'position:fixed;bottom:104px;right:24px;width:380px;height:500px;border:none;background:transparent;z-index:9998;display:none';
        iframe.frameBorder = '0';
        iframe.allow = 'microphone;camera';
        document.body.appendChild(iframe);
      } else if (e.data.type === 'TOGGLE_CHAT') {
        const chatWindow = document.getElementById('chat-win');
        if (chatWindow) chatWindow.style.display = e.data.isOpen ? 'block' : 'none';
      } else if (e.data.type === 'SCROLL_PASSTHROUGH') {
        window.scrollBy(0, e.data.deltaY);
      }
    };

    window.addEventListener('message', handleMessage);

    // 清理事件监听器
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  const menu = (
    <Menu>
      <Menu.Item
        onClick={() => {
          history.push('/account/profile/info');
        }}
      >
        {t('profile')}
      </Menu.Item>
      {!IS_ENT && (
        <Menu.Item
          onClick={() => {
            setThemeVisible(true);
          }}
        >
          {t('themeSetting')}
        </Menu.Item>
      )}
      <Menu.Item
        onClick={() => {
          Logout().then(() => {
            localStorage.removeItem(AccessTokenKey);
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('curBusiId');
            history.push('/login');
          });
          document.body.className = ''; // 登录页不需要主题，退出登录是清空
        }}
      >
        {t('logout')}
      </Menu.Item>
    </Menu>
  );
  const handleMouseDown = (e) => {
    setIsDragging(true);
    // 计算鼠标相对于聊天图标的偏移量
    const offsetX = e.clientX - chatRef.current.getBoundingClientRect().left;
    const offsetY = e.clientY - chatRef.current.getBoundingClientRect().top;

    const handleMouseMove = (moveEvent) => {
      if (!isDragging) return;
      // 更新位置
      setPosition({
        x: moveEvent.clientX - offsetX,
        y: moveEvent.clientY - offsetY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  return (
    <div className={'page-wrapper'}>
      {!embed && (
        <>
          {' '}
          {customArea ? (
            <div className={'page-top-header'}>{customArea}</div>
          ) : (
            <div className={'page-top-header'}>
              <div
                className={`page-header-content ${!IS_ENT ? 'n9e-page-header-content' : ''}`}
                style={{
                  // 2024-07-10 用途集成仪表盘全屏模式，未来其他页面的全屏模式皆是 viewMode=fullscreen
                  display: query.viewMode === 'fullscreen' ? 'none' : 'flex',
                }}
              >
                <div className={'page-header-title'}>{shouldShowTabs && <TabNavigation visible={shouldShowTabs} />}</div>

                <div className={'page-header-right-area'} style={{ display: sessionStorage.getItem('menuHide') === '1' ? 'none' : undefined }}>
                  {introIcon}
                  {docFn && (
                    <a onClick={() => docFn()} style={{ marginRight: 20 }}>
                      {t('docs')}
                    </a>
                  )}

                  {/* <Version /> */}
                  <AlertIndicator />

                  {/* <Space style={{ marginRight: 16 }}> */}
                  {/* 整合版本关闭文档链接 */}
                  {/* {!IS_ENT && (
                      <div style={{ marginRight: 8, position: 'relative' }}> */}
                  {/* <a target='_blank' href={siteInfo?.document_url || 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/introduction/'}> */}
                  {/* <a target='_blank' href={siteInfo?.document_url || ''}>
                          {t('docs')}
                        </a>
                      </div>
                    )} */}
                  {/* {profile?.admin && (
                      <AdvancedWrap var='VITE_IS_PRO,VITE_IS_ENT'>
                        <Link to='/audits'>{t('audits:title')}</Link>
                      </AdvancedWrap>
                    )}
                  </Space> */}

                  {/* {rightArea} */}

                  {/* <AdvancedWrap var='VITE_IS_PRO,VITE_IS_ENT'>
                    <License />
                  </AdvancedWrap> */}
                  {/* <AdvancedWrap var='VITE_IS_PRO,VITE_IS_ENT'>
                    <FeatureNotification />
                  </AdvancedWrap> */}

                  {/* <Dropdown
                    overlay={
                      <Menu
                        onSelect={({ key }) => {
                          i18n.changeLanguage(key);
                          setCurLanguage(i18nMap[key]);
                          localStorage.setItem('language', key);
                        }}
                        selectable
                      >
                        {Object.keys(i18nMap).map((el) => {
                          return <Menu.Item key={el}>{i18nMap[el]}</Menu.Item>;
                        })}
                      </Menu>
                    }
                  >
                    <a style={{ marginRight: 12 }} onClick={(e) => e.preventDefault()} id='i18n-btn'>
                      {curLanguage}
                    </a>
                  </Dropdown> */}

                  <div style={{ marginRight: 12 }}>
                    <DarkModeSelect />
                  </div>

                  <Dropdown overlay={menu} trigger={['click']}>
                    <span className='avator' style={{ cursor: 'pointer' }}>
                      <img src={profile.portrait || '/image/avatar1.png'} alt='' />
                      <span className='display-name'>{profile.nickname || profile.username}</span>
                      <DownOutlined />
                    </span>
                  </Dropdown>
                </div>
              </div>
              {/* 标签页导航 - 显示在 header 内部 */}
            </div>
          )}
        </>
      )}
      {children && children}
      <Drawer
        closable={false}
        open={themeVisible}
        onClose={() => {
          setThemeVisible(false);
        }}
      >
        <div>
          <div>
            <div className='text-lg font-semibold dark:text-slate-50 text-l1'>{t('theme.title')}</div>
            <div className='text-sm text-hint mt-1'>{t('theme.title_help')}</div>
          </div>
          <div className='mt-6'>
            <span className='font-semibold'>{t('theme.sideMenu')}</span> <span className='ml-2 text-hint'>{t('theme.sideMenu_help')}</span>
          </div>
          <div className='m-2'>
            <SideMenuColorSetting />
          </div>
        </div>
      </Drawer>
      {/* <iframe
        src='http://127.0.0.1/next-chats/widget?shared_id=c0be2754c38111f0b3971a934f5ce897&from=chat&auth=NiNjExNWM2YzM2OTExZjA5NDM5YmVjZD&mode=master&streaming=false'
        style={{
          position: 'fixed',
          bottom: '200px',
          right: '0',
          width: '100px',
          height: '100px',
          border: 'none',
          borderRadius: '50%',
          background: 'transparent',
          zIndex: 9999,
        }}
        frameBorder='0'
        onMouseDown={handleMouseDown}
        allow='microphone;camera'
      /> */}
    </div>
  );
};

export default PageLayout;
