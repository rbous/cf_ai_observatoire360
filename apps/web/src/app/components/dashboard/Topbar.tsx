import { useState } from "react";
import { Bell, ChevronDown, MapPin } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { ProfileMenu } from "./ProfileMenu";
import { useNotifications } from "@/app/hooks/useNotifications";
import { useAuth } from "@/app/hooks/useAuth";
import { useLanguage } from "@/app/hooks/useLanguage";

interface TopbarProps {
    onNotificationToggle?: () => void;
}

export function Topbar({
    onNotificationToggle,
}: TopbarProps) {
    const { user } = useAuth();
    const { t, locale, setLocale } = useLanguage();

    const municipalityName = user?.municipalityName
        ? `${t("topbar_municipality_of")} ${user.municipalityName}`
        : t("loading");

    const SECTOR_OPTIONS = [
        t("topbar_all_sectors"),
        t("topbar_sector_north"),
        t("topbar_sector_south"),
        t("topbar_sector_east"),
        t("topbar_sector_west"),
        t("topbar_sector_downtown"),
    ];

    const STATUS_OPTIONS = [
        t("topbar_all_statuses"),
        t("status_a_analyser"),
        t("status_a_inspecter"),
        t("status_en_cours"),
        t("status_infraction_confirmee"),
        t("status_cloturee"),
    ];

    const [selectedSector, setSelectedSector] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState(0);
    const { unreadCount } = useNotifications();

    const toggleLocale = () => setLocale(locale === "fr" ? "en" : "fr");

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0F172A] border-b border-slate-700 flex items-center px-4 gap-3">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
                <div className="w-7 h-7 rounded-full bg-[#137fec] flex items-center justify-center">
                    <span className="text-white font-black text-xs">O</span>
                </div>
                <span className="font-black text-sm text-[#E2E8F0] hidden md:block leading-none">
                    Observatoire <span className="text-[#137fec]">360</span>
                </span>
            </a>

            <div className="w-px h-5 bg-slate-700 mx-1 hidden md:block" />

            {/* Municipality name */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] min-w-0">
                <MapPin className="w-3 h-3 text-[#137fec] shrink-0" />
                <span className="truncate">{municipalityName}</span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Sector filter dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs text-[#94A3B8] hover:bg-slate-800 transition-colors">
                        <span className="max-w-[90px] truncate">{SECTOR_OPTIONS[selectedSector]}</span>
                        <ChevronDown className="w-3 h-3 text-[#94A3B8]/40 shrink-0" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel className="text-xs">{t("topbar_sector_label")}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {SECTOR_OPTIONS.map((sector, index) => (
                        <DropdownMenuItem
                            key={index}
                            onSelect={() => setSelectedSector(index)}
                            className={selectedSector === index ? "text-[#137fec] font-semibold text-xs" : "text-xs"}
                        >
                            {sector}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Status filter dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs text-[#94A3B8] hover:bg-slate-800 transition-colors">
                        <span className="max-w-[100px] truncate">{STATUS_OPTIONS[selectedStatus]}</span>
                        <ChevronDown className="w-3 h-3 text-[#94A3B8]/40 shrink-0" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs">{t("topbar_status_label")}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {STATUS_OPTIONS.map((status, index) => (
                        <DropdownMenuItem
                            key={index}
                            onSelect={() => setSelectedStatus(index)}
                            className={selectedStatus === index ? "text-[#137fec] font-semibold text-xs" : "text-xs"}
                        >
                            {status}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Language toggle */}
            <button
                onClick={toggleLocale}
                className="px-2 py-1 rounded-full border border-slate-700 text-[11px] font-bold text-[#94A3B8] hover:border-[#137fec] hover:text-[#137fec] transition-colors tracking-wider"
                aria-label="Toggle language"
            >
                {locale === "fr" ? "FR" : "EN"}
            </button>

            {/* Notification bell */}
            <button
                onClick={onNotificationToggle}
                className="relative p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label={t("notifications_title")}
            >
                <Bell className="w-4 h-4 text-[#E2E8F0]" />
                {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 flex items-center justify-center rounded-full bg-[#DC2626] text-white text-[9px] font-bold px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Profile */}
            <ProfileMenu />
        </header>
    );
}
