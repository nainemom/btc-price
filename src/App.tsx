import { useWindowSize } from 'react-use';
import {
  type PriceDataPoint,
  RealtimePriceChart,
} from './components/RealtimePriceChart';
import { useStream } from './utils/useStream';

const base = 'btc';
const quote = 'usdt';
const interval = '1s';
const fakeTolerance = () => Math.random() * 20 - 10;

function App() {
  const { width, height } = useWindowSize();
  const size = Math.floor(width / 35);
  const { data, isConnected, isPending, isTrusted } = useStream<PriceDataPoint>(
    `wss://stream.binance.com:9443/ws/${base.toLowerCase()}${quote.toLowerCase()}@kline_${interval}`,
    {
      size,
      trustCheck: (messages) => messages.length > 2,
      formatter: (message) => {
        try {
          const parsedMessage = JSON.parse(message);
          return {
            price:
              (parseFloat(parsedMessage.k.h) + parseFloat(parsedMessage.k.l)) /
                2 +
              fakeTolerance(),
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
            `https://api.binance.com/api/v3/klines?symbol=${base.toUpperCase()}${quote.toUpperCase()}&interval=${interval}&limit=${size}`,
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
            price:
              (parseFloat(item[4]) + parseFloat(item[1])) / 2 + fakeTolerance(),
            time: new Date(item[0]),
          }));
        } catch (e) {
          console.error('Error fetching initial data:', e);
          return [];
        }
      },
    },
  );

  if (!isConnected || isPending || !isTrusted)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="animate-pulse">
          {!isConnected
            ? 'Connecting...'
            : !isTrusted
              ? 'Establishing a secure connection...'
              : `Preparing... ${Math.ceil((data.length / size) * 100)}%`}
        </p>
      </div>
    );

  return (
    <RealtimePriceChart
      data={data}
      height={height}
      width={width}
      backgroundColor="#000"
      color="#fff"
    />
  );
}

export default App;
