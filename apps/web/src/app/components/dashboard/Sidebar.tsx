import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Map, BarChart3, Calendar, Layers, Menu, X, ScanLine, Users, UserCircle } from "lucide-react";
import { cn } from "@/app/lib/cn";
import { useAuth } from "@/app/hooks/useAuth";
import { useLanguage } from "@/app/hooks/useLanguage";
import type { TranslationKey } from "@/app/i18n/translations";

interface NavItem {
    labelKey: TranslationKey;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    managerOnly?: boolean;
}

const NAV_ITEMS_PRIMARY: NavItem[] = [
    { labelKey: "sidebar_map", href: "/tableau-de-bord", icon: Map },
    { labelKey: "sidebar_reports", href: "/tableau-de-bord/rapports", icon: BarChart3 },
    { labelKey: "sidebar_planning", href: "/tableau-de-bord/planification", icon: Calendar },
    { labelKey: "sidebar_layers", href: "/tableau-de-bord/calques", icon: Layers },
];

const NAV_ITEMS_SECONDARY: NavItem[] = [
    { labelKey: "sidebar_scans", href: "/tableau-de-bord/analyses", icon: ScanLine },
    { labelKey: "sidebar_users", href: "/tableau-de-bord/utilisateurs", icon: Users, managerOnly: true },
    { labelKey: "sidebar_profile", href: "/tableau-de-bord/profil", icon: UserCircle },
];

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user } = useAuth();
    const { t } = useLanguage();
    const isManager = user?.role === "manager";

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-slate-900 border border-slate-700"
                aria-label="Ouvrir la navigation"
            >
                <Menu className="w-5 h-5 text-[#E2E8F0]" />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-[55] bg-black/40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={cn(
                    "fixed left-0 top-16 bottom-0 z-40 w-56 flex flex-col",
                    "bg-slate-900 border-r border-slate-700",
                    "transition-transform duration-300",
                    // Mobile: hidden unless open
                    "max-md:-translate-x-full",
                    mobileOpen && "max-md:translate-x-0 max-md:z-[58]",
                    className
                )}
            >
                {/* Mobile close button */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="md:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-800"
                    aria-label="Fermer la navigation"
                >
                    <X className="w-4 h-4 text-[#E2E8F0]" />
                </button>

                <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                    {NAV_ITEMS_PRIMARY.map(({ labelKey, href, icon: Icon }) => (
                        <NavLink
                            key={href}
                            to={href}
                            end={href === "/tableau-de-bord"}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                                    isActive
                                        ? "bg-indigo-600/20 text-indigo-400"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                                )
                            }
                        >
                            <Icon className="w-4.5 h-4.5 shrink-0" />
                            <span>{t(labelKey)}</span>
                        </NavLink>
                    ))}

                    {/* Separator */}
                    <div className="my-2 h-px w-full bg-slate-700" />

                    {NAV_ITEMS_SECONDARY.map(({ labelKey, href, icon: Icon, managerOnly }) => {
                        if (managerOnly && !isManager) return null;
                        return (
                            <NavLink
                                key={href}
                                to={href}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                                        isActive
                                            ? "bg-[#6366F1] text-white shadow-none"
                                            : "text-[#94A3B8] hover:bg-[#6366F1]/10 hover:text-[#6366F1]"
                                    )
                                }
                            >
                                <Icon className="w-4.5 h-4.5 shrink-0" />
                                <span>{t(labelKey)}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Bottom branding */}
                <div className="px-4 pb-5">
                    <div className="rounded-xl bg-[#6366F1]/8 p-3 text-center">
                        <p className="text-xs text-[#94A3B8]/50 font-medium">Observatoire 360</p>
                        <p className="text-[10px] text-[#94A3B8]/30 mt-0.5">v1.0.0</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
