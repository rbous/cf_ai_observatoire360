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

import { WMS_LAYERS } from "@observatoire360/shared";
import type { RiskLevel, AlertStatus } from "@observatoire360/shared";
import { MapLegend } from "./MapLegend";

// -----------------------------------------------------------------------
// Mock alert data — replace with API data later
// -----------------------------------------------------------------------
interface MockAlert {
    id: string;
    lat: number;
    lng: number;
    riskLevel: RiskLevel;
    status: AlertStatus;
    address: string;
    type: string;
}

const MOCK_ALERTS: MockAlert[] = [
    {
        id: "ALT-001",
        lat: 45.415,
        lng: -71.882,
        riskLevel: "high",
        status: "a_inspecter",
        address: "45 Rue Bowen, Sherbrooke",
        type: "Construction sans permis",
    },
    {
        id: "ALT-002",
        lat: 45.395,
        lng: -71.905,
        riskLevel: "medium",
        status: "a_analyser",
        address: "12 Ave du Plateau, Sherbrooke",
        type: "Agrandissement non autorisé",
    },
    {
        id: "ALT-003",
        lat: 45.408,
        lng: -71.862,
        riskLevel: "low",
        status: "en_cours",
        address: "789 Blvd Portland, Sherbrooke",
        type: "Abri temporaire",
    },
    {
        id: "ALT-004",
        lat: 45.422,
        lng: -71.895,
        riskLevel: "high",
        status: "infraction_confirmee",
        address: "33 Rue Wellington N, Sherbrooke",
        type: "Piscine hors-norme",
    },
    {
        id: "ALT-005",
        lat: 45.385,
        lng: -71.870,
        riskLevel: "medium",
        status: "a_analyser",
        address: "201 Chemin Godin, Sherbrooke",
        type: "Extension arrière",
    },
];

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
                {MOCK_ALERTS.map((alert) => (
                    <Marker
                        key={alert.id}
                        position={[alert.lat, alert.lng]}
                        icon={createCircleIcon(RISK_COLORS[alert.riskLevel])}
                    >
                        <Popup>
                            <div className="p-1 min-w-[180px]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-[#1A2332]">{alert.id}</span>
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
                                <p className="text-xs text-[#2A3A4E] font-medium mb-0.5">{alert.address}</p>
                                <p className="text-[11px] text-[#2A3A4E]/60 mb-2">{alert.type}</p>
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
        </div>
    );
}
