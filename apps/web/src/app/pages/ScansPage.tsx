import { useState } from "react";
import { Loader2, AlertTriangle, ScanLine, CheckCircle2, Clock, ArrowRight, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/app/components/ui/dialog";
import { ImageComparator } from "@/app/components/dashboard/ImageComparator";
import { useApi } from "@/app/hooks/useApi";
import { useAuth } from "@/app/hooks/useAuth";
import { api, ApiRequestError } from "@/app/lib/api";
import { API_BASE_URL } from "@/app/lib/constants";
import type { ScanJob, PaginatedResponse } from "@observatoire360/shared";
import { SCAN_JOB_STATUS_LABELS } from "@observatoire360/shared";
import type { ScanJobStatus } from "@observatoire360/shared";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type BadgeVariant =
    | "secondary"
    | "default"
    | "pending"
    | "active"
    | "high"
    | "inactive"
    | "outline"
    | "accent"
    | "destructive"
    | "medium"
    | "low";

function statusBadgeVariant(status: ScanJobStatus): BadgeVariant {
    switch (status) {
        case "pending":
            return "secondary";
        case "fetching":
            return "default";
        case "analyzing":
            return "pending";
        case "completed":
            return "active";
        case "failed":
            return "high";
        default:
            return "secondary";
    }
}

function formatDate(timestamp: number | null): string {
    if (!timestamp) return "—";
    return new Date(timestamp).toLocaleString("fr-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getDefaultStartDate(): string {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString().slice(0, 10);
}

function getDefaultEndDate(): string {
    return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// ScansPage
// ---------------------------------------------------------------------------

export default function ScansPage() {
    const { user } = useAuth();
    const isManager = user?.role === "manager";

    const { data: scansResponse, isLoading, error, refetch } =
        useApi<PaginatedResponse<ScanJob>>("/scans");

    // -----------------------------------------------------------------------
    // Trigger dialog state
    // -----------------------------------------------------------------------

    const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
    const [scanMode, setScanMode] = useState<"municipality" | "address" | "coordinates">("address");
    const [startDate, setStartDate] = useState(getDefaultStartDate);
    const [endDate, setEndDate] = useState(getDefaultEndDate);
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [triggerLoading, setTriggerLoading] = useState(false);
    const [triggerError, setTriggerError] = useState<string | null>(null);
    const [triggerSuccess, setTriggerSuccess] = useState(false);

    // -----------------------------------------------------------------------
    // Compare dialog state
    // -----------------------------------------------------------------------

    const [compareScan, setCompareScan] = useState<ScanJob | null>(null);

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

    function openTriggerDialog() {
        setScanMode("address");
        setStartDate(getDefaultStartDate());
        setEndDate(getDefaultEndDate());
        setAddress("");
        setLatitude("");
        setLongitude("");
        setTriggerError(null);
        setTriggerDialogOpen(true);
    }

    async function handleTriggerScan() {
        if (scanMode === "coordinates") {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            if (isNaN(lat) || isNaN(lng)) {
                setTriggerError("Latitude et longitude sont requis.");
                return;
            }
        }
        if (scanMode === "address" && !address.trim()) {
            setTriggerError("L'adresse est requise.");
            return;
        }
        setTriggerLoading(true);
        setTriggerError(null);
        try {
            const payload: Record<string, unknown> = {
                mode: scanMode,
                startDate,
                endDate,
            };

            if (scanMode === "address") {
                // Geocode the address using Nominatim (free, no API key)
                const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
                    { headers: { "User-Agent": "Observatoire360/1.0" } },
                );
                const geoData = await geoRes.json() as Array<{ lat: string; lon: string }>;
                if (!geoData.length) {
                    setTriggerError("Adresse introuvable. Vérifiez l'adresse ou utilisez le mode coordonnées.");
                    setTriggerLoading(false);
                    return;
                }
                payload.latitude = parseFloat(geoData[0].lat);
                payload.longitude = parseFloat(geoData[0].lon);
                payload.address = address;
            } else if (scanMode === "coordinates") {
                payload.latitude = parseFloat(latitude);
                payload.longitude = parseFloat(longitude);
            }

            await api.post<{ job: ScanJob }>("/scans/trigger", payload);
            setTriggerSuccess(true);
            setTriggerDialogOpen(false);
            refetch();
            setTimeout(() => setTriggerSuccess(false), 5000);
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setTriggerError(err.message);
            } else {
                setTriggerError("Une erreur inattendue s'est produite.");
            }
        } finally {
            setTriggerLoading(false);
        }
    }

    // -----------------------------------------------------------------------
    // Render: loading / error
    // -----------------------------------------------------------------------

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 flex items-center justify-center min-h-[300px]">
                <div className="flex items-center gap-3 text-[#2A3A4E]/60">
                    <Loader2 className="w-5 h-5 animate-spin text-[#008B8B]" />
                    <span className="text-sm font-medium">Chargement des analyses…</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-6">
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    const scans = scansResponse?.data ?? [];

    // -----------------------------------------------------------------------
    // Render: main
    // -----------------------------------------------------------------------

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black uppercase text-[#1A2332]">Historique des analyses</h1>
                    <p className="text-sm text-[#2A3A4E]/60 mt-0.5">
                        {scansResponse?.total ?? 0} analyse{(scansResponse?.total ?? 0) !== 1 ? "s" : ""} au total
                    </p>
                </div>
                {isManager && (
                    <Button onClick={openTriggerDialog}>
                        <ScanLine className="w-4 h-4" />
                        Lancer une analyse
                    </Button>
                )}
            </div>

            {/* Feedback banners */}
            {triggerSuccess && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Analyse lancée avec succès. Elle apparaîtra dans la liste ci-dessous.</span>
                </div>
            )}

            {/* Empty state */}
            {scans.length === 0 ? (
                <Card>
                    <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#008B8B]/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-[#008B8B]" />
                        </div>
                        <p className="text-sm font-medium text-[#2A3A4E]/70">
                            Aucune analyse enregistrée pour le moment.
                        </p>
                        {isManager && (
                            <p className="text-xs text-[#2A3A4E]/40">
                                Cliquez sur "Lancer une analyse" pour démarrer la première analyse.
                            </p>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-sm font-bold text-[#1A2332]">
                            Résultats des analyses
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#2A3A4E]/60 uppercase tracking-wide">Date</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#2A3A4E]/60 uppercase tracking-wide">Adresse</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#2A3A4E]/60 uppercase tracking-wide">Statut</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#2A3A4E]/60 uppercase tracking-wide">Période</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#2A3A4E]/60 uppercase tracking-wide">Détections</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#2A3A4E]/60 uppercase tracking-wide">Images</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#2A3A4E]/60 uppercase tracking-wide">Erreur</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {scans.map((scan) => (
                                        <tr key={scan.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-5 py-3.5 text-[#2A3A4E]/80 whitespace-nowrap">
                                                {formatDate(scan.createdAt)}
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-[#2A3A4E]/70 max-w-[200px] truncate">
                                                {scan.address ?? "—"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <Badge variant={statusBadgeVariant(scan.status)}>
                                                    {SCAN_JOB_STATUS_LABELS[scan.status]}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                {scan.startDate && scan.endDate ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-[#2A3A4E]/70">
                                                        <span>{scan.startDate}</span>
                                                        <ArrowRight className="w-3 h-3 shrink-0 text-[#2A3A4E]/40" />
                                                        <span>{scan.endDate}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-[#2A3A4E]/30">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-[#1A2332]">
                                                {scan.status === "completed"
                                                    ? scan.detectionsCount
                                                    : "—"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {scan.beforeImageKey && scan.afterImageKey ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs px-2.5 border-[#008B8B]/40 text-[#008B8B] hover:bg-[#008B8B]/5"
                                                        onClick={() => setCompareScan(scan)}
                                                    >
                                                        <Layers className="w-3.5 h-3.5" />
                                                        Comparer
                                                    </Button>
                                                ) : (
                                                    <span className="text-[#2A3A4E]/30">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-red-600 text-xs max-w-[240px] truncate">
                                                {scan.error ?? "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* Trigger scan dialog                                               */}
            {/* ---------------------------------------------------------------- */}
            <Dialog open={triggerDialogOpen} onOpenChange={setTriggerDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Nouvelle analyse</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Mode selector */}
                        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                            {([
                                { value: "municipality", label: "Municipalité" },
                                { value: "address", label: "Adresse" },
                                { value: "coordinates", label: "Coordonnées" },
                            ] as const).map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setScanMode(opt.value)}
                                    className={`flex-1 text-xs font-medium py-2 px-3 rounded-md transition-colors ${
                                        scanMode === opt.value
                                            ? "bg-white text-[#008B8B] shadow-sm"
                                            : "text-[#2A3A4E]/60 hover:text-[#2A3A4E]"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {scanMode === "municipality" && (
                            <p className="text-sm text-[#2A3A4E]/70 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                L'analyse portera sur l'ensemble du territoire de votre municipalité. La résolution sera plus faible qu'une analyse ciblée.
                            </p>
                        )}

                        {scanMode === "address" && (
                            <>
                                <Input
                                    label="Adresse"
                                    placeholder="Ex: 125 Boul. de la Cité-des-Jeunes, Gatineau"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-[#2A3A4E]/50">
                                    L'adresse sera automatiquement géolocalisée. L'analyse portera sur un rayon de 200m.
                                </p>
                            </>
                        )}

                        {scanMode === "coordinates" && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="Latitude"
                                        type="number"
                                        step="any"
                                        placeholder="45.4765"
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="Longitude"
                                        type="number"
                                        step="any"
                                        placeholder="-75.7013"
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-[#2A3A4E]/50">
                                    L'analyse portera sur un rayon de 200m autour des coordonnées.
                                </p>
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="date"
                                label="Date de début"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                max={endDate}
                            />
                            <Input
                                type="date"
                                label="Date de fin"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                max={getDefaultEndDate()}
                            />
                        </div>

                        {triggerError && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>{triggerError}</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setTriggerDialogOpen(false)}
                            disabled={triggerLoading}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleTriggerScan}
                            disabled={
                                triggerLoading || !startDate || !endDate ||
                                (scanMode === "address" && !address.trim()) ||
                                (scanMode === "coordinates" && (!latitude || !longitude))
                            }
                        >
                            {triggerLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ScanLine className="w-4 h-4" />
                            )}
                            Lancer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ---------------------------------------------------------------- */}
            {/* Image comparator dialog                                           */}
            {/* ---------------------------------------------------------------- */}
            <Dialog open={compareScan !== null} onOpenChange={(open) => { if (!open) setCompareScan(null); }}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Comparaison d'images</DialogTitle>
                    </DialogHeader>

                    {compareScan?.beforeImageKey && compareScan?.afterImageKey && (
                        <>
                            <p className="text-xs font-semibold text-[#2A3A4E]/60 uppercase tracking-wide">Détection de changements (Sentinel-2, 10m/pixel)</p>
                            <ImageComparator
                                beforeSrc={`${API_BASE_URL}/images/${compareScan.beforeImageKey}`}
                                afterSrc={`${API_BASE_URL}/images/${compareScan.afterImageKey}`}
                                beforeLabel={compareScan.startDate ? `AVANT (${compareScan.startDate})` : "AVANT"}
                                afterLabel={compareScan.endDate ? `APRÈS (${compareScan.endDate})` : "APRÈS"}
                            />
                        </>
                    )}

                    {compareScan?.orthoImageKey && (
                        <div className="mt-4">
                            <p className="text-xs font-semibold text-[#2A3A4E]/60 uppercase tracking-wide mb-2">Vue haute résolution (Orthophoto Québec, ~20cm/pixel)</p>
                            <img
                                src={`${API_BASE_URL}/images/${compareScan.orthoImageKey}`}
                                alt="Orthophoto haute résolution"
                                className="w-full rounded-xl border border-gray-200"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
