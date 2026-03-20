import { CheckCircle, Clock, Circle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

interface Stage {
  id: string;
  label: string;
  status: 'PENDING' | 'CURRENT' | 'COMPLETED';
  description?: string;
}

interface ProcessTimelineProps {
  stages: Stage[];
  orientation?: 'horizontal' | 'vertical';
}

export default function ProcessTimeline({ stages, orientation = 'horizontal' }: ProcessTimelineProps) {
  const { t } = useTranslation();

  if (orientation === 'vertical') {
    return (
      <div className="space-y-0">
        {stages.map((stage, index) => {
          const isCompleted = stage.status === 'COMPLETED';
          const isCurrent = stage.status === 'CURRENT';
          const isLast = index === stages.length - 1;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4"
            >
              {/* Line + Icon column */}
              <div className="flex flex-col items-center">
                <div className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 z-10',
                  isCompleted ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' :
                  isCurrent ? 'bg-slate-900 border-blue-400 shadow-lg shadow-blue-400/30' :
                  'bg-slate-800/50 border-slate-700'
                )}>
                  {isCompleted && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.1 + 0.2 }}>
                      <CheckCircle className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                  {isCurrent && (
                    <div className="relative">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/20" />
                    </div>
                  )}
                  {stage.status === 'PENDING' && (
                    <Circle className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                {!isLast && (
                  <div className={clsx(
                    'w-0.5 flex-1 my-1 min-h-6',
                    isCompleted ? 'bg-emerald-500/50' : 'bg-slate-700/50'
                  )} />
                )}
              </div>

              {/* Content */}
              <div className={clsx('pb-6 flex-1', isLast && 'pb-0')}>
                <div className={clsx(
                  'rounded-2xl p-4 border transition-all',
                  isCompleted ? 'bg-emerald-500/5 border-emerald-500/20' :
                  isCurrent ? 'bg-blue-500/5 border-blue-500/30 shadow-md shadow-blue-500/10' :
                  'bg-white/5/20 border-white/10/30'
                )}>
                  <h4 className={clsx(
                    'font-semibold text-sm',
                    isCompleted ? 'text-emerald-400' :
                    isCurrent ? 'text-blue-400' :
                    'text-slate-500'
                  )}>
                    {t(`ticket_config.stages.${stage.id}.label`, stage.label)}
                  </h4>
                  {(isCurrent || isCompleted) && stage.description && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {t(`ticket_config.stages.${stage.id}.description`, stage.description)}
                    </p>
                  )}
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      En progreso
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Horizontal (default - existing Timeline behavior enhanced)
  return (
    <div className="w-full">
      <div className="relative flex justify-between items-start">
        {/* Progress bar */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-800 -z-10 rounded-full">
          {(() => {
            const completedIdx = stages.filter(s => s.status === 'COMPLETED').length;
            const progress = (completedIdx / (stages.length - 1)) * 100;
            return (
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            );
          })()}
        </div>

        {stages.map((stage, index) => {
          const isCompleted = stage.status === 'COMPLETED';
          const isCurrent = stage.status === 'CURRENT';

          return (
            <div key={stage.id} className="flex flex-col items-center relative group">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all',
                  isCompleted ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' :
                  isCurrent ? 'bg-slate-900 border-blue-400' :
                  'bg-slate-800 border-slate-700'
                )}
              >
                {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                {isCurrent && <Clock className="w-4 h-4 text-blue-400 animate-pulse" />}
                {stage.status === 'PENDING' && <Circle className="w-3 h-3 text-slate-700" />}
              </motion.div>

              <div className="mt-3 text-center md:w-28">
                <p className={clsx('text-xs font-semibold',
                  isCurrent ? 'text-blue-400' :
                  isCompleted ? 'text-emerald-400' : 'text-slate-500'
                )}>
                  {t(`ticket_config.stages.${stage.id}.label`, stage.label)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}