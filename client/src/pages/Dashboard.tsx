import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { Ticket, Clock, CheckCircle, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStats } from '../features/dashboard/hooks/useStats';
import StatCard from '../components/StatCard';
import  UserAvatar from '../components/UserAvatar';
import ProcessTimeline from '../components/ProcessTimeline';
import { motion } from 'framer-motion';
import { t } from 'i18next';

// ————— CLIENT DASHBOARD —————
function ClientDashboard() {
  const { user } = useAuth();
  const { stats, recentActivity, isLoading } = useStats();

  const activeTicket = recentActivity?.[0];
  const activeStages = activeTicket?.metadata?.stages;

  return (
    <div className="space-y-8">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        <UserAvatar name={user?.name || ''} role={user?.role as any} size="lg" />
        <div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">{t('dashboard.welcome')}</p>
          <h1 className="text-4xl font-bold">
            <span className="text-slate-200">{t('dashboard.hello')}, </span>
            <span className="bg-linear-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
              {user?.name?.split(' ')[0]}
            </span>
          </h1>
          {activeTicket && (
            <p className="text-slate-400 mt-1">
              {t('dashboard.active_ticket')}:{' '}
              <span className="text-blue-400 font-medium">
                {activeTicket.title}
              </span>
            </p>
          )}
        </div>
      </motion.div>

      {/* Active Process Card */}
      {activeTicket && activeStages && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-8 border border-blue-500/20 shadow-xl shadow-blue-500/5"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                {t('dashboard.active_ticket')}
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">{activeTicket.title}</p>
            </div>
            <Link
              to={`/tickets/${activeTicket.id}`}
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Ver detalles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProcessTimeline stages={activeStages} orientation="horizontal" />
        </motion.div>
      )}

      {/* Next Action + Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next action card */}
        {activeTicket && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="md:col-span-2 glass rounded-3xl p-6 border border-amber-500/20 bg-amber-500/5"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl shrink-0">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-400 text-sm uppercase tracking-wide">{t('dashboard.next_action')}</h3>
                <p className="text-white font-medium mt-1">{t('dashboard.check_status')}</p>
                <p className="text-slate-400 text-sm mt-1">{t('dashboard.keep_info_updated')}</p>
                <Link
                  to={`/tickets/${activeTicket?.id}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
                >
                  {t('dashboard.go_to_ticket')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mini stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-6"
        >
          <h3 className="text-sm font-medium text-slate-400 mb-4">{t('dashboard.quick_stats')}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">{t('dashboard.open')}</span>
              <span className="text-blue-400 font-bold">{stats?.open || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">{t('dashboard.in_progress')}</span>
              <span className="text-blue-400 font-bold">{stats?.inProgress || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">{t('dashboard.resolved')}</span>
              <span className="text-emerald-400 font-bold">{stats?.resolved || 0}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Messages */}
      {recentActivity && recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-3xl p-8 md:w-1/2 w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              {t('dashboard.recent_activity')}
            </h2>
            <Link to="/tickets" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              {t('dashboard.view_all')}
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivity.slice(0, 3).map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/50 transition-all group"
              >
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  ticket.status === 'OPEN' ? 'bg-blue-400' :
                  ticket.status === 'IN_PROGRESS' ? 'bg-amber-400' :
                  'bg-emerald-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 font-medium truncate group-hover:text-white transition-colors">{ticket.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{new Date(ticket.updatedAt).toLocaleDateString()}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ————— ADVISOR/ADMIN DASHBOARD —————
function StaffDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { stats, recentActivity, isLoading } = useStats();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-blue-500',
      IN_PROGRESS: 'bg-amber-500',
      RESOLVED: 'bg-emerald-500',
      CLOSED: 'bg-slate-500',
    };
    return colors[status] || 'bg-slate-500';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-blue-300">
          {t('dashboard.welcome')}
        </h1>
        <p className="text-slate-400 mt-1">{user?.name} · {user?.role}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/tickets?status=OPEN">
          <StatCard
            icon={Ticket}
            title={t('dashboard.new_requests')}
            value={stats?.open || 0}
            accent="blue"
          />
        </Link>
        <Link to="/tickets?status=IN_PROGRESS">
          <StatCard
            icon={Clock}
            title={t('dashboard.in_progress')}
            value={stats?.inProgress || 0}
            accent="amber"
          />
        </Link>
        <Link to="/tickets?status=RESOLVED">
          <StatCard
            icon={CheckCircle}
            title={t('dashboard.resolved')}
            value={stats?.resolved || 0}
            accent="emerald"
          />
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="glass rounded-3xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-500 rounded-full" />
            {t('dashboard.recent_activity')}
          </h2>
          <Link to="/tickets" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors py-2 px-4 rounded-lg hover:bg-blue-500/10">
            {t('common.view_all')}
          </Link>
        </div>

        <div className="space-y-3">
          {(!recentActivity || recentActivity.length === 0) ? (
            <div className="text-center py-12 bg-white/5/30 rounded-2xl border border-white/10/50">
              <p className="text-slate-500">{t('common.no_data')}</p>
            </div>
          ) : (
            recentActivity.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center justify-between p-4 bg-white/5/40 rounded-2xl border border-white/10/50 hover:border-blue-500/30 hover:bg-white/5/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(ticket.status)}`} />
                  <div>
                    <h4 className="font-medium text-slate-200 group-hover:text-white transition-colors">
                      {ticket.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(ticket.updatedAt).toLocaleDateString()} · {t(`ticket_status.${ticket.status}`)}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-black/30 text-slate-500 border border-white/10 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                  EXP-{ticket.id.toString().padStart(4, '0')}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ————— MAIN EXPORT —————
export default function Dashboard() {
  const { user } = useAuth();
  const { isLoading, isError } = useStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-400">Error al cargar el dashboard</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {user?.role === 'CLIENT' ? <ClientDashboard /> : <StaffDashboard />}
    </Layout>
  );
}