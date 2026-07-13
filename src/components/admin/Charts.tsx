'use client';

interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  height?: number;
}

export function BarChart({ data, height = 180 }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <div className="w-full font-sans">
      <div className="flex items-end justify-between gap-2 pt-4 border-b border-slate-100" style={{ height: `${height}px` }}>
        {data.map((item, idx) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center group">
              {/* Tooltip */}
              <div className="absolute -translate-y-8 bg-slate-950 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none font-bold">
                ₹{item.value.toLocaleString()}
              </div>
              {/* Bar */}
              <div
                className="w-full bg-slate-900 group-hover:bg-slate-750 rounded-t-sm transition-all duration-300"
                style={{ height: `${percentage}%`, maxHeight: '100%' }}
              />
            </div>
          );
        })}
      </div>
      {/* Labels */}
      <div className="flex justify-between gap-2 mt-2">
        {data.map((item, idx) => (
          <span key={idx} className="flex-1 text-center text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: number[];
  labels: string[];
  height?: number;
}

export function LineChart({ data, labels, height = 180 }: LineChartProps) {
  const maxValue = Math.max(...data) || 1;
  const padding = 20;
  const chartHeight = height - padding * 2;
  const pointsCount = data.length;

  // Generate SVG path points
  const points = data
    .map((val, idx) => {
      const x = (idx / (pointsCount - 1)) * 100; // in percentage
      const y = padding + (1 - val / maxValue) * chartHeight;
      return `${x}%,${y}`;
    })
    .join(' ');

  // Create absolute point coordinates for a viewBox width of 500, height of 180
  const width = 500;
  const absolutePoints = data
    .map((val, idx) => {
      const x = (idx / (pointsCount - 1)) * width;
      const y = padding + (1 - val / maxValue) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  // Area path (closes the shape at the bottom for shading)
  const areaPoints = `${absolutePoints} ${width},${height} 0,${height}`;

  return (
    <div className="w-full font-sans">
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Shaded Area */}
          <polyline
            fill="rgba(15, 23, 42, 0.03)"
            points={areaPoints}
            stroke="none"
          />
          {/* Main Trend Line */}
          <polyline
            fill="none"
            stroke="rgb(15, 23, 42)"
            strokeWidth="2.5"
            points={absolutePoints}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Data Points */}
          {data.map((val, idx) => {
            const x = (idx / (pointsCount - 1)) * width;
            const y = padding + (1 - val / maxValue) * chartHeight;
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="3.5"
                className="fill-white stroke-slate-900 stroke-[2] cursor-pointer hover:r-[5] transition-all"
              />
            );
          })}
        </svg>
      </div>
      {/* Labels */}
      <div className="flex justify-between mt-2 px-1">
        {labels.map((lbl, idx) => (
          <span key={idx} className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {lbl}
          </span>
        ))}
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
}

export function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 py-2 font-sans">
      {/* SVG Ring */}
      <div className="relative h-32 w-32 flex-shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
          
          {data.map((item, idx) => {
            const percent = (item.value / total) * 100;
            const strokeDash = `${percent} ${100 - percent}`;
            const strokeOffset = 100 - accumulatedPercent;
            accumulatedPercent += percent;

            return (
              <circle
                key={idx}
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke={item.color}
                strokeWidth="3.2"
                strokeDasharray={strokeDash}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
          <span className="text-sm font-bold text-slate-900">{total} Items</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2 w-full text-xs">
        {data.map((item, idx) => {
          const percent = ((item.value / total) * 100).toFixed(0);
          return (
            <div key={idx} className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.label}</span>
              </div>
              <span className="text-slate-800 font-bold ml-4">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
