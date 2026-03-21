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
import { FileText, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

// -----------------------------------------------------------------------
// Mock data
// -----------------------------------------------------------------------
const MONTHLY_DETECTIONS = [
    { month: "Avr", count: 3 },
    { month: "Mai", count: 5 },
    { month: "Jui", count: 4 },
    { month: "Jui", count: 8 },
    { month: "Aoû", count: 6 },
    { month: "Sep", count: 7 },
    { month: "Oct", count: 5 },
    { month: "Nov", count: 4 },
    { month: "Déc", count: 3 },
    { month: "Jan", count: 2 },
    { month: "Fév", count: 4 },
    { month: "Mar", count: 6 },
];

const BY_TYPE = [
    { name: "Construction", value: 18, color: "#008B8B" },
    { name: "Extension", value: 14, color: "#D4A843" },
    { name: "Annexe", value: 9, color: "#6366F1" },
    { name: "Piscine", value: 6, color: "#10B981" },
];

const BY_RISK = [
    { level: "Faible", count: 20, fill: "#10B981" },
    { level: "Moyen", count: 18, fill: "#F59E0B" },
    { level: "Élevé", count: 9, fill: "#DC2626" },
];

const KPI_CARDS = [
    {
        label: "Total alertes",
        value: "47",
        icon: AlertTriangle,
        color: "#008B8B",
        bg: "#008B8B15",
    },
    {
        label: "Infractions confirmées",
        value: "12",
        icon: FileText,
        color: "#DC2626",
        bg: "#DC262615",
    },
    {
        label: "Taux de régularisation",
        value: "78 %",
        icon: TrendingUp,
        color: "#10B981",
        bg: "#10B98115",
    },
    {
        label: "Inspections complétées",
        value: "35",
        icon: CheckCircle,
        color: "#D4A843",
        bg: "#D4A84315",
    },
];

export function ReportsView() {
    return (
        <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-xl font-black uppercase text-[#1A2332]">Rapports & Statistiques</h1>
                <p className="text-sm text-[#2A3A4E]/60 mt-0.5">Vue d'ensemble du territoire — Municipalité de Sherbrooke</p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {KPI_CARDS.map((kpi) => {
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
                        <LineChart data={MONTHLY_DETECTIONS} margin={{ top: 8, right: 20, left: -20, bottom: 0 }}>
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
                                    data={BY_TYPE}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={75}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {BY_TYPE.map((entry) => (
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
                            <BarChart data={BY_RISK} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="level" tick={{ fontSize: 11, fill: "#6b7280" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                    formatter={(val: number) => [`${val} alertes`, "Détections"]}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {BY_RISK.map((entry) => (
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
