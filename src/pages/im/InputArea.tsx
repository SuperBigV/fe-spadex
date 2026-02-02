/**
 * 输入区：文本 + 发送文档 + 发送截图 + 发送按钮
 */
import React, { useState, useRef } from 'react';
import { Button, Input, message } from 'antd';
import { SendOutlined, PaperClipOutlined, PictureOutlined } from '@ant-design/icons';
import { uploadFile } from '@/services/im';
import type { IMsgBody } from './types';
import './style.less';

const { TextArea } = Input;

export interface InputAreaProps {
  peerUserId: number | null;
  sendMessage: (toUserId: number, body: IMsgBody) => void;
  disabled?: boolean;
}

export default function InputArea({ peerUserId, sendMessage, disabled }: InputAreaProps) {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSendText = () => {
    const trimmed = (text || '').trim();
    if (!trimmed || !peerUserId) return;
    sendMessage(peerUserId, { type: 'text', content: trimmed });
    setText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const file = e.target.files?.[0];
    if (!file || !peerUserId) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    uploadFile(formData)
      .then((res) => {
        const body: IMsgBody =
          type === 'image' ? { type: 'image', content: res.filename || '[图片]', file_url: res.url } : { type: 'file', content: res.filename || '[文件]', file_url: res.url };
        sendMessage(peerUserId, body);
      })
      .catch((err) => {
        message.error(err?.message || '上传失败');
      })
      .finally(() => {
        setUploading(false);
        e.target.value = '';
      });
  };

  if (!peerUserId) return null;

  return (
    <div className='im-input-area'>
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPressEnter={(e) => {
          if (!e.shiftKey) {
            e.preventDefault();
            handleSendText();
          }
        }}
        placeholder='输入消息，Enter 发送'
        autoSize={{ minRows: 2, maxRows: 4 }}
        disabled={disabled}
        rows={2}
      />
      <div className='im-input-actions'>
        <Button type='text' size='small' icon={<PaperClipOutlined />} onClick={() => fileInputRef.current?.click()} disabled={disabled || uploading} title='发送文件' />
        <input ref={fileInputRef} type='file' accept='*' style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'file')} />
        <Button type='text' size='small' icon={<PictureOutlined />} onClick={() => imageInputRef.current?.click()} disabled={disabled || uploading} title='发送图片' />
        <input ref={imageInputRef} type='file' accept='image/*' style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'image')} />
        <Button type='primary' size='small' icon={<SendOutlined />} onClick={handleSendText} disabled={disabled || uploading}>
          发送
        </Button>
      </div>
    </div>
  );
}
