import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { Resizable } from 're-resizable';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Button, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { LeftOutlined, RightOutlined, SearchOutlined, PlusSquareOutlined } from '@ant-design/icons';

import { CommonStateContext } from '@/App';
import { ActionType } from '@/store/manageInterface';
import Tree from '@/components/BusinessGroup2/components/Tree';
import EditBusinessDrawer from '@/components/BusinessGroup2/components/EditBusinessDrawer';
import CreateAssetModal from '@/pages/assetModels/components/CreateTree';

import { listToTree, getCollapsedKeys, getCleanAssetModelIds, getDefaultBusinessGroupKey, getCleanBusinessGroupIds, getDefaultAssetModel, getVaildAssetModel } from './utils';
import BusinessGroupSelect from './BusinessGroupSelect';
import BusinessGroupSelectWithAll from './BusinessGroupSelectWithAll';
import { getAssetModels } from './services';
import './style.less';

export {
  listToTree,
  getCollapsedKeys,
  getCleanAssetModelIds,
  BusinessGroupSelect,
  getDefaultBusinessGroupKey,
  getDefaultAssetModel,
  BusinessGroupSelectWithAll,
  // getBusiGroups,
  getCleanBusinessGroupIds,
  getVaildAssetModel,
};

interface IProps {
  onSelect?: (key: string, item: any) => void;
  title?: string;
  pageKey: string;
  renderHeadExtra?: () => React.ReactNode;
  showSelected?: boolean;
}

interface Node {
  id: string;
  title: string;
  key: string;
  children?: Node[];
}

