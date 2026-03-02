import type { useEffect, useState } from 'react';
import type { getWithETag } from '../services/api';

interface UsePollingOptions {
  url: string;
  interval?: number;
  enabled?: boolean;
}

export const usePolling = <T = any>(
  options: UsePollingOptions
): { data: T | null; loading: boolean; error: Error | null } => {
  const { url, interval = 30000, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setInterval>;
    let isActive = true;

    const poll = async () => {
      if (!isActive) return;
      
      setLoading(true);
      try {
        const etagHeader = localStorage.getItem(`etag:${url}`);
        const headers: any = {};
        if (etagHeader) headers['If-None-Match'] = etagHeader;

        const response = await getWithETag<T>(url, { headers });
        
        if (response.status === 304) {
          console.log('数据未变化');
          setLoading(false);
          return;
        }

        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    // 立即执行一次
    poll();

    // 设置轮询
    timer = setInterval(poll, interval);

    // 监听标签页可见性
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 后台：暂停轮询
        clearInterval(timer);
      } else {
        // 前台：恢复轮询
        poll();
        timer = setInterval(poll, interval);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isActive = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [url, interval, enabled]);

  return { data, loading, error };
};
