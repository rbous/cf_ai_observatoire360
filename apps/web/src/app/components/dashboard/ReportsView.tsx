import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { FileText, AlertTriangle, TrendingUp, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import type { ReportStats } from "@observatoire360/shared";
import { ALERT_TYPE_LABELS, RISK_LEVEL_LABELS } from "@observatoire360/shared";
import { useApi } from "@/app/hooks/useApi";

// Color maps for pie chart types and risk levels
const TYPE_COLORS: Record<string, string> = {
    construction: "#008B8B",
    extension: "#D4A843",
    annexe: "#6366F1",
    piscine: "#10B981",
};

const RISK_COLORS: Record<string, string> = {
    low: "#10B981",
    medium: "#F59E0B",
    high: "#DC2626",
};

export function ReportsView() {
    const { data: stats, isLoading, error } = useApi<ReportStats>("/reports/stats");

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 flex items-center justify-center min-h-[300px]">
                <div className="flex items-center gap-3 text-[#2A3A4E]/60">
                    <Loader2 className="w-5 h-5 animate-spin text-[#008B8B]" />
                    <span className="text-sm font-medium">Chargement des statistiques…</span>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="p-4 md:p-6">
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{error ?? "Impossible de charger les statistiques."}</span>
                </div>
            </div>
        );
    }

    const kpiCards = [
        {
            label: "Total alertes",
            value: String(stats.totalAlerts),
            icon: AlertTriangle,
            color: "#008B8B",
            bg: "#008B8B15",
        },
        {
            label: "Infractions confirmées",
            value: String(stats.confirmedInfractions),
            icon: FileText,
            color: "#DC2626",
            bg: "#DC262615",
        },
        {
            label: "Taux de régularisation",
            value: `${Math.round(stats.regularizationRate)} %`,
            icon: TrendingUp,
            color: "#10B981",
            bg: "#10B98115",
        },
        {
            label: "Inspections complétées",
            value: String(stats.inspectionsDone),
            icon: CheckCircle,
            color: "#D4A843",
            bg: "#D4A84315",
        },
    ];

    const byTypeData = stats.alertsByType.map((entry) => ({
        name: ALERT_TYPE_LABELS[entry.type] ?? entry.type,
        value: entry.count,
        color: TYPE_COLORS[entry.type] ?? "#6366F1",
    }));

    const byRiskData = stats.alertsByRiskLevel.map((entry) => ({
        level: RISK_LEVEL_LABELS[entry.level] ?? entry.level,
        count: entry.count,
        fill: RISK_COLORS[entry.level] ?? "#6366F1",
    }));

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-xl font-black uppercase text-[#1A2332]">Rapports & Statistiques</h1>
                <p className="text-sm text-[#2A3A4E]/60 mt-0.5">Vue d'ensemble du territoire — Municipalité de Sherbrooke</p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <Card key={kpi.label}>
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-[#2A3A4E]/60 font-medium">{kpi.label}</p>
                                        <p className="text-2xl font-black mt-0.5" style={{ color: kpi.color }}>
                                            {kpi.value}
                                        </p>
                                    </div>
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ background: kpi.bg }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Line chart — détections par mois */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-[#1A2332]">
                        Détections par mois (12 derniers mois)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={stats.alertsByMonth} margin={{ top: 8, right: 20, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                formatter={(val: number) => [`${val} alerte(s)`, "Détections"]}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#008B8B"
                                strokeWidth={2.5}
                                dot={{ fill: "#008B8B", r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Pie + Bar charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie — by type */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-[#1A2332]">Détections par type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={byTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={75}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {byTypeData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                    formatter={(val: number) => [`${val} alertes`, ""]}
                                />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value) => <span style={{ fontSize: 11, color: "#374151" }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Bar — by risk level */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-[#1A2332]">Détections par niveau de risque</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={byRiskData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="level" tick={{ fontSize: 11, fill: "#6b7280" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                    formatter={(val: number) => [`${val} alertes`, "Détections"]}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {byRiskData.map((entry) => (
                                        <Cell key={entry.level} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
