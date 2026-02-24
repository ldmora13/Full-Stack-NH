import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicket } from '../../features/tickets/hooks/useTicket';
import { CommentService } from '../../services/commentService';
import type { Comment } from '../../services/commentService';
import Layout from '../../components/Layout';
import CommentList from '../../components/CommentList';
import CommentForm from '../../components/CommentForm';
import FileUpload from '../../components/FileUpload';
import AttachmentList from '../../components/AttachmentList';
import PayPalPayment from '../../components/PayPalPayment';
import { PaymentHistory } from '../../features/payments/components/PaymentHistory';
import { AppointmentList } from '../../features/appointments/components/AppointmentList';
import AppointmentScheduler from '../../components/AppointmentScheduler';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    AlertCircle,
    CheckCircle,
    AlertTriangle,
    MessageSquare,
    Calendar,
    Paperclip,
    FileText,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { TICKET_CONFIG, type TicketType } from '../../config/ticketConfig';

import Timeline from '../../components/Timeline';
import Checklist from '../../components/Checklist';

export default function TicketDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: ticket, isLoading, isError, refetch } = useTicket(Number(id));

    // Comments state - could be refactored to a hook later
    const [comments, setComments] = useState<Comment[]>([]);
    const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'COMPLETED'>('PENDING'); // Mock status
    const [appointmentStatus, setAppointmentStatus] = useState<'PENDING' | 'SCHEDULED'>('PENDING'); // Mock status
    const { t } = useTranslation();

    const statusConfig = {
        OPEN: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: AlertCircle, label: t('ticket_status.OPEN') },
        IN_PROGRESS: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Clock, label: t('ticket_status.IN_PROGRESS') },
        RESOLVED: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: CheckCircle, label: t('ticket_status.RESOLVED') },
        CLOSED: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: FileText, label: t('ticket_status.CLOSED') },
    };

    const priorityConfig = {
        LOW: { label: t('ticket_priority.LOW'), color: 'text-slate-400', bg: 'bg-slate-500/10' },
        MEDIUM: { label: t('ticket_priority.MEDIUM'), color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        HIGH: { label: t('ticket_priority.HIGH'), color: 'text-orange-400', bg: 'bg-orange-500/10' },
        URGENT: { label: t('ticket_priority.URGENT'), color: 'text-red-400 font-bold', bg: 'bg-red-500/10' },
    };

    useEffect(() => {
        loadComments();
    }, [id]);

    async function loadComments() {
        try {
            const data = await CommentService.getByTicket(Number(id));
            setComments(data);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    async function handleFileUploadComplete() {
        // Reload ticket to get updated attachments
        await refetch();
    }

    const handleAppointmentSchedule = (date: Date, type: string) => {
        console.log('Appointment scheduled:', date, type);
        setAppointmentStatus('SCHEDULED');
        // TODO: Update backend
    };

    const currentStageId = ticket?.metadata?.stages?.find((s: any) => s.status === 'IN_PROGRESS')?.id;

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        );
    }

    if (isError) {
        return (
            <Layout>
                <div className="text-center py-20 text-red-400">
                    <p>Error loading ticket</p>
                    <Button variant="outline" onClick={() => navigate('/tickets')} className="mt-4">
                        {t('common.back')}
                    </Button>
                </div>
            </Layout>
        );
    }

    if (!ticket) {
        return (
            <Layout>
                <div className="text-center py-20">
                    <p className="text-slate-400">{t('ticket.detail.not_found')}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 rounded-full border-slate-700 hover:bg-slate-800"
                            onClick={() => navigate('/tickets')}
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-400" />
                        </Button>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-300">
                            {t('ticket.detail.case_number')} {ticket.id}
                        </h1>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[ticket.status as keyof typeof statusConfig]?.bg} ${statusConfig[ticket.status as keyof typeof statusConfig]?.color} ${statusConfig[ticket.status as keyof typeof statusConfig]?.border}`}>
                            {statusConfig[ticket.status as keyof typeof statusConfig]?.label}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">{ticket.title}</h2>

                    {/* Timeline Section */}
                    {ticket.metadata?.stages && (
                        <div className="mt-8 mb-12">
                            <Timeline stages={ticket.metadata.stages} />
                        </div>
                    )}
                </div>

                {/* Stage Actions Section */}
                {currentStageId === 'HR_INTERVIEW' && paymentStatus === 'PENDING' && (
                    <div className="mb-8 p-8 bg-white/5/60 border border-blue-500/30 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Pago de Procesamiento</h2>
                        <p className="text-slate-400 mb-6 relative z-10">Para continuar con la entrevista de RRHH y la aprobación del patrocinio, es necesario cubrir el 35% del valor del trámite.</p>
                        <PayPalPayment
                            amount="350.00"
                            ticketId={ticket.id}
                            onSuccess={() => {
                                refetch();
                                setPaymentStatus('COMPLETED');
                            }}
                        />
                    </div>
                )}

                {/* Payment History Section */}
                {ticket.payments && ticket.payments.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-white mb-4">Historial de Pagos</h3>
                        <PaymentHistory payments={ticket.payments} />
                    </div>
                )}

                {currentStageId === 'MEDICAL_EXAMS' && appointmentStatus === 'PENDING' && (
                    <div className="mb-8 p-8 bg-white/5/60 border border-blue-500/30 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Agendamiento de Exámenes</h2>
                        <p className="text-slate-400 mb-6 relative z-10">Selecciona una fecha y hora para tus exámenes médicos o psicológicos.</p>
                        <AppointmentScheduler
                            ticketId={ticket.id}
                            onSchedule={handleAppointmentSchedule}
                        />
                    </div>
                )}

                {/* Scheduled Appointments */}
                <div className="mb-8">
                    <AppointmentList ticketId={ticket.id} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description Card */}
                        <div className="bg-white/5/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    {(() => {
                                        const config = TICKET_CONFIG[ticket.type as TicketType];
                                        const TypeIcon = config?.icon || FileText;
                                        return <TypeIcon className="w-5 h-5" />;
                                    })()}
                                </div>
                                <h3 className="text-lg font-bold text-white">{t('ticket.detail.details')}</h3>
                            </div>
                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {ticket.description}
                            </p>

                            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/10/50">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">{t('ticket.detail.started')} {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${priorityConfig[ticket.priority as keyof typeof priorityConfig]?.bg} ${priorityConfig[ticket.priority as keyof typeof priorityConfig]?.color}`}>
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>{t('ticket.detail.priority')} {priorityConfig[ticket.priority as keyof typeof priorityConfig]?.label}</span>
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="bg-white/5/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <MessageSquare className="w-6 h-6 text-blue-400" />
                                <h2 className="text-2xl font-bold text-white">{t('ticket.detail.comments')}</h2>
                                <span className="text-sm text-slate-500">({comments.length})</span>
                            </div>

                            <div className="mb-6">
                                <CommentForm ticketId={ticket.id} onCommentCreated={loadComments} />
                            </div>

                            <CommentList comments={comments} />
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        {/* Checklist Section */}
                        {ticket.metadata?.checklist && (
                            <Checklist items={ticket.metadata.checklist} />
                        )}

                        {/* Attachments Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Paperclip className="w-6 h-6 text-blue-400" />
                                <h2 className="text-2xl font-bold text-white">{t('ticket.detail.attachments')}</h2>
                                <span className="text-sm text-slate-500">({ticket.attachments?.length || 0})</span>
                            </div>

                            {/* Upload Section - Hidden if case is closed */}
                            {ticket.status !== 'CLOSED' && (
                                <div className="mb-6 pb-6 border-b border-white/10">
                                    <FileUpload
                                        ticketId={ticket.id}
                                        onUploadComplete={handleFileUploadComplete}
                                        disabled={(ticket.status as string) === 'CLOSED'}
                                    />
                                </div>
                            )}

                            {/* Attachments List */}
                            <AttachmentList attachments={ticket.attachments || []} />
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
