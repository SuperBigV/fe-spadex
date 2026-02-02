/**
 * WebSocket /im/ws 连接：鉴权、心跳、上行 send/ping、下行 message/pong/error
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { basePrefix } from '@/App';
import { AccessTokenKey } from '@/utils/constant';
import type { IMessage, IMsgBody } from '../types';

export type WsStatus = 'closed' | 'connecting' | 'connected';

export interface UseImWsOptions {
  /** 是否启用（如当前在 /im 页面） */
  enabled: boolean;
  /** 收到新消息回调，payload 与 IMessage 一致 */
  onMessage?: (msg: IMessage) => void;
  /** 收到 error 回调 */
  onError?: (code: string, message: string) => void;
}

export function useImWs(options: UseImWsOptions) {
  const { enabled, onMessage, onError } = options;
  const [status, setStatus] = useState<WsStatus>('closed');
  const wsRef = useRef<WebSocket | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  onMessageRef.current = onMessage;
  onErrorRef.current = onError;

  const getWsUrl = useCallback(() => {
    const token = localStorage.getItem(AccessTokenKey) || '';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname + ':17004';
    const path = `${basePrefix}/im/ws`;
    const sep = path.includes('?') ? '&' : '?';
    return `${protocol}//${host}${path}${sep}token=${encodeURIComponent(token)}`;
  }, []);

  const send = useCallback((data: object) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }, []);

  const sendMessage = useCallback(
    (toUserId: number, body: IMsgBody) => {
      send({ type: 'send', to_user_id: toUserId, body });
    },
    [send],
  );

  const connect = useCallback(() => {
    if (!enabled) return;
    setStatus('connecting');
    const url = getWsUrl();
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      pingTimerRef.current = setInterval(() => {
        send({ type: 'ping' });
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'message':
            if (data.payload) {
              const payload = data.payload as IMessage;
              onMessageRef.current?.(payload);
            }
            break;
          case 'pong':
            break;
          case 'error':
            onErrorRef.current?.(data.code || 'ERROR', data.message || '');
            break;
          default:
            break;
        }
      } catch {
        // ignore
      }
    };

    ws.onclose = () => {
      setStatus('closed');
      if (pingTimerRef.current) {
        clearInterval(pingTimerRef.current);
        pingTimerRef.current = null;
      }
      wsRef.current = null;
    };

    ws.onerror = () => {
      setStatus('closed');
    };
  }, [enabled, getWsUrl, send]);

  const disconnect = useCallback(() => {
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('closed');
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return { status, sendMessage, reconnect: connect };
}
