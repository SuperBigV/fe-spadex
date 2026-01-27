import { useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
  interval?: number; // 刷新间隔（毫秒），默认30000（30秒）
  enabled?: boolean; // 是否启用自动刷新，默认true
  onRefresh: () => void;
}

export const useAutoRefresh = ({ interval = 30000, enabled = true, onRefresh }: UseAutoRefreshOptions) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      onRefresh();
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, interval, onRefresh]);
};
