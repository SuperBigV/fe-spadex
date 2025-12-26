import React, { useState } from 'react';
import { Drawer, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'antd';
import { getTargetInformationByIdent } from '../services';
import MetaDataTab from './MetaDataTab';
import TopologyTab from './TopologyTab';
import './style.less';

interface IProps {
  ident: string;
}

export default function TargetMetaDrawer(props: IProps) {
  const { t } = useTranslation('targets');
  let { ident } = props;
  const [visible, setVisible] = useState(false);
  const [information, setInformation] = useState({});
  const [activeTab, setActiveTab] = useState('metadata');

  const handleOpen = () => {
    setVisible(true);
    getTargetInformationByIdent(ident).then((res) => {
      setInformation(res);
    });
  };

  const tabItems = [
    {
      key: 'metadata',
      label: '元数据',
      children: <MetaDataTab information={information} />,
    },
    {
      key: 'topology',
      label: '拓扑',
      children: <TopologyTab ident={ident} />,
    },
  ];

  return (
    <>
      <Tooltip title={t('meta_tip')}>
        <a onClick={handleOpen}>{ident}</a>
      </Tooltip>
      <Drawer
        destroyOnClose
        title={t('meta_title')}
        width={800}
        placement='right'
        onClose={() => {
          setVisible(false);
        }}
        open={visible}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Drawer>
    </>
  );
}
