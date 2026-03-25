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
import { useApi } from "@/app/hooks/useApi";
import { useLanguage } from "@/app/hooks/useLanguage";

// Color maps for pie chart types and risk levels
const TYPE_COLORS: Record<string, string> = {
    construction: "#137fec",
    extension: "#D4A843",
    annexe: "#137fec",
    piscine: "#10B981",
};

const RISK_COLORS: Record<string, string> = {
    low: "#10B981",
    medium: "#F59E0B",
    high: "#DC2626",
};

export function ReportsView() {
    const { data: stats, isLoading, error } = useApi<ReportStats>("/reports/stats");
    const { t } = useLanguage();

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 flex items-center justify-center min-h-[300px]">
                <div className="flex items-center gap-3 text-[#94A3B8]/60">
                    <Loader2 className="w-5 h-5 animate-spin text-[#137fec]" />
                    <span className="text-sm font-medium">{t("reports_loading")}</span>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="p-4 md:p-6">
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{error ?? t("reports_error")}</span>
                </div>
            </div>
        );
    }

    const ALERT_TYPE_LABELS_I18N: Record<string, string> = {
        construction: t("type_construction"),
        extension: t("type_extension"),
        annexe: t("type_annexe"),
        piscine: t("type_piscine"),
    };

    const RISK_LEVEL_LABELS_I18N: Record<string, string> = {
        high: t("risk_high"),
        medium: t("risk_medium"),
        low: t("risk_low"),
    };

    const kpiCards = [
        {
            label: t("reports_total_alerts"),
            value: String(stats.totalAlerts),
            icon: AlertTriangle,
            color: "#137fec",
            bg: "#137fec15",
        },
        {
            label: t("reports_confirmed"),
            value: String(stats.confirmedInfractions),
            icon: FileText,
            color: "#DC2626",
            bg: "#DC262615",
        },
        {
            label: t("reports_regularization"),
            value: `${Math.round(stats.regularizationRate)} %`,
            icon: TrendingUp,
            color: "#10B981",
            bg: "#10B98115",
        },
        {
            label: t("reports_inspections"),
            value: String(stats.inspectionsDone),
            icon: CheckCircle,
            color: "#D4A843",
            bg: "#D4A84315",
        },
    ];

    const byTypeData = stats.alertsByType.map((entry) => ({
        name: ALERT_TYPE_LABELS_I18N[entry.type] ?? entry.type,
        value: entry.count,
        color: TYPE_COLORS[entry.type] ?? "#137fec",
    }));

    const byRiskData = stats.alertsByRiskLevel.map((entry) => ({
        level: RISK_LEVEL_LABELS_I18N[entry.level] ?? entry.level,
        count: entry.count,
        fill: RISK_COLORS[entry.level] ?? "#137fec",
    }));

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-xl font-black uppercase text-[#E2E8F0]">{t("reports_title")}</h1>
                <p className="text-sm text-[#94A3B8]/60 mt-0.5">{t("reports_subtitle")}</p>
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
                                        <p className="text-xs text-[#94A3B8]/60 font-medium">{kpi.label}</p>
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

            {/* Line chart — detections per month */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-[#E2E8F0]">
                        {t("reports_detections_by_month")}
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
                                formatter={(val: number) => [`${val} ${t("reports_alert_count")}`, t("reports_detections")]}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#137fec"
                                strokeWidth={2.5}
                                dot={{ fill: "#137fec", r: 4 }}
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
                        <CardTitle className="text-sm font-bold text-[#E2E8F0]">{t("reports_detections_by_type")}</CardTitle>
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
                                    formatter={(val: number) => [`${val} ${t("reports_alert_count")}`, ""]}
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
                        <CardTitle className="text-sm font-bold text-[#E2E8F0]">{t("reports_detections_by_risk")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={byRiskData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="level" tick={{ fontSize: 11, fill: "#6b7280" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                    formatter={(val: number) => [`${val} ${t("reports_alert_count")}`, t("reports_detections")]}
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
