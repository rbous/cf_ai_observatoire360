import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/app/hooks/useAuth";
import { api, ApiRequestError } from "@/app/lib/api";
import { useLanguage } from "@/app/hooks/useLanguage";
import type { UserRole } from "@observatoire360/shared";

// ---------------------------------------------------------------------------
// ProfilePage
// ---------------------------------------------------------------------------

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const { t } = useLanguage();

    // -----------------------------------------------------------------------
    // Personal info form
    // -----------------------------------------------------------------------
    const [name, setName] = useState(user?.name ?? "");
    const [infoLoading, setInfoLoading] = useState(false);
    const [infoError, setInfoError] = useState<string | null>(null);
    const [infoSuccess, setInfoSuccess] = useState(false);

    // Sync name field when user object updates
    useEffect(() => {
        if (user) {
            setName(user.name);
        }
    }, [user]);

    async function handleUpdateInfo(e: React.FormEvent) {
        e.preventDefault();
        setInfoLoading(true);
        setInfoError(null);
        setInfoSuccess(false);
        try {
            await updateProfile({ name: name.trim() });
            setInfoSuccess(true);
            setTimeout(() => setInfoSuccess(false), 5000);
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setInfoError(err.message);
            } else {
                setInfoError(t("profile_unexpected_error"));
            }
        } finally {
            setInfoLoading(false);
        }
    }

    // -----------------------------------------------------------------------
    // Password form
    // -----------------------------------------------------------------------
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    function validatePasswordForm(): string | null {
        if (newPassword.length < 8) {
            return t("profile_password_min_length");
        }
        if (newPassword !== confirmPassword) {
            return t("profile_password_mismatch");
        }
        return null;
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        const validationError = validatePasswordForm();
        if (validationError) {
            setPasswordError(validationError);
            return;
        }
        setPasswordLoading(true);
        setPasswordError(null);
        setPasswordSuccess(false);
        try {
            await api.put("/me/password", {
                currentPassword,
                newPassword,
            });
            setPasswordSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setPasswordSuccess(false), 5000);
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setPasswordError(err.message);
            } else {
                setPasswordError(t("profile_unexpected_error"));
            }
        } finally {
            setPasswordLoading(false);
        }
    }

    const ROLE_LABELS_I18N: Record<UserRole, string> = {
        inspector: t("role_inspector"),
        analyst: t("role_analyst"),
        manager: t("role_manager"),
        readonly: t("role_readonly"),
    };

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    if (!user) {
        return (
            <div className="p-4 md:p-6 flex items-center justify-center min-h-[300px]">
                <div className="flex items-center gap-3 text-[#94A3B8]/60">
                    <Loader2 className="w-5 h-5 animate-spin text-[#6366F1]" />
                    <span className="text-sm font-medium">{t("profile_loading")}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
            {/* Page header */}
            <div>
                <h1 className="text-xl font-black uppercase text-[#E2E8F0]">{t("profile_title")}</h1>
                <p className="text-sm text-[#94A3B8]/60 mt-0.5">
                    {t("profile_subtitle")}
                </p>
            </div>

            {/* Two-column layout on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ----------------------------------------------------------------
                    Card 1: Personal information
                ---------------------------------------------------------------- */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{t("profile_info")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateInfo} className="space-y-4">
                            {/* Name — editable */}
                            <Input
                                label={t("profile_name")}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t("profile_name_placeholder")}
                                required
                            />

                            {/* Email — read-only */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-[#E2E8F0]">{t("profile_email")}</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    readOnly
                                    className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-[#94A3B8]/60 cursor-not-allowed"
                                />
                            </div>

                            {/* Role — read-only badge */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-[#E2E8F0]">{t("profile_role")}</span>
                                <div className="h-10 flex items-center">
                                    <Badge variant="default">
                                        {ROLE_LABELS_I18N[user.role]}
                                    </Badge>
                                </div>
                            </div>

                            {/* Municipality — read-only */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-[#E2E8F0]">{t("profile_municipality")}</label>
                                <input
                                    type="text"
                                    value={user.municipalityId}
                                    readOnly
                                    className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-[#94A3B8]/60 cursor-not-allowed"
                                />
                            </div>

                            {/* Feedback */}
                            {infoSuccess && (
                                <div className="flex items-center gap-2 text-emerald-700 text-sm p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    {t("profile_updated")}
                                </div>
                            )}
                            {infoError && (
                                <div className="flex items-center gap-2 text-red-700 text-sm p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    {infoError}
                                </div>
                            )}

                            <Button type="submit" disabled={infoLoading} className="w-full">
                                {infoLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {t("profile_save")}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* ----------------------------------------------------------------
                    Card 2: Change password
                ---------------------------------------------------------------- */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{t("profile_change_password")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <Input
                                label={t("profile_current_password")}
                                type="password"
                                placeholder="••••••••"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                            <Input
                                label={t("profile_new_password")}
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                hint={t("profile_password_hint")}
                                required
                            />
                            <Input
                                label={t("profile_confirm_password")}
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />

                            {/* Feedback */}
                            {passwordSuccess && (
                                <div className="flex items-center gap-2 text-emerald-700 text-sm p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    {t("profile_password_changed")}
                                </div>
                            )}
                            {passwordError && (
                                <div className="flex items-center gap-2 text-red-700 text-sm p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    {passwordError}
                                </div>
                            )}

                            <Button type="submit" disabled={passwordLoading} className="w-full">
                                {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {t("profile_edit")}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
