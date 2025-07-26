import { clsx } from 'clsx';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { formatNumber } from '../utils/numbers';
import { useUpdatePeriod } from '../utils/useUpdatePeriod';

export interface PriceDataPoint {
  price: number;
  time: Date;
}

export function RealtimePriceChart({
  data,
  className,
  width,
  height,
  backgroundColor,
  color,
}: {
  data: PriceDataPoint[];
  className?: string;
  width: number;
  height: number;
  backgroundColor: string;
  color: string;
}) {
  const updatePeriod = useUpdatePeriod(data, 1000);

  const root = useRef<SVGSVGElement>(null);
  const yDomainRef = useRef<[number, number]>([0, 0]); // Initial dummy values

  useEffect(() => {
    if (!root.current || data.length === 0) return;

    const cirlceSize = 8;

    const endMargin = width / 5;

    const svg = d3.select(root.current);
    svg.attr('style', `background-color: ${backgroundColor}`);
    svg.selectAll('*').remove();

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.time) as [Date, Date])
      .range([0, width - endMargin]);

    const lastData = data[data.length - 1];

    if (
      lastData.price > yDomainRef.current[1] ||
      lastData.price < yDomainRef.current[0]
    ) {
      yDomainRef.current = [
        (d3.min(data, (d) => d.price) ?? 0) * 0.999,
        (d3.max(data, (d) => d.price) ?? 0) * 1.001,
      ];
    }

    const y = d3.scaleLinear().domain(yDomainRef.current).range([height, 0]);

    const line = d3
      .line<PriceDataPoint>()
      .x((d) => x(d.time))
      .y((d) => y(d.price))
      .curve(d3.curveBumpX);

    const g = svg.attr('width', width).attr('height', height).append('g');

    svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width - endMargin)
      .attr('height', height);

    const path = g
      .append('g')
      .attr('clip-path', 'url(#clip)')
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);

    g.append('rect')
      .attr('x', x(data.at(-2)?.time ?? 0))
      .attr('y', 0)
      .attr('width', width / data.length)
      .attr('height', height)
      .attr('fill', backgroundColor);

    const circle = g
      .append('circle')
      .attr('cx', x(data.at(-2)?.time ?? 0))
      .attr('cy', y(data.at(-2)?.price ?? 0))
      .attr('r', cirlceSize)
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('fill', backgroundColor);

    const fakeCircle = circle
      .clone()
      .attr('r', cirlceSize - 5)
      .attr('stroke-width', 0)
      .attr('fill', 'transparent');

    const text = g
      .append('text')
      .attr('x', x(data.at(-2)?.time ?? 0) + cirlceSize + 5)
      .attr('y', y(data.at(-2)?.price ?? 0) + cirlceSize / 2)
      .attr('fill', color)
      .text(
        `$${formatNumber(data.at(-1)?.price ?? 0, {
          compactInteger: true,
          separateByComma: true,
          decimalLength: 3,
          minifyDecimalRepeats: true,
        })}`,
      )
      .attr('font-size', 12)
      .attr('font-weight', 300)
      .attr('font-family', 'monospace');

    circle
      .transition()
      .duration(updatePeriod)
      .ease(d3.easeExpInOut)
      .attr('cy', y(data.at(-1)?.price ?? 0));

    fakeCircle
      .transition()
      .duration(updatePeriod)
      .ease(d3.easeExpInOut)
      .attr('fill', color)
      .attr('cy', y(data.at(-1)?.price ?? 0));

    text
      .transition()
      .duration(updatePeriod)
      .ease(d3.easeExpInOut)
      .attr('y', y(data.at(-1)?.price ?? 0) + cirlceSize / 2);

    path
      .transition()
      .duration(updatePeriod)
      .ease(d3.easeLinear)
      .attr(
        'transform',
        `translate(${-((width - endMargin) / data.length)}, 0)`,
      );
  }, [data, width, height, backgroundColor, color, updatePeriod]);

  return <svg ref={root} className={clsx(className)} />;
}
