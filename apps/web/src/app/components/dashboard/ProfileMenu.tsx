import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useAuth } from "@/app/hooks/useAuth";
import { ROLE_LABELS } from "@observatoire360/shared";

export function ProfileMenu() {
    const { user, logout } = useAuth();

    const name = user?.name ?? "Utilisateur";
    const role = user?.role ? ROLE_LABELS[user.role] : "Inspecteur";
    const municipality = user?.municipalityName
        ? `Municipalité de ${user.municipalityName}`
        : "Municipalité";

    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none">
                    <div className="w-8 h-8 rounded-full bg-[#1A2332] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {initials}
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-tight">
                        <span className="text-sm font-semibold text-[#1A2332] leading-none">{name}</span>
                        <span className="text-xs text-[#2A3A4E]/50 leading-none mt-0.5">{role}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#2A3A4E]/50 hidden sm:block" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal pb-0">
                    <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-semibold text-[#1A2332]">{name}</p>
                        <p className="text-xs text-[#2A3A4E]/50">{role}</p>
                        <p className="text-xs text-[#2A3A4E]/40">{municipality}</p>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link to="/tableau-de-bord/parametres" className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-[#2A3A4E]/50" />
                        Paramètres
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link to="/profil" className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#2A3A4E]/50" />
                        Mon profil
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onSelect={() => logout()}
                >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
