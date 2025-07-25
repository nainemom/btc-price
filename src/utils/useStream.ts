import { useState } from 'react';
import { useEffectOnce } from 'react-use';
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

  useEffectOnce(() => {
    initialData()
      .catch(() => data)
      .then((resp) => {
        setData((p) => (p.length < resp.length ? resp : p));
      });
  });

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
