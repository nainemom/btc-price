import { useEffect, useRef, useState } from 'react';

export const useUpdatePeriod = (dependency: unknown, defaultValue: number) => {
  const lastUpdate = useRef<number>(Date.now());
  const lastValue = useRef<unknown>(dependency);

  const [period, setPeriod] = useState<number>(defaultValue);

  useEffect(() => {
    if (dependency !== lastValue.current) {
      const now = Date.now();
      setPeriod(now - lastUpdate.current);
      lastUpdate.current = now;
      lastValue.current = dependency;
    }
  }, [dependency]);

  return period;
};
