import React, { useState, useRef, useMemo } from 'react';
import type { Phone } from '../types/phone';
import { formatINR } from '../utils/formatters';
import { Sparkles } from 'lucide-react';

interface PriceHistoryChartProps {
  phones: Phone[];
  activePhoneId?: string;
  onSelectPhone?: (id: string) => void;
}

const LINE_COLORS = [
  { stroke: '#0F766E', fill: '#0F766E', bg: 'bg-[#0F766E]', lightBg: 'bg-teal-50', text: 'text-[#0F766E]', border: 'border-[#0F766E]' }, // Deep Teal (SpecLedger Accent)
  { stroke: '#D97706', fill: '#D97706', bg: 'bg-[#D97706]', lightBg: 'bg-amber-50', text: 'text-[#D97706]', border: 'border-[#D97706]' }, // Warm Amber
  { stroke: '#4F46E5', fill: '#4F46E5', bg: 'bg-[#4F46E5]', lightBg: 'bg-indigo-50', text: 'text-[#4F46E5]', border: 'border-[#4F46E5]' }, // Indigo
];

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  phones,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showReferenceLines, setShowReferenceLines] = useState<boolean>(true);
  const [selectedReferencePhoneId, setSelectedReferencePhoneId] = useState<string>(
    phones[0]?.id || ''
  );
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Default to first phone if reference phone removed
  const activeRefPhone = phones.find(p => p.id === selectedReferencePhoneId) || phones[0];

  // Calculate global min and max prices across all active phones
  const { minPrice, maxPrice, dates } = useMemo(() => {
    if (phones.length === 0) return { minPrice: 15000, maxPrice: 30000, dates: [] };

    let min = Infinity;
    let max = -Infinity;
    phones.forEach((p) => {
      p.priceHistory.forEach((pt) => {
        if (pt.price < min) min = pt.price;
        if (pt.price > max) max = pt.price;
      });
    });

    // Add padding to range
    const paddedMin = Math.max(10000, Math.floor((min - 1000) / 1000) * 1000);
    const paddedMax = Math.min(35000, Math.ceil((max + 1000) / 1000) * 1000);

    const dateList = phones[0]?.priceHistory.map((pt) => pt.date) || [];

    return { minPrice: paddedMin, maxPrice: paddedMax, dates: dateList };
  }, [phones]);

  // Chart dimensions in SVG viewBox coordinate space
  const chartWidth = 900;
  const chartHeight = 280;
  const padding = { top: 20, right: 30, bottom: 35, left: 65 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Scale functions
  const totalPoints = Math.max(2, dates.length || 365);
  const getX = (index: number) => {
    return padding.left + (index / (totalPoints - 1)) * plotWidth;
  };

  const getY = (price: number) => {
    return (
      padding.top +
      plotHeight -
      ((price - minPrice) / (maxPrice - minPrice)) * plotHeight
    );
  };

  // Generate SVG paths for each phone
  const paths = useMemo(() => {
    return phones.map((phone) => {
      const len = phone.priceHistory.length;
      if (len === 0) return '';
      const pts = phone.priceHistory.map((pt, idx) => {
        const x = getX(idx);
        const y = getY(pt.price);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      });
      return `M ${pts.join(' L ')}`;
    });
  }, [phones, minPrice, maxPrice, totalPoints]);

  // Y-axis tick intervals
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = 2500;
    const start = Math.ceil(minPrice / step) * step;
    for (let p = start; p <= maxPrice; p += step) {
      ticks.push(p);
    }
    return ticks;
  }, [minPrice, maxPrice]);

  // X-axis date ticks (6 intervals across the 365 days)
  const xTicks = useMemo(() => {
    if (dates.length === 0) return [];
    const indices = [0, 60, 120, 180, 240, 300, 364];
    return indices.map((idx) => {
      const dateStr = dates[idx];
      if (!dateStr) return { index: idx, label: '' };
      const d = new Date(dateStr);
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      return { index: idx, label };
    });
  }, [dates]);

  // Major sale event annotations across the 365-day timeline
  const eventBands = useMemo(() => {
    if (!dates || dates.length === 0) return [];
    const bands: { name: string; startIndex: number; endIndex: number }[] = [];
    let currentEvent: string | null = null;
    let startIdx = 0;

    dates.forEach((d, idx) => {
      const m = d.slice(5, 7);
      const day = parseInt(d.slice(8, 10), 10);
      let ev: string | null = null;
      if (m === '01' && day >= 19 && day <= 26) ev = 'Republic Day';
      else if ((m === '09' && day >= 23) || (m === '10' && day <= 6)) ev = 'Big Billion Days';
      else if (m === '11' && day >= 1 && day <= 5) ev = 'Diwali Festive';

      if (ev !== currentEvent) {
        if (currentEvent) {
          bands.push({ name: currentEvent, startIndex: startIdx, endIndex: idx - 1 });
        }
        currentEvent = ev;
        startIdx = idx;
      }
    });

    if (currentEvent) {
      bands.push({ name: currentEvent, startIndex: startIdx, endIndex: dates.length - 1 });
    }

    return bands;
  }, [dates]);

  // Handle pointer tracking for scrubber
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || dates.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    // Map clientX to SVG viewBox coordinate
    const svgX = (clientX / rect.width) * chartWidth;
    const clampedX = Math.max(padding.left, Math.min(padding.left + plotWidth, svgX));
    const normalized = (clampedX - padding.left) / plotWidth;
    const index = Math.round(normalized * (dates.length - 1));
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  if (phones.length === 0) {
    return (
      <div className="bg-app-surface border border-app-border rounded-lg p-8 text-center text-app-muted">
        Select at least one phone from the slots above to inspect the 365-day price trajectory.
      </div>
    );
  }

  // Hover data calculations
  const hoveredDate = hoverIndex !== null ? dates[hoverIndex] : null;
  const hoveredEvents = hoverIndex !== null
    ? phones
        .map((p) => p.priceHistory[hoverIndex]?.event)
        .filter(Boolean)
    : [];
  const primaryEvent = hoveredEvents[0];

  return (
    <div className="bg-app-surface border border-app-border rounded-lg p-5 shadow-sm">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-app-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-app-text tracking-tight flex items-center gap-1.5">
              <span>365-Day Daily Flipkart Price History</span>
              <span className="text-xs font-normal text-app-muted px-2 py-0.5 bg-app-bg border border-app-border rounded">
                Daily INR Scrape
              </span>
            </h2>
          </div>
          <p className="text-xs text-app-muted mt-0.5">
            Synchronized price tracking over the past 12 months with festival discount benchmarks.
          </p>
        </div>

        {/* Reference Line Toggle and Active Benchmark Device Selector */}
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-app-muted hover:text-app-text select-none">
            <input
              type="checkbox"
              checked={showReferenceLines}
              onChange={(e) => setShowReferenceLines(e.target.checked)}
              className="rounded border-app-border text-app-accent focus:ring-app-accent h-3.5 w-3.5 cursor-pointer"
            />
            <span>Show Low / Avg Reference</span>
          </label>

          {showReferenceLines && phones.length > 1 && (
            <div className="flex items-center gap-1.5 bg-app-bg px-2 py-1 rounded border border-app-border">
              <span className="text-app-muted">Benchmark device:</span>
              <select
                value={activeRefPhone?.id}
                onChange={(e) => setSelectedReferencePhoneId(e.target.value)}
                className="bg-transparent font-medium text-app-text text-xs focus:outline-none cursor-pointer"
              >
                {phones.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Device Legend Strip */}
      <div className="flex flex-wrap items-center gap-3 pt-3 pb-2 text-xs">
        {phones.map((phone, idx) => {
          const color = LINE_COLORS[idx % LINE_COLORS.length];
          return (
            <div
              key={phone.id}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border ${color.border} ${color.lightBg}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
              <span className="font-semibold text-app-text">{phone.name}</span>
              <span className="tabular-nums font-bold text-app-text">
                {formatINR(phone.currentPrice)}
              </span>
              {phone.isAtYearLow ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-[#0F766E]">
                  1-Yr Low
                </span>
              ) : (
                <span className="text-[11px] text-app-muted tabular-nums">
                  {phone.percentBelowAvg}% below avg
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive SVG Chart Container */}
      <div className="relative mt-2 select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Background Grid Lines (Horizontal) */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick} className="text-app-muted">
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#EBEBE5"
                  strokeWidth="1"
                  strokeDasharray="2,3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-current tabular-nums font-medium"
                >
                  {formatINR(tick)}
                </text>
              </g>
            );
          })}

          {/* Sale Event Highlight Bands & Labels */}
          {eventBands.map((band) => {
            const x1 = getX(band.startIndex);
            const x2 = getX(band.endIndex);
            const w = Math.max(34, x2 - x1);
            const midX = (x1 + x2) / 2;
            return (
              <g key={band.name + band.startIndex}>
                <rect
                  x={x1}
                  y={padding.top}
                  width={w}
                  height={plotHeight}
                  fill="#0F766E"
                  fillOpacity="0.04"
                />
                <line
                  x1={midX}
                  y1={padding.top}
                  x2={midX}
                  y2={chartHeight - padding.bottom}
                  stroke="#0F766E"
                  strokeWidth="0.8"
                  strokeDasharray="2,2"
                  strokeOpacity="0.3"
                />
                <rect
                  x={midX - 42}
                  y={padding.top + 2}
                  width={84}
                  height={14}
                  rx="3"
                  fill="#F0FDFA"
                  stroke="#99F6E4"
                  strokeWidth="0.8"
                />
                <text
                  x={midX}
                  y={padding.top + 12}
                  textAnchor="middle"
                  className="text-[8.5px] font-bold fill-[#0F766E] uppercase tracking-wider"
                >
                  {band.name}
                </text>
              </g>
            );
          })}

          {/* Reference Lines (Low, High & Average for active benchmark phone) */}
          {showReferenceLines && activeRefPhone && (
            <g>
              {/* 1-Year Low Line */}
              <line
                x1={padding.left}
                y1={getY(activeRefPhone.oneYearLow)}
                x2={chartWidth - padding.right}
                y2={getY(activeRefPhone.oneYearLow)}
                stroke="#0F766E"
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />
              <text
                x={chartWidth - padding.right - 4}
                y={getY(activeRefPhone.oneYearLow) - 4}
                textAnchor="end"
                className="text-[9.5px] font-semibold fill-[#0F766E] tabular-nums"
              >
                1-Yr Low ({formatINR(activeRefPhone.oneYearLow)})
              </text>

              {/* 1-Year High Line */}
              <line
                x1={padding.left}
                y1={getY(activeRefPhone.oneYearHigh)}
                x2={chartWidth - padding.right}
                y2={getY(activeRefPhone.oneYearHigh)}
                stroke="#D97706"
                strokeWidth="1.2"
                strokeDasharray="4,3"
              />
              <text
                x={chartWidth - padding.right - 4}
                y={getY(activeRefPhone.oneYearHigh) - 4}
                textAnchor="end"
                className="text-[9.5px] font-semibold fill-[#D97706] tabular-nums"
              >
                1-Yr High ({formatINR(activeRefPhone.oneYearHigh)})
              </text>

              {/* 1-Year Average Line */}
              <line
                x1={padding.left}
                y1={getY(activeRefPhone.oneYearAvg)}
                x2={chartWidth - padding.right}
                y2={getY(activeRefPhone.oneYearAvg)}
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              <text
                x={chartWidth - padding.right - 4}
                y={getY(activeRefPhone.oneYearAvg) - 4}
                textAnchor="end"
                className="text-[9.5px] font-medium fill-slate-500 tabular-nums"
              >
                1-Yr Avg ({formatINR(activeRefPhone.oneYearAvg)})
              </text>
            </g>
          )}

          {/* Device Lines */}
          {phones.map((phone, idx) => {
            const color = LINE_COLORS[idx % LINE_COLORS.length];
            return (
              <g key={phone.id}>
                <path
                  d={paths[idx]}
                  fill="none"
                  stroke={color.stroke}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* X-Axis Date Ticks */}
          {xTicks.map((tick) => {
            const x = getX(tick.index);
            return (
              <g key={tick.index} className="text-app-muted">
                <line
                  x1={x}
                  y1={chartHeight - padding.bottom}
                  x2={x}
                  y2={chartHeight - padding.bottom + 4}
                  stroke="#D4D4CE"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={chartHeight - padding.bottom + 16}
                  textAnchor="middle"
                  className="text-[10px] fill-current font-medium"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Scrubber Crosshair & Tooltip Anchor */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={chartHeight - padding.bottom}
                stroke="#141413"
                strokeWidth="1"
                strokeDasharray="2,2"
              />

              {/* Intersection dots for each phone */}
              {phones.map((phone, idx) => {
                const color = LINE_COLORS[idx % LINE_COLORS.length];
                const pt = phone.priceHistory[hoverIndex];
                if (!pt) return null;
                const cx = getX(hoverIndex);
                const cy = getY(pt.price);
                return (
                  <circle
                    key={phone.id}
                    cx={cx}
                    cy={cy}
                    r="4.5"
                    fill="#FFFFFF"
                    stroke={color.stroke}
                    strokeWidth="2.5"
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* Hover Tooltip Card (positioned dynamically) */}
        {hoverIndex !== null && hoveredDate && (
          <div
            className="absolute top-2 pointer-events-none z-20 bg-app-surface/95 backdrop-blur-sm border border-app-border shadow-md rounded-md p-2.5 text-xs transition-all duration-75"
            style={{
              left: `${Math.min(
                Math.max(10, ((getX(hoverIndex) / chartWidth) * 100)),
                75
              )}%`,
            }}
          >
            <div className="font-semibold text-app-text border-b border-app-border-subtle pb-1 mb-1.5 flex items-center justify-between gap-3">
              <span>{new Date(hoveredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              {primaryEvent && (
                <span className="text-[10px] font-semibold text-app-accent px-1.5 py-0.2 bg-teal-50 border border-teal-200 rounded">
                  {primaryEvent}
                </span>
              )}
            </div>
            <div className="space-y-1">
              {phones.map((phone, idx) => {
                const color = LINE_COLORS[idx % LINE_COLORS.length];
                const pt = phone.priceHistory[hoverIndex];
                if (!pt) return null;
                return (
                  <div key={phone.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${color.bg}`} />
                      <span className="text-app-text text-[11px] font-medium truncate max-w-[140px]">
                        {phone.name}
                      </span>
                    </div>
                    <span className="tabular-nums font-bold text-app-text">
                      {formatINR(pt.price)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Price Drop Forecast & AI Timing Analysis Box */}
      <div className="mt-4 pt-3 border-t border-app-border-subtle grid grid-cols-1 md:grid-cols-3 gap-3">
        {phones.map((phone, idx) => {
          const color = LINE_COLORS[idx % LINE_COLORS.length];
          return (
            <div
              key={phone.id}
              className="bg-app-bg/70 border border-app-border rounded-md p-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${color.bg}`} />
                    <span className="text-xs font-semibold text-app-text truncate">
                      {phone.name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                      phone.forecastStatus === 'At Floor'
                        ? 'bg-teal-50 text-[#0F766E] border-teal-200'
                        : phone.forecastStatus === 'Likely Drop'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {phone.forecastStatus}
                  </span>
                </div>
                <p className="text-[11px] text-app-muted leading-relaxed">
                  {phone.forecastNote}
                </p>
              </div>

              {/* Future Price Drop Forecast Placeholder Slot */}
              <div className="mt-2 pt-1.5 border-t border-app-border-subtle flex items-center justify-between text-[10px]">
                <span className="text-app-muted flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#0F766E]" />
                  <span>Forecast Slot v2:</span>
                </span>
                <span className="font-medium text-app-text">
                  {phone.isAtYearLow ? 'Optimal Buy Now' : 'Sale dip expected'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
