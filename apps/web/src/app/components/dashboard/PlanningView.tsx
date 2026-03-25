import { useState } from "react";
import { Calendar, Clock, AlertCircle, MapPin, User, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/cn";
import { useInspections } from "@/app/hooks/useInspections";
import { useLanguage } from "@/app/hooks/useLanguage";
import type { Inspection } from "@observatoire360/shared";

const RISK_COLORS = { high: "text-red-600 bg-red-50", medium: "text-amber-600 bg-amber-50", low: "text-green-600 bg-green-50" };

const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

/** Extract HH:MM from an ISO date string */
function toTimeSlot(dateStr: string): string {
    const d = new Date(dateStr);
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    // Snap to nearest TIME_SLOTS value
    const hm = `${h}:${m}`;
    return TIME_SLOTS.includes(hm) ? hm : `${h}:00`;
}

export function PlanningView() {
    const { t } = useLanguage();

    // Day labels and mapping — defined inside the component to use t()
    const DAYS = [
        t("planning_day_monday"),
        t("planning_day_tuesday"),
        t("planning_day_wednesday"),
        t("planning_day_thursday"),
        t("planning_day_friday"),
    ] as const;

    type Day = typeof DAYS[number];

    // Maps JS getDay() (0=Sun, 1=Mon, ..., 5=Fri, 6=Sat) to translated day labels
    const DAY_INDEX_MAP: Record<number, Day> = {
        1: DAYS[0],
        2: DAYS[1],
        3: DAYS[2],
        4: DAYS[3],
        5: DAYS[4],
    };

    const [selectedCell, setSelectedCell] = useState<{ day: Day; time: string } | null>(null);

    // All inspections for the calendar (scheduled ones)
    const { inspections: allInspections, isLoading: isLoadingAll } = useInspections();

    // Unscheduled = status "planned" (awaiting scheduling)
    const { inspections: plannedInspections, isLoading: isLoadingPlanned } = useInspections({ status: "planned" });

    const isLoading = isLoadingAll || isLoadingPlanned;

    /** Extract weekday label from an ISO date string */
    function toDayName(dateStr: string): Day | null {
        const d = new Date(dateStr);
        return DAY_INDEX_MAP[d.getDay()] ?? null;
    }

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
                <h1 className="text-xl font-black uppercase text-[#E2E8F0]">{t("planning_title")}</h1>
                <p className="text-sm text-[#94A3B8]/60 mt-0.5">{t("planning_week")}</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-[#94A3B8]/60 font-medium">{t("planning_this_week")}</p>
                                <p className="text-2xl font-black text-[#137fec]">
                                    {isLoading ? "…" : thisWeekCount}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-[#137fec]/10 flex items-center justify-center">
                                <Calendar className="w-4.5 h-4.5 text-[#137fec]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-[#94A3B8]/60 font-medium">{t("planning_unscheduled")}</p>
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
                                <p className="text-xs text-[#94A3B8]/60 font-medium">{t("planning_inspectors")}</p>
                                <p className="text-2xl font-black text-[#E2E8F0]">
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
                                <p className="text-xs text-[#94A3B8]/60 font-medium">{t("planning_avg_duration")}</p>
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
                        <CardTitle className="text-sm font-bold text-[#E2E8F0] flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#137fec]" />
                            {t("planning_calendar")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32 gap-2 text-[#94A3B8]/40">
                                <Loader2 className="w-4 h-4 animate-spin text-[#137fec]" />
                                <span className="text-xs">{t("planning_loading")}</span>
                            </div>
                        ) : (
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr>
                                        <th className="w-16 text-left pb-2">
                                            <span className="text-[10px] text-[#94A3B8]/40 font-semibold uppercase tracking-wide">{t("planning_hour")}</span>
                                        </th>
                                        {DAYS.map((day) => (
                                            <th key={day} className="pb-2 text-center">
                                                <span className="text-xs font-bold text-[#E2E8F0]">{day}</span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {TIME_SLOTS.map((time) => (
                                        <tr key={time} className="border-t border-gray-50">
                                            <td className="py-1.5 pr-3">
                                                <span className="text-[10px] text-[#94A3B8]/40 font-mono">{time}</span>
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
                                                                    ? "bg-[#137fec]/10 border-[#137fec]/30 hover:bg-[#137fec]/15"
                                                                    : isSelected
                                                                    ? "bg-[#137fec]/5 border-[#137fec]/50 border-dashed"
                                                                    : "bg-slate-950 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
                                                            )}
                                                        >
                                                            {insp ? (
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-[#137fec] leading-tight">{insp.alertId}</p>
                                                                    <p className="text-[10px] text-[#94A3B8]/60 truncate leading-tight">
                                                                        {insp.id}
                                                                    </p>
                                                                    <p className="text-[9px] text-[#94A3B8]/40 leading-tight mt-0.5">
                                                                        {insp.inspectorId.slice(0, 8)}
                                                                    </p>
                                                                </div>
                                                            ) : isSelected ? (
                                                                <p className="text-[10px] text-[#137fec]/60 font-medium">{t("planning_add")}</p>
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
                            <CardTitle className="text-sm font-bold text-[#E2E8F0] flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                {t("planning_to_schedule")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {isLoadingPlanned ? (
                                <div className="flex items-center justify-center h-16 gap-2 text-[#94A3B8]/40">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#137fec]" />
                                    <span className="text-xs">{t("planning_loading")}</span>
                                </div>
                            ) : plannedInspections.length === 0 ? (
                                <p className="text-xs text-[#94A3B8]/40 text-center py-4">{t("planning_no_inspections")}</p>
                            ) : (
                                plannedInspections.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-[#137fec]">{item.alertId}</span>
                                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", RISK_COLORS.high)}>
                                                {t("planning_planned")}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-1.5">
                                            <MapPin className="w-3 h-3 text-[#94A3B8]/40 shrink-0 mt-0.5" />
                                            <p className="text-xs text-[#94A3B8]/70 leading-snug">{item.id}</p>
                                        </div>
                                        <p className="text-[10px] text-[#94A3B8]/40 mt-1">
                                            {t("planning_created_on")} {new Date(item.createdAt).toLocaleDateString("fr-CA")}
                                        </p>
                                        <Button size="sm" variant="outline" className="mt-2 w-full h-7 text-xs">
                                            {t("planning_schedule")}
                                        </Button>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Selected cell detail */}
                    {selectedCell && (
                        <Card className="border-[#137fec]/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold text-[#137fec]">
                                    {selectedCell.day} {t("planning_at")} {selectedCell.time}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {getInspection(selectedCell.day, selectedCell.time) ? (
                                    <div className="text-xs text-[#94A3B8]/70">
                                        <p className="font-semibold text-[#E2E8F0] mb-1">
                                            {t("planning_alert")} {getInspection(selectedCell.day, selectedCell.time)?.alertId}
                                        </p>
                                        <p>{t("planning_inspector")} {getInspection(selectedCell.day, selectedCell.time)?.inspectorId}</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#94A3B8]/50">{t("planning_free_slot")}</p>
                                )}
                                <Button size="sm" className="w-full h-7 text-xs">
                                    {getInspection(selectedCell.day, selectedCell.time) ? t("planning_edit") : t("planning_add")}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
