import { useState } from "react";
import { ArrowLeft, MapPin, Calendar, FileText, User, Clock, CheckCircle, AlertTriangle, Image, Loader2 } from "lucide-react";
import { ImageComparator } from "./ImageComparator";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { RiskBadge } from "@/app/components/shared/RiskBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import type { Alert, AlertStatus } from "@observatoire360/shared";
import { ALERT_STATUS_LABELS, ALERT_TYPE_LABELS } from "@observatoire360/shared";
import { useApi } from "@/app/hooks/useApi";

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
                                        beforeSrc={"/api/images/" + alert.beforeImageKey}
                                        afterSrc={"/api/images/" + alert.afterImageKey}
                                        beforeLabel="AVANT"
                                        afterLabel="APRÈS"
                                    />
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Before image placeholder */}
                                        <div>
                                            <p className="text-xs font-bold text-[#2A3A4E]/50 uppercase tracking-wide mb-2">Avant</p>
                                            <div
                                                className="aspect-video rounded-xl flex items-center justify-center overflow-hidden"
                                                style={{ background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)" }}
                                            >
                                                <div className="text-center opacity-50">
                                                    <Image className="w-8 h-8 mx-auto mb-1.5 text-slate-400" />
                                                    <p className="text-xs text-slate-500 font-medium">Aucune image disponible</p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* After image placeholder */}
                                        <div>
                                            <p className="text-xs font-bold text-[#2A3A4E]/50 uppercase tracking-wide mb-2">Après</p>
                                            <div
                                                className="aspect-video rounded-xl flex items-center justify-center overflow-hidden"
                                                style={{ background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)" }}
                                            >
                                                <div className="text-center opacity-50">
                                                    <Image className="w-8 h-8 mx-auto mb-1.5 text-slate-400" />
                                                    <p className="text-xs text-slate-500 font-medium">Aucune image disponible</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
