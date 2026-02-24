import { useEffect, useState } from 'react';
import { useTickets } from '../../features/tickets/hooks/useTickets';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import TicketFilters, { type FilterValues } from '../../features/tickets/components/TicketFilters';
import Pagination from '../../components/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TICKET_CONFIG, type TicketType } from '../../config/ticketConfig';

function CreateButton({ variant = 'primary' }: { variant?: 'primary' | 'secondary' | 'outline' | 'danger' }) {
    const { user } = useAuth();
    const { t } = useTranslation();

    if (user?.role === 'CLIENT') return null;

    return (
        <Link to="/tickets/new">
            <Button variant={variant} className={variant === 'primary' ? "shadow-lg shadow-blue-500/20 hover:shadow-emerald-500/30 transition-all" : "w-auto"}>
                {variant === 'primary' && <Plus className="w-5 h-5" />}
                {t('nav.new_ticket')}
            </Button>
        </Link>
    );
}

const statusIcons = {
    OPEN: AlertCircle,
    IN_PROGRESS: Clock,
    RESOLVED: CheckCircle,
    CLOSED: FileText,
};

const statusStyles = {
    OPEN: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    IN_PROGRESS: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    RESOLVED: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    CLOSED: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
};

const priorityStyles = {
    LOW: { color: 'text-slate-400', bg: 'bg-slate-500/10' },
    MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    HIGH: { color: 'text-orange-400', bg: 'bg-orange-500/10' },
    URGENT: { color: 'text-red-400 font-bold', bg: 'bg-red-500/10' },
};



export default function TicketList() {
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState<FilterValues>({});
    const [page, setPage] = useState(1);
    const limit = 10;
    const { t } = useTranslation();

    const { data, isLoading, isError } = useTickets({
        ...filters,
        page,
        limit,
    });

    const tickets = data?.tickets || [];
    const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };

    // Read query parameters from URL on mount
    useEffect(() => {
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const advisorId = searchParams.get('advisorId');
        const clientId = searchParams.get('clientId');
        const search = searchParams.get('search');

        const initialFilters: FilterValues = {};
        if (status) initialFilters.status = status;
        if (priority) initialFilters.priority = priority;
        if (advisorId) initialFilters.advisorId = advisorId;
        if (clientId) initialFilters.clientId = clientId;
        if (search) initialFilters.search = search;

        setFilters(initialFilters);
    }, [searchParams]);

    const handleFilterChange = (newFilters: FilterValues) => {
        setFilters(newFilters);
        // Reset to page 1 when filters change
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };



    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-300">
                        {t('nav.tickets')}
                    </h1>
                    <p className="text-slate-400 mt-1 text-lg">Gestiona tus procesos para trabajar en el extranjero</p>
                </div>
                <CreateButton />
            </div>

            <TicketFilters onFilterChange={handleFilterChange} />

            {isLoading ? (
                <div className="text-center py-20">
                    <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500">{t('common.loading')}</p>
                </div>
            ) : isError ? (
                <div className="text-center py-20 text-red-400">
                    <p>Error loading tickets</p>
                </div>
            ) : tickets.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-24 bg-white/5/30 rounded-3xl border border-dashed border-white/10"
                >
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('common.no_data')}</h3>
                    <p className="text-slate-400 mb-6 max-w-sm mx-auto">Parece que no hay tickets que coincidan con tu búsqueda o aún no has creado ninguno.</p>
                    <CreateButton variant="secondary" />
                </motion.div>
            ) : (
                <>
                    <motion.div layout className="grid gap-4">
                        <AnimatePresence>
                            {tickets.map((ticket) => {
                                const StatusIcon = statusIcons[ticket.status];
                                const statusStyle = statusStyles[ticket.status];
                                const priorityStyle = priorityStyles[ticket.priority];

                                return (
                                    <motion.div
                                        key={ticket.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <Link to={`/ tickets / ${ticket.id} `}>
                                            <div className="group glass p-5 rounded-2xl hover:bg-slate-800/60 hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                <div className="relative z-10 flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-semibold text-slate-100 mb-1 group-hover:text-blue-400 transition-colors">
                                                            {ticket.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                                                {(() => {
                                                                    const config = TICKET_CONFIG[ticket.type as TicketType];
                                                                    const TypeIcon = config?.icon || FileText;
                                                                    return <TypeIcon className="w-3 h-3" />;
                                                                })()}
                                                                {t(`ticket_config.types.${ticket.type}.label`, ticket.type)}
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-400 text-sm mb-3 line-clamp-2 group-hover:text-slate-300 transition-colors">
                                                            {ticket.description}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1.5 bg-white/5/50 px-2 py-1 rounded-md border border-white/10">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border} border shadow-sm`}>
                                                            {t(`Ticket Status: ${ticket.status} `)}
                                                        </span>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border-transparent ${priorityStyle.bg || 'bg-slate-800'} ${priorityStyle.color} `}>
                                                            {t(`Ticket Priority: ${ticket.priority} `)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </Layout>
    );
}
