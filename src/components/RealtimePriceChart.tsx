import { clsx } from 'clsx';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { useUpdatePeriod } from '../utils/useUpdatePeriod';

export interface PriceDataPoint {
  price: number;
  time: Date;
}

export function RealtimePriceChart({
  data,
  className,
  width = 460,
  height = 400,
}: {
  data: PriceDataPoint[];
  className?: string;
  width?: number;
  height?: number;
}) {
  const updatePeriod = useUpdatePeriod(data, 1000);

  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!root.current || data.length === 0) return;

    const svg = d3.select(root.current);
    svg.selectAll('*').remove();

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.time) as [Date, Date])
      .range([0, width]);

    const lastData = data[data.length - 1];

    const y = d3
      .scaleLinear()
      .domain([
        (d3.min(data, (d) => d.price) ?? 0) * 0.999,
        (d3.max(data, (d) => d.price) ?? 0) * 1.001,
      ])
      .range([height, 0]);

    const line = d3
      .line<PriceDataPoint>()
      .x((d) => x(d.time))
      .y((d) => y(d.price))
      .curve(d3.curveBasis);

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(0, 0)`);

    svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width - width / 5)
      .attr('height', height);

    const path = g
      .append('g')
      .attr('clip-path', 'url(#clip)')
      .append('path')
      .datum([
        ...data,
        {
          ...lastData,
          time: new Date(lastData.time.getTime() + updatePeriod),
        },
      ])
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', line);

    path
      .transition()
      .duration(updatePeriod)
      .ease(d3.easeLinear)
      .attr('transform', `translate(${-(width / data.length)}, 0)`);
  }, [data, width, height, updatePeriod]);

  return <svg ref={root} className={clsx('bg-white', className)} />;
}
