/**
 * 单条消息展示：气泡、时间、text/file/image
 */
import React from 'react';
import { basePrefix } from '@/App';
import type { IMessage } from './types';
import { formatTime } from '@/pages/im/utils';
import './style.less';

export interface MessageItemProps {
  message: IMessage;
  isSelf: boolean;
}

export default function MessageItem({ message, isSelf }: MessageItemProps) {
  const { type, content, file_url, created_at } = message;
  const fullFileUrl = file_url ? `${basePrefix}${file_url}` : '';

  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <a href={fullFileUrl} target='_blank' rel='noopener noreferrer' className='im-message-image-wrap'>
            <img src={fullFileUrl} alt='' className='im-message-image' />
          </a>
        );
      case 'file':
        return (
          <a href={fullFileUrl} target='_blank' rel='noopener noreferrer' className='im-message-file-link'>
            {content || '[文件]'}
          </a>
        );
      default:
        return <span>{content || ''}</span>;
    }
  };

  return (
    <div className={`im-message-item ${isSelf ? 'is-self' : ''}`}>
      <div className='im-message-bubble'>{renderContent()}</div>
      <div className='im-message-meta'>{formatTime(created_at)}</div>
    </div>
  );
}
