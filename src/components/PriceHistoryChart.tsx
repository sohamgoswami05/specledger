import React, { useState, useRef, useMemo } from 'react';
import type { Phone, PricePoint } from '../types/phone';
import { formatINR } from '../utils/formatters';
import { Sparkles } from 'lucide-react';

interface PriceHistoryChartProps {
  phones: Phone[];
  activePhoneId?: string;
  onSelectPhone?: (id: string) => void;
}

type RangeMode = 'all' | 'live' | '90d' | '1y';

const LIVE_SYNC_CUTOFF = '2026-12-01';

const LINE_COLORS = [
  { stroke: '#0F766E', fill: '#0F766E', bg: 'bg-[#0F766E]', lightBg: 'bg-teal-50', text: 'text-[#0F766E]', border: 'border-[#0F766E]' }, // Deep Teal (SpecLedger Accent)
  { stroke: '#D97706', fill: '#D97706', bg: 'bg-[#D97706]', lightBg: 'bg-amber-50', text: 'text-[#D97706]', border: 'border-[#D97706]' }, // Warm Amber
  { stroke: '#4F46E5', fill: '#4F46E5', bg: 'bg-[#4F46E5]', lightBg: 'bg-indigo-50', text: 'text-[#4F46E5]', border: 'border-[#4F46E5]' }, // Indigo
];

