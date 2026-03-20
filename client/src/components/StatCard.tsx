import { type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  accent?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  onClick?: () => void;
}

const accentConfig = {
  blue: {
    icon: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    border: 'hover:border-blue-500/30',
    glow: 'from-blue-500/10',
    dot: 'bg-blue-400',
  },
  emerald: {
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    border: 'hover:border-emerald-500/30',
    glow: 'from-emerald-500/10',
    dot: 'bg-emerald-400',
  },
  amber: {
    icon: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    border: 'hover:border-amber-500/30',
    glow: 'from-amber-500/10',
    dot: 'bg-amber-400',
  },
  purple: {
    icon: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    border: 'hover:border-purple-500/30',
    glow: 'from-purple-500/10',
    dot: 'bg-purple-400',
  },
  rose: {
    icon: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
    border: 'hover:border-rose-500/30',
    glow: 'from-rose-500/10',
    dot: 'bg-rose-400',
  },
};

export default function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  accent = 'blue',
  onClick,
}: StatCardProps) {
  const cfg = accentConfig[accent];

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={clsx(
        'glass p-6 rounded-3xl relative overflow-hidden transition-all duration-300',
        cfg.border,
        onClick && 'cursor-pointer'
      )}
    >
      <div className={clsx('absolute inset-0 bg-linear-to-br to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500', cfg.glow)} />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className={clsx('p-3 rounded-2xl', cfg.iconBg)}>
            <Icon className={clsx('w-6 h-6', cfg.icon)} />
          </div>
          {trend && (
            <span className={clsx(
              'text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-full',
              trend.direction === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
            )}>
              {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>

        <div>
          <div className="text-4xl font-bold text-white tabular-nums">{value}</div>
          <div className="text-slate-400 text-sm font-medium mt-1">{title}</div>
          {subtitle && <div className="text-slate-500 text-xs mt-0.5">{subtitle}</div>}
        </div>
      </div>
    </motion.div>
  );
}