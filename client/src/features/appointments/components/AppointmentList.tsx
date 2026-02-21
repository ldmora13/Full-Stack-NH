import { useEffect, useState } from 'react';
import { AppointmentService } from '../services/appointmentService';
import type { Appointment } from '../services/appointmentService';
import { Video, Calendar, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AppointmentListProps {
    ticketId: number;
}

export const AppointmentList = ({ ticketId }: AppointmentListProps) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, [ticketId]);

    const loadAppointments = async () => {
        try {
            const data = await AppointmentService.getAppointments(ticketId);
            setAppointments(data);
        } catch (error) {
            console.error('Error loading appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-slate-400 text-sm">Cargando citas...</div>;

    if (appointments.length === 0) return null; // Don't show anything if no appointments

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Citas Agendadas</h3>
            </div>

            <div className="grid gap-4">
                {appointments.map((apt) => (
                    <div key={apt.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                <Video className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-medium text-white">
                                    {apt.type === 'MEDICAL' ? 'Examen Médico' : 'Sesión Psicológica'}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        {format(new Date(apt.date), 'PPPP', { locale: es })}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {format(new Date(apt.date), 'p', { locale: es })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {apt.link && (
                            <a
                                href={apt.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Unirse
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
