/**
 * IM 模块 HTTP 接口
 * 与 im 后端对接，响应格式 { dat, err }
 */
import request from '@/utils/request';
import type { IMessagesResponse, IUploadResponse } from '@/pages/im/types';

const PREFIX = '/im';

function unwrap<T>(res: { dat?: T; err?: string }): T {
  if (res.err) throw new Error(res.err);
  return res.dat as T;
}

/** 当前用户会话列表（最近联系） */
export const getConversations = () =>
  request(`${PREFIX}/conversations`, { method: 'GET' }).then((res: any) => {
    const data = unwrap<{ list: any[] }>(res);
    return data?.list ?? [];
  });

/** 标记与某用户的会话为已读 */
export const markConversationRead = (peerUserId: number) => request(`${PREFIX}/conversations/${peerUserId}/read`, { method: 'PUT' }).then((res: any) => unwrap(res));

/** 与某用户的历史消息分页 */
export const getMessages = (params: { peer_user_id: number; limit?: number; before?: number }) =>
  request(`${PREFIX}/messages`, { method: 'GET', params }).then((res: any) => unwrap<IMessagesResponse>(res));

/** 上传文件/截图，formData 需包含字段 file */
export const uploadFile = (formData: FormData) =>
  request(`${PREFIX}/upload`, {
    method: 'POST',
    data: formData,
  }).then((res: any) => unwrap<IUploadResponse>(res));
