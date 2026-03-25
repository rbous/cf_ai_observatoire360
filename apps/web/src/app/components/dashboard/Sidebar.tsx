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
                className="md:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-[#0F172A] border border-slate-700"
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
                    "fixed left-0 top-14 bottom-0 z-40 w-48 flex flex-col",
                    "bg-[#0F172A] border-r border-slate-800",
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

                <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
                    {NAV_ITEMS_PRIMARY.map(({ labelKey, href, icon: Icon }) => (
                        <NavLink
                            key={href}
                            to={href}
                            end={href === "/tableau-de-bord"}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative",
                                    isActive
                                        ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-400 pl-[10px]"
                                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-300"
                                )
                            }
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{t(labelKey)}</span>
                        </NavLink>
                    ))}

                    {/* Separator */}
                    <div className="my-3 h-px w-full bg-slate-800" />

                    {NAV_ITEMS_SECONDARY.map(({ labelKey, href, icon: Icon, managerOnly }) => {
                        if (managerOnly && !isManager) return null;
                        return (
                            <NavLink
                                key={href}
                                to={href}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative",
                                        isActive
                                            ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-400 pl-[10px]"
                                            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-300"
                                    )
                                }
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{t(labelKey)}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Bottom version text */}
                <div className="px-4 pb-4">
                    <p className="text-[10px] text-slate-600 font-medium">v1.0.0</p>
                </div>
            </aside>
        </>
    );
}
