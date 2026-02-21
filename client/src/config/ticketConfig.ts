import {
    Briefcase,
    GraduationCap,
    Landmark,
    Flag,
    HelpCircle,
    type LucideIcon
} from 'lucide-react';

export const TicketTypes = {
    WORK_VISA: 'WORK_VISA',
    STUDENT_VISA: 'STUDENT_VISA',
    RESIDENCY: 'RESIDENCY',
    CITIZENSHIP: 'CITIZENSHIP',
    OTHER: 'OTHER',
} as const;

export type TicketType = keyof typeof TicketTypes;

export interface Stage {
    id: string;
    label: string;
    description?: string;
}

export interface ChecklistItem {
    id: string;
    label: string;
    required: boolean;
}

export interface TicketConfig {
    label: string;
    description: string;
    icon: LucideIcon;
    stages: Stage[];
    checklist: ChecklistItem[];
}

export const TICKET_CONFIG: Record<TicketType, TicketConfig> = {
    WORK_VISA: {
        label: 'Visa de Trabajo',
        description: 'Proceso para obtener permiso de trabajo en el extranjero.',
        icon: Briefcase,
        stages: [
            { id: 'REQUEST_RECEIVED', label: 'Solicitud Iniciada', description: 'Cliente visualiza su petición.' },
            { id: 'HR_INTERVIEW', label: 'Entrevista RRHH', description: 'Aprobación de patrocinio y pago del 35%.' },
            { id: 'MEDICAL_EXAMS', label: 'Exámenes Médicos', description: 'Agendamiento de exámenes físicos y psicológicos.' },
            { id: 'SPONSORSHIP', label: 'Carta Patrocinio', description: 'Entrega de carta oficial de patrocinio.' },
            { id: 'VISA_INTERVIEW', label: 'Entrevista Embajada', description: 'Presentación ante la embajada.' },
            { id: 'FINALIZATION', label: 'Finalización', description: 'Compra de vuelos y recepción de documentos.' },
        ],
        checklist: [
            { id: 'PASSPORT', label: 'Pasaporte Vigente', required: true },
            { id: 'CONTRACT', label: 'Contrato de Trabajo', required: true },
            { id: 'CV', label: 'Curriculum Vitae', required: true },
            { id: 'DIPLOMA', label: 'Títulos Académicos', required: true },
            { id: 'PHOTO', label: 'Foto Fondo Blanco', required: true },
        ]
    },
    STUDENT_VISA: {
        label: 'Visa de Estudiante',
        description: 'Para cursar estudios académicos o de idiomas.',
        icon: GraduationCap,
        stages: [
            { id: 'ADMISSION', label: 'Admisión Académica', description: 'Obtener carta de aceptación.' },
            { id: 'DOCS_COLLECTION', label: 'Documentación', description: 'Recolección de documentos financieros y académicos.' },
            { id: 'FILING', label: 'Radicación', description: 'Solicitud ante la embajada.' },
            { id: 'DECISION', label: 'Decisión', description: 'Respuesta consular.' },
        ],
        checklist: [
            { id: 'PASSPORT', label: 'Pasaporte Vigente', required: true },
            { id: 'ACCEPTANCE_LETTER', label: 'Carta de Aceptación', required: true },
            { id: 'BANK_stmts', label: 'Extractos Bancarios', required: true },
            { id: 'DIPLOMA', label: 'Diplomas Anteriores', required: true },
        ]
    },
    RESIDENCY: {
        label: 'Residencia Permanente',
        description: 'Proceso de arraigo y residencia definitiva.',
        icon: Landmark,
        stages: [
            { id: 'ELIGIBILITY', label: 'Análisis de Elegibilidad', description: 'Verificación de puntaje y requisitos.' },
            { id: 'DOCS_COLLECTION', label: 'Recolección', description: 'Apostillas y traducciones.' },
            { id: 'FILING', label: 'Aplicación', description: 'Envío de expediente.' },
            { id: 'INTERVIEW', label: 'Entrevista', description: 'Cita con oficial de migración.' },
            { id: 'DECISION', label: 'Decisión Final', description: 'Otorgamiento de residencia.' },
        ],
        checklist: [
            { id: 'PASSPORT', label: 'Pasaporte', required: true },
            { id: 'BIRTH_CERT', label: 'Registro de Nacimiento', required: true },
            { id: 'POLICE_RECORD', label: 'Antecedentes Penales', required: true },
            { id: 'MARRIAGE_CERT', label: 'Certificado de Matrimonio', required: false },
        ]
    },
    CITIZENSHIP: {
        label: 'Ciudadanía',
        description: 'Naturalización y obtención de pasaporte.',
        icon: Flag,
        stages: [
            { id: 'APP_REVIEW', label: 'Revisión de Solicitud', description: 'Verificación de tiempos de residencia.' },
            { id: 'EXAM', label: 'Examen de Ciudadanía', description: 'Prueba de conocimientos e idioma.' },
            { id: 'OATH', label: 'Juramento', description: 'Ceremonia de ciudadanía.' },
        ],
        checklist: [
            { id: 'RESIDENCY_CARD', label: 'Tarjeta de Residencia', required: true },
            { id: 'TAX_RETURNS', label: 'Declaraciones de Impuestos', required: true },
            { id: 'ID_PHOTOS', label: 'Fotos Tipo Pasaporte', required: true },
        ]
    },
    OTHER: {
        label: 'Otro Trámite',
        description: 'Consulta general o trámite no listado.',
        icon: HelpCircle,
        stages: [
            { id: 'OPEN', label: 'Abierto', description: '' },
            { id: 'IN_PROGRESS', label: 'En Proceso', description: '' },
            { id: 'RESOLVED', label: 'Resuelto', description: '' },
        ],
        checklist: []
    }
};
