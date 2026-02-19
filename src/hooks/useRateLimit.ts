import { useCallback, useEffect, useRef, useState } from 'react';

export function useRateLimit(cooldownSeconds: number) {
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const recordPost = useCallback(() => {
    setRemaining(cooldownSeconds);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [cooldownSeconds]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const canPost = remaining === 0;

  return { canPost, remaining, recordPost };
}
