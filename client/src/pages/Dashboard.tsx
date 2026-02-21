import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { Ticket, Clock, CheckCircle, AlertCircle } from 'lucide-react';


import { useTranslation } from 'react-i18next';

import { useStats } from '../features/dashboard/hooks/useStats';

export default function Dashboard() {
    const { user } = useAuth();
    const { t } = useTranslation();

    // Use custom hook for data fetching
    const {
        stats,
        recentActivity,
        isLoading: loading,
        isError: error
    } = useStats();

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            OPEN: 'bg-emerald-500',
            IN_PROGRESS: 'bg-blue-500',
            RESOLVED: 'bg-purple-500',
            CLOSED: 'bg-slate-500',
        };
        return colors[status] || 'bg-slate-500';
    };

    const getStatusLabel = (status: string) => {
        return t(`ticket_status.${status}`);
    };

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${t('common.date')} ${diffMins} min`;
        if (diffHours < 24) return `${t('common.date')} ${diffHours} h`;
        return `${t('common.date')} ${diffDays} d`;
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-slate-400">{error}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
                        {t('dashboard.welcome')}
                    </h1>
                    <p className="text-slate-400 mt-1">{user?.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link to="/tickets?status=OPEN" className="block group">
                    <div className="glass p-6 rounded-3xl h-full hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Ticket className="w-6 h-6 text-emerald-400" />
                                </div>
                                <span className="flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            </div>
                            <div>
                                <h3 className="text-4xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">
                                    {stats?.open || 0}
                                </h3>
                                <p className="text-slate-400 text-sm font-medium">{t('dashboard.new_requests')}</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to="/tickets?status=IN_PROGRESS" className="block group">
                    <div className="glass p-6 rounded-3xl h-full hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Clock className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-4xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">
                                    {stats?.inProgress || 0}
                                </h3>
                                <p className="text-slate-400 text-sm font-medium">{t('dashboard.in_progress')}</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to="/tickets?status=RESOLVED" className="block group">
                    <div className="glass p-6 rounded-3xl h-full hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <CheckCircle className="w-6 h-6 text-purple-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-4xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">
                                    {stats?.resolved || 0}
                                </h3>
                                <p className="text-slate-400 text-sm font-medium">{t('dashboard.resolved')}</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="glass rounded-3xl p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                        {t('dashboard.recent_activity')}
                    </h2>
                    <Link to="/tickets" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors py-2 px-4 rounded-lg hover:bg-emerald-500/10">
                        {t('common.view_all')}
                    </Link>
                </div>

                <div className="space-y-3">
                    {recentActivity.length === 0 ? (
                        <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800/50 dashed-border">
                            <p className="text-slate-500">{t('common.no_data')}</p>
                        </div>
                    ) : (
                        recentActivity.map((ticket) => (
                            <Link
                                key={ticket.id}
                                to={`/tickets/${ticket.id}`}
                                className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50 hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all duration-300 cursor-pointer group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(ticket.status)} shadow-lg shadow-${getStatusColor(ticket.status).replace('bg-', '')}/20`} />
                                    <div>
                                        <h4 className="font-medium text-slate-200 group-hover:text-white transition-colors text-lg">
                                            {ticket.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                            <span>{formatTimeAgo(ticket.updatedAt)}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                            <span className="uppercase tracking-wider font-semibold text-[10px]">{getStatusLabel(ticket.status)}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-mono font-medium px-3 py-1.5 rounded-lg bg-slate-950 text-slate-500 border border-slate-800 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                                        EXP-{ticket.id.toString().padStart(4, '0')}
                                    </span>
                                    <div className="p-2 rounded-full bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}

