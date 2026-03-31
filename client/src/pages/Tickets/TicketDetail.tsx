import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicket } from '../../features/tickets/hooks/useTicket';
import { useAuth } from '../../context/AuthContext';
import { AttachmentService } from '../../services/attachmentService';
import Layout from '../../components/Layout';
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
    Calendar,
    Paperclip,
    FileText,
    Info,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { TICKET_CONFIG, type TicketType } from '../../config/ticketConfig';
import { isStaffAdmin } from '../../lib/roles';

type ProcessStageStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

interface ProcessStage {
    id: string;
    label: string;
    description: string;
    status: ProcessStageStatus;
    updatedAt?: string;
}

interface ProcessHistoryEntry {
    stageId: string;
    fromStatus: ProcessStageStatus;
    toStatus: ProcessStageStatus;
    updatedAt: string;
    updatedBy?: string;
}

type ChecklistStatus = 'PENDING' | 'UPLOADED' | 'APPROVED' | 'REJECTED';

interface ChecklistItemState {
    id: string;
    label: string;
    required: boolean;
    status: ChecklistStatus;
    attachmentIds: number[];
    updatedAt?: string;
    reviewedAt?: string;
    reviewedBy?: string;
}

const DEFAULT_PROCESS_STAGES: Omit<ProcessStage, 'status' | 'updatedAt'>[] = [
    {
        id: 'PROCESS_START',
        label: 'Inicio del proceso',
        description: 'Se valida tu caso y se define la estrategia de relocalizacion o inmigracion.',
    },
    {
        id: 'DOCUMENT_PREPARATION',
        label: 'Preparacion de documentos',
        description: 'Se recopilan, revisan y organizan los documentos requeridos.',
    },
    {
        id: 'PERMIT_APPLICATION',
        label: 'Solicitud de permisos',
        description: 'Se presenta la solicitud formal ante las entidades correspondientes.',
    },
    {
        id: 'AUTHORITY_REVIEW',
        label: 'Revision de autoridades',
        description: 'Las autoridades migratorias analizan la solicitud y soportes.',
    },
    {
        id: 'FINAL_APPROVAL',
        label: 'Aprobacion final',
        description: 'Se emite la decision y autorizacion final del proceso.',
    },
    {
        id: 'PROCESS_COMPLETED',
        label: 'Proceso completado',
        description: 'Tu caso se cierra exitosamente y recibes confirmacion final.',
    },
];

function normalizeProcessStages(stagesFromApi?: any[]): ProcessStage[] {
    const now = new Date().toISOString();
    const hasApiStages = Array.isArray(stagesFromApi) && stagesFromApi.length === DEFAULT_PROCESS_STAGES.length;

    const mapped = DEFAULT_PROCESS_STAGES.map((baseStage, index) => {
        const apiStage = hasApiStages ? stagesFromApi?.[index] : null;
        const apiStatus = apiStage?.status;

        let status: ProcessStageStatus = 'PENDING';
        if (apiStatus === 'COMPLETED' || apiStatus === 'IN_PROGRESS' || apiStatus === 'PENDING') {
            status = apiStatus;
        } else if (!hasApiStages) {
            status = index === 0 ? 'IN_PROGRESS' : 'PENDING';
        }

        return {
            ...baseStage,
            status,
            updatedAt: typeof apiStage?.updatedAt === 'string' ? apiStage.updatedAt : undefined,
        };
    });

    let foundInProgress = false;
    const normalized = mapped.map((stage, index) => {
        if (stage.status === 'IN_PROGRESS') {
            if (foundInProgress) {
                return { ...stage, status: 'PENDING' as const };
            }
            foundInProgress = true;
        }

        if (stage.status === 'COMPLETED' && mapped.slice(0, index).some((s) => s.status !== 'COMPLETED')) {
            return { ...stage, status: 'PENDING' as const };
        }

        return stage;
    });

    if (!normalized.some((stage) => stage.status === 'IN_PROGRESS') && !normalized.every((stage) => stage.status === 'COMPLETED')) {
        const firstPendingIndex = normalized.findIndex((stage) => stage.status === 'PENDING');
        if (firstPendingIndex >= 0) {
            normalized[firstPendingIndex] = { ...normalized[firstPendingIndex], status: 'IN_PROGRESS', updatedAt: now };
        }
    }

    return normalized;
}

function normalizeChecklist(itemsFromApi: any[] | undefined, type: TicketType): ChecklistItemState[] {
    const configItems = TICKET_CONFIG[type]?.checklist || [];
    const itemMap = new Map((Array.isArray(itemsFromApi) ? itemsFromApi : []).map((item: any) => [item.id, item]));

    return configItems.map((item) => {
        const incoming = itemMap.get(item.id);
        const incomingStatus = incoming?.status;
        const status: ChecklistStatus =
            incomingStatus === 'UPLOADED' || incomingStatus === 'APPROVED' || incomingStatus === 'REJECTED'
                ? incomingStatus
                : 'PENDING';

        return {
            ...item,
            status,
            attachmentIds: Array.isArray(incoming?.attachmentIds)
                ? incoming.attachmentIds.filter((value: unknown) => typeof value === 'number')
                : [],
            updatedAt: typeof incoming?.updatedAt === 'string' ? incoming.updatedAt : undefined,
            reviewedAt: typeof incoming?.reviewedAt === 'string' ? incoming.reviewedAt : undefined,
            reviewedBy: typeof incoming?.reviewedBy === 'string' ? incoming.reviewedBy : undefined,
        };
    });
}

export default function TicketDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: ticket, isLoading, isError, refetch, updateTicket, isUpdating } = useTicket(Number(id));

    const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'COMPLETED'>('PENDING'); // Mock status
    const [appointmentStatus, setAppointmentStatus] = useState<'PENDING' | 'SCHEDULED'>('PENDING'); // Mock status
    const [processStages, setProcessStages] = useState<ProcessStage[]>([]);
    const [processHistory, setProcessHistory] = useState<ProcessHistoryEntry[]>([]);
    const [processError, setProcessError] = useState<string | null>(null);
    const [checklistItems, setChecklistItems] = useState<ChecklistItemState[]>([]);
    const [checklistError, setChecklistError] = useState<string | null>(null);
    const [checklistBusyItemId, setChecklistBusyItemId] = useState<string | null>(null);
    const [selectedChecklistItemId, setSelectedChecklistItemId] = useState<string | null>(null);
    const checklistFileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();
    const isStaffAdminUser = isStaffAdmin(user?.role);

    const statusConfig = {
        OPEN: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: AlertCircle, label: t('ticket_status.OPEN') },
        IN_PROGRESS: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Clock, label: t('ticket_status.IN_PROGRESS') },
        RESOLVED: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: CheckCircle, label: t('ticket_status.RESOLVED') },
        CLOSED: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: FileText, label: t('ticket_status.CLOSED') },
    };

    useEffect(() => {
        if (!ticket) return;
        const tracking = ticket.metadata?.processTracking;
        setProcessStages(normalizeProcessStages(tracking?.stages));
        setProcessHistory(Array.isArray(tracking?.history) ? tracking.history : []);
        setChecklistItems(normalizeChecklist(ticket.metadata?.checklist, ticket.type as TicketType));
    }, [ticket]);

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

    const processCompleted = processStages.length > 0 && processStages.every((stage) => stage.status === 'COMPLETED');
    const completedStages = processStages.filter((stage) => stage.status === 'COMPLETED').length;
    const progressValue = processStages.length > 0
        ? Math.round((completedStages / processStages.length) * 100)
        : 0;
    const requiredChecklistApproved = checklistItems
        .filter((item) => item.required)
        .every((item) => item.status === 'APPROVED');

    function persistMetadata(nextMetadata: any, onErrorMessageKey: string) {
        if (!ticket) return;
        updateTicket(
            { metadata: nextMetadata },
            {
                onError: () => {
                    setChecklistError(t(onErrorMessageKey));
                },
            }
        );
    }

    function handleProcessStatusChange(stageIndex: number, nextStatus: ProcessStageStatus) {
        if (!ticket || !user || !isStaffAdminUser) return;
        setProcessError(null);

        const currentStage = processStages[stageIndex];
        if (!currentStage || currentStage.status === nextStatus) return;

        const previousIncomplete = processStages
            .slice(0, stageIndex)
            .some((stage) => stage.status !== 'COMPLETED');

        if ((nextStatus === 'COMPLETED' || nextStatus === 'IN_PROGRESS') && previousIncomplete) {
            setProcessError(t('ticket.process_tracking.errors.previous_stages_required'));
            return;
        }

        const isAdvancingDocumentStage = stageIndex >= 1 && nextStatus === 'COMPLETED';
        if (isAdvancingDocumentStage && !requiredChecklistApproved) {
            setProcessError(t('ticket.process_tracking.errors.checklist_required'));
            return;
        }

        const now = new Date().toISOString();
        const updatedStages = processStages.map((stage, index) => {
            if (index < stageIndex) {
                return stage.status === 'COMPLETED' ? stage : { ...stage, status: 'COMPLETED' as const, updatedAt: now };
            }

            if (index === stageIndex) {
                return { ...stage, status: nextStatus, updatedAt: now };
            }

            if (nextStatus === 'COMPLETED') {
                return { ...stage, status: 'PENDING' as const };
            }

            if (nextStatus === 'IN_PROGRESS') {
                return { ...stage, status: 'PENDING' as const };
            }

            if (nextStatus === 'PENDING') {
                return { ...stage, status: 'PENDING' as const };
            }

            return stage;
        }).map((stage, index) => {
            if (nextStatus === 'PENDING' && index > stageIndex) {
                return { ...stage, status: 'PENDING' as const };
            }
            return stage;
        });

        if (!updatedStages.some((stage) => stage.status === 'IN_PROGRESS') && !updatedStages.every((stage) => stage.status === 'COMPLETED')) {
            const firstPendingIndex = updatedStages.findIndex((stage) => stage.status === 'PENDING');
            if (firstPendingIndex >= 0) {
                updatedStages[firstPendingIndex] = { ...updatedStages[firstPendingIndex], status: 'IN_PROGRESS', updatedAt: now };
            }
        }

        const historyEntry: ProcessHistoryEntry = {
            stageId: currentStage.id,
            fromStatus: currentStage.status,
            toStatus: nextStatus,
            updatedAt: now,
            updatedBy: user.id,
        };
        const updatedHistory = [historyEntry, ...processHistory].slice(0, 30);

        setProcessStages(updatedStages);
        setProcessHistory(updatedHistory);

        updateTicket(
            {
                metadata: {
                    ...ticket.metadata,
                    checklist: checklistItems,
                    processTracking: {
                        stages: updatedStages,
                        history: updatedHistory,
                    },
                },
            },
            {
                onError: () => {
                    setProcessError(t('ticket.process_tracking.errors.save_failed'));
                    setProcessStages(normalizeProcessStages(ticket.metadata?.processTracking?.stages));
                    setProcessHistory(Array.isArray(ticket.metadata?.processTracking?.history) ? ticket.metadata.processTracking.history : []);
                },
            }
        );
    }

    async function handleChecklistFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        const targetItemId = selectedChecklistItemId;
        if (!file || !targetItemId || !ticket || !user) return;

        setChecklistError(null);
        setChecklistBusyItemId(targetItemId);

        try {
            const attachment = await AttachmentService.upload(ticket.id, file);
            await refetch();

            const now = new Date().toISOString();
            const updatedChecklist = checklistItems.map((item) => {
                if (item.id !== targetItemId) return item;
                const attachmentIds = Array.from(new Set([...(item.attachmentIds || []), attachment.id]));
                return {
                    ...item,
                    status: (item.status === 'APPROVED' ? 'APPROVED' : 'UPLOADED') as ChecklistStatus,
                    attachmentIds,
                    updatedAt: now,
                };
            });
            setChecklistItems(updatedChecklist);

            persistMetadata(
                {
                    ...ticket.metadata,
                    checklist: updatedChecklist,
                },
                'ticket.checklist.errors.save_failed'
            );
        } catch (error) {
            setChecklistError(t('ticket.checklist.errors.upload_failed'));
        } finally {
            setChecklistBusyItemId(null);
            setSelectedChecklistItemId(null);
            if (checklistFileInputRef.current) {
                checklistFileInputRef.current.value = '';
            }
        }
    }

    function handleChecklistStatusChange(itemId: string, nextStatus: ChecklistStatus) {
        if (!ticket || !user || !isStaffAdminUser) return;
        setChecklistError(null);
        const now = new Date().toISOString();

        const updatedChecklist = checklistItems.map((item) => {
            if (item.id !== itemId) return item;
            return {
                ...item,
                status: nextStatus,
                updatedAt: now,
                reviewedAt: nextStatus === 'APPROVED' || nextStatus === 'REJECTED' ? now : item.reviewedAt,
                reviewedBy: nextStatus === 'APPROVED' || nextStatus === 'REJECTED' ? user.id : item.reviewedBy,
            };
        });
        setChecklistItems(updatedChecklist);

        persistMetadata(
            {
                ...ticket.metadata,
                checklist: updatedChecklist,
            },
            'ticket.checklist.errors.save_failed'
        );
    }

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
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-blue-300">
                            {t('ticket.detail.case_number')} {ticket.id}
                        </h1>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[ticket.status as keyof typeof statusConfig]?.bg} ${statusConfig[ticket.status as keyof typeof statusConfig]?.color} ${statusConfig[ticket.status as keyof typeof statusConfig]?.border}`}>
                            {statusConfig[ticket.status as keyof typeof statusConfig]?.label}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">{ticket.title}</h2>

                    {ticket.advisor && (
                        <p className="text-sm text-slate-400 mb-2">
                            <span className="text-slate-500">{t('ticket.detail.assigned_advisor')}: </span>
                            <span className="text-emerald-400 font-medium">{ticket.advisor.name}</span>
                            {ticket.advisor.email ? (
                                <span className="text-slate-500"> · {ticket.advisor.email}</span>
                            ) : null}
                        </p>
                    )}

                    {/* Process Tracking Section */}
                    <div className="mt-8 mb-12 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white">{t('ticket.process_tracking.title')}</h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    {t('ticket.process_tracking.subtitle')}
                                </p>
                            </div>
                            <div className="text-sm text-slate-300">
                                {t('ticket.process_tracking.progress')}: <span className="font-semibold text-blue-300">{progressValue}%</span>
                            </div>
                        </div>

                        <div className="w-full h-2 bg-slate-800 rounded-full mb-8">
                            <div
                                className="h-2 bg-linear-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${progressValue}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {processStages.map((stage, index) => {
                                const isCompleted = stage.status === 'COMPLETED';
                                const isInProgress = stage.status === 'IN_PROGRESS';
                                const stateColor = isCompleted
                                    ? 'border-emerald-500/30 bg-emerald-500/10'
                                    : isInProgress
                                        ? 'border-blue-500/40 bg-blue-500/10'
                                        : 'border-slate-700 bg-slate-900/40';
                                const dotColor = isCompleted
                                    ? 'bg-emerald-500 text-white'
                                    : isInProgress
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-slate-700 text-slate-300';
                                const label = isCompleted
                                    ? t('ticket.process_tracking.status.completed')
                                    : isInProgress
                                        ? t('ticket.process_tracking.status.in_progress')
                                        : t('ticket.process_tracking.status.pending');

                                return (
                                    <div key={stage.id} className={`rounded-2xl border p-4 ${stateColor} transition-colors`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${dotColor}`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-white">{stage.label}</h4>
                                                    <p className="text-xs text-slate-400 mt-1">{label}</p>
                                                </div>
                                            </div>
                                            <span
                                                className="text-slate-400"
                                                title={stage.description}
                                                aria-label={`${t('ticket.process_tracking.tooltip_prefix')} ${stage.label}`}
                                            >
                                                <Info className="w-4 h-4" />
                                            </span>
                                        </div>

                                        {stage.updatedAt && (
                                            <p className="text-[11px] text-slate-500 mt-3">
                                                {t('ticket.process_tracking.updated_at')}: {new Date(stage.updatedAt).toLocaleString()}
                                            </p>
                                        )}

                                        {isStaffAdminUser && (
                                            <div className="mt-4">
                                                <label htmlFor={`stage-${stage.id}`} className="block text-xs text-slate-400 mb-1">
                                                    {t('ticket.process_tracking.update_status')}
                                                </label>
                                                <select
                                                    id={`stage-${stage.id}`}
                                                    value={stage.status}
                                                    disabled={isUpdating}
                                                    onChange={(e) => handleProcessStatusChange(stage.id ? index : 0, e.target.value as ProcessStageStatus)}
                                                    className="w-full rounded-lg border border-slate-700 bg-slate-900 text-slate-200 px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="PENDING">{t('ticket.process_tracking.status.pending')}</option>
                                                    <option value="IN_PROGRESS">{t('ticket.process_tracking.status.in_progress')}</option>
                                                    <option value="COMPLETED">{t('ticket.process_tracking.status.completed')}</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {processCompleted && (
                            <p className="mt-5 text-sm text-emerald-300 font-medium">
                                {t('ticket.process_tracking.completed_message')}
                            </p>
                        )}

                        {processError && (
                            <p className="mt-4 text-sm text-red-400">{processError}</p>
                        )}

                        <div className="mt-6 border-t border-white/10 pt-4">
                            <h4 className="text-sm font-semibold text-white mb-3">Historial de actualizaciones</h4>
                            {processHistory.length === 0 ? (
                                <p className="text-xs text-slate-500">{t('ticket.process_tracking.no_history')}</p>
                            ) : (
                                <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
                                    {processHistory.map((entry, index) => (
                                        <div key={`${entry.stageId}-${entry.updatedAt}-${index}`} className="text-xs text-slate-300 bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-2">
                                            <span className="font-medium">{processStages.find((s) => s.id === entry.stageId)?.label || entry.stageId}</span>
                                            {' - '}
                                            {entry.fromStatus} {'->'} {entry.toStatus}
                                            {' - '}
                                            <span className="text-slate-400">{new Date(entry.updatedAt).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stage Actions Section */}
                {currentStageId === 'HR_INTERVIEW' && paymentStatus === 'PENDING' && (
                    <div className="mb-8 p-8 bg-white/5 border border-blue-500/30 rounded-3xl shadow-2xl relative overflow-hidden">
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
                        <h3 className="text-xl font-bold text-white mb-4">{t('payments.title')}</h3>
                        <PaymentHistory
                            payments={ticket.payments.map((payment: any) => ({
                                id: payment.id,
                                amount: Number(payment.amount),
                                currency: payment.currency || 'USD',
                                status: payment.status || 'PENDING',
                                createdAt: payment.createdAt,
                            }))}
                        />
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
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        {/* Checklist Section */}
                        {checklistItems.length > 0 && (
                            <div className="bg-white/5/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
                                <div className="flex items-center justify-between gap-2 mb-4">
                                    <h3 className="text-lg font-bold text-white">{t('ticket.checklist.title')}</h3>
                                    <span className="text-xs text-slate-400">
                                        {checklistItems.filter((item) => item.status === 'APPROVED').length}/{checklistItems.length}
                                    </span>
                                </div>

                                <input
                                    ref={checklistFileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleChecklistFileSelected}
                                />

                                <div className="space-y-3">
                                    {checklistItems.map((item) => {
                                        const statusKey =
                                            item.status === 'APPROVED'
                                                ? 'approved'
                                                : item.status === 'REJECTED'
                                                    ? 'rejected'
                                                    : item.status === 'UPLOADED'
                                                        ? 'uploaded'
                                                        : 'pending';
                                        const statusClass =
                                            item.status === 'APPROVED'
                                                ? 'text-emerald-400'
                                                : item.status === 'REJECTED'
                                                    ? 'text-red-400'
                                                    : item.status === 'UPLOADED'
                                                        ? 'text-blue-400'
                                                        : 'text-slate-500';

                                        return (
                                            <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm text-slate-200 font-medium">
                                                            {t(`ticket_config.checklist.${item.id}`, item.label)}
                                                        </p>
                                                        <p className={`text-xs mt-1 ${statusClass}`}>
                                                            {t(`ticket.checklist.status.${statusKey}`)}
                                                        </p>
                                                        {item.updatedAt && (
                                                            <p className="text-[11px] text-slate-500 mt-1">
                                                                {t('ticket.checklist.updated_at')}: {new Date(item.updatedAt).toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {item.required && (
                                                        <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/20 text-amber-300">
                                                            {t('ticket.checklist.required')}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="w-auto text-xs px-3 py-1.5"
                                                        disabled={checklistBusyItemId === item.id || isUpdating}
                                                        onClick={() => {
                                                            setSelectedChecklistItemId(item.id);
                                                            checklistFileInputRef.current?.click();
                                                        }}
                                                    >
                                                        {checklistBusyItemId === item.id ? t('ticket.checklist.uploading') : t('ticket.checklist.upload')}
                                                    </Button>

                                                    {item.attachmentIds.length > 0 && (
                                                        <span className="text-xs text-slate-400 self-center">
                                                            {t('ticket.checklist.files_count', { count: item.attachmentIds.length })}
                                                        </span>
                                                    )}

                                                    {isStaffAdminUser && (
                                                        <select
                                                            className="rounded-lg border border-slate-700 bg-slate-900 text-slate-200 px-3 py-1.5 text-xs"
                                                            value={item.status}
                                                            disabled={isUpdating}
                                                            onChange={(e) => handleChecklistStatusChange(item.id, e.target.value as ChecklistStatus)}
                                                        >
                                                            <option value="PENDING">{t('ticket.checklist.status.pending')}</option>
                                                            <option value="UPLOADED">{t('ticket.checklist.status.uploaded')}</option>
                                                            <option value="APPROVED">{t('ticket.checklist.status.approved')}</option>
                                                            <option value="REJECTED">{t('ticket.checklist.status.rejected')}</option>
                                                        </select>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {checklistError && <p className="text-sm text-red-400 mt-3">{checklistError}</p>}
                            </div>
                        )} 
                        
                    </div>
                </div>
            </div>
        </Layout>
    );
}
