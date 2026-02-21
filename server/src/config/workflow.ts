export const WORKFLOW_CONFIG = {
    WORK_VISA: {
        stages: [
            { id: 'REQUEST_RECEIVED', label: 'Solicitud Iniciada', status: 'CURRENT' },
            { id: 'HR_INTERVIEW', label: 'Entrevista RRHH', status: 'PENDING' },
            { id: 'MEDICAL_EXAMS', label: 'Exámenes Médicos', status: 'PENDING' },
            { id: 'SPONSORSHIP', label: 'Carta Patrocinio', status: 'PENDING' },
            { id: 'VISA_INTERVIEW', label: 'Entrevista Embajada', status: 'PENDING' },
            { id: 'FINALIZATION', label: 'Finalización', status: 'PENDING' },
        ],
        checklist: [
            { id: 'PASSPORT', label: 'Pasaporte Vigente', required: true, status: 'PENDING' },
            { id: 'CONTRACT', label: 'Contrato de Trabajo', required: true, status: 'PENDING' },
            { id: 'CV', label: 'Curriculum Vitae', required: true, status: 'PENDING' },
            { id: 'DIPLOMA', label: 'Títulos Académicos', required: true, status: 'PENDING' },
            { id: 'PHOTO', label: 'Foto Fondo Blanco', required: true, status: 'PENDING' },
        ]
    },
    STUDENT_VISA: {
        stages: [
            { id: 'ADMISSION', label: 'Admisión Académica', status: 'CURRENT' },
            { id: 'DOCS_COLLECTION', label: 'Documentación', status: 'PENDING' },
            { id: 'FILING', label: 'Radicación', status: 'PENDING' },
            { id: 'DECISION', label: 'Decisión', status: 'PENDING' },
        ],
        checklist: [
            { id: 'PASSPORT', label: 'Pasaporte Vigente', required: true, status: 'PENDING' },
            { id: 'ACCEPTANCE_LETTER', label: 'Carta de Aceptación', required: true, status: 'PENDING' },
            { id: 'BANK_stmts', label: 'Extractos Bancarios', required: true, status: 'PENDING' },
            { id: 'DIPLOMA', label: 'Diplomas Anteriores', required: true, status: 'PENDING' },
        ]
    },
    RESIDENCY: {
        stages: [
            { id: 'ELIGIBILITY', label: 'Análisis de Elegibilidad', status: 'CURRENT' },
            { id: 'DOCS_COLLECTION', label: 'Recolección', status: 'PENDING' },
            { id: 'FILING', label: 'Aplicación', status: 'PENDING' },
            { id: 'INTERVIEW', label: 'Entrevista', status: 'PENDING' },
            { id: 'DECISION', label: 'Decisión Final', status: 'PENDING' },
        ],
        checklist: [
            { id: 'PASSPORT', label: 'Pasaporte', required: true, status: 'PENDING' },
            { id: 'BIRTH_CERT', label: 'Registro de Nacimiento', required: true, status: 'PENDING' },
            { id: 'POLICE_RECORD', label: 'Antecedentes Penales', required: true, status: 'PENDING' },
            { id: 'MARRIAGE_CERT', label: 'Certificado de Matrimonio', required: false, status: 'PENDING' },
        ]
    },
    CITIZENSHIP: {
        stages: [
            { id: 'APP_REVIEW', label: 'Revisión de Solicitud', status: 'CURRENT' },
            { id: 'EXAM', label: 'Examen de Ciudadanía', status: 'PENDING' },
            { id: 'OATH', label: 'Juramento', status: 'PENDING' },
        ],
        checklist: [
            { id: 'RESIDENCY_CARD', label: 'Tarjeta de Residencia', required: true, status: 'PENDING' },
            { id: 'TAX_RETURNS', label: 'Declaraciones de Impuestos', required: true, status: 'PENDING' },
            { id: 'ID_PHOTOS', label: 'Fotos Tipo Pasaporte', required: true, status: 'PENDING' },
        ]
    },
    OTHER: {
        stages: [
            { id: 'OPEN', label: 'Abierto', status: 'CURRENT' },
            { id: 'IN_PROGRESS', label: 'En Proceso', status: 'PENDING' },
            { id: 'RESOLVED', label: 'Resuelto', status: 'PENDING' },
        ],
        checklist: []
    }
};
