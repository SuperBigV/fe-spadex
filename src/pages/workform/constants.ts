// 工单状态
export const STATUS_PENDING = 'pending';
export const STATUS_PROCESSING = 'processing';
export const STATUS_RESOLVED = 'resolved';
export const STATUS_CLOSED = 'closed';

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  [STATUS_PENDING]: { label: '待处理', color: 'orange' },
  [STATUS_PROCESSING]: { label: '处理中', color: 'blue' },
  [STATUS_RESOLVED]: { label: '已解决', color: 'green' },
  [STATUS_CLOSED]: { label: '已关闭', color: 'default' },
};

// 视图 Tab
export const VIEW_ALL = 'all';
export const VIEW_MY_ORDERS = 'my_orders';
export const VIEW_PENDING = 'pending';
export const VIEW_PROCESSING = 'processing';
export const VIEW_RESOLVED = 'resolved';
export const VIEW_CLOSED = 'closed';