export function getLocaleExpandedKeys() {
  const val = localStorage.getItem('biz_group_expanded_keys');
  try {
    if (val) {
      const parsed = JSON.parse(val);
      if (_.isArray(parsed)) {
        return parsed;
      }
      return [];
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function setLocaleExpandedKeys(nodes: string[]) {
  localStorage.setItem('biz_group_expanded_keys', JSON.stringify(nodes));
}

const filterData = (
  value: string,
  data: {
    name: string;
    id: number;
    label_value?: string;
  }[],
) => {
  const filteredData = _.filter(data, (item) => {
    if (!value) return true;
    return _.includes(_.toLower(item.name), _.toLower(value));
  });
  return filteredData;
};

const BUSINESS_GROUP_SEARCH_KEY = 'businessGroupSearchValue';

export default function index(props: IProps) {
  const { t } = useTranslation('BusinessGroup');
  const { assetModel, assetModelOnChange } = useContext(CommonStateContext);
  const location = useLocation();
  const query = queryString.parse(location.search);
  const history = useHistory();
  const { title = t('资产模型'), renderHeadExtra, onSelect, pageKey, showSelected = true } = props;
  const [collapse, setCollapse] = useState(localStorage.getItem('leftlist') === '1');
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem('leftwidth') || 200));
  const { assetModels, siteInfo, setAssetModels } = useContext(CommonStateContext);
  const [businessGroupTreeData, setBusinessGroupTreeData] = useState<Node[]>([]);
  const [createBusiVisible, setCreateBusiVisible] = useState<boolean>(false);
  const [editBusiDrawerVisible, setEditBusiDrawerVisible] = useState<boolean>(false);
  const [editBusiId, setEditBusiId] = useState<number>();
  const [searchValue, setSearchValue] = useState<string>('');
  const savedSearchValue = sessionStorage.getItem(BUSINESS_GROUP_SEARCH_KEY);

  const reloadData = () => {
    getAssetModels().then((res = []) => {
      setAssetModels(res);
      const filteredData = filterData(searchValue, res);
      setBusinessGroupTreeData(listToTree(filteredData, siteInfo?.businessGroupSeparator));
    });
  };

  useEffect(() => {
    let data = assetModels;
    if (savedSearchValue) {
      setSearchValue(savedSearchValue);
      data = filterData(savedSearchValue, assetModels);
    }
    setBusinessGroupTreeData(listToTree(data, siteInfo?.businessGroupSeparator));
  }, []);

  return (
    <Resizable
      style={{
        marginRight: collapse ? 0 : 10,
      }}
      size={{ width: collapse ? 0 : width, height: '100%' }}
      enable={{
        right: collapse ? false : true,
      }}
      onResizeStop={(_e, _direction, _ref, d) => {
        let curWidth = width + d.width;
        if (curWidth < 200) {
          curWidth = 200;
        }
        setWidth(curWidth);
        localStorage.setItem('leftwidth', curWidth.toString());
      }}
    >
      <div className={collapse ? 'n9e-biz-group-container collapse' : 'n9e-biz-group-container'}>
        <div
          className='collapse-btn'
          onClick={() => {
            localStorage.setItem('leftlist', !collapse ? '1' : '0');
            setCollapse(!collapse);
          }}
        >
          {!collapse ? <LeftOutlined /> : <RightOutlined />}
        </div>
        <div className='n9e-biz-group-container-group group-shrink'>
          {renderHeadExtra && renderHeadExtra()}
          {pageKey === 'assetModel' && (
            <div className='n9e-biz-group-container-group-title'>
              {title}
              <Button
                style={{
                  height: '30px',
                }}
                size='small'
                type='link'
                onClick={() => {
                  setCreateBusiVisible(true);
                }}
                icon={<PlusSquareOutlined />}
              />
            </div>
          )}
          <Input
            className='n9e-biz-group-container-group-search'
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchValue(value);
              sessionStorage.setItem(BUSINESS_GROUP_SEARCH_KEY, value);
              const filteredData = filterData(value, assetModels);
              setBusinessGroupTreeData(listToTree(filteredData, siteInfo?.businessGroupSeparator));
            }}
            placeholder={t('common:search_placeholder')}
          />
          {siteInfo?.businessGroupDisplayMode == 'list' ? (
            <div className='radio-list'>
              {_.map(assetModels, (item) => {
                const itemKey = _.toString(item.id);
                return (
                  <div
                    className={classNames({
                      'n9e-metric-views-list-content-item': true,
                      active: showSelected ? itemKey === assetModel.key : false,
                    })}
                    key={itemKey}
                    onClick={() => {
                      assetModelOnChange(itemKey);
                      onSelect && onSelect(itemKey, item);
                      history.push({
                        pathname: location.pathname,
                        search: queryString.stringify({
                          ...query,
                          ids: itemKey,
                          isLeaf: true,
                        }),
                      });
                    }}
                  >
                    <span className='name'>{item.name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='radio-list'>
              {!_.isEmpty(businessGroupTreeData) && (
                <Tree
                  defaultExpandedKeys={getCollapsedKeys(businessGroupTreeData, getLocaleExpandedKeys(), assetModel.key)}
                  selectedKeys={showSelected && assetModel.key ? [assetModel.key] : undefined}
                  onSelect={(_selectedKeys, e) => {
                    const itemKey = e.node.key;
                    assetModelOnChange(itemKey);
                    onSelect && onSelect(itemKey, e.node);
                    history.push({
                      pathname: location.pathname,
                      search: queryString.stringify({
                        ...query,
                        ids: getCleanAssetModelIds(itemKey),
                        isLeaf: !_.startsWith(itemKey, 'group,'),
                      }),
                    });
                  }}
                  onExpand={(expandedKeys: string[]) => {
                    setLocaleExpandedKeys(expandedKeys);
                  }}
                  onEdit={(_selectedKeys, e) => {
                    const itemKey = e.node.key;
                    setEditBusiId(itemKey);
                    setEditBusiDrawerVisible(true);
                  }}
                  treeData={businessGroupTreeData as Node[]}
                />
              )}
            </div>
          )}
        </div>
      </div>
      {editBusiId && (
        <EditBusinessDrawer
          id={editBusiId}
          open={editBusiDrawerVisible}
          onCloseDrawer={() => {
            setEditBusiId(undefined);
            setEditBusiDrawerVisible(false);
            reloadData();
          }}
        />
      )}
      <CreateAssetModal
        width={600}
        visible={createBusiVisible}
        userType='business'
        onClose={(type: string) => {
          setCreateBusiVisible(false);
          if (type === 'create') {
            reloadData();
          }
        }}
      />
    </Resizable>
  );
}
