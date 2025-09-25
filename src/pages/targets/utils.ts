import _ from 'lodash';
import { IS_PLUS } from '@/utils/constant';

export const getDefaultColumnsConfigs = () => {
  const columns = _.concat(
    ['host_ip', 'ident_type', 'tags', 'group_obj', 'life_status', 'update_at', 'mem_util', 'cpu_util', 'cpu_num', 'os', 'arch'],
    IS_PLUS ? ['agent_version'] : [],
    ['note', 'operation'],
  );
  // const columns = _.concat(
  //   ['host_ip', 'host_tags', 'tags', 'group_obj', 'update_at', 'mem_util', 'cpu_util', 'offset', 'cpu_num', 'os', 'arch', 'remote_addr'],
  //   IS_PLUS ? ['agent_version'] : [],
  //   ['note'],
  // );
  let defaultColumnsConfigs = _.map(columns, (item) => {
    return {
      name: item,
      visible: true,
    };
  });
  const localColumnsConfigs = localStorage.getItem('targets_columns_configs');
  if (localColumnsConfigs) {
    try {
      defaultColumnsConfigs = _.map(defaultColumnsConfigs, (item) => {
        const localItem = _.find(JSON.parse(localColumnsConfigs), (i) => i.name === item.name);
        if (localItem) {
          item.visible = localItem.visible;
        }
        return item;
      });
    } catch (e) {
      console.error(e);
    }
  }
  return defaultColumnsConfigs;
};

export const getMiddlewareColumnsConfigs = () => {
  const columns = _.concat(['host_ip', 'update_at', 'group_obj', 'tags'], IS_PLUS ? ['agent_version'] : [], ['note', 'operation']);
  // const columns = _.concat(
  //   ['host_ip', 'host_tags', 'tags', 'group_obj', 'update_at', 'mem_util', 'cpu_util', 'offset', 'cpu_num', 'os', 'arch', 'remote_addr'],
  //   IS_PLUS ? ['agent_version'] : [],
  //   ['note'],
  // );
  let defaultColumnsConfigs = _.map(columns, (item) => {
    return {
      name: item,
      visible: true,
    };
  });
  const localColumnsConfigs = localStorage.getItem('targets_columns_configs');
  if (localColumnsConfigs) {
    try {
      defaultColumnsConfigs = _.map(defaultColumnsConfigs, (item) => {
        const localItem = _.find(JSON.parse(localColumnsConfigs), (i) => i.name === item.name);
        if (localItem) {
          item.visible = localItem.visible;
        }
        return item;
      });
    } catch (e) {
      console.error(e);
    }
  }
  return defaultColumnsConfigs;
};

export const setDefaultColumnsConfigs = (columnsConfigs) => {
  localStorage.setItem('targets_columns_configs', JSON.stringify(columnsConfigs));
};

export const setMiddlewareColumnsConfigs = (columnsConfigs) => {
  localStorage.setItem('middleware_columns_configs', JSON.stringify(columnsConfigs));
};
