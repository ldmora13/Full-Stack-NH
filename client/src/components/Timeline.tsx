import { CheckCircle, Circle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Stage {
    id: string;
    label: string;
    status: 'PENDING' | 'CURRENT' | 'COMPLETED';
    description?: string;
}

interface TimelineProps {
    stages: Stage[];
}

export default function Timeline({ stages }: TimelineProps) {
    const { t } = useTranslation();

    return (
        <div className="w-full">
            <div className="relative flex justify-between items-start">
                {/* Progress Bar Background */}
                <div className="absolute top-4 left-0 w-full h-1 bg-slate-800 -z-10 rounded-full" />

                {stages.map((stage, index) => {
                    const isCompleted = stage.status === 'COMPLETED';
                    const isCurrent = stage.status === 'CURRENT';
                    const isPending = stage.status === 'PENDING';

                    return (
                        <div key={stage.id} className="flex flex-col items-center relative group">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${isCompleted ? 'bg-blue-500 border-blue-500' :
                                    isCurrent ? 'bg-white/5 border-emerald-400' :
                                        'bg-white/5 border-slate-700'
                                    } transition-colors duration-300 z-10`}
                            >
                                {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                                {isCurrent && <Clock className="w-4 h-4 text-blue-400 animate-pulse" />}
                                {isPending && <Circle className="w-3 h-3 text-slate-700" />}
                            </motion.div>

                            <div className="mt-3 text-center md:w-32">
                                <p className={`text-xs font-bold ${isCurrent ? 'text-blue-400' :
                                    isCompleted ? 'text-emerald-500/80' : 'text-slate-500'
                                    }`}>
                                    {t(`ticket_config.stages.${stage.id}.label`, stage.label)}
                                </p>
                                {isCurrent && stage.description && (
                                    <p className="hidden md:block text-[10px] text-slate-400 mt-1 leading-tight">
                                        {t(`ticket_config.stages.${stage.id}.description`, stage.description)}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
