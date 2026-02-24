import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Video } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { AppointmentService } from '../features/appointments/services/appointmentService';
import { toast } from 'react-hot-toast';

type AppointmentType = 'MEDICAL' | 'PSYCHOLOGICAL';

interface AppointmentSchedulerProps {
    ticketId: number;
    onSchedule: (date: Date, type: AppointmentType) => void;
}

const AVAILABLE_HOURS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

export default function AppointmentScheduler({ ticketId, onSchedule }: AppointmentSchedulerProps) {
    const { t } = useTranslation();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // In a real app, we would fetch occupied slots here
    // const [bookedSlots, setBookedSlots] = useState<string[]>([]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const handleDateClick = (day: Date) => {
        if (isBefore(day, startOfDay(new Date()))) return; // Disable past dates
        setSelectedDate(day);
        setSelectedTime(null);
    };

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime || !selectedType) return;

        setIsSubmitting(true);
        try {
            // Combine date and time
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const appointmentDate = new Date(selectedDate);
            appointmentDate.setHours(hours, minutes);

            await AppointmentService.createAppointment({
                date: appointmentDate,
                type: selectedType,
                ticketId,
                link: 'https://meet.google.com/ex-amp-le' // Mock link for now
            });

            toast.success('Cita agendada correctamente');
            onSchedule(appointmentDate, selectedType);

            // Reset selection
            setSelectedDate(null);
            setSelectedTime(null);
            setSelectedType(null);
        } catch (error) {
            console.error('Error booking appointment:', error);
            toast.error('Error al agendar la cita');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white/5 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Calendar Section */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-slate-700/50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-blue-400" />
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <div className="flex gap-1">
                            <button onClick={prevMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-slate-500 uppercase py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, idx) => {
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isPast = isBefore(day, startOfDay(new Date()));

                            return (
                                <button
                                    key={day.toString()}
                                    onClick={() => handleDateClick(day)}
                                    disabled={isPast}
                                    className={clsx(
                                        "aspect-square rounded-lg flex items-center justify-center text-sm relative transition-all",
                                        !isCurrentMonth && "text-slate-600 opacity-50",
                                        isPast && "text-slate-700 cursor-not-allowed",
                                        !isPast && isCurrentMonth && !isSelected && "text-slate-300 hover:bg-slate-800 hover:text-white",
                                        isSelected && "bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20"
                                    )}
                                >
                                    {format(day, 'd')}
                                    {isSelected && <motion.div layoutId="day-highlight" className="absolute inset-0 border-2 border-emerald-400 rounded-lg" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Slots & Config Section */}
                <div className="p-6 bg-slate-800/20 flex flex-col h-full">
                    {!selectedDate ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 text-center">
                            <CalendarIcon className="w-12 h-12 opacity-20" />
                            <p>Selecciona una fecha para ver los horarios disponibles.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 flex-1">
                            <div>
                                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                                    Fecha Seleccionada
                                </h3>
                                <p className="text-xl font-bold text-white capitalize">
                                    {format(selectedDate, 'EEEE, d MMMM yyyy')}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                                    Tipo de Cita
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {(['MEDICAL', 'PSYCHOLOGICAL'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className={clsx(
                                                "p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-2",
                                                selectedType === type
                                                    ? "bg-blue-500/10 border-blue-500 text-blue-400"
                                                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                                            )}
                                        >
                                            <Video className="w-5 h-5" />
                                            {type === 'MEDICAL' ? 'Examen Médico' : 'Examen Psicológico'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                                    Horarios Disponibles
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {AVAILABLE_HOURS.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={clsx(
                                                "py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                                                selectedTime === time
                                                    ? "bg-white text-slate-900 shadow-lg"
                                                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                            )}
                                        >
                                            <Clock className="w-3.5 h-3.5" />
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-6 mt-6 border-t border-slate-700/50">
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedDate || !selectedTime || !selectedType || isSubmitting}
                            className={clsx(
                                "w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2",
                                (!selectedDate || !selectedTime || !selectedType || isSubmitting)
                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 shadow-blue-500/20"
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Agendando...
                                </>
                            ) : (
                                "Confirmar Reserva"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
