import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardKPICard({
  title, value, icon: Icon, trend, trendLabel,
  color = 'blue', prefix = '', loading
}) {
  const colors = {
    blue: 'bg-[#0B5E8E]/10 text-[#0B5E8E] dark:text-[#72D6C1] border-[#0B5E8E]/20',
    primary: 'bg-[#0B5E8E]/10 text-[#0B5E8E] dark:text-[#72D6C1] border-[#0B5E8E]/20',
    secondary: 'bg-[#168A8A]/10 text-[#168A8A] border-[#168A8A]/20',
    emerald: 'bg-[#249B72]/10 text-[#249B72] border-[#249B72]/20',
    amber: 'bg-[#D99A2B]/10 text-[#D99A2B] border-[#D99A2B]/20',
    red: 'bg-[#D95353]/10 text-[#D95353] border-[#D95353]/20',
    purple: 'bg-[#168A8A]/10 text-[#168A8A] border-[#168A8A]/20'
  };
  const barColors = {
    blue: 'bg-[#0B5E8E]',
    primary: 'bg-[#0B5E8E]',
    secondary: 'bg-[#168A8A]',
    emerald: 'bg-[#249B72]',
    amber: 'bg-[#D99A2B]',
    red: 'bg-[#D95353]',
    purple: 'bg-[#168A8A]'
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm rounded-2xl p-6 h-32 animate-pulse">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-800" />
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-slate-800 rounded"></div>
            <div className="h-8 w-32 bg-slate-800 rounded"></div>
          </div>
          <div className="h-12 w-12 bg-slate-800 rounded-full"></div>
        </div>
      </div>
    );
  }

  const isPositive = trend > 0;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const trendColor = isPositive ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 group">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${barColors[color]}`} />
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            {prefix && <span className="text-xl text-slate-500">{prefix}</span>}
            <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
          </div>
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className={`flex items-center ${trendColor} font-medium`}>
                <TrendIcon className="w-4 h-4 mr-1" />
                {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-slate-500">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full border ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
}
