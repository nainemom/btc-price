import { useRef, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export const useStream = <T, R>(
  url: string,
  config: {
    messageHistory: number;
    formatter: (message: R) => T;
  },
) => {
  const [data, setData] = useState<T[]>([]);
  const messageHistory = useRef(config.messageHistory);
  const formatter = useRef(config.formatter);

  const { readyState } = useWebSocket<T>(url, {
    shouldReconnect: () => true,
    onMessage: (e) => {
      try {
        const message = formatter.current(JSON.parse(e.data));
        if (message) {
          setData((p) => {
            if (p.includes(message)) return p;
            return [...p.slice(-1 * messageHistory.current + 1), message];
          });
        }
      } catch (_e) {
        console.error('Error parsing message:', e.data);
      }
    },
  });

  return {
    data,
    isConnected: readyState === ReadyState.OPEN,
  };
};
