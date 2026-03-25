import { useState } from "react";
import { Bell, Filter, ChevronDown } from "lucide-react";
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
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900 shadow-none border-b border-slate-700 flex items-center px-4 gap-3">
            {/* Logo — links to home */}
            <a href="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center">
                    <span className="text-white font-black text-sm">O</span>
                </div>
                <span className="font-black text-base text-[#E2E8F0] hidden md:block">
                    Observatoire <span className="text-[#6366F1]">360</span>
                </span>
            </a>

            <div className="w-px h-6 bg-slate-700 mx-1 hidden md:block" />

            {/* Municipality name */}
            <div className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-[#94A3B8]/70 min-w-0">
                <span className="truncate">{municipalityName}</span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Filters */}
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-[#94A3B8] hover:bg-slate-950 transition-colors">
                            <Filter className="w-3.5 h-3.5 text-[#6366F1]" />
                            <span className="max-w-[100px] truncate">{SECTOR_OPTIONS[selectedSector]}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]/40" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>{t("topbar_sector_label")}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {SECTOR_OPTIONS.map((sector, index) => (
                            <DropdownMenuItem
                                key={index}
                                onSelect={() => setSelectedSector(index)}
                                className={selectedSector === index ? "text-[#6366F1] font-semibold" : ""}
                            >
                                {sector}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-[#94A3B8] hover:bg-slate-950 transition-colors">
                            <span className="max-w-[110px] truncate">{STATUS_OPTIONS[selectedStatus]}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]/40" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>{t("topbar_status_label")}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {STATUS_OPTIONS.map((status, index) => (
                            <DropdownMenuItem
                                key={index}
                                onSelect={() => setSelectedStatus(index)}
                                className={selectedStatus === index ? "text-[#6366F1] font-semibold" : ""}
                            >
                                {status}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Language toggle */}
            <button
                onClick={toggleLocale}
                className="px-2.5 py-1 rounded-full border border-slate-700 text-xs font-bold text-[#94A3B8] hover:border-[#6366F1] hover:text-[#6366F1] transition-colors tracking-wide"
                aria-label="Toggle language"
            >
                {locale === "fr" ? "FR" : "EN"}
            </button>

            {/* Notification bell */}
            <button
                onClick={onNotificationToggle}
                className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label={t("notifications_title")}
            >
                <Bell className="w-5 h-5 text-[#E2E8F0]" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[#DC2626] text-white text-[10px] font-bold px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Profile */}
            <ProfileMenu />
        </header>
    );
}
