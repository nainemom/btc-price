import { useEffect, useRef, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export const useStream = <T>(
  url: string,
  {
    size,
    formatter,
    initialData = () => Promise.resolve([]),
  }: {
    size: number;
    formatter: (message: never) => T | null;
    initialData?: () => Promise<T[]>;
  },
) => {
  const [data, setData] = useState<T[]>([]);
  const inited = useRef(false);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    initialData()
      .catch(() => [])
      .then((resp) => {
        setData((p) => (p.length < resp.length ? resp : p));
      });
  }, [initialData]);

  const { readyState } = useWebSocket<T>(url, {
    shouldReconnect: () => true,
    disableJson: true,
    onMessage: (e) => {
      const item = formatter(e.data as never);
      if (item === null) return;
      setData((p) => {
        if (p.includes(item)) return p;
        return [...p.slice(-1 * size + 1), item];
      });
    },
  });

  return {
    data,
    isConnected: readyState === ReadyState.OPEN,
    isPending: data.length !== size,
  };
};
