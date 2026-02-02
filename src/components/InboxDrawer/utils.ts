export function formatRelativeTime(ts: number): string {
  if (!ts) return '';
  const now = Math.floor(Date.now() / 1000);
  const diff = now - ts;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`;
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`;
}

/** 事件类型 → 展示文案与友好提示 */
export const EVENT_TYPE_MAP: Record<string, { label: string; tip: string }> = {
  created: { label: '工单创建', tip: '您有新的工单待处理，请及时查看。' },
  claimed: { label: '认领', tip: '您的工单已被认领，正在处理中。' },
  assigned: { label: '分配/转派', tip: '工单已分配给您，请及时处理。' },
  started: { label: '开始处理', tip: '处理人已开始处理您的工单。' },
  resolved: { label: '已解决', tip: '工单已解决，请确认或反馈。' },
  confirmed: { label: '用户确认关闭', tip: '提交人已确认关闭工单。' },
  feedback: { label: '用户反馈', tip: '提交人提出了反馈，请继续处理。' },
  closed: { label: '直接关闭', tip: '工单已关闭。' },
  reopened: { label: '重开', tip: '工单已重开，请关注。' },
};

export function getEventTypeLabel(eventType: string): string {
  return EVENT_TYPE_MAP[eventType]?.label ?? (eventType || '工单动态');
}

export function getEventTypeTip(eventType: string): string {
  return EVENT_TYPE_MAP[eventType]?.tip ?? '工单状态有更新，请查看。';
}
