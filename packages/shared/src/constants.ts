export const USER_ROLES = ["inspector", "analyst", "manager", "readonly"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ALERT_STATUSES = [
    "a_analyser",
    "a_inspecter",
    "en_cours",
    "infraction_confirmee",
    "cloturee",
] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
    a_analyser: "À analyser",
    a_inspecter: "À inspecter",
    en_cours: "En cours",
    infraction_confirmee: "Infraction confirmée",
    cloturee: "Clôturée",
};

export const RISK_LEVELS = ["low", "medium", "high"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
    low: "Faible",
    medium: "Moyen",
    high: "Élevé",
};

export const ALERT_TYPES = ["construction", "extension", "annexe", "piscine"] as const;
export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
    construction: "Construction",
    extension: "Extension",
    annexe: "Annexe",
    piscine: "Piscine",
};

export const INSPECTION_STATUSES = ["planned", "in_progress", "completed", "cancelled"] as const;
export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
    planned: "Planifiée",
    in_progress: "En cours",
    completed: "Complétée",
    cancelled: "Annulée",
};

export const ROLE_LABELS: Record<UserRole, string> = {
    inspector: "Inspecteur",
    analyst: "Analyste",
    manager: "Gestionnaire",
    readonly: "Lecture seule",
};

// ---------------------------------------------------------------------------
// Notification types
// ---------------------------------------------------------------------------

export const NOTIFICATION_TYPES = ["new_alert", "status_change", "inspection_due", "system"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
    new_alert: "Nouvelle alerte",
    status_change: "Changement de statut",
    inspection_due: "Inspection à venir",
    system: "Système",
};

// ---------------------------------------------------------------------------
// Scan job statuses
// ---------------------------------------------------------------------------

export const SCAN_JOB_STATUSES = ["pending", "fetching", "analyzing", "completed", "failed"] as const;
export type ScanJobStatus = (typeof SCAN_JOB_STATUSES)[number];

export const SCAN_JOB_STATUS_LABELS: Record<ScanJobStatus, string> = {
    pending: "En attente",
    fetching: "Récupération",
    analyzing: "Analyse en cours",
    completed: "Terminé",
    failed: "Échoué",
};

// ---------------------------------------------------------------------------
// Scan frequencies
// ---------------------------------------------------------------------------

export const SCAN_FREQUENCIES = ["daily", "weekly", "biweekly", "monthly"] as const;
export type ScanFrequency = (typeof SCAN_FREQUENCIES)[number];

export const SCAN_FREQUENCY_LABELS: Record<ScanFrequency, string> = {
    daily: "Quotidien",
    weekly: "Hebdomadaire",
    biweekly: "Bi-mensuel",
    monthly: "Mensuel",
};

// ---------------------------------------------------------------------------
// WMS Layers
// ---------------------------------------------------------------------------

export const WMS_LAYERS = {
    cadastre: {
        url: "https://ws.mapserver.mern.gouv.qc.ca/cgi-bin/cadastre?",
        layers: "cadastre",
        label: "Cadastre (lots)",
    },
    limites_municipales: {
        url: "https://ws.mapserver.mern.gouv.qc.ca/cgi-bin/limites_mun?",
        layers: "limites_municipales",
        label: "Limites municipales",
    },
    orthophotos: {
        url: "https://ws.mapserver.mern.gouv.qc.ca/cgi-bin/ortho?",
        layers: "orthophotos",
        label: "Orthophotos",
    },
    adresses: {
        url: "https://ws.mapserver.mern.gouv.qc.ca/cgi-bin/adresses?",
        layers: "adresses",
        label: "Adresses Québec",
    },
    hydrographie: {
        url: "https://ws.mapserver.mern.gouv.qc.ca/cgi-bin/hydro?",
        layers: "hydrographie",
        label: "Hydrographie",
    },
    courbes_niveau: {
        url: "https://ws.mapserver.mern.gouv.qc.ca/cgi-bin/courbes?",
        layers: "courbes_niveau",
        label: "Courbes de niveau",
    },
    ecoforestiere: {
        url: "https://geo.foretouverte.gouv.qc.ca/geoserver/ecoforestiere/wms?",
        layers: "ecoforestiere:peuplements_forestiers",
        label: "Écoforestière",
    },
} as const;
