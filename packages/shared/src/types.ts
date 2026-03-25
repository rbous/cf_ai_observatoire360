import type {
    AlertStatus,
    AlertType,
    InspectionStatus,
    NotificationType,
    RiskLevel,
    ScanFrequency,
    ScanJobStatus,
    UserRole,
} from "./constants.js";

export interface Municipality {
    id: string;
    name: string;
    code: string;
    region: string | null;
    bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
    } | null;
    scanFrequency: ScanFrequency;
    scanEnabled: boolean;
    lastScanAt: number | null;
    createdAt: number;
}

export interface User {
    id: string;
    municipalityId: string;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    municipalityName?: string;
    createdAt: number;
    updatedAt: number;
}

export interface Alert {
    id: string;
    municipalityId: string;
    latitude: number;
    longitude: number;
    riskLevel: RiskLevel;
    riskScore: number;
    status: AlertStatus;
    type: AlertType;
    detectedArea: number | null;
    authorizedArea: number | null;
    zone: string | null;
    hasPermit: boolean;
    address: string | null;
    detectedAt: number;
    images: string[];
    scanJobId: string | null;
    beforeImageKey: string | null;
    afterImageKey: string | null;
    confidence: number | null;
    aiSummary: string | null;
    createdAt: number;
}

export interface Inspection {
    id: string;
    alertId: string;
    inspectorId: string;
    scheduledDate: string;
    status: InspectionStatus;
    notes: string | null;
    createdAt: number;
    updatedAt: number;
}

export interface ContactSubmission {
    id: string;
    name: string;
    position: string | null;
    municipality: string | null;
    email: string;
    description: string | null;
    createdAt: number;
}

export interface ReportStats {
    totalAlerts: number;
    confirmedInfractions: number;
    regularizationRate: number;
    inspectionsDone: number;
    alertsByMonth: { month: string; count: number }[];
    alertsByType: { type: AlertType; count: number }[];
    alertsByRiskLevel: { level: RiskLevel; count: number }[];
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface JwtPayload {
    sub: string;
    role: UserRole;
    municipalityId: string;
    exp: number;
    iat: number;
}

export interface ApiError {
    error: string;
    message: string;
    statusCode: number;
}

export interface Notification {
    id: string;
    municipalityId: string;
    userId: string | null;
    alertId: string | null;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: number;
}

export interface ScanJob {
    id: string;
    municipalityId: string;
    status: ScanJobStatus;
    imageryDate: string | null;
    beforeImageKey: string | null;
    afterImageKey: string | null;
    orthoImageKey: string | null;
    detectionsCount: number;
    error: string | null;
    startedAt: number | null;
    completedAt: number | null;
    startDate: string | null;
    endDate: string | null;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    createdAt: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}
