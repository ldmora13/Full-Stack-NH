import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { TicketService } from '../../../services/ticketService';
import type { TicketFilters } from '../../../services/ticketService';

export function useTickets(filters: TicketFilters = {}) {
    return useQuery({
        queryKey: ['tickets', filters],
        queryFn: () => TicketService.getAll(filters),
        placeholderData: keepPreviousData,
    });
}

export function useCreateTicket() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => TicketService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
}
