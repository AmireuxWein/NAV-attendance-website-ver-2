import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatItem {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  subtext: string;
}

interface SummaryStatsProps {
  stats: StatItem[];
}

export function SummaryStats({ stats }: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-surface-container-lowest p-5 sm:p-6 rounded-3xl custom-shadow border border-outline-variant/10 flex flex-col justify-between group hover:border-primary/20 transition-all">
          <span className="text-[10px] font-black tracking-widest text-outline uppercase">{stat.label}</span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-on-surface">{stat.value}</span>
            {stat.change && (
              <span className={cn(
                "text-[11px] font-black flex items-center px-1.5 py-0.5 rounded-full",
                stat.trend === 'up' ? "bg-primary/10 text-primary" : stat.trend === 'down' ? "bg-error/10 text-error" : "bg-tertiary/10 text-tertiary"
              )}>
                {stat.trend === 'up' && <ArrowUp size={12} />}
                {stat.trend === 'down' && <ArrowDown size={12} />}
                {stat.change}
              </span>
            )}
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2 font-bold uppercase tracking-tight opacity-60">{stat.subtext}</p>
        </div>
      ))}
    </div>
  );
}
