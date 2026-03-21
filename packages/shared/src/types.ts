import type { AlertStatus, AlertType, InspectionStatus, RiskLevel, UserRole } from "./constants.js";

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
    createdAt: number;
}

export interface User {
    id: string;
    municipalityId: string;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
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

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}
