import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { canAccessAssignmentPage } from '../../lib/roles';
import { useTickets } from '../../features/tickets/hooks/useTickets';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TicketService } from '../../services/ticketService';
import { UserService, type User } from '../../services/userService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTranslation } from 'react-i18next';
import { ClipboardList, UserPlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Pagination from '../../components/Pagination';

export default function CoordinatorAssignment() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const limit = 10;
    const [status, setStatus] = useState('');
    const [clientId, setClientId] = useState('');
    const [advisorId, setAdvisorId] = useState('');
    const [search, setSearch] = useState('');
    const [unassignedOnly, setUnassignedOnly] = useState(true);
    const [createdFrom, setCreatedFrom] = useState('');
    const [createdTo, setCreatedTo] = useState('');

    const [advisors, setAdvisors] = useState<User[]>([]);
    const [clients, setClients] = useState<User[]>([]);

    const [assignTicketId, setAssignTicketId] = useState<number | null>(null);
    const [selectedAdvisorId, setSelectedAdvisorId] = useState('');

    useEffect(() => {
        if (!canAccessAssignmentPage(user?.role)) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [a, c] = await Promise.all([
                    UserService.getAll('ADVISOR'),
                    UserService.getAll('CLIENT'),
                ]);
                if (!cancelled) {
                    setAdvisors(a);
                    setClients(c);
                }
            } catch {
                if (!cancelled) toast.error(t('common.error'));
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [t]);

    const filters = useMemo(
        () => ({
            status: status || undefined,
            clientId: clientId || undefined,
            advisorId: advisorId || undefined,
            search: search || undefined,
            unassignedOnly: unassignedOnly || undefined,
            createdFrom: createdFrom || undefined,
            createdTo: createdTo || undefined,
            page,
            limit,
        }),
        [status, clientId, advisorId, search, unassignedOnly, createdFrom, createdTo, page, limit]
    );

    const { data, isLoading, isError } = useTickets(filters);

    const assignMutation = useMutation({
        mutationFn: ({ ticketId, advisor }: { ticketId: number; advisor: string }) =>
            TicketService.assignAdvisor(ticketId, advisor),
        onSuccess: () => {
            toast.success(t('coordinator.assign_success'));
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            setAssignTicketId(null);
            setSelectedAdvisorId('');
        },
        onError: (err: unknown) => {
            const msg =
                err &&
                typeof err === 'object' &&
                'response' in err &&
                (err as { response?: { data?: { error?: string } } }).response?.data?.error;
            toast.error(typeof msg === 'string' ? msg : t('coordinator.assign_error'));
        },
    });

    const tickets = data?.tickets ?? [];
    const pagination = data?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 };

    if (!user || !canAccessAssignmentPage(user.role)) {
        return null;
    }

    return (
        <Layout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-amber-400" />
                        {t('coordinator.title')}
                    </h1>
                    <p className="text-slate-400 mt-2">{t('coordinator.subtitle')}</p>
                </div>

                <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={unassignedOnly}
                                onChange={(e) => {
                                    setUnassignedOnly(e.target.checked);
                                    setPage(1);
                                }}
                                className="rounded border-white/20"
                            />
                            {t('coordinator.unassigned_only')}
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">{t('common.status')}</label>
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
                            >
                                <option value="">{t('filters.all')}</option>
                                <option value="OPEN">{t('ticket_status.OPEN')}</option>
                                <option value="IN_PROGRESS">{t('ticket_status.IN_PROGRESS')}</option>
                                <option value="RESOLVED">{t('ticket_status.RESOLVED')}</option>
                                <option value="CLOSED">{t('ticket_status.CLOSED')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">{t('filters.client')}</label>
                            <select
                                value={clientId}
                                onChange={(e) => {
                                    setClientId(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
                            >
                                <option value="">{t('filters.all')}</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">{t('filters.advisor')}</label>
                            <select
                                value={advisorId}
                                onChange={(e) => {
                                    setAdvisorId(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
                            >
                                <option value="">{t('filters.all')}</option>
                                {advisors.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Input
                                label={t('filters.search.label')}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="bg-black/30 border-white/10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">{t('coordinator.created_from')}</label>
                            <input
                                type="date"
                                value={createdFrom}
                                onChange={(e) => {
                                    setCreatedFrom(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">{t('coordinator.created_to')}</label>
                            <input
                                type="date"
                                value={createdTo}
                                onChange={(e) => {
                                    setCreatedTo(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                    {isLoading && (
                        <div className="p-12 text-center text-slate-500">{t('common.loading')}</div>
                    )}
                    {isError && (
                        <div className="p-12 text-center text-red-400">{t('common.error')}</div>
                    )}
                    {!isLoading && !isError && tickets.length === 0 && (
                        <div className="p-12 text-center text-slate-500">{t('coordinator.no_tickets')}</div>
                    )}
                    {!isLoading && !isError && tickets.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">{t('coordinator.col_title')}</th>
                                        <th className="px-4 py-3">{t('filters.client')}</th>
                                        <th className="px-4 py-3">{t('filters.advisor')}</th>
                                        <th className="px-4 py-3">{t('common.status')}</th>
                                        <th className="px-4 py-3">{t('coordinator.created')}</th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id} className="border-t border-white/10 hover:bg-white/5">
                                            <td className="px-4 py-3 font-mono text-slate-500">#{ticket.id}</td>
                                            <td className="px-4 py-3 text-white max-w-xs truncate">{ticket.title}</td>
                                            <td className="px-4 py-3 text-slate-300">{ticket.client?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {ticket.advisor?.name ?? (
                                                    <span className="text-amber-400/90">{t('coordinator.unassigned')}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">{t(`ticket_status.${ticket.status}`)}</td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        to={`/tickets/${ticket.id}`}
                                                        className="text-blue-400 hover:text-blue-300 text-xs"
                                                    >
                                                        {t('common.view')}
                                                    </Link>
                                                    {!ticket.advisor && (
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            className="py-1! px-2! text-xs"
                                                            onClick={() => {
                                                                setAssignTicketId(ticket.id);
                                                                setSelectedAdvisorId('');
                                                            }}
                                                        >
                                                            <UserPlus className="w-3 h-3 mr-1 inline" />
                                                            {t('coordinator.assign')}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {pagination.totalPages > 1 && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={setPage}
                    />
                )}
            </div>

            <AnimatePresence>
                {assignTicketId !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1d2532] border border-slate-600 rounded-2xl p-6 max-w-md w-full shadow-xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">{t('coordinator.assign_advisor')}</h3>
                                <button
                                    type="button"
                                    onClick={() => setAssignTicketId(null)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <label className="block text-sm text-slate-400 mb-2">{t('coordinator.select_advisor')}</label>
                            <select
                                value={selectedAdvisorId}
                                onChange={(e) => setSelectedAdvisorId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white mb-6"
                            >
                                <option value="">{t('coordinator.select_placeholder')}</option>
                                {advisors.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setAssignTicketId(null)}>
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    className="flex-1"
                                    disabled={!selectedAdvisorId || assignMutation.isPending}
                                    isLoading={assignMutation.isPending}
                                    onClick={() => {
                                        if (assignTicketId && selectedAdvisorId) {
                                            assignMutation.mutate({
                                                ticketId: assignTicketId,
                                                advisor: selectedAdvisorId,
                                            });
                                        }
                                    }}
                                >
                                    {t('coordinator.confirm_assign')}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
}
