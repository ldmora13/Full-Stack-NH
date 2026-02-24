import { Search, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { UserService, type User } from '../../../services/userService';
import { useTranslation } from 'react-i18next';

interface TicketFiltersProps {
    onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
    status?: string;
    priority?: string;
    advisorId?: string;
    clientId?: string;
    search?: string;
}

export default function TicketFilters({ onFilterChange }: TicketFiltersProps) {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [advisors, setAdvisors] = useState<User[]>([]);
    const [clients, setClients] = useState<User[]>([]);

    const [filters, setFilters] = useState<FilterValues>({});

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            loadAdvisors();
            loadClients();
        } else if (user?.role === 'ADVISOR') {
            loadClients();
        }
    }, [user]);

    async function loadAdvisors() {
        try {
            const data = await UserService.getAll('ADVISOR');
            setAdvisors(data);
        } catch (error) {
            console.error('Error loading advisors:', error);
        }
    }

    async function loadClients() {
        try {
            const data = await UserService.getAll('CLIENT');
            setClients(data);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    }

    const handleFilterChange = (key: keyof FilterValues, value: string) => {
        const newFilters = { ...filters, [key]: value || undefined };
        // Remove undefined values
        Object.keys(newFilters).forEach(k =>
            newFilters[k as keyof FilterValues] === undefined && delete newFilters[k as keyof FilterValues]
        );
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        setFilters({});
        onFilterChange({});
    };

    const hasActiveFilters = Object.keys(filters).length > 0;

    return (
        <div className="bg-white/5/50 rounded-2xl border border-white/10 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-blue-400" />
                    {t('filters.title')}
                </h3>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-sm text-blue-400 hover:text-emerald-300 transition-colors"
                >
                    {isOpen ? t('filters.hide') : t('filters.show')}
                </button>
            </div>

            {isOpen && (
                <div className="space-y-4">
                    {/* Search */}
                    <div>
                        <Input
                            label={t('filters.search.label')}
                            placeholder={t('filters.search.placeholder')}
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="bg-black/30 border-white/10"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {t('common.status')}
                            </label>
                            <select
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="">{t('filters.all')}</option>
                                <option value="OPEN">{t('ticket_status.OPEN')}</option>
                                <option value="IN_PROGRESS">{t('ticket_status.IN_PROGRESS')}</option>
                                <option value="RESOLVED">{t('ticket_status.RESOLVED')}</option>
                                <option value="CLOSED">{t('ticket_status.CLOSED')}</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {t('common.priority')}
                            </label>
                            <select
                                value={filters.priority || ''}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="">{t('filters.all')}</option>
                                <option value="LOW">{t('ticket_priority.LOW')}</option>
                                <option value="MEDIUM">{t('ticket_priority.MEDIUM')}</option>
                                <option value="HIGH">{t('ticket_priority.HIGH')}</option>
                                <option value="URGENT">{t('ticket_priority.URGENT')}</option>
                            </select>
                        </div>

                        {/* Advisor Filter (Admin only) */}
                        {user?.role === 'ADMIN' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {t('filters.advisor')}
                                </label>
                                <select
                                    value={filters.advisorId || ''}
                                    onChange={(e) => handleFilterChange('advisorId', e.target.value)}
                                    className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="">{t('filters.all')}</option>
                                    {advisors.map((advisor) => (
                                        <option key={advisor.id} value={advisor.id}>
                                            {advisor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Client Filter (Admin and Advisor) */}
                        {(user?.role === 'ADMIN' || user?.role === 'ADVISOR') && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {t('filters.client')}
                                </label>
                                <select
                                    value={filters.clientId || ''}
                                    onChange={(e) => handleFilterChange('clientId', e.target.value)}
                                    className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="">{t('filters.all')}</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <Button
                            variant="primary" // Changed to primary or outline/danger as appropriate, likely outline/danger for clear
                            onClick={clearFilters}
                            className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                        >
                            <X className="w-4 h-4 mr-2" />
                            {t('filters.clear')}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
