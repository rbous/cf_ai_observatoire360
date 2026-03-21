import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import type { RiskLevel, AlertStatus, AlertType } from "@observatoire360/shared";
import {
    ALERT_STATUS_LABELS,
    ALERT_TYPE_LABELS,
    RISK_LEVEL_LABELS,
} from "@observatoire360/shared";
import { RiskBadge } from "@/app/components/shared/RiskBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { cn } from "@/app/lib/cn";

interface AlertItem {
    id: string;
    address: string;
    type: AlertType;
    riskLevel: RiskLevel;
    riskScore: number;
    status: AlertStatus;
    detectedAt: string;
}

const MOCK_ALERTS: AlertItem[] = [
    {
        id: "ALT-001",
        address: "45 Rue Bowen, Sherbrooke",
        type: "construction",
        riskLevel: "high",
        riskScore: 92,
        status: "a_inspecter",
        detectedAt: "2026-03-19",
    },
    {
        id: "ALT-004",
        address: "33 Rue Wellington N",
        type: "piscine",
        riskLevel: "high",
        riskScore: 88,
        status: "infraction_confirmee",
        detectedAt: "2026-03-15",
    },
    {
        id: "ALT-002",
        address: "12 Ave du Plateau",
        type: "extension",
        riskLevel: "medium",
        riskScore: 64,
        status: "a_analyser",
        detectedAt: "2026-03-18",
    },
    {
        id: "ALT-005",
        address: "201 Chemin Godin",
        type: "extension",
        riskLevel: "medium",
        riskScore: 58,
        status: "a_analyser",
        detectedAt: "2026-03-17",
    },
    {
        id: "ALT-003",
        address: "789 Blvd Portland",
        type: "annexe",
        riskLevel: "low",
        riskScore: 31,
        status: "en_cours",
        detectedAt: "2026-03-16",
    },
    {
        id: "ALT-006",
        address: "56 Rue du Roi",
        type: "construction",
        riskLevel: "low",
        riskScore: 22,
        status: "cloturee",
        detectedAt: "2026-03-12",
    },
];

const ALL_OPTION = "all";

export function AlertList() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<AlertStatus | "all">(ALL_OPTION);
    const [filterRisk, setFilterRisk] = useState<RiskLevel | "all">(ALL_OPTION);
    const [filterType, setFilterType] = useState<AlertType | "all">(ALL_OPTION);

    const filtered = MOCK_ALERTS.filter((a) => {
        const matchSearch = search === "" || a.address.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === ALL_OPTION || a.status === filterStatus;
        const matchRisk = filterRisk === ALL_OPTION || a.riskLevel === filterRisk;
        const matchType = filterType === ALL_OPTION || a.type === filterType;
        return matchSearch && matchStatus && matchRisk && matchType;
    }).sort((a, b) => b.riskScore - a.riskScore);

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-bold text-[#1A2332]">
                        Alertes{" "}
                        <span className="text-[#008B8B] font-black">{filtered.length}</span>
                    </h2>
                    <SlidersHorizontal className="w-4 h-4 text-[#2A3A4E]/40" />
                </div>

                {/* Search */}
                <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#2A3A4E]/40" />
                    <input
                        type="text"
                        placeholder="Chercher une adresse…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#008B8B] focus:border-[#008B8B] text-[#1A2332] placeholder:text-[#2A3A4E]/40"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-1.5 flex-wrap">
                    <select
                        value={filterRisk}
                        onChange={(e) => setFilterRisk(e.target.value as RiskLevel | "all")}
                        className="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-[#2A3A4E] focus:outline-none focus:ring-1 focus:ring-[#008B8B]"
                    >
                        <option value={ALL_OPTION}>Tous risques</option>
                        {(["high", "medium", "low"] as RiskLevel[]).map((r) => (
                            <option key={r} value={r}>{RISK_LEVEL_LABELS[r]}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as AlertStatus | "all")}
                        className="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-[#2A3A4E] focus:outline-none focus:ring-1 focus:ring-[#008B8B]"
                    >
                        <option value={ALL_OPTION}>Tous statuts</option>
                        {(["a_analyser", "a_inspecter", "en_cours", "infraction_confirmee", "cloturee"] as AlertStatus[]).map((s) => (
                            <option key={s} value={s}>{ALERT_STATUS_LABELS[s]}</option>
                        ))}
                    </select>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as AlertType | "all")}
                        className="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-[#2A3A4E] focus:outline-none focus:ring-1 focus:ring-[#008B8B]"
                    >
                        <option value={ALL_OPTION}>Tous types</option>
                        {(["construction", "extension", "annexe", "piscine"] as AlertType[]).map((t) => (
                            <option key={t} value={t}>{ALERT_TYPE_LABELS[t]}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Alert items */}
            <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-xs text-[#2A3A4E]/40">
                        Aucune alerte trouvée
                    </div>
                ) : (
                    filtered.map((alert) => (
                        <button
                            key={alert.id}
                            onClick={() => navigate(`/tableau-de-bord/alertes/${alert.id}`)}
                            className={cn(
                                "w-full flex flex-col gap-1.5 px-4 py-3 text-left",
                                "border-b border-gray-50 hover:bg-gray-50 transition-colors",
                                "focus:outline-none focus:bg-[#008B8B]/5"
                            )}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-[#008B8B]">{alert.id}</span>
                                <RiskBadge level={alert.riskLevel} />
                            </div>
                            <p className="text-xs font-semibold text-[#1A2332] leading-snug">{alert.address}</p>
                            <div className="flex items-center justify-between gap-2">
                                <StatusBadge status={alert.status} />
                                <span className="text-[10px] text-[#2A3A4E]/40">{alert.detectedAt}</span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
