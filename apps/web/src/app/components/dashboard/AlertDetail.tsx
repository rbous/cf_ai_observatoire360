import { useState } from "react";
import { ArrowLeft, MapPin, Calendar, FileText, User, Clock, CheckCircle, AlertTriangle, Image, Loader2, ScanLine } from "lucide-react";
import { api } from "@/app/lib/api";
import { ImageComparator } from "./ImageComparator";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { RiskBadge } from "@/app/components/shared/RiskBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import type { Alert, AlertStatus } from "@observatoire360/shared";
import { ALERT_STATUS_LABELS, ALERT_TYPE_LABELS } from "@observatoire360/shared";
import { useApi } from "@/app/hooks/useApi";
import { API_BASE_URL } from "@/app/lib/constants";

// ---------------------------------------------------------------------------
// Sub-component: prompt to analyze zone when no images exist
// ---------------------------------------------------------------------------

function AnalyzeZonePrompt({ latitude, longitude, address }: {
    latitude: number;
    longitude: number;
    address: string | null;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<"idle" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const today = new Date().toISOString().slice(0, 10);
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    async function handleAnalyze() {
        setIsLoading(true);
        setResult("idle");
        try {
            await api.post("/scans/trigger", {
                mode: "coordinates",
                latitude,
                longitude,
                address: address ?? undefined,
                startDate: threeMonthsAgo,
                endDate: today,
            });
            setResult("success");
        } catch (err) {
            setResult("error");
            setErrorMsg(err instanceof Error ? err.message : "Erreur inattendue");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl bg-gray-50 border border-dashed border-gray-200">
            <Image className="w-10 h-10 text-[#2A3A4E]/20 mb-3" />
            <p className="text-sm text-[#2A3A4E]/60 mb-1 text-center">Aucune image satellite disponible pour cette alerte.</p>
            <p className="text-xs text-[#2A3A4E]/40 mb-4 text-center">
                Lancez une analyse pour obtenir les images avant/après de cette zone.
            </p>

            {result === "success" ? (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <CheckCircle className="w-4 h-4" />
                    Analyse lancée ! Les images seront disponibles dans quelques minutes.
                </div>
            ) : result === "error" ? (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-2">
                    {errorMsg}
                </div>
            ) : null}

            {result !== "success" && (
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="gap-2"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <ScanLine className="w-4 h-4" />
                    )}
                    Analyser cette zone (3 derniers mois)
                </Button>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------

const STATUS_OPTIONS: AlertStatus[] = [
    "a_analyser",
    "a_inspecter",
    "en_cours",
    "infraction_confirmee",
    "cloturee",
];

interface AlertDetailProps {
    alertId?: string;
}

export function AlertDetail({ alertId = "ALT-001" }: AlertDetailProps) {
    const navigate = useNavigate();
    const { data: alert, isLoading, error } = useApi<Alert>(`/alerts/${alertId}`);
    const [currentStatus, setCurrentStatus] = useState<AlertStatus | null>(null);

    const effectiveStatus = currentStatus ?? alert?.status ?? "a_analyser";

    const eventIcons = {
        detection: AlertTriangle,
        status: CheckCircle,
        assign: User,
        inspect: Calendar,
    };

    const eventColors = {
        detection: "text-red-500 bg-red-50",
        status: "text-[#008B8B] bg-[#008B8B]/10",
        assign: "text-blue-500 bg-blue-50",
        inspect: "text-amber-500 bg-amber-50",
    };

    if (isLoading) {
        return (
            <div className="min-h-full bg-gray-50 p-4 md:p-6 flex items-center justify-center">
                <div className="flex items-center gap-3 text-[#2A3A4E]/60">
                    <Loader2 className="w-5 h-5 animate-spin text-[#008B8B]" />
                    <span className="text-sm font-medium">Chargement de l'alerte…</span>
                </div>
            </div>
        );
    }

    if (error || !alert) {
        return (
            <div className="min-h-full bg-gray-50 p-4 md:p-6">
                <div className="max-w-5xl mx-auto">
                    <button
                        onClick={() => navigate("/tableau-de-bord")}
                        className="inline-flex items-center gap-1.5 text-sm text-[#008B8B] hover:underline mb-5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à la carte
                    </button>
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span>{error ?? "Alerte introuvable."}</span>
                    </div>
                </div>
            </div>
        );
    }

    const detectedAtDate = new Date(alert.detectedAt).toLocaleDateString("fr-CA");

    return (
        <div className="min-h-full bg-gray-50 p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate("/tableau-de-bord")}
                    className="inline-flex items-center gap-1.5 text-sm text-[#008B8B] hover:underline mb-5"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour à la carte
                </button>

                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h1 className="text-xl font-black uppercase text-[#1A2332]">
                                Alerte {alert.id}
                            </h1>
                            <RiskBadge level={alert.riskLevel} />
                            <StatusBadge status={effectiveStatus} />
                        </div>
                        <p className="text-sm text-[#2A3A4E]/60">{ALERT_TYPE_LABELS[alert.type]}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <select
                            value={effectiveStatus}
                            onChange={(e) => setCurrentStatus(e.target.value as AlertStatus)}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-[#1A2332] focus:outline-none focus:ring-1 focus:ring-[#008B8B]"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{ALERT_STATUS_LABELS[s]}</option>
                            ))}
                        </select>
                        <Button size="sm" variant="outline">
                            <User className="w-4 h-4" />
                            Assigner
                        </Button>
                        <Button size="sm">
                            <Calendar className="w-4 h-4" />
                            Planifier
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Before / After images */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Image className="w-4 h-4 text-[#008B8B]" />
                                    Comparaison avant / après
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {alert.beforeImageKey && alert.afterImageKey ? (
                                    <ImageComparator
                                        beforeSrc={API_BASE_URL + "/images/" + alert.beforeImageKey}
                                        afterSrc={API_BASE_URL + "/images/" + alert.afterImageKey}
                                        beforeLabel="AVANT"
                                        afterLabel="APRÈS"
                                    />
                                ) : (
                                    <AnalyzeZonePrompt
                                        latitude={alert.latitude}
                                        longitude={alert.longitude}
                                        address={alert.address}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Technical data */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <FileText className="w-4 h-4 text-[#008B8B]" />
                                    Données techniques
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                    {[
                                        {
                                            label: "Superficie détectée",
                                            value: alert.detectedArea != null ? `${alert.detectedArea} m²` : "Non disponible",
                                        },
                                        {
                                            label: "Superficie autorisée",
                                            value: alert.authorizedArea != null && alert.authorizedArea > 0
                                                ? `${alert.authorizedArea} m²`
                                                : "Non applicable",
                                        },
                                        {
                                            label: "Zone de règlement",
                                            value: alert.zone ?? "Non spécifiée",
                                        },
                                        {
                                            label: "Permis de construction",
                                            value: alert.hasPermit ? "Oui" : "Non",
                                        },
                                        {
                                            label: "Coordonnées",
                                            value: `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`,
                                        },
                                        {
                                            label: "Score de risque",
                                            value: `${alert.riskScore}/100`,
                                        },
                                        ...(alert.confidence != null
                                            ? [{ label: "Confiance IA", value: `${Math.round(alert.confidence * 100)} %` }]
                                            : []),
                                    ].map(({ label, value }) => (
                                        <div key={label}>
                                            <p className="text-[10px] text-[#2A3A4E]/50 uppercase font-semibold tracking-wide">{label}</p>
                                            <p className="text-sm font-medium text-[#1A2332] mt-0.5">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action timeline — placeholder since API Alert has no events field */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-[#008B8B]" />
                                    Historique des actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    {/* Vertical line */}
                                    <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-200" />

                                    <div className="space-y-4">
                                        {/* Detection event derived from detectedAt */}
                                        <div className="flex items-start gap-3 relative">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${eventColors.detection}`}>
                                                <AlertTriangle className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0 pt-1">
                                                <p className="text-xs font-semibold text-[#1A2332]">Détection automatique par satellite</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[10px] text-[#2A3A4E]/50">{detectedAtDate}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status creation event derived from createdAt */}
                                        <div className="flex items-start gap-3 relative">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${eventColors.status}`}>
                                                <CheckCircle className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0 pt-1">
                                                <p className="text-xs font-semibold text-[#1A2332]">
                                                    Alerte créée — statut : {ALERT_STATUS_LABELS[alert.status]}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[10px] text-[#2A3A4E]/50">
                                                        {new Date(alert.createdAt).toLocaleString("fr-CA")}
                                                    </p>
                                                    <span className="text-[10px] text-[#2A3A4E]/40">— Système</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-4">
                        {/* Location */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-[#008B8B]" />
                                    Localisation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-[10px] text-[#2A3A4E]/50 uppercase font-semibold tracking-wide mb-0.5">Adresse</p>
                                    <p className="text-sm text-[#1A2332] font-medium leading-snug">
                                        {alert.address ?? "Adresse non disponible"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#2A3A4E]/50 uppercase font-semibold tracking-wide mb-0.5">Coordonnées GPS</p>
                                    <p className="text-xs font-mono text-[#1A2332]">
                                        {alert.latitude}, {alert.longitude}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => navigate("/tableau-de-bord")}
                                >
                                    Voir sur la carte
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Detection info */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-[#008B8B]" />
                                    Détection
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <p className="text-[10px] text-[#2A3A4E]/50 uppercase font-semibold tracking-wide mb-0.5">Date</p>
                                    <p className="text-sm text-[#1A2332] font-medium">{detectedAtDate}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#2A3A4E]/50 uppercase font-semibold tracking-wide mb-0.5">Méthode</p>
                                    <p className="text-xs text-[#2A3A4E]/70">Analyse satellite automatique</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick actions */}
                        <div className="space-y-2">
                            <Button className="w-full" size="sm">
                                Générer l'avis officiel
                            </Button>
                            <Button variant="outline" className="w-full" size="sm">
                                Planifier une inspection
                            </Button>
                            <Button variant="ghost" className="w-full" size="sm">
                                Télécharger le rapport PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
