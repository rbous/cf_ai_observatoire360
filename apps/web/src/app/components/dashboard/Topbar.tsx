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

const SECTOR_OPTIONS = [
    "Tous les secteurs",
    "Secteur Nord",
    "Secteur Sud",
    "Secteur Est",
    "Secteur Ouest",
    "Centre-ville",
];

const STATUS_OPTIONS = [
    "Tous les statuts",
    "À analyser",
    "À inspecter",
    "En cours",
    "Infraction confirmée",
    "Clôturée",
];

export function Topbar({
    onNotificationToggle,
}: TopbarProps) {
    const { user } = useAuth();
    const municipalityName = user?.municipalityName
        ? `Municipalité de ${user.municipalityName}`
        : "Chargement...";

    const [selectedSector, setSelectedSector] = useState("Tous les secteurs");
    const [selectedStatus, setSelectedStatus] = useState("Tous les statuts");
    const { unreadCount } = useNotifications();
    const { locale, setLocale } = useLanguage();

    const toggleLocale = () => setLocale(locale === "fr" ? "en" : "fr");

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white shadow-sm border-b border-gray-200 flex items-center px-4 gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#008B8B] flex items-center justify-center">
                    <span className="text-white font-black text-sm">O</span>
                </div>
                <span className="font-black text-base text-[#1A2332] hidden md:block">
                    Observatoire <span className="text-[#008B8B]">360</span>
                </span>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block" />

            {/* Municipality name */}
            <div className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-[#2A3A4E]/70 min-w-0">
                <span className="truncate">{municipalityName}</span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Filters */}
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-[#2A3A4E] hover:bg-gray-50 transition-colors">
                            <Filter className="w-3.5 h-3.5 text-[#008B8B]" />
                            <span className="max-w-[100px] truncate">{selectedSector}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-[#2A3A4E]/40" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Secteur</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {SECTOR_OPTIONS.map((sector) => (
                            <DropdownMenuItem
                                key={sector}
                                onSelect={() => setSelectedSector(sector)}
                                className={selectedSector === sector ? "text-[#008B8B] font-semibold" : ""}
                            >
                                {sector}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-[#2A3A4E] hover:bg-gray-50 transition-colors">
                            <span className="max-w-[110px] truncate">{selectedStatus}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-[#2A3A4E]/40" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Statut</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {STATUS_OPTIONS.map((status) => (
                            <DropdownMenuItem
                                key={status}
                                onSelect={() => setSelectedStatus(status)}
                                className={selectedStatus === status ? "text-[#008B8B] font-semibold" : ""}
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
                className="px-2.5 py-1 rounded-full border border-gray-200 text-xs font-bold text-[#2A3A4E] hover:border-[#008B8B] hover:text-[#008B8B] transition-colors tracking-wide"
                aria-label="Toggle language"
            >
                {locale === "fr" ? "FR" : "EN"}
            </button>

            {/* Notification bell */}
            <button
                onClick={onNotificationToggle}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-[#1A2332]" />
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
