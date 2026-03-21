import { useState } from "react";
import { Calendar, Clock, AlertCircle, MapPin, User, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/cn";
import { useInspections } from "@/app/hooks/useInspections";
import type { Inspection } from "@observatoire360/shared";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"] as const;
type Day = (typeof DAYS)[number];

// Maps JS getDay() (0=Sun, 1=Mon, ..., 5=Fri, 6=Sat) to French day labels
const DAY_INDEX_MAP: Record<number, Day> = {
    1: "Lundi",
    2: "Mardi",
    3: "Mercredi",
    4: "Jeudi",
    5: "Vendredi",
};

const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

const RISK_COLORS = { high: "text-red-600 bg-red-50", medium: "text-amber-600 bg-amber-50", low: "text-green-600 bg-green-50" };

/** Extract HH:MM from an ISO date string */
function toTimeSlot(dateStr: string): string {
    const d = new Date(dateStr);
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    // Snap to nearest TIME_SLOTS value
    const hm = `${h}:${m}`;
    return TIME_SLOTS.includes(hm) ? hm : `${h}:00`;
}

/** Extract French weekday name from an ISO date string */
function toDayName(dateStr: string): Day | null {
    const d = new Date(dateStr);
    return DAY_INDEX_MAP[d.getDay()] ?? null;
}

export function PlanningView() {
    const [selectedCell, setSelectedCell] = useState<{ day: Day; time: string } | null>(null);

    // All inspections for the calendar (scheduled ones)
    const { inspections: allInspections, isLoading: isLoadingAll } = useInspections();

    // Unscheduled = status "planned" (awaiting scheduling)
    const { inspections: plannedInspections, isLoading: isLoadingPlanned } = useInspections({ status: "planned" });

    const isLoading = isLoadingAll || isLoadingPlanned;

    // Scheduled inspections are those with a scheduledDate that falls Mon–Fri
    const scheduledInspections = allInspections.filter((i) => {
        const day = toDayName(i.scheduledDate);
        return day !== null && i.status !== "cancelled";
    });

    const thisWeekCount = scheduledInspections.length;
    const overdueCount = plannedInspections.length;

    // Count unique inspectors
    const uniqueInspectors = new Set(scheduledInspections.map((i) => i.inspectorId)).size;

    function getInspection(day: Day, time: string): Inspection | undefined {
        return scheduledInspections.find((i) => {
            return toDayName(i.scheduledDate) === day && toTimeSlot(i.scheduledDate) === time;
        });
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-full">
            <div>
                <h1 className="text-xl font-black uppercase text-[#1A2332]">Planification</h1>
                <p className="text-sm text-[#2A3A4E]/60 mt-0.5">Semaine du 18 au 22 mars 2026</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-[#2A3A4E]/60 font-medium">Cette semaine</p>
                                <p className="text-2xl font-black text-[#008B8B]">
                                    {isLoading ? "…" : thisWeekCount}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-[#008B8B]/10 flex items-center justify-center">
                                <Calendar className="w-4.5 h-4.5 text-[#008B8B]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-[#2A3A4E]/60 font-medium">Non planifiées</p>
                                <p className="text-2xl font-black text-[#DC2626]">
                                    {isLoading ? "…" : overdueCount}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                                <AlertCircle className="w-4.5 h-4.5 text-red-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-[#2A3A4E]/60 font-medium">Inspecteurs</p>
                                <p className="text-2xl font-black text-[#1A2332]">
                                    {isLoading ? "…" : uniqueInspectors}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                                <User className="w-4.5 h-4.5 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-[#2A3A4E]/60 font-medium">Durée moy.</p>
                                <p className="text-2xl font-black text-[#D4A843]">45 min</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Clock className="w-4.5 h-4.5 text-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Weekly calendar */}
                <Card className="xl:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-[#1A2332] flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#008B8B]" />
                            Calendrier de la semaine
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32 gap-2 text-[#2A3A4E]/40">
                                <Loader2 className="w-4 h-4 animate-spin text-[#008B8B]" />
                                <span className="text-xs">Chargement…</span>
                            </div>
                        ) : (
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr>
                                        <th className="w-16 text-left pb-2">
                                            <span className="text-[10px] text-[#2A3A4E]/40 font-semibold uppercase tracking-wide">Heure</span>
                                        </th>
                                        {DAYS.map((day) => (
                                            <th key={day} className="pb-2 text-center">
                                                <span className="text-xs font-bold text-[#1A2332]">{day}</span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {TIME_SLOTS.map((time) => (
                                        <tr key={time} className="border-t border-gray-50">
                                            <td className="py-1.5 pr-3">
                                                <span className="text-[10px] text-[#2A3A4E]/40 font-mono">{time}</span>
                                            </td>
                                            {DAYS.map((day) => {
                                                const insp = getInspection(day, time);
                                                const isSelected = selectedCell?.day === day && selectedCell?.time === time;
                                                return (
                                                    <td key={day} className="py-1 px-1">
                                                        <div
                                                            onClick={() => setSelectedCell(isSelected ? null : { day, time })}
                                                            className={cn(
                                                                "min-h-[38px] rounded-lg border cursor-pointer transition-all text-left px-2 py-1",
                                                                insp
                                                                    ? "bg-[#008B8B]/10 border-[#008B8B]/30 hover:bg-[#008B8B]/15"
                                                                    : isSelected
                                                                    ? "bg-[#008B8B]/5 border-[#008B8B]/50 border-dashed"
                                                                    : "bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200"
                                                            )}
                                                        >
                                                            {insp ? (
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-[#008B8B] leading-tight">{insp.alertId}</p>
                                                                    <p className="text-[10px] text-[#2A3A4E]/60 truncate leading-tight">
                                                                        {insp.id}
                                                                    </p>
                                                                    <p className="text-[9px] text-[#2A3A4E]/40 leading-tight mt-0.5">
                                                                        {insp.inspectorId.slice(0, 8)}
                                                                    </p>
                                                                </div>
                                                            ) : isSelected ? (
                                                                <p className="text-[10px] text-[#008B8B]/60 font-medium">+ Ajouter</p>
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

                {/* Unscheduled inspections */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-[#1A2332] flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                À planifier
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {isLoadingPlanned ? (
                                <div className="flex items-center justify-center h-16 gap-2 text-[#2A3A4E]/40">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#008B8B]" />
                                    <span className="text-xs">Chargement…</span>
                                </div>
                            ) : plannedInspections.length === 0 ? (
                                <p className="text-xs text-[#2A3A4E]/40 text-center py-4">Aucune inspection à planifier</p>
                            ) : (
                                plannedInspections.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-[#008B8B]">{item.alertId}</span>
                                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", RISK_COLORS.high)}>
                                                Planifiée
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-1.5">
                                            <MapPin className="w-3 h-3 text-[#2A3A4E]/40 shrink-0 mt-0.5" />
                                            <p className="text-xs text-[#2A3A4E]/70 leading-snug">{item.id}</p>
                                        </div>
                                        <p className="text-[10px] text-[#2A3A4E]/40 mt-1">
                                            Créée le {new Date(item.createdAt).toLocaleDateString("fr-CA")}
                                        </p>
                                        <Button size="sm" variant="outline" className="mt-2 w-full h-7 text-xs">
                                            Planifier
                                        </Button>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Selected cell detail */}
                    {selectedCell && (
                        <Card className="border-[#008B8B]/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold text-[#008B8B]">
                                    {selectedCell.day} à {selectedCell.time}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {getInspection(selectedCell.day, selectedCell.time) ? (
                                    <div className="text-xs text-[#2A3A4E]/70">
                                        <p className="font-semibold text-[#1A2332] mb-1">
                                            Alerte : {getInspection(selectedCell.day, selectedCell.time)?.alertId}
                                        </p>
                                        <p>Inspecteur : {getInspection(selectedCell.day, selectedCell.time)?.inspectorId}</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#2A3A4E]/50">Créneau libre — cliquez pour assigner une alerte</p>
                                )}
                                <Button size="sm" className="w-full h-7 text-xs">
                                    {getInspection(selectedCell.day, selectedCell.time) ? "Modifier" : "Ajouter"}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
