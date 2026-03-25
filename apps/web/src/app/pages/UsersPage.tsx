import { useState } from "react";
import { Loader2, AlertTriangle, UserPlus, Pencil, PowerOff, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/app/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";
import { useApi } from "@/app/hooks/useApi";
import { useAuth } from "@/app/hooks/useAuth";
import { api, ApiRequestError } from "@/app/lib/api";
import type { User } from "@observatoire360/shared";
import { USER_ROLES } from "@observatoire360/shared";
import type { UserRole } from "@observatoire360/shared";
import { useLanguage } from "@/app/hooks/useLanguage";

// ---------------------------------------------------------------------------
// Create user form state
// ---------------------------------------------------------------------------

interface CreateUserForm {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

const DEFAULT_FORM: CreateUserForm = {
    name: "",
    email: "",
    password: "",
    role: "readonly",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function roleBadgeVariant(role: UserRole) {
    switch (role) {
        case "manager":
            return "default" as const;
        case "analyst":
            return "pending" as const;
        case "inspector":
            return "active" as const;
        case "readonly":
            return "secondary" as const;
        default:
            return "secondary" as const;
    }
}

// ---------------------------------------------------------------------------
// UsersPage
// ---------------------------------------------------------------------------

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const { t } = useLanguage();
    const { data: usersResponse, isLoading, error, refetch } = useApi<{ data: User[]; total: number }>("/users");
    const users = usersResponse?.data ?? null;

    const ROLE_LABELS_I18N: Record<UserRole, string> = {
        inspector: t("role_inspector"),
        analyst: t("role_analyst"),
        manager: t("role_manager"),
        readonly: t("role_readonly"),
    };

    // Create dialog
    const [createOpen, setCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState<CreateUserForm>(DEFAULT_FORM);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    // Edit role dialog
    const [editUser, setEditUser] = useState<User | null>(null);
    const [editRole, setEditRole] = useState<UserRole>("readonly");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    // Deactivate / activate loading per user id
    const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);
    const [toggleError, setToggleError] = useState<string | null>(null);

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError(null);
        try {
            await api.post("/users", {
                email: createForm.email,
                password: createForm.password,
                name: createForm.name,
                role: createForm.role,
                municipalityId: currentUser?.municipalityId,
            });
            setCreateOpen(false);
            setCreateForm(DEFAULT_FORM);
            refetch();
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setCreateError(err.message);
            } else {
                setCreateError(t("users_unexpected_error"));
            }
        } finally {
            setCreateLoading(false);
        }
    }

    function openEditDialog(user: User) {
        setEditUser(user);
        setEditRole(user.role);
        setEditError(null);
    }

    async function handleEditRole(e: React.FormEvent) {
        e.preventDefault();
        if (!editUser) return;
        setEditLoading(true);
        setEditError(null);
        try {
            await api.put(`/users/${editUser.id}`, { role: editRole });
            setEditUser(null);
            refetch();
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setEditError(err.message);
            } else {
                setEditError(t("users_unexpected_error"));
            }
        } finally {
            setEditLoading(false);
        }
    }

    async function handleToggleActive(user: User) {
        setToggleLoadingId(user.id);
        setToggleError(null);
        try {
            if (user.isActive) {
                await api.delete(`/users/${user.id}`);
            } else {
                await api.put(`/users/${user.id}`, { isActive: true });
            }
            refetch();
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setToggleError(err.message);
            } else {
                setToggleError(t("users_unexpected_error"));
            }
        } finally {
            setToggleLoadingId(null);
        }
    }

    // -----------------------------------------------------------------------
    // Render: loading / error
    // -----------------------------------------------------------------------

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 flex items-center justify-center min-h-[300px]">
                <div className="flex items-center gap-3 text-[#94A3B8]/60">
                    <Loader2 className="w-5 h-5 animate-spin text-[#6366F1]" />
                    <span className="text-sm font-medium">{t("loading")}</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-6">
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    // -----------------------------------------------------------------------
    // Render: main
    // -----------------------------------------------------------------------

    const userCount = users?.length ?? 0;

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black uppercase text-[#E2E8F0]">{t("users_title")}</h1>
                    <p className="text-sm text-[#94A3B8]/60 mt-0.5">
                        {userCount} {userCount !== 1 ? t("users_count_many") : t("users_count_one")} {t("users_in_municipality")}
                    </p>
                </div>
                <Button onClick={() => { setCreateForm(DEFAULT_FORM); setCreateError(null); setCreateOpen(true); }}>
                    <UserPlus className="w-4 h-4" />
                    {t("users_add")}
                </Button>
            </div>

            {/* Toggle error banner */}
            {toggleError && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{toggleError}</span>
                </div>
            )}

            {/* Users table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#94A3B8]/60 uppercase tracking-wide">{t("users_col_name")}</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#94A3B8]/60 uppercase tracking-wide">{t("users_col_email")}</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#94A3B8]/60 uppercase tracking-wide">{t("users_col_role")}</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#94A3B8]/60 uppercase tracking-wide">{t("users_col_status")}</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#94A3B8]/60 uppercase tracking-wide">{t("users_col_actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {(users ?? []).map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-950/60 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-[#E2E8F0]">{u.name}</td>
                                        <td className="px-5 py-3.5 text-[#94A3B8]/70">{u.email}</td>
                                        <td className="px-5 py-3.5">
                                            <Badge variant={roleBadgeVariant(u.role)}>
                                                {ROLE_LABELS_I18N[u.role]}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <Badge variant={u.isActive ? "active" : "inactive"}>
                                                {u.isActive ? t("users_active") : t("users_inactive")}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditDialog(u)}
                                                    disabled={u.id === currentUser?.id}
                                                    title={t("users_edit_role_title")}
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                    {t("users_edit_role")}
                                                </Button>
                                                <Button
                                                    variant={u.isActive ? "destructive" : "outline"}
                                                    size="sm"
                                                    onClick={() => handleToggleActive(u)}
                                                    disabled={
                                                        u.id === currentUser?.id ||
                                                        toggleLoadingId === u.id
                                                    }
                                                    title={u.isActive ? t("users_deactivate") : t("users_activate")}
                                                >
                                                    {toggleLoadingId === u.id ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : u.isActive ? (
                                                        <PowerOff className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <Power className="w-3.5 h-3.5" />
                                                    )}
                                                    {u.isActive ? t("users_deactivate") : t("users_activate")}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(users ?? []).length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-10 text-center text-sm text-[#94A3B8]/50">
                                            {t("users_no_users")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* ----------------------------------------------------------------
                Create user dialog
            ---------------------------------------------------------------- */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("users_create_title")}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCreate} className="space-y-4 mt-2">
                        <Input
                            label={t("users_col_name")}
                            placeholder="Marie Tremblay"
                            value={createForm.name}
                            onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                            required
                        />
                        <Input
                            label={t("users_col_email")}
                            type="email"
                            placeholder="marie@municipalite.qc.ca"
                            value={createForm.email}
                            onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                            required
                        />
                        <Input
                            label={t("login_password")}
                            type="password"
                            placeholder="••••••••"
                            value={createForm.password}
                            onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                            required
                        />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-[#E2E8F0]">{t("users_col_role")}</label>
                            <Select
                                value={createForm.role}
                                onValueChange={(v) => setCreateForm((f) => ({ ...f, role: v as UserRole }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("users_choose_role")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {USER_ROLES.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {ROLE_LABELS_I18N[role]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {createError && (
                            <p className="text-xs text-[#DC2626] flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                {createError}
                            </p>
                        )}

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">
                                    {t("cancel")}
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={createLoading}>
                                {createLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {t("users_create_btn")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ----------------------------------------------------------------
                Edit role dialog
            ---------------------------------------------------------------- */}
            <Dialog open={editUser !== null} onOpenChange={(open) => { if (!open) setEditUser(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("users_edit_title")}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleEditRole} className="space-y-4 mt-2">
                        <p className="text-sm text-[#94A3B8]/70">
                            {t("users_edit_desc")} <span className="font-semibold text-[#E2E8F0]">{editUser?.name}</span>.
                        </p>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-[#E2E8F0]">{t("users_col_role")}</label>
                            <Select
                                value={editRole}
                                onValueChange={(v) => setEditRole(v as UserRole)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("users_choose_role")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {USER_ROLES.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {ROLE_LABELS_I18N[role]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {editError && (
                            <p className="text-xs text-[#DC2626] flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                {editError}
                            </p>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setEditUser(null)}>
                                {t("cancel")}
                            </Button>
                            <Button type="submit" disabled={editLoading}>
                                {editLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {t("save")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
