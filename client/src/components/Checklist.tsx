import { UploadCloud, CheckCircle, Circle, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ChecklistItem {
    id: string;
    label: string;
    required: boolean;
    status?: 'PENDING' | 'UPLOADED' | 'APPROVED' | 'REJECTED';
}

interface ChecklistProps {
    items: ChecklistItem[];
    onUpload?: (itemId: string) => void;
}

export default function Checklist({ items, onUpload }: ChecklistProps) {
    const { t } = useTranslation();

    if (!items || items.length === 0) return null;

    return (
        <div className="bg-white/5/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                {t('ticket.config.checklist_title', 'Requisitos del Trámite')}
            </h3>
            <div className="space-y-3">
                {items.map((item, index) => {
                    const isCompleted = item.status === 'APPROVED' || item.status === 'UPLOADED';

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center justify-between p-3 rounded-xl border ${isCompleted ? 'border-blue-500/20 bg-blue-500/5' : 'border-white/10 bg-white/5/50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {item.status === 'APPROVED' ? (
                                    <CheckCircle className="w-5 h-5 text-blue-400" />
                                ) : item.status === 'UPLOADED' ? (
                                    <CheckCircle className="w-5 h-5 text-blue-400" />
                                ) : (
                                    <Circle className="w-5 h-5 text-slate-600" />
                                )}
                                <div>
                                    <p className={`text-sm font-medium ${isCompleted ? 'text-slate-200' : 'text-slate-400'}`}>
                                        {t(`ticket_config.checklist.${item.id}`, item.label)}
                                    </p>
                                    {item.required && !isCompleted && (
                                        <span className="text-[10px] text-amber-500 font-medium">{t('common.required', 'Requerido')}</span>
                                    )}
                                </div>
                            </div>

                            {/* Action Button - For now just visual if no handler */}
                            <button
                                onClick={() => onUpload && onUpload(item.id)}
                                disabled={isCompleted}
                                className={`p-2 rounded-lg transition-colors ${isCompleted
                                    ? 'text-emerald-500 cursor-default'
                                    : 'text-slate-500 hover:text-blue-400 hover:bg-blue-500/10'
                                    }`}
                            >
                                {item.status === 'REJECTED' ? (
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                ) : (
                                    <UploadCloud className="w-4 h-4" />
                                )}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
