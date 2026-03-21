import { useState } from "react";
import { Calendar, Clock, AlertCircle, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/cn";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"] as const;
type Day = (typeof DAYS)[number];

const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

interface Inspection {
    id: string;
    alertId: string;
    address: string;
    inspector: string;
    day: Day;
    time: string;
    scheduled: boolean;
}

const MOCK_INSPECTIONS: Inspection[] = [
    { id: "INS-001", alertId: "ALT-001", address: "45 Rue Bowen", inspector: "Jean Bouchard", day: "Lundi", time: "09:00", scheduled: true },
    { id: "INS-002", alertId: "ALT-002", address: "12 Ave du Plateau", inspector: "Marie Tremblay", day: "Mardi", time: "10:00", scheduled: true },
    { id: "INS-003", alertId: "ALT-004", address: "33 Rue Wellington N", inspector: "Jean Bouchard", day: "Mercredi", time: "14:00", scheduled: true },
    { id: "INS-004", alertId: "ALT-005", address: "201 Chemin Godin", inspector: "Marie Tremblay", day: "Jeudi", time: "11:00", scheduled: true },
    { id: "INS-005", alertId: "ALT-003", address: "789 Blvd Portland", inspector: "Pierre Gagnon", day: "Vendredi", time: "09:00", scheduled: true },
];

const UNSCHEDULED = [
    { id: "ALT-007", address: "56 Rue du Roi", risk: "high" as const, date: "2026-03-17" },
    { id: "ALT-008", address: "22 Chemin des Pins", risk: "medium" as const, date: "2026-03-16" },
];

const RISK_COLORS = { high: "text-red-600 bg-red-50", medium: "text-amber-600 bg-amber-50", low: "text-green-600 bg-green-50" };

export function PlanningView() {
    const [selectedCell, setSelectedCell] = useState<{ day: Day; time: string } | null>(null);

    const thisWeekCount = MOCK_INSPECTIONS.length;
    const overdueCount = UNSCHEDULED.filter((u) => u.risk === "high").length;

    function getInspection(day: Day, time: string): Inspection | undefined {
        return MOCK_INSPECTIONS.find((i) => i.day === day && i.time === time);
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
                                <p className="text-2xl font-black text-[#008B8B]">{thisWeekCount}</p>
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
                                <p className="text-2xl font-black text-[#DC2626]">{overdueCount}</p>
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
                                <p className="text-2xl font-black text-[#1A2332]">3</p>
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
                                                                <p className="text-[10px] text-[#2A3A4E]/60 truncate leading-tight">{insp.address}</p>
                                                                <p className="text-[9px] text-[#2A3A4E]/40 leading-tight mt-0.5">{insp.inspector.split(" ")[0]}</p>
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
                            {UNSCHEDULED.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-[#008B8B]">{item.id}</span>
                                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", RISK_COLORS[item.risk])}>
                                            {item.risk === "high" ? "Élevé" : item.risk === "medium" ? "Moyen" : "Faible"}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-1.5">
                                        <MapPin className="w-3 h-3 text-[#2A3A4E]/40 shrink-0 mt-0.5" />
                                        <p className="text-xs text-[#2A3A4E]/70 leading-snug">{item.address}</p>
                                    </div>
                                    <p className="text-[10px] text-[#2A3A4E]/40 mt-1">Détecté le {item.date}</p>
                                    <Button size="sm" variant="outline" className="mt-2 w-full h-7 text-xs">
                                        Planifier
                                    </Button>
                                </div>
                            ))}
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
                                            {getInspection(selectedCell.day, selectedCell.time)?.address}
                                        </p>
                                        <p>{getInspection(selectedCell.day, selectedCell.time)?.inspector}</p>
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
