import { useEffect, useRef } from 'react';

export default function DashboardChart({
  title, data = [], type = 'bar', color = '#0B5E8E', height = 200, loading
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (loading || !data.length || !canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const drawChart = () => {
      const container = containerRef.current;
      if (!container) return;
      const width = container.clientWidth;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.clearRect(0, 0, width, height);

      const padding = { top: 20, right: 20, bottom: 30, left: 45 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;
      const maxValue = Math.max(...data.map(d => d.value), 1);

      // Grid lines and Y-axis labels
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight * i) / 4;
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const val = maxValue - (maxValue * i) / 4;
        ctx.fillText(val > 1000 ? (val / 1000).toFixed(1) + 'k' : Math.round(val), padding.left - 10, y);
      }
      ctx.stroke();

      if (type === 'bar') {
        const barWidth = Math.min((chartWidth / data.length) * 0.6, 40);
        const spacing = chartWidth / data.length;
        data.forEach((item, i) => {
          const x = padding.left + (i * spacing) + (spacing - barWidth) / 2;
          const barHeight = (item.value / maxValue) * chartHeight;
          const y = height - padding.bottom - barHeight;

          const gradient = ctx.createLinearGradient(0, y, 0, height - padding.bottom);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, `${color}33`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.textAlign = 'center';
          ctx.font = '10px Inter, sans-serif';
          ctx.fillText(item.label, x + barWidth / 2, height - 10);
        });
      } else if (type === 'line') {
        const spacing = chartWidth / (data.length - 1 || 1);
        const points = data.map((item, i) => ({
          x: padding.left + i * spacing,
          y: padding.top + chartHeight - (item.value / maxValue) * chartHeight
        }));

        // Area fill
        const areaGradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        areaGradient.addColorStop(0, `${color}30`);
        areaGradient.addColorStop(1, `${color}05`);
        ctx.beginPath();
        ctx.moveTo(points[0].x, height - padding.bottom);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = areaGradient;
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();

        // X-axis labels
        data.forEach((item, i) => {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.textAlign = 'center';
          ctx.font = '10px Inter, sans-serif';
          ctx.fillText(item.label, padding.left + i * spacing, height - 10);
        });
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      animationFrameId = requestAnimationFrame(drawChart);
    });
    resizeObserver.observe(containerRef.current);
    drawChart();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [data, type, color, height, loading]);

  return (
    <div className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm rounded-2xl p-6">
      <h3 className="text-lg font-medium text-slate-200 mb-6">{title}</h3>
      <div ref={containerRef} className="relative w-full" style={{ height }}>
        {loading ? (
          <div className="absolute inset-0 flex items-end gap-2 animate-pulse p-4">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="flex-1 bg-slate-800 rounded-t" style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">No data available</div>
        ) : (
          <canvas ref={canvasRef} className="block w-full" />
        )}
      </div>
    </div>
  );
}
