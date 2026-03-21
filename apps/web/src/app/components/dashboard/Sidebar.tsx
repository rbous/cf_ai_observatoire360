import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Map, BarChart3, Calendar, Layers, Menu, X } from "lucide-react";
import { cn } from "@/app/lib/cn";

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
    { label: "Carte", href: "/tableau-de-bord", icon: Map },
    { label: "Rapport et Stat", href: "/tableau-de-bord/rapports", icon: BarChart3 },
    { label: "Planification", href: "/tableau-de-bord/planification", icon: Calendar },
    { label: "Calques", href: "/tableau-de-bord/calques", icon: Layers },
];

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-white shadow-md border border-gray-200"
                aria-label="Ouvrir la navigation"
            >
                <Menu className="w-5 h-5 text-[#1A2332]" />
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
                    "bg-gradient-to-b from-[#E8F4FD] to-white border-r border-gray-200",
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
                    className="md:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100"
                    aria-label="Fermer la navigation"
                >
                    <X className="w-4 h-4 text-[#1A2332]" />
                </button>

                <nav className="flex-1 px-3 py-5 space-y-1">
                    {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                        <NavLink
                            key={href}
                            to={href}
                            end={href === "/tableau-de-bord"}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                                    isActive
                                        ? "bg-[#008B8B] text-white shadow-sm"
                                        : "text-[#2A3A4E] hover:bg-[#008B8B]/10 hover:text-[#008B8B]"
                                )
                            }
                        >
                            <Icon className="w-4.5 h-4.5 shrink-0" />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom branding */}
                <div className="px-4 pb-5">
                    <div className="rounded-xl bg-[#008B8B]/8 p-3 text-center">
                        <p className="text-xs text-[#2A3A4E]/50 font-medium">Observatoire 360</p>
                        <p className="text-[10px] text-[#2A3A4E]/30 mt-0.5">v1.0.0</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
