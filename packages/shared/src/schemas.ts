import { z } from "zod";
import { ALERT_STATUSES, ALERT_TYPES, INSPECTION_STATUSES, RISK_LEVELS, USER_ROLES } from "./constants.js";

// Auth schemas
export const loginSchema = z.object({
    email: z.string().email("Courriel invalide"),
    password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = z.object({
    email: z.string().email("Courriel invalide"),
    password: z
        .string()
        .min(8, "Minimum 8 caractères")
        .regex(/[A-Z]/, "Doit contenir une majuscule")
        .regex(/[a-z]/, "Doit contenir une minuscule")
        .regex(/[0-9]/, "Doit contenir un chiffre"),
    name: z.string().min(2, "Nom requis").max(100),
    municipalityId: z.string().min(1, "Municipalité requise"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Courriel invalide"),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    password: z
        .string()
        .min(8, "Minimum 8 caractères")
        .regex(/[A-Z]/, "Doit contenir une majuscule")
        .regex(/[a-z]/, "Doit contenir une minuscule")
        .regex(/[0-9]/, "Doit contenir un chiffre"),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
        .string()
        .min(8, "Minimum 8 caractères")
        .regex(/[A-Z]/, "Doit contenir une majuscule")
        .regex(/[a-z]/, "Doit contenir une minuscule")
        .regex(/[0-9]/, "Doit contenir un chiffre"),
});

// Contact schema
export const contactSchema = z.object({
    name: z.string().min(2, "Nom requis").max(100),
    position: z.string().max(100).optional(),
    municipality: z.string().max(100).optional(),
    email: z.string().email("Courriel invalide"),
    description: z.string().max(2000).optional(),
});

// Alert schemas
export const updateAlertSchema = z.object({
    status: z.enum(ALERT_STATUSES).optional(),
    riskLevel: z.enum(RISK_LEVELS).optional(),
    riskScore: z.number().int().min(0).max(100).optional(),
    notes: z.string().max(2000).optional(),
});

// Inspection schemas
export const createInspectionSchema = z.object({
    alertId: z.string().min(1),
    inspectorId: z.string().min(1),
    scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD requis"),
    notes: z.string().max(2000).optional(),
});

export const updateInspectionSchema = z.object({
    scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    status: z.enum(INSPECTION_STATUSES).optional(),
    notes: z.string().max(2000).optional(),
});

// User management schemas
export const createUserSchema = z.object({
    email: z.string().email("Courriel invalide"),
    name: z.string().min(2).max(100),
    role: z.enum(USER_ROLES),
    password: z
        .string()
        .min(8, "Minimum 8 caractères")
        .regex(/[A-Z]/, "Doit contenir une majuscule")
        .regex(/[a-z]/, "Doit contenir une minuscule")
        .regex(/[0-9]/, "Doit contenir un chiffre"),
});

export const updateUserSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    role: z.enum(USER_ROLES).optional(),
    isActive: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
});

// Query params
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const alertsQuerySchema = paginationSchema.extend({
    status: z.enum(ALERT_STATUSES).optional(),
    riskLevel: z.enum(RISK_LEVELS).optional(),
    type: z.enum(ALERT_TYPES).optional(),
    search: z.string().max(100).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;
export type UpdateInspectionInput = z.infer<typeof updateInspectionSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AlertsQuery = z.infer<typeof alertsQuerySchema>;
