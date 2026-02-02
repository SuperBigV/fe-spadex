/**
 * IM 模块类型定义
 */

/** 会话项（最近联系） */
export interface IConversation {
  id: number;
  peer_user_id: number;
  last_msg_at: number;
  last_msg_id: number;
  last_content: string;
  unread_count: number;
  peer_nickname?: string;
}

/** 消息项 */
export interface IMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  type: 'text' | 'file' | 'image';
  content: string;
  file_url?: string;
  created_at: number;
}

/** 历史消息分页响应 */
export interface IMessagesResponse {
  list: IMessage[];
  has_more: boolean;
}

/** 上传响应 */
export interface IUploadResponse {
  url: string;
  filename: string;
  size: number;
}

/** WebSocket 上行：发送消息 body */
export type IMsgBody = { type: 'text'; content: string } | { type: 'file'; content: string; file_url: string } | { type: 'image'; content: string; file_url: string };

/** 用户信息（全部用户列表用） */
export interface IUserItem {
  id: number;
  username?: string;
  nickname?: string;
  [key: string]: any;
}

/** 用户组（全部用户用） */
export interface IUserGroup {
  id: number;
  name?: string;
  [key: string]: any;
}
