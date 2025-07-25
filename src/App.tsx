import { useWindowSize } from 'react-use';
import {
  type PriceDataPoint,
  RealtimePriceChart,
} from './components/RealtimePriceChart';
import { useStream } from './utils/useStream';

const base = 'pengu';
const quote = 'usdt';
const interval = '1s';
const limit = 100;

function App() {
  const { width, height } = useWindowSize();
  const { data } = useStream<PriceDataPoint>(
    `wss://stream.binance.com:9443/ws/${base.toLowerCase()}${quote.toLowerCase()}@kline_${interval}`,
    {
      size: limit,
      formatter: (message) => {
        try {
          const parsedMessage = JSON.parse(message);
          return {
            price:
              parseFloat(parsedMessage.k.c) + parseFloat(parsedMessage.k.o) / 2,
            time: new Date(parsedMessage.E),
          };
        } catch (e) {
          console.error('Error parsing message:', message, e);
          return null;
        }
      },
      initialData: async () => {
        try {
          const res = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${base.toUpperCase()}${quote.toUpperCase()}&interval=${interval}&limit=${limit}`,
            {
              headers: {
                'Content-Type': 'application/json',
              },
              method: 'GET',
            },
          );
          const messages = await res.json();
          // biome-ignore lint/suspicious/noExplicitAny: it doesn't matter here
          return messages.map((item: any) => ({
            price: parseFloat(item[4]) + parseFloat(item[1]) / 2,
            time: new Date(item[0]),
          }));
        } catch (e) {
          console.error('Error fetching initial data:', e);
          return [];
        }
      },
    },
  );

  return <RealtimePriceChart data={data} height={height} width={width} />;
}

export default App;
