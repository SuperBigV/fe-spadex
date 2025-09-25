import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import _ from 'lodash';

export function getProjectList(datasourceValue: number, plugin_type: string) {
  if (plugin_type === 'sls') {
    return request(`/api/n9e/proxy/${datasourceValue}/`, {
      method: RequestMethod.Get,
    }).then((res) => {
      // const dat = _.get(res, 'responses[0].hits');
      console.log(res);
      return res?.projects || [];
    });
  } else {
    return request(`/api/n9e/es-index-pattern-list?datasource_id=${datasourceValue}`, {
      method: RequestMethod.Get,
    }).then((res) => {
      // const dat = _.get(res, 'responses[0].hits');
      console.log(res);
      return res?.dat || [];
    });
  }
}

// api/n9e/es-index-pattern-list?datasource_id=2
