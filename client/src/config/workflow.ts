import { CheckCircle, FileText, UserCheck, Plane, Search } from 'lucide-react';

export const WORKFLOW_STEPS = {
    WORK_VISA: [
        { id: 'INITIAL_REVIEW', label: 'Revisión Inicial', icon: Search },
        { id: 'DOCUMENTS_COLLECTION', label: 'Recolección de Documentos', icon: FileText },
        { id: 'HR_INTERVIEW', label: 'Entrevista RRHH', icon: UserCheck },
        { id: 'LABOR_CERTIFICATION', label: 'Certificación Laboral', icon: CheckCircle },
        { id: 'VISA_APPLICATION', label: 'Aplicación de Visa', icon: Plane },
    ],
    STUDENT_VISA: [
        { id: 'INITIAL_REVIEW', label: 'Revisión Inicial', icon: Search },
        { id: 'SCHOOL_ADMISSION', label: 'Admisión Escolar', icon: FileText },
        { id: 'DOCUMENTS_COLLECTION', label: 'Documentos Financieros', icon: FileText },
        { id: 'VISA_APPLICATION', label: 'Aplicación de Visa', icon: Plane },
    ],
    RESIDENCY: [
        { id: 'INITIAL_REVIEW', label: 'Revisión Inicial', icon: Search },
        { id: 'DOCUMENTS_COLLECTION', label: 'Documentación Legal', icon: FileText },
        { id: 'BACKGROUND_CHECK', label: 'Verificación de Antecedentes', icon: UserCheck },
        { id: 'APPLICATION_SUBMISSION', label: 'Envío de Solicitud', icon: CheckCircle },
    ],
    CITIZENSHIP: [
        { id: 'INITIAL_REVIEW', label: 'Revisión de Elegibilidad', icon: Search },
        { id: 'DOCUMENTS_COLLECTION', label: 'Recolección de Pruebas', icon: FileText },
        { id: 'APPLICATION_SUBMISSION', label: 'Envío de Solicitud', icon: CheckCircle },
        { id: 'INTERVIEW_PREP', label: 'Preparación Entrevista', icon: UserCheck },
    ],
    OTHER: [
        { id: 'INITIAL_REVIEW', label: 'Revisión Inicial', icon: Search },
        { id: 'IN_PROGRESS', label: 'En Proceso', icon: FileText },
        { id: 'RESOLVED', label: 'Resuelto', icon: CheckCircle },
    ]
};

export const CHECKLIST_ITEMS = {
    WORK_VISA: [
        { id: 'passport', label: 'Pasaporte Vigente', required: true },
        { id: 'cv', label: 'Curriculum Vitae Actualizado', required: true },
        { id: 'degrees', label: 'Títulos Universitarios', required: true },
        { id: 'job_offer', label: 'Carta de Oferta Laboral', required: true },
        { id: 'photos', label: 'Fotos Tipo Visa', required: false },
    ],
    STUDENT_VISA: [
        { id: 'passport', label: 'Pasaporte Vigente', required: true },
        { id: 'school_letter', label: 'Carta de Aceptación Escolar', required: true },
        { id: 'bank_statements', label: 'Estados de Cuenta Bancarios', required: true },
        { id: 'photos', label: 'Fotos Tipo Visa', required: false },
    ],
    RESIDENCY: [
        { id: 'passport', label: 'Pasaporte Vigente', required: true },
        { id: 'birth_cert', label: 'Certificado de Nacimiento', required: true },
        { id: 'police_record', label: 'Antecedentes Penales', required: true },
        { id: 'marriage_cert', label: 'Certificado de Matrimonio (si aplica)', required: false },
    ],
    CITIZENSHIP: [
        { id: 'greencard', label: 'Residencia Permanente (Green Card)', required: true },
        { id: 'tax_returns', label: 'Declaraciones de Impuestos (3 años)', required: true },
        { id: 'travel_history', label: 'Historial de Viajes', required: true },
    ],
    OTHER: [
        { id: 'id_doc', label: 'Documento de Identidad', required: true },
        { id: 'description', label: 'Descripción del Caso', required: true },
    ]
};