function toUtcMs(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getTime();
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  phones,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [rangeMode, setRangeMode] = useState<RangeMode>('all');
  const [showReferenceLines, setShowReferenceLines] = useState<boolean>(true);
  const [selectedReferencePhoneId, setSelectedReferencePhoneId] = useState<string>(
    phones[0]?.id || ''
  );
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Default to first phone if reference phone removed
  const activeRefPhone = phones.find((p) => p.id === selectedReferencePhoneId) || phones[0];

  // Filter each phone's priceHistory by the selected rangeMode
  const filteredSeries = useMemo(() => {
    let latestMs = 0;
    phones.forEach((p) => {
      p.priceHistory.forEach((pt) => {
        const ms = toUtcMs(pt.date);
        if (!Number.isNaN(ms) && ms > latestMs) latestMs = ms;
      });
    });
    if (latestMs === 0) latestMs = Date.now();

    const cutoff90d = new Date(latestMs - 90 * 86400000).toISOString().slice(0, 10);
    const cutoff1y = new Date(latestMs - 365 * 86400000).toISOString().slice(0, 10);

    return phones.map((p) => {
      const pts = (p.priceHistory || []).filter((pt) => {
        if (rangeMode === 'live') return pt.date >= LIVE_SYNC_CUTOFF;
        if (rangeMode === '90d') return pt.date >= cutoff90d;
        if (rangeMode === '1y') return pt.date >= cutoff1y;
        return true;
      });
      return [...pts].sort((a, b) => a.date.localeCompare(b.date));
    });
  }, [phones, rangeMode]);

  // Calculate global min/max prices and calendar date bounds across filtered series
  const { minPrice, maxPrice, dates, minDateMs, maxDateMs } = useMemo(() => {
    if (phones.length === 0) {
      return {
        minPrice: 15000,
        maxPrice: 30000,
        dates: [] as string[],
        minDateMs: 0,
        maxDateMs: 0,
      };
    }

    let min = Infinity;
    let max = -Infinity;
    const dateSet = new Set<string>();

    filteredSeries.forEach((pts) => {
      pts.forEach((pt) => {
        if (pt.price < min) min = pt.price;
        if (pt.price > max) max = pt.price;
        if (pt.date) dateSet.add(pt.date);
      });
    });

    if (min === Infinity) min = 15000;
    if (max === -Infinity) max = 30000;

    // Add padding to Y-axis range
    const paddedMin = Math.max(5000, Math.floor((min - 1000) / 1000) * 1000);
    const paddedMax = Math.max(paddedMin + 2000, Math.ceil((max + 1000) / 1000) * 1000);

    const sortedDates = Array.from(dateSet).sort();
    const minMs = sortedDates.length > 0 ? toUtcMs(sortedDates[0]) : 0;
    const maxMs = sortedDates.length > 0 ? toUtcMs(sortedDates[sortedDates.length - 1]) : 0;

    return {
      minPrice: paddedMin,
      maxPrice: paddedMax,
      dates: sortedDates,
      minDateMs: minMs,
      maxDateMs: maxMs,
    };
  }, [phones.length, filteredSeries]);

  // Chart dimensions in SVG viewBox coordinate space
  const chartWidth = 900;
  const chartHeight = 280;
  const padding = { top: 24, right: 30, bottom: 35, left: 65 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Calendar-proportional X scale (falls back to right edge for single-date baseline)
  const getXForDate = (dateStr: string) => {
    if (minDateMs === maxDateMs || maxDateMs === 0) {
      return padding.left + plotWidth * 0.5;
    }
    const ms = toUtcMs(dateStr);
    const ratio = (ms - minDateMs) / (maxDateMs - minDateMs);
    return padding.left + Math.max(0, Math.min(1, ratio)) * plotWidth;
  };

  const getY = (price: number) => {
    const span = maxPrice - minPrice || 1;
    return padding.top + plotHeight - ((price - minPrice) / span) * plotHeight;
  };

  // Generate SVG paths: step-after (H then V) for < 2026-12-01 anchors, smooth L for >= 2026-12-01
  const paths = useMemo(() => {
    return filteredSeries.map((pts) => {
      if (pts.length === 0) return '';
      if (pts.length === 1) {
        const y = getY(pts[0].price);
        return `M ${padding.left},${y.toFixed(1)} L ${(chartWidth - padding.right).toFixed(1)},${y.toFixed(1)}`;
      }
      const cmds: string[] = [];
      pts.forEach((pt, idx) => {
        const x = getXForDate(pt.date);
        const y = getY(pt.price);
        if (idx === 0) {
          cmds.push(`M ${x.toFixed(1)},${y.toFixed(1)}`);
        } else {
          const prev = pts[idx - 1];
          const isHistoricalStep =
            prev.date < LIVE_SYNC_CUTOFF || prev.source === 'historical_anchor';
          if (isHistoricalStep) {
            cmds.push(`H ${x.toFixed(1)} V ${y.toFixed(1)}`);
          } else {
            cmds.push(`L ${x.toFixed(1)},${y.toFixed(1)}`);
          }
        }
      });
      return cmds.join(' ');
    });
  }, [filteredSeries, minPrice, maxPrice, minDateMs, maxDateMs]);

  // Y-axis tick intervals
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const span = maxPrice - minPrice;
    const step = span > 20000 ? 5000 : 2500;
    const start = Math.ceil(minPrice / step) * step;
    for (let p = start; p <= maxPrice; p += step) {
      ticks.push(p);
    }
    return ticks;
  }, [minPrice, maxPrice]);

  // X-axis date ticks
  const xTicks = useMemo(() => {
    if (dates.length === 0) return [];
    if (dates.length === 1) {
      return [
        {
          date: dates[0],
          label: new Date(dates[0]).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: '2-digit',
          }),
        },
      ];
    }
    if (dates.length <= 6) {
      return dates.map((d) => ({
        date: d,
        label: new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      }));
    }
    const ticks: { date: string; label: string }[] = [];
    const segments = 6;
    for (let i = 0; i <= segments; i++) {
      const ms = minDateMs + ((maxDateMs - minDateMs) * i) / segments;
      const dStr = new Date(ms).toISOString().slice(0, 10);
      const label = new Date(ms).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
      if (ticks.length === 0 || ticks[ticks.length - 1].label !== label) {
        ticks.push({ date: dStr, label });
      }
    }
    return ticks;
  }, [dates, minDateMs, maxDateMs]);

  // Sale event bands with shortened labels & horizontal/vertical collision stagger
  const eventBands = useMemo(() => {
    if (!dates || dates.length < 2) return [];
    const rawBands: { name: string; startDate: string; endDate: string }[] = [];
    let currentEvent: string | null = null;
    let startDate = '';

    dates.forEach((d, idx) => {
      const m = d.slice(5, 7);
      const day = parseInt(d.slice(8, 10), 10);
      let ev: string | null = null;
      if (m === '01' && day >= 19 && day <= 26) ev = 'Rep. Day';
      else if ((m === '09' && day >= 23) || (m === '10' && day <= 6)) ev = 'BBD';
      else if (m === '11' && day >= 1 && day <= 5) ev = 'Diwali';

      if (ev !== currentEvent) {
        if (currentEvent) {
          rawBands.push({ name: currentEvent, startDate, endDate: dates[idx - 1] });
        }
        currentEvent = ev;
        startDate = d;
      }
    });

    if (currentEvent) {
      rawBands.push({ name: currentEvent, startDate, endDate: dates[dates.length - 1] });
    }

    // Stagger Y offsets so adjacent pills (e.g. BBD and Diwali) never collide
    let lastRow0RightX = -Infinity;
    let lastRow1RightX = -Infinity;

    return rawBands.map((band) => {
      const x1 = getXForDate(band.startDate);
      const x2 = getXForDate(band.endDate);
      const w = Math.max(24, x2 - x1);
      const midX = (x1 + x2) / 2;
      const pillWidth = Math.max(38, band.name.length * 6.5 + 14);
      const pillLeft = midX - pillWidth / 2;

      let row = 0;
      if (pillLeft < lastRow0RightX + 6) {
        if (pillLeft >= lastRow1RightX + 6) {
          row = 1;
          lastRow1RightX = midX + pillWidth / 2;
        } else {
          row = 1;
          lastRow1RightX = midX + pillWidth / 2;
        }
      } else {
        lastRow0RightX = midX + pillWidth / 2;
      }

      return {
        ...band,
        x1,
        w,
        midX,
        pillWidth,
        pillY: row === 0 ? padding.top + 2 : padding.top + 18,
      };
    });
  }, [dates, minDateMs, maxDateMs]);

  // Right-edge reference lines with vertical collision avoidance
  const referenceItems = useMemo(() => {
    if (!showReferenceLines || !activeRefPhone) return [];
    const raw = [
      {
        key: 'high',
        label: `1-Yr High (${formatINR(activeRefPhone.oneYearHigh)})`,
        rawY: getY(activeRefPhone.oneYearHigh),
        stroke: '#D97706',
        strokeWidth: 1.2,
        dash: '4,3',
        textClass: 'fill-[#D97706] font-semibold',
      },
      {
        key: 'avg',
        label: `1-Yr Avg (${formatINR(activeRefPhone.oneYearAvg)})`,
        rawY: getY(activeRefPhone.oneYearAvg),
        stroke: '#94A3B8',
        strokeWidth: 1,
        dash: '3,3',
        textClass: 'fill-slate-500 font-medium',
      },
      {
        key: 'low',
        label: `1-Yr Low (${formatINR(activeRefPhone.oneYearLow)})`,
        rawY: getY(activeRefPhone.oneYearLow),
        stroke: '#0F766E',
        strokeWidth: 1.5,
        dash: '4,3',
        textClass: 'fill-[#0F766E] font-semibold',
      },
    ];

    // Sort top-to-bottom by rawY and resolve overlapping text labels
    const sorted = [...raw].sort((a, b) => a.rawY - b.rawY);
    const MIN_GAP = 13;
    const minLabelY = padding.top + 10;
    const maxLabelY = chartHeight - padding.bottom - 4;

    const adjustedY = sorted.map((item) => Math.max(minLabelY, Math.min(maxLabelY, item.rawY - 4)));

    // Forward pass: push down if too close
    for (let i = 1; i < adjustedY.length; i++) {
      if (adjustedY[i] < adjustedY[i - 1] + MIN_GAP) {
        adjustedY[i] = adjustedY[i - 1] + MIN_GAP;
      }
    }
    // Backward pass: clamp to bottom and push up if needed
    if (adjustedY[adjustedY.length - 1] > maxLabelY) {
      adjustedY[adjustedY.length - 1] = maxLabelY;
      for (let i = adjustedY.length - 2; i >= 0; i--) {
        if (adjustedY[i] > adjustedY[i + 1] - MIN_GAP) {
          adjustedY[i] = adjustedY[i + 1] - MIN_GAP;
        }
      }
    }

    return sorted.map((item, idx) => ({
      ...item,
      labelY: adjustedY[idx],
    }));
  }, [showReferenceLines, activeRefPhone, minPrice, maxPrice]);

  // Live Daily Sync divider position (Dec 1, 2026)
  const liveSyncMs = toUtcMs(LIVE_SYNC_CUTOFF);
  const showLiveSyncDivider =
    dates.length >= 2 && liveSyncMs >= minDateMs && liveSyncMs <= maxDateMs;
  const liveSyncX = showLiveSyncDivider ? getXForDate(LIVE_SYNC_CUTOFF) : null;

  // Handle pointer tracking for scrubber (snap to nearest recorded date in timeline)
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || dates.length === 0) return;
    if (dates.length === 1) {
      setHoverIndex(0);
      return;
    }
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * chartWidth;
    const clampedX = Math.max(padding.left, Math.min(padding.left + plotWidth, svgX));
    const normalized = (clampedX - padding.left) / plotWidth;
    const targetMs = minDateMs + normalized * (maxDateMs - minDateMs);

    let bestIdx = 0;
    let bestDiff = Infinity;
    dates.forEach((d, idx) => {
      const diff = Math.abs(toUtcMs(d) - targetMs);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIdx = idx;
      }
    });
    setHoverIndex(bestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  if (phones.length === 0) {
    return (
      <div className="bg-app-surface border border-app-border rounded-lg p-8 text-center text-app-muted">
        Select at least one phone from the slots above to inspect the price trajectory.
      </div>
    );
  }

  // Hover point lookup helper (respects step-after holds between historical anchors)
  const getPointForHover = (pts: PricePoint[], targetDate: string): PricePoint | undefined => {
    if (pts.length === 0) return undefined;
    if (pts.length === 1) return pts[0];
    const exact = pts.find((p) => p.date === targetDate);
    if (exact) return exact;
    if (targetDate < pts[0].date) return undefined;
    let latest: PricePoint | undefined;
    for (const p of pts) {
      if (p.date <= targetDate) latest = p;
      else break;
    }
    return latest;
  };

  const hoveredDate = hoverIndex !== null ? dates[hoverIndex] : null;
  const hoveredEvents =
    hoverIndex !== null && hoveredDate
      ? filteredSeries
          .map((pts) => {
            const exact = pts.find((item) => item.date === hoveredDate);
            return exact?.event || (pts.length === 1 ? pts[0].event : undefined);
          })
          .filter(Boolean)
      : [];
  const primaryEvent = hoveredEvents[0];

  return (
    <div className="bg-app-surface border border-app-border rounded-lg p-5 shadow-sm">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-app-border-subtle">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-app-text tracking-tight">
              Flipkart Price History Ledger
            </h2>
            <span className="text-[11px] font-medium text-app-muted px-2 py-0.5 bg-app-bg border border-app-border rounded">
              Anchors (&lt; Dec 1) + Daily Live Sync
            </span>
          </div>
          <p className="text-xs text-app-muted mt-0.5">
            Step-after historical turning points transitioning into daily Flipkart price scrapes from Dec 1, 2026 onward.
          </p>
        </div>

        {/* Range Switcher, Reference Line Toggle & Benchmark Selector */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Compact Range Switcher */}
          <div className="inline-flex items-center bg-app-bg p-0.5 rounded-md border border-app-border">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'live', label: 'Live (Dec 1+)' },
                { id: '90d', label: '90D' },
                { id: '1y', label: '1Y' },
              ] as { id: RangeMode; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setRangeMode(opt.id);
                  setHoverIndex(null);
                }}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  rangeMode === opt.id
                    ? 'bg-app-surface text-app-text shadow-2xs border border-app-border'
                    : 'text-app-muted hover:text-app-text'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

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
      {dates.length === 0 ? (
        <div className="mt-3 py-10 px-4 bg-app-bg/60 border border-app-border-subtle rounded-md text-center text-xs text-app-muted">
          {rangeMode === 'live' ? (
            <span>
              Live daily Flipkart scraping starts <strong>Dec 1, 2026</strong>. Switch to{' '}
              <button
                type="button"
                onClick={() => setRangeMode('all')}
                className="text-app-accent font-semibold underline cursor-pointer"
              >
                All
              </button>{' '}
              to inspect pre-Dec 1 historical anchors.
            </span>
          ) : (
            <span>No price history points recorded in this range yet.</span>
          )}
        </div>
      ) : (
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

            {/* Sale Event Highlight Bands & Staggered Top Pills */}
            {eventBands.map((band) => (
              <g key={band.name + band.startDate}>
                <rect
                  x={band.x1}
                  y={padding.top}
                  width={band.w}
                  height={plotHeight}
                  fill="#0F766E"
                  fillOpacity="0.04"
                />
                <line
                  x1={band.midX}
                  y1={padding.top}
                  x2={band.midX}
                  y2={chartHeight - padding.bottom}
                  stroke="#0F766E"
                  strokeWidth="0.8"
                  strokeDasharray="2,2"
                  strokeOpacity="0.3"
                />
                <rect
                  x={band.midX - band.pillWidth / 2}
                  y={band.pillY}
                  width={band.pillWidth}
                  height={14}
                  rx="3"
                  fill="#F0FDFA"
                  stroke="#99F6E4"
                  strokeWidth="0.8"
                />
                <text
                  x={band.midX}
                  y={band.pillY + 10}
                  textAnchor="middle"
                  className="text-[8.5px] font-bold fill-[#0F766E] uppercase tracking-wider"
                >
                  {band.name}
                </text>
              </g>
            ))}

            {/* Vertical Dashed Divider at 2026-12-01 (Live Sync Starts) */}
            {liveSyncX !== null && (
              <g>
                <line
                  x1={liveSyncX}
                  y1={padding.top}
                  x2={liveSyncX}
                  y2={chartHeight - padding.bottom}
                  stroke="#0F766E"
                  strokeWidth="1.2"
                  strokeDasharray="4,3"
                  strokeOpacity="0.65"
                />
                <rect
                  x={Math.min(chartWidth - padding.right - 84, Math.max(padding.left + 2, liveSyncX - 42))}
                  y={chartHeight - padding.bottom - 18}
                  width={84}
                  height={14}
                  rx="3"
                  fill="#F0FDFA"
                  stroke="#0F766E"
                  strokeOpacity="0.4"
                  strokeWidth="0.8"
                />
                <text
                  x={Math.min(chartWidth - padding.right - 42, Math.max(padding.left + 44, liveSyncX))}
                  y={chartHeight - padding.bottom - 8}
                  textAnchor="middle"
                  className="text-[8.5px] font-bold fill-[#0F766E]"
                >
                  Live Sync Starts
                </text>
              </g>
            )}

            {/* Reference Lines with Vertical Collision Avoidance */}
            {referenceItems.map((ref) => (
              <g key={ref.key}>
                <line
                  x1={padding.left}
                  y1={ref.rawY}
                  x2={chartWidth - padding.right}
                  y2={ref.rawY}
                  stroke={ref.stroke}
                  strokeWidth={ref.strokeWidth}
                  strokeDasharray={ref.dash}
                />
                <text
                  x={chartWidth - padding.right - 4}
                  y={ref.labelY}
                  textAnchor="end"
                  className={`text-[9.5px] tabular-nums ${ref.textClass}`}
                >
                  {ref.label}
                </text>
              </g>
            ))}

            {/* Device Lines & Historical Anchor Nodes */}
            {phones.map((phone, idx) => {
              const color = LINE_COLORS[idx % LINE_COLORS.length];
              const pts = filteredSeries[idx] || [];
              const showDots = pts.length <= 15;
              return (
                <g key={phone.id}>
                  <path
                    d={paths[idx]}
                    fill="none"
                    stroke={color.stroke}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={pts.length === 1 ? '4,4' : undefined}
                  />
                  {pts.map((pt, ptIdx) => {
                    const isAnchor = pt.source === 'historical_anchor' || pt.date < LIVE_SYNC_CUTOFF;
                    if (!showDots && !isAnchor) return null;
                    const cx =
                      pts.length === 1
                        ? dates.length === 1
                          ? padding.left + plotWidth * 0.5
                          : chartWidth - padding.right
                        : getXForDate(pt.date);
                    const cy = getY(pt.price);
                    return (
                      <circle
                        key={`${phone.id}-dot-${ptIdx}`}
                        cx={cx}
                        cy={cy}
                        r={isAnchor ? 4 : 3.5}
                        fill="#FFFFFF"
                        stroke={color.stroke}
                        strokeWidth="2"
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* X-Axis Date Ticks */}
            {xTicks.map((tick) => {
              const x = getXForDate(tick.date);
              return (
                <g key={tick.date} className="text-app-muted">
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
            {hoverIndex !== null && hoveredDate && (
              <g>
                <line
                  x1={getXForDate(hoveredDate)}
                  y1={padding.top}
                  x2={getXForDate(hoveredDate)}
                  y2={chartHeight - padding.bottom}
                  stroke="#141413"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />

                {/* Intersection dots for each phone */}
                {phones.map((phone, idx) => {
                  const color = LINE_COLORS[idx % LINE_COLORS.length];
                  const pt = getPointForHover(filteredSeries[idx] || [], hoveredDate);
                  if (!pt) return null;
                  const cx = getXForDate(hoveredDate);
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

          {/* Hover Tooltip Card */}
          {hoverIndex !== null && hoveredDate && (
            <div
              className="absolute top-2 pointer-events-none z-20 bg-app-surface/95 backdrop-blur-sm border border-app-border shadow-md rounded-md p-2.5 text-xs transition-all duration-75"
              style={{
                left: `${Math.min(
                  Math.max(10, (getXForDate(hoveredDate) / chartWidth) * 100),
                  72
                )}%`,
              }}
            >
              <div className="font-semibold text-app-text border-b border-app-border-subtle pb-1 mb-1.5 flex items-center justify-between gap-3">
                <span>
                  {new Date(hoveredDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                {primaryEvent && (
                  <span className="text-[10px] font-semibold text-app-accent px-1.5 py-0.2 bg-teal-50 border border-teal-200 rounded">
                    {primaryEvent}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {phones.map((phone, idx) => {
                  const color = LINE_COLORS[idx % LINE_COLORS.length];
                  const pts = filteredSeries[idx] || [];
                  const pt = getPointForHover(pts, hoveredDate);
                  if (!pt) return null;
                  const exactMatch = pts.find((item) => item.date === hoveredDate);
                  return (
                    <div key={phone.id} className="space-y-0.5">
                      <div className="flex items-center justify-between gap-4">
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
                      {exactMatch?.event && exactMatch.event !== primaryEvent && (
                        <div className="pl-3.5 text-[10px] text-app-accent font-medium">
                          {exactMatch.event}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

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
