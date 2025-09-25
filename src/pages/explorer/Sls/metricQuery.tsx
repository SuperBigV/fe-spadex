import _ from 'lodash';
import semver from 'semver';
import { getLogsSlsHistogram, getESVersion } from './services';
import { normalizeTime } from '@/pages/alertRules/utils';
import { dslBuilder } from './utils';

interface IOptions {
  datasourceValue: number;
  query: any;
  from: number;
  to: number;
  interval: number;
  intervalUnit: 'second' | 'min' | 'hour';
  filters?: any[];
}

export default async function metricQuery(options: IOptions) {
  const { query, datasourceValue, from, to, interval, intervalUnit, filters } = options;
  let series: any[] = [];

  const res = await getLogsSlsHistogram(datasourceValue, from, to);
  series = [
    {
      id: _.uniqueId('series_'),
      name: 'doc_count',
      metric: {
        __name__: 'doc_count',
      },
      data: _.map(res, (item) => {
        return [item.from, item.count];
      }),
    },
  ];
  return series;
}
