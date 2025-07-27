import clsx from 'clsx';

export function Progress({
  value = 0,
  className,
}: {
  value?: number;
  className?: string;
}) {
  return (
    <div className={clsx(`w-full h-1 bg-zinc-800 rounded`, className)}>
      <div
        className="h-full bg-white rounded transition-all duration-700 ease-linear"
        style={{ width: `${Math.min(value, 1) * 100}%` }}
      />
    </div>
  );
}
