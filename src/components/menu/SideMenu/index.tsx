import React, { useEffect, useMemo, useRef, useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Icon, { MenuUnfoldOutlined, MenuFoldOutlined, GlobalOutlined, AppstoreAddOutlined, SecurityScanOutlined, FormOutlined, RadarChartOutlined } from '@ant-design/icons';
import _ from 'lodash';
import querystring from 'query-string';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ScrollArea';
import { CommonStateContext } from '@/App';
import { getSideMenuBgColor } from '@/components/pageLayout/SideMenuColorSetting';
import { IS_ENT } from '@/utils/constant';
import IconFont from '../../IconFont';
import menuIcon from '@/components/menu/configs';
import { cn } from './utils';
import SideMenuHeader from './Header';
import MenuList from './MenuList';
import QuickMenu from './QuickMenu';
import { IMenuItem } from './types';
import './menu.less';
import '../locale';
// @ts-ignore
import getPlusMenu from 'plus:/menu';

export const getMenuList = (t) => {
  const menuList = [
    {
      key: 'workbench',
      icon: <GlobalOutlined />,
      label: t('工作台'),
      children: [
        {
          key: '/workbench',
          label: t('我的工作台'),
        },
        {
          key: '/im',
          label: t('即时通讯'),
        },
        {
          key: '/embedded-dashboards',
          label: 'AIOps助手',
        },
      ],
    },

    // {
    //   key: '/aiKnowlage',
    //   icon: <AndroidOutlined />,
    //   label: t('Ai知识库'),
    // },
    {
      key: 'dashboard',
      icon: <IconFont type='icon-Menu_Dashboard' />,
      label: t('运维态势'),
      children: [
        {
          key: '/dashboards/2',
          label: t('主机态势'),
        },
        {
          key: '/dashboards-net',
          label: t('网络态势'),
        },
        {
          key: '/dashboards',
          label: t('软件态势'),
        },
      ],
    },
    {
      key: 'assets',
      icon: <AppstoreAddOutlined />,
      label: '资产管理',
      children: [
        {
          key: '/asset-models',
          label: '资产模型',
        },
        {
          key: '/asset-list',
          label: '资产管理',
        },
        {
          key: '/busi-groups',
          label: '软件管理',
        },
        {
          key: '/ips',
          label: t('IP管理'),
        },
        {
          key: '/rooms',
          label: t('机房管理'),
        },
        {
          key: '/partners',
          label: t('合作单位'),
        },
        // {
        //   key: '/knowledge-base',
        //   label: t('知识库管理'),
        // },
      ],
    },
    // {
    //   key: 'targets',
    //   icon: <IconFont type='icon-Menu_Infrastructure' />,
    //   label: '业务管理',
    //   children: [
    //     {
    //       key: '/targets',
    //       label: '业务软件',
    //     },
    //     {
    //       key: '/net-targets',
    //       label: '网络设备',
    //     },
    //   ],
    // },
    {
      key: 'metric',
      icon: <IconFont type='icon-IndexManagement1' />,
      label: t('数据洞察'),
      children: [
        {
          key: '/targets',
          label: '业务管理',
        },
        {
          key: '/net-targets',
          label: '网络设备',
        },
        {
          key: '/topology',
          label: '网络拓扑',
        },
        // {
        //   key: '/assets-analysis',
        //   label: '资源分析',
        // },
        // {
        //   key: '/prediction',
        //   label: '趋势预测',
        // },
        {
          key: '/metric/explorer',
          label: t('指标查询'),
        },
        {
          key: '/log/explorer',
          label: t('日志查询'),
        },
        // {
        //   key: '/metrics-built-in',
        //   label: t('metricsBuiltin:title'),
        // },
        // {
        //   key: '/object/explorer',
        //   label: t('洞察中心'),
        // },

        // {
        //   key: '/recording-rules',
        //   label: t('记录规则'),
        // },
      ],
    },
    {
      key: 'trace',
      icon: <IconFont type='icon-Menu_LinkAnalysis' />,
      activeIcon: <Icon component={menuIcon.LinkAnalysis as any} />,
      label: t('链路追踪'),
      children: [
        {
          key: '/trace/explorer',
          label: t('数据查询'),
        },
        {
          key: '/trace/dependencies',
          label: t('链路拓扑'),
        },
      ],
    },
    // 运维大屏
    {
      key: 'operation',
      icon: <IconFont type='icon-Menu_LogAnalysis' />,
      label: t('运维大屏'),
      children: [
        {
          key: '/room-dashboard',
          label: t('机房大屏'),
        },
        // {
        //   key: '/network-dashboard',
        //   label: t('网络大屏'),
        // },
        // {
        //   key: '/software-dashboard',
        //   label: t('软件大屏'),
        // },
      ],
    },
    // {
    //   key: 'log',
    //   icon: <IconFont type='icon-Menu_LogAnalysis' />,
    //   label: t('日志分析'),
    //   children: [
    //     {
    //       key: '/log/explorer',
    //       label: t('即时查询'),
    //     },
    //   ],
    // },
    {
      key: 'alarm',
      icon: <IconFont type='icon-Menu_AlarmManagement' />,
      label: t('告警管理'),
      children: [
        {
          key: '/alert-rules',
          label: t('告警规则'),
        },
        {
          key: '/alert-mutes',
          label: t('屏蔽规则'),
        },
        {
          key: '/alert-subscribes',
          label: t('订阅规则'),
        },
        {
          key: '/alert-cur-events',
          label: t('正在告警'),
        },
        {
          key: '/alert-his-events',
          label: t('历史告警'),
        },
      ],
    },
    // {
    //   key: 'notification',
    //   icon: <NotificationFilled />,
    //   label: t('告警通知'),
    //   children: [
    //     {
    //       key: '/help/notification-settings',
    //       label: t('通知设置'),
    //     },
    //     {
    //       key: '/help/notification-tpls',
    //       label: t('通知模板'),
    //     },
    //   ],
    // },

    // {
    //   key: 'ops',
    //   icon: <IconFont type='icon-Menu_Infrastructure' />,
    //   label: '运维管理',
    //   children: [
    //     {
    //       key: '/crons',
    //       label: '任务管理',
    //     },

    //   ],
    // },

    {
      key: 'job',
      icon: <IconFont type='icon-Menu_AlarmSelfhealing' />,
      label: '运维管理',
      children: [
        {
          key: '/job-tpls',
          label: t('运维脚本'),
        },
        {
          key: '/job-tasks',
          label: '任务历史',
        },

        // {
        //   key: '/pollings',
        //   label: '智能巡检',
        // },
        {
          key: '/probes',
          label: '网络工具',
        },
      ],
    },
    {
      key: 'workform',
      icon: <FormOutlined />,
      label: t('工单系统'),
      children: [
        {
          key: '/workform-orders',
          label: t('工单列表'),
        },
        {
          key: '/workform-config',
          label: t('工单配置'),
        },
        {
          key: '/workform-reports',
          label: t('报表分析'),
        },
      ],
    },
    {
      key: 'inspection',
      icon: <RadarChartOutlined />,
      label: t('智能巡检'),
      children: [
        {
          key: '/inspection-overview',
          label: t('巡检概览'),
        },
        {
          key: '/inspection-templates',
          label: t('巡检模板'),
        },
        {
          key: '/inspection-tasks',
          label: t('巡检任务'),
        },
      ],
    },
    {
      key: 'record',
      icon: <SecurityScanOutlined />,
      label: '记录中心',
      children: [
        {
          key: '/operation-record',
          label: t('操作记录'),
        },
        {
          key: '/command-record',
          label: '命令记录',
        },
      ],
    },
    {
      key: 'manage',
      icon: <IconFont type='icon-Menu_PersonnelOrganization' />,
      label: t('用户分组'),
      children: [
        {
          key: '/users',
          label: t('用户管理'),
        },
        {
          key: '/user-groups',
          label: t('分组管理'),
        },

        {
          key: '/permissions',
          label: t('权限管理'),
        },
      ],
    },
    // {
    //   key: 'business',
    //   icon: <IconFont type='icon-shujujicheng' />,
    //   label: '业务管理',
    //   children: [
    //     {
    //       key: '/business',
    //       label: '业务管理',
    //     },
    //     {
    //       key: '/busi-topology',
    //       label: '技术问答',
    //     },
    //   ],
    // },

    // {
    //   key: '/rooms',
    //   icon: <IconFont type='icon-Relation' />,
    //   label: '机房管理',
    //   children: [
    //     {
    //       key: '/rooms',
    //       label: '机房管理',
    //     },
    //   ],
    // },

    // {
    //   key: 'integrations',
    //   icon: <IconFont type='icon-shujujicheng' />,
    //   activeIcon: <Icon component={menuIcon.EmbedsSvgHover as any} />,
    //   label: t('integrations'),
    //   children: [
    //     {
    //       key: '/help/source',
    //       label: t('数据源'),
    //     },
    //     {
    //       key: '/built-in-components',
    //       label: t('built_in_components'),
    //     },
    //   ],
    // },
    {
      key: 'help',
      icon: <IconFont type='icon-Menu_SystemInformation' />,
      label: t('系统配置'),
      children: [
        // {
        //   key: '/asset-icons',
        //   label: '图标管理',
        // },
        {
          key: '/knowledge-base',
          label: '知识库',
        },

        {
          key: '/auths',
          label: '认证管理',
        },
        {
          key: '/dangerous-commands',
          label: '危险命令',
        },
        {
          key: '/device-models',
          label: '型号适配',
        },
        {
          key: '/auth-configs',
          label: t('认证设置'),
        },
        // {
        //   key: '/help/variable-configs',
        //   label: t('变量设置'),
        // },
        {
          key: '/help/notification-settings',
          label: t('通知设置'),
        },
        {
          key: '/help/notification-tpls',
          label: t('通知模板'),
        },
        {
          key: '/help/source',
          label: t('数据源'),
        },
        {
          key: '/built-in-components',
          label: t('built_in_components'),
        },
        // {
        //   key: '/help/sso',
        //   label: t('单点登录'),
        // },
        // {
        //   key: '/help/servers',
        //   label: t('告警引擎'),
        // },
        // {
        //   key: '/site-settings',
        //   label: t('siteInfo:title'),
        // },
        // {
        //   key: '/help/version',
        //   label: t('version:title'),
        // },
      ],
    },
  ];
  return menuList;
};

const SideMenu = () => {
  const { t, i18n } = useTranslation('menu');
  const { profile, isPlus, darkMode, perms } = useContext(CommonStateContext);
  let { sideMenuBgMode } = useContext(CommonStateContext);
  if (darkMode) {
    sideMenuBgMode = 'dark';
  }
  const sideMenuBgColor = getSideMenuBgColor(sideMenuBgMode as any);
  const history = useHistory();
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState<string[]>();
  const [collapsed, setCollapsed] = useState<boolean>(Number(localStorage.getItem('menuCollapsed')) === 1);
  const [collapsedHover, setCollapsedHover] = useState<boolean>(false);
  const quickMenuRef = useRef<{ open: () => void }>({ open: () => {} });
  const isCustomBg = sideMenuBgMode !== 'light';
  const menuList = isPlus ? getPlusMenu(t) : getMenuList(t);
  const [menus, setMenus] = useState<IMenuItem[]>(menuList);
  const menuPaths = useMemo(
    () =>
      menuList
        .map((item) => (item?.children?.length ? item.children.map((c) => `${item.key}|${c?.key || ''}`) : `${item?.key}|${item?.key}`))
        .filter((p) => p)
        .flat(),
    [menuList],
  );
  const hideSideMenu = useMemo(() => {
    if (
      location.pathname === '/login' ||
      location.pathname.startsWith('/chart/') ||
      location.pathname.startsWith('/events/screen/') ||
      location.pathname.startsWith('/dashboards/share/') ||
      location.pathname === '/callback' ||
      location.pathname.indexOf('/polaris/screen') === 0 ||
      location.pathname.indexOf('/template/screens/detail') === 0
    ) {
      return true;
    }
    // 大盘全屏模式下也需要隐藏左侧菜单
    if (location.pathname.indexOf('/dashboard') === 0 || location.pathname.indexOf('/embedded-dashboards') === 0) {
      const query = querystring.parse(location.search);
      if (query?.viewMode === 'fullscreen') {
        return true;
      }
      return false;
    }
    return false;
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (profile?.roles?.length > 0) {
      // 过滤掉没有权限的菜单
      const newMenus: any = _.filter(
        _.map(menuList, (menu) => {
          return {
            ...menu,
            children: _.filter(menu.children, (item) => item && _.includes(perms, item.key)),
          };
        }),
        (item) => {
          return item.children && item.children.length > 0;
        },
      );
      setMenus(newMenus);
    }
  }, [profile?.roles, i18n.language]);

  useEffect(() => {
    let finalPath = ['', ''];
    menuPaths.forEach((path) => {
      const pathArr = path?.split('|');
      const realPath = pathArr ? pathArr[pathArr.length - 1] : '';
      const curPathname = location.pathname;

      if (pathArr && curPathname.startsWith(realPath) && realPath.length > finalPath[finalPath.length - 1].length) {
        finalPath = pathArr;
      }
    });

    if (selectedKeys?.join('|') !== finalPath.join('|')) {
      setSelectedKeys(finalPath);
    }
  }, [menuPaths, location.pathname, selectedKeys]);

  const uncollapsedWidth = i18n.language === 'en_US' ? 'w-[210px]' : 'w-[172px]';

  return (
    <div
      id='#tailwind'
      style={{
        display: hideSideMenu ? 'none' : 'flex',
      }}
    >
      <div
        className={cn('relative flex h-screen shrink-0', collapsed ? 'w-[64px]' : '')}
        onMouseEnter={() => {
          collapsed && setCollapsedHover(true);
        }}
        onMouseLeave={() => setCollapsedHover(false)}
      >
        <div
          className={cn(
            'z-20 flex h-full select-none flex-col justify-between border-0 border-r border-solid transition-width',
            collapsed ? 'w-[64px]' : uncollapsedWidth,
            collapsedHover ? `absolute ${uncollapsedWidth} shadow-mf` : '',
            !IS_ENT ? 'border-fc-300' : '',
          )}
          style={{ background: sideMenuBgColor }}
        >
          <div className='flex flex-1 flex-col justify-between gap-4 overflow-hidden'>
            <SideMenuHeader collapsed={collapsed} collapsedHover={collapsedHover} sideMenuBgMode={sideMenuBgMode} />
            <ScrollArea className='-mr-2 flex-1'>
              <MenuList
                list={menus}
                collapsed={collapsed && !collapsedHover}
                selectedKeys={selectedKeys}
                sideMenuBgColor={sideMenuBgColor}
                isCustomBg={isCustomBg}
                quickMenuRef={quickMenuRef}
              />
            </ScrollArea>
          </div>
          <div className='mx-2 my-2 shrink-0'>
            <div
              className={cn('flex h-10 cursor-pointer items-center justify-center rounded', isCustomBg ? 'text-[#fff] hover:bg-gray-200/20' : 'text-title hover:bg-fc-200')}
              onClick={() => {
                const nextCollapsed = !collapsed;
                setCollapsed(nextCollapsed);
                localStorage.setItem('menuCollapsed', nextCollapsed ? '1' : '0');
                setCollapsedHover(false);
              }}
            >
              {collapsed ? (
                <MenuUnfoldOutlined className='h-4 w-4 children-icon:h-4 children-icon:w-4' />
              ) : (
                <MenuFoldOutlined className='h-4 w-4 children-icon:h-4 children-icon:w-4' />
              )}
            </div>
          </div>
        </div>
      </div>
      <QuickMenu ref={quickMenuRef} menuList={menus} />
    </div>
  );
};

export default SideMenu;
