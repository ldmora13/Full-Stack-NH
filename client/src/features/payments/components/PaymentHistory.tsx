import { useTranslation } from "react-i18next";
import { CheckCircle, Clock } from "lucide-react";

interface Payment {
    id: number;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
}

interface PaymentHistoryProps {
    payments: Payment[];
}

export const PaymentHistory = ({ payments }: PaymentHistoryProps) => {
    const { t } = useTranslation();

    if (payments.length === 0) {
        return (
            <div className="p-4 bg-white/5/50 rounded-lg text-center text-slate-500 text-sm">
                {t('payments.no_history')}
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs uppercase bg-white/5/80 text-slate-300">
                    <tr>
                        <th className="px-4 py-3">{t('common.date')}</th>
                        <th className="px-4 py-3">{t('payments.amount')}</th>
                        <th className="px-4 py-3">{t('common.status')}</th>
                        <th className="px-4 py-3">ID</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-white/10 bg-white/5/30 hover:bg-slate-800/50">
                            <td className="px-4 py-3">
                                {new Date(payment.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 font-medium text-white">
                                {Number(payment.amount).toFixed(2)} {payment.currency}
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'COMPLETED'
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}>
                                    {payment.status === 'COMPLETED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    {payment.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                #{payment.id}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
