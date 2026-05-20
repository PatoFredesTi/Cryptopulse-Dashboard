import { useEffect, useMemo, useState } from 'react';

const DEFAULT_INTERVAL_MS = 120000;

export function useAutoRefreshTimer(lastUpdated, intervalMs = DEFAULT_INTERVAL_MS) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  return useMemo(() => {
    if (!lastUpdated) {
      return {
        intervalMs,
        nextRefreshSeconds: Math.round(intervalMs / 1000),
        progress: 0,
      };
    }

    const elapsed = Math.max(0, now - lastUpdated.getTime());
    const remaining = Math.max(0, intervalMs - elapsed);

    return {
      intervalMs,
      nextRefreshSeconds: Math.ceil(remaining / 1000),
      progress: Math.min(100, (elapsed / intervalMs) * 100),
    };
  }, [lastUpdated, intervalMs, now]);
}
