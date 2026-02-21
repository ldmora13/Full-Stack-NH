import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TicketService } from '../../../services/ticketService';

export function useTicket(id: number) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['ticket', id],
        queryFn: () => TicketService.getById(id),
        enabled: !!id,
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => TicketService.update(id, data),
        onSuccess: (updatedTicket) => {
            queryClient.setQueryData(['ticket', id], updatedTicket);
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });

    return {
        ...query,
        updateTicket: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
    };
}
