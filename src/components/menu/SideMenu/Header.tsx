import React, { useContext } from 'react';
import { cn } from '@/components/menu/SideMenu/utils';
import { CommonStateContext } from '@/App';

interface Props {
  collapsed: boolean;
  collapsedHover: boolean;
  sideMenuBgMode: string;
}

const getLogoSrc = (collapsed: boolean, sideMenuBgMode: string, siteInfo?: any) => {
  if (!collapsed) {
    if (sideMenuBgMode === 'light') {
      return siteInfo?.light_menu_big_logo_url || '/image/logo-light-l.png';
    }
    // return siteInfo?.menu_big_logo_url || '/image/spadex-logo.png';
    return siteInfo?.menu_big_logo_url || '/image/logo-bg.png';
  }
  if (sideMenuBgMode === 'light') {
    return siteInfo?.light_menu_small_logo_url || '/image/logo-light.png';
  }
  // return siteInfo?.menu_small_logo_url || '/image/spadex-logo.png';
  return siteInfo?.menu_small_logo_url || '/image/logo-bg.png';
};

export default function SideMenuHeader(props: Props) {
  const { collapsed, collapsedHover, sideMenuBgMode } = props;
  const { siteInfo } = useContext(CommonStateContext);

  const noCollapsedLogo = getLogoSrc(false, sideMenuBgMode, siteInfo);
  const collapsedLogo = getLogoSrc(true, sideMenuBgMode, siteInfo);

  return (
    <div className={cn('relative mt-0 h-20 w-full shrink-0 overflow-hidden transition-spacing', 'pl-0.2')}>
      <img
        src={noCollapsedLogo}
        width={180}
        height={80}
        className='max-w-[180px]'
        style={{
          display: !collapsed || collapsedHover ? 'block' : 'none',
        }}
      />
      <img
        src={collapsedLogo}
        width={180}
        height={80}
        className='max-w-[180px]'
        style={{
          display: !collapsed || collapsedHover ? 'none' : 'block',
        }}
      />
    </div>
  );
}
