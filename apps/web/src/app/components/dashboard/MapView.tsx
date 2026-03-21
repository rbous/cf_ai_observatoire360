import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, LayersControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon path issue with bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

import { WMS_LAYERS, ALERT_TYPE_LABELS } from "@observatoire360/shared";
import type { RiskLevel } from "@observatoire360/shared";
import { MapLegend } from "./MapLegend";
import { useAlerts } from "@/app/hooks/useAlerts";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";

const RISK_COLORS: Record<RiskLevel, string> = {
    high: "#DC2626",
    medium: "#F59E0B",
    low: "#10B981",
};

function createCircleIcon(color: string): L.DivIcon {
    return L.divIcon({
        className: "",
        html: `<div style="
            width: 20px;
            height: 20px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
}

const RISK_LABELS: Record<RiskLevel, string> = {
    high: "Élevé",
    medium: "Moyen",
    low: "Faible",
};

const WMS_OPTIONS = {
    format: "image/png" as const,
    transparent: true,
    version: "1.3.0",
    attribution: "© Gouvernement du Québec",
};

interface MapViewProps {
    className?: string;
}

export function MapView({ className }: MapViewProps) {
    const navigate = useNavigate();
    const { alerts, isLoading, error } = useAlerts();

    // Ensure Leaflet container fills its parent
    useEffect(() => {
        window.dispatchEvent(new Event("resize"));
    }, []);

    return (
        <div className={`relative w-full h-full ${className ?? ""}`}>
            <MapContainer
                center={[45.4042, -71.8929]}
                zoom={13}
                style={{ width: "100%", height: "100%" }}
                zoomControl={true}
            >
                <LayersControl position="topright">
                    {/* Base layer */}
                    <LayersControl.BaseLayer checked name="OpenStreetMap">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            maxZoom={19}
                        />
                    </LayersControl.BaseLayer>

                    {/* WMS overlay layers */}
                    <LayersControl.Overlay name={WMS_LAYERS.cadastre.label}>
                        <WMSTileLayer
                            url={WMS_LAYERS.cadastre.url}
                            layers={WMS_LAYERS.cadastre.layers}
                            {...WMS_OPTIONS}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name={WMS_LAYERS.limites_municipales.label}>
                        <WMSTileLayer
                            url={WMS_LAYERS.limites_municipales.url}
                            layers={WMS_LAYERS.limites_municipales.layers}
                            {...WMS_OPTIONS}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name={WMS_LAYERS.orthophotos.label}>
                        <WMSTileLayer
                            url={WMS_LAYERS.orthophotos.url}
                            layers={WMS_LAYERS.orthophotos.layers}
                            {...WMS_OPTIONS}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name={WMS_LAYERS.hydrographie.label}>
                        <WMSTileLayer
                            url={WMS_LAYERS.hydrographie.url}
                            layers={WMS_LAYERS.hydrographie.layers}
                            {...WMS_OPTIONS}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name={WMS_LAYERS.adresses.label}>
                        <WMSTileLayer
                            url={WMS_LAYERS.adresses.url}
                            layers={WMS_LAYERS.adresses.layers}
                            {...WMS_OPTIONS}
                        />
                    </LayersControl.Overlay>
                </LayersControl>

                {/* Alert markers */}
                {alerts.map((alert) => (
                    <Marker
                        key={alert.id}
                        position={[alert.latitude, alert.longitude]}
                        icon={createCircleIcon(RISK_COLORS[alert.riskLevel])}
                    >
                        <Popup>
                            <div className="p-1 min-w-[180px]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-[#1A2332]">{alert.id.slice(-6)}</span>
                                    <span
                                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                        style={{
                                            background: `${RISK_COLORS[alert.riskLevel]}20`,
                                            color: RISK_COLORS[alert.riskLevel],
                                        }}
                                    >
                                        {RISK_LABELS[alert.riskLevel]}
                                    </span>
                                </div>
                                <p className="text-xs text-[#2A3A4E] font-medium mb-0.5">{alert.address ?? "Adresse inconnue"}</p>
                                <p className="text-[11px] text-[#2A3A4E]/60 mb-2">{ALERT_TYPE_LABELS[alert.type]}</p>
                                <button
                                    onClick={() => navigate(`/tableau-de-bord/alertes/${alert.id}`)}
                                    className="w-full text-xs bg-[#008B8B] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#006666] transition-colors"
                                >
                                    Voir le détail
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Map legend overlay */}
            <MapLegend />

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/60">
                    <LoadingSpinner text="Chargement des alertes..." />
                </div>
            )}

            {/* Error overlay */}
            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm shadow">
                    {error}
                </div>
            )}
        </div>
    );
}
