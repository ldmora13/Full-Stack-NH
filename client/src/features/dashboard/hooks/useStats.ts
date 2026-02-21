import { useQuery } from '@tanstack/react-query';
import { statsService } from '../../../services/statsService';

export function useStats() {
    const statsQuery = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: statsService.getTicketStats,
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    const activityQuery = useQuery({
        queryKey: ['dashboard-activity'],
        queryFn: statsService.getRecentActivity,
        refetchInterval: 30000,
    });

    return {
        stats: statsQuery.data,
        recentActivity: activityQuery.data || [],
        isLoading: statsQuery.isLoading || activityQuery.isLoading,
        isError: statsQuery.isError || activityQuery.isError,
        error: statsQuery.error || activityQuery.error,
        refetch: () => {
            statsQuery.refetch();
            activityQuery.refetch();
        }
    };
}
