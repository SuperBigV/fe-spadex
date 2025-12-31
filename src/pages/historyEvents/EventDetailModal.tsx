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
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import moment from 'moment';
import _ from 'lodash';
import queryString from 'query-string';
import { Button, Card, Modal, Space, Spin, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getHistoryEventsById } from '@/services/warning';
import { priorityColor } from '@/utils/constant';
import { CommonStateContext, basePrefix } from '@/App';
import TDengineDetail from '@/plugins/TDengine/Event';
import { Event as ElasticsearchDetail } from '@/plugins/elasticsearch';

import TaskTpls from '@/pages/event/TaskTpls';
import PrometheusDetail from '@/pages/event/Detail/Prometheus';
import Host from '@/pages/event/Detail/Host';
import LokiDetail from '@/pages/event/Detail/Loki';

// @ts-ignore
import plusEventDetail from 'plus:/parcels/Event/eventDetail';
// @ts-ignore
import PlusPreview from 'plus:/parcels/Event/Preview';
// @ts-ignore
import PlusLogsDetail from 'plus:/parcels/Event/LogsDetail';

import '@/pages/event/detail.less';

const { Paragraph } = Typography;

interface EventDetailModalProps {
  eventId: string | number;
  visible: boolean;
  onCancel: () => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ eventId, visible, onCancel }) => {
  const { t } = useTranslation('AlertCurEvents');
  const commonState = useContext(CommonStateContext);
  const { busiGroups, datasourceList } = commonState;
  const history = useHistory();
  const [eventDetail, setEventDetail] = useState<any>();

  const handleNavToWarningList = (id) => {
    if (busiGroups.find((item) => item.id === id)) {
      window.open(`${basePrefix}/alert-rules?ids=${id}&isLeaf=true`);
    }
  };

  if (eventDetail) eventDetail.cate = eventDetail.cate || 'prometheus'; // TODO: 兼容历史的告警事件

  const descriptionInfo = [
    {
      label: t('detail.rule_name'),
      key: 'rule_name',
      render(content, { rule_id }) {
        if (!_.includes(['firemap', 'northstar'], eventDetail?.rule_prod)) {
          return (
            <Link
              to={{
                pathname: `/alert-rules/edit/${rule_id}`,
              }}
              target='_blank'
            >
              {content}
            </Link>
          );
        }
        return content;
      },
    },
    ...(!_.includes(['firemap', 'northstar'], eventDetail?.rule_prod)
      ? [
          {
            label: t('detail.group_name'),
            key: 'group_name',
            render(content, { group_id }) {
              return (
                <Button size='small' type='link' className='rule-link-btn' onClick={() => handleNavToWarningList(group_id)}>
                  {content}
                </Button>
              );
            },
          },
        ]
      : [
          {
            label: t('detail.detail_url'),
            key: 'rule_config',
            render(val) {
              const detail_url = _.get(val, 'detail_url');
              return (
                <a href={detail_url} target='_blank'>
                  {detail_url}
                </a>
              );
            },
          },
        ]),
    {
      label: t('detail.severity'),
      key: 'severity',
      render: (severity) => {
        const severityMap = {
          1: '严重',
          2: '警告',
          3: '通知',
        };
        return (
          <Tag color={priorityColor[severity - 1]}>
            S{severity} {severityMap[severity]}
          </Tag>
        );
      },
    },
    {
      label: t('detail.is_recovered'),
      key: 'is_recovered',
      render(isRecovered) {
        return <Tag color={isRecovered ? 'green' : 'red'}>{isRecovered ? '已恢复' : '正在告警'}</Tag>;
      },
    },
    {
      label: t('detail.tags'),
      key: 'tags',
      render(tags) {
        return tags
          ? tags.map((tag) => (
              <Tag color='purple' key={tag}>
                {tag}
              </Tag>
            ))
          : '';
      },
    },
    {
      label: '告警对象',
      key: 'target_ident',
    },
    {
      label: t('detail.first_trigger_time'),
      key: 'first_trigger_time',
      render(time) {
        return moment(time * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      label: t('detail.last_eval_time'),
      key: 'last_eval_time',
      render(time) {
        return moment(time * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      label:
        eventDetail?.is_recovered && eventDetail?.cate === 'prometheus' && (eventDetail?.rule_config?.version === 'v1' || eventDetail?.rule_config?.version === undefined)
          ? t('detail.trigger_value')
          : t('detail.trigger_value2'),
      key: 'trigger_value',
      render(val) {
        return (
          <span>
            {val}
            <PlusLogsDetail data={eventDetail} />
          </span>
        );
      },
    },
    {
      label: t('detail.recover_time'),
      key: 'recover_time',
      render(time) {
        return moment((time || 0) * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      label: t('detail.cate'),
      key: 'cate',
    },
    ...(_.includes(['firemap', 'northstar'], eventDetail?.rule_prod)
      ? [
          {
            label: t(`查询条件`),
            key: 'prom_ql',
            render: (val) => {
              return val;
            },
          },
        ]
      : [false]),
    ...(eventDetail?.cate === 'prometheus' && !_.includes(['firemap', 'northstar'], eventDetail?.rule_prod)
      ? PrometheusDetail({
          eventDetail,
          history,
        })
      : [false]),
    ...(eventDetail?.cate === 'loki'
      ? LokiDetail({
          eventDetail,
          history,
        })
      : [false]),
    ...(eventDetail?.cate === 'host' ? Host(t, commonState) : [false]),
    ...(eventDetail?.cate === 'tdengine' ? TDengineDetail(t) : [false]),
    ...(eventDetail?.cate === 'elasticsearch' ? ElasticsearchDetail() : [false]),
    ...(plusEventDetail(eventDetail?.cate, t) || []),
    {
      label: t('detail.prom_eval_interval'),
      key: 'prom_eval_interval',
      render(content) {
        return `${content} s`;
      },
    },
    {
      label: t('detail.prom_for_duration'),
      key: 'prom_for_duration',
      render(content) {
        return `${content} s`;
      },
    },
    {
      label: t('detail.notify_channels'),
      key: 'notify_channels',
      render(channels) {
        return channels.join(' ');
      },
    },
    {
      label: t('detail.notify_groups_obj'),
      key: 'notify_groups_obj',
      render(groups) {
        return groups ? groups.map((group) => <Tag color='purple'>{group.name}</Tag>) : '';
      },
    },
  ];

  if (eventDetail?.annotations) {
    _.forEach(eventDetail.annotations, (value, key) => {
      descriptionInfo.push({
        label: key,
        key,
        render: () => {
          if (value.indexOf('http') === 0) {
            return (
              <a href={value} target='_blank'>
                {value}
              </a>
            );
          }
          return <span>{value}</span>;
        },
      });
    });
  }

  useEffect(() => {
    if (visible && eventId) {
      getHistoryEventsById(eventId).then((res) => {
        setEventDetail(res.dat);
      });
    } else {
      setEventDetail(undefined);
    }
  }, [visible, eventId]);

  return (
    <Modal
      title={t('detail.title')}
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={null}
      destroyOnClose
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: 'calc(100vh - 100px)', overflow: 'auto' }}
    >
      <div className='event-detail-container'>
        <Spin spinning={!eventDetail}>
          <Card
            size='small'
            className='desc-container'
            title={t('detail.card_title')}
            actions={
              !_.includes(['firemap', 'northstar'], eventDetail?.rule_prod)
                ? [
                    <div className='action-btns' key='actions'>
                      <Space>
                        <Button
                          type='primary'
                          onClick={() => {
                            history.push({
                              pathname: '/alert-mutes/add',
                              search: queryString.stringify({
                                busiGroup: eventDetail.group_id,
                                prod: eventDetail.rule_prod,
                                cate: eventDetail.cate,
                                datasource_ids: [eventDetail.datasource_id],
                                tags: eventDetail.tags,
                              }),
                            });
                            onCancel();
                          }}
                        >
                          {t('shield')}
                        </Button>
                      </Space>
                    </div>,
                  ]
                : []
            }
          >
            {eventDetail && (
              <div>
                <PlusPreview data={eventDetail} />
                {descriptionInfo
                  .filter((item: any) => {
                    if (!item) return false;
                    return eventDetail.is_recovered ? true : item.key !== 'recover_time';
                  })
                  .map(({ label, key, render }: any, i) => {
                    return (
                      <div className='desc-row' key={key + i}>
                        <div className='desc-label'>{label}：</div>
                        <div className='desc-content'>{render ? render(eventDetail[key], eventDetail) : eventDetail[key]}</div>
                      </div>
                    );
                  })}
                <TaskTpls eventDetail={eventDetail} />
              </div>
            )}
          </Card>
        </Spin>
      </div>
    </Modal>
  );
};

export default EventDetailModal;

