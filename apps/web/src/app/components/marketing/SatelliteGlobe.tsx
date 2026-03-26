import { motion } from "framer-motion";

/**
 * Animated satellite globe illustration — pure SVG, no images.
 * Shows a dotted globe with orbit rings and a satellite.
 */
export function SatelliteGlobe({ className }: { className?: string }) {
    return (
        <div className={`relative ${className ?? ""}`}>
            <svg viewBox="0 0 500 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Outer orbit rings */}
                <motion.circle
                    cx="250" cy="250" r="230"
                    fill="none" stroke="#137fec" strokeWidth="0.5" opacity="0.15"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.15 }}
                    transition={{ duration: 1.5 }}
                />
                <motion.circle
                    cx="250" cy="250" r="200"
                    fill="none" stroke="#137fec" strokeWidth="0.5" opacity="0.2"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.2 }}
                    transition={{ duration: 1.5, delay: 0.1 }}
                />
                <motion.circle
                    cx="250" cy="250" r="170"
                    fill="none" stroke="#137fec" strokeWidth="0.8" opacity="0.25"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.25 }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                />

                {/* Tilted orbit ellipse */}
                <motion.ellipse
                    cx="250" cy="250" rx="220" ry="80"
                    fill="none" stroke="#F59E0B" strokeWidth="0.8" opacity="0.3"
                    transform="rotate(-30, 250, 250)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 1, delay: 0.5 }}
                />
                <motion.ellipse
                    cx="250" cy="250" rx="190" ry="70"
                    fill="none" stroke="#137fec" strokeWidth="0.5" opacity="0.2"
                    transform="rotate(20, 250, 250)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    transition={{ duration: 1, delay: 0.6 }}
                />

                {/* Globe - dotted circle */}
                <circle cx="250" cy="250" r="120" fill="none" stroke="#137fec" strokeWidth="1.5" opacity="0.3" />
                <circle cx="250" cy="250" r="120" fill="#137fec" opacity="0.03" />

                {/* Globe grid lines - latitude */}
                <ellipse cx="250" cy="250" rx="120" ry="40" fill="none" stroke="#137fec" strokeWidth="0.5" opacity="0.15" />
                <ellipse cx="250" cy="250" rx="120" ry="80" fill="none" stroke="#137fec" strokeWidth="0.5" opacity="0.15" />
                <ellipse cx="250" cy="250" rx="120" ry="110" fill="none" stroke="#137fec" strokeWidth="0.5" opacity="0.15" />

                {/* Globe grid lines - longitude */}
                <ellipse cx="250" cy="250" rx="40" ry="120" fill="none" stroke="#137fec" strokeWidth="0.5" opacity="0.15" />
                <ellipse cx="250" cy="250" rx="80" ry="120" fill="none" stroke="#137fec" strokeWidth="0.5" opacity="0.15" />
                <ellipse cx="250" cy="250" rx="110" ry="120" fill="none" stroke="#137fec" strokeWidth="0.5" opacity="0.15" />

                {/* Continent dots - Americas shape (simplified) */}
                {[
                    [225, 185], [230, 190], [220, 195], [215, 200], [218, 210],
                    [222, 215], [228, 220], [230, 230], [225, 240], [220, 250],
                    [222, 260], [228, 265], [235, 270], [240, 280], [238, 290],
                    [232, 300], [228, 310], [230, 320], [235, 325],
                    // North America
                    [240, 180], [250, 175], [255, 180], [260, 185], [258, 190],
                    [252, 195], [248, 200], [245, 195], [240, 190],
                    // More detail
                    [265, 195], [270, 200], [268, 210], [262, 215], [258, 220],
                    [255, 230], [250, 235], [245, 240], [242, 250],
                    // Europe/Africa hint on right edge
                    [290, 210], [295, 220], [292, 230], [288, 240], [285, 250],
                    [288, 260], [292, 270], [295, 280], [290, 290],
                    [285, 215], [280, 225], [282, 235],
                ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="2" fill="#F59E0B" opacity="0.5" />
                ))}

                {/* Scan beam from satellite */}
                <motion.path
                    d="M 355 145 L 290 210 L 250 250 L 210 290"
                    fill="none" stroke="#F59E0B" strokeWidth="1" opacity="0.15"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 1 }}
                />

                {/* Scan cone from satellite */}
                <motion.path
                    d="M 355 145 L 310 200 L 280 250 L 310 300 L 355 145"
                    fill="#F59E0B" opacity="0.04"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.04 }}
                    transition={{ duration: 1, delay: 1.5 }}
                />

                {/* Satellite */}
                <motion.g
                    initial={{ x: 20, y: -20, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                >
                    {/* Satellite body */}
                    <rect x="348" y="132" width="16" height="12" rx="2" fill="#F59E0B" opacity="0.9" transform="rotate(-40, 356, 138)" />
                    {/* Solar panels */}
                    <rect x="330" y="118" width="18" height="8" rx="1" fill="#F59E0B" opacity="0.6" transform="rotate(-40, 339, 122)" />
                    <rect x="366" y="142" width="18" height="8" rx="1" fill="#F59E0B" opacity="0.6" transform="rotate(-40, 375, 146)" />
                    {/* Panel grid lines */}
                    <line x1="335" y1="118" x2="335" y2="126" stroke="#0F172A" strokeWidth="0.5" opacity="0.5" transform="rotate(-40, 335, 122)" />
                    <line x1="340" y1="118" x2="340" y2="126" stroke="#0F172A" strokeWidth="0.5" opacity="0.5" transform="rotate(-40, 340, 122)" />
                    <line x1="371" y1="142" x2="371" y2="150" stroke="#0F172A" strokeWidth="0.5" opacity="0.5" transform="rotate(-40, 371, 146)" />
                    <line x1="376" y1="142" x2="376" y2="150" stroke="#0F172A" strokeWidth="0.5" opacity="0.5" transform="rotate(-40, 376, 146)" />
                </motion.g>

                {/* Orbiting nodes */}
                {[
                    { cx: 120, cy: 170, r: 4, color: "#137fec", delay: 0.3 },
                    { cx: 380, cy: 320, r: 3, color: "#137fec", delay: 0.5 },
                    { cx: 160, cy: 380, r: 3.5, color: "#F59E0B", delay: 0.7 },
                    { cx: 400, cy: 180, r: 3, color: "#F59E0B", delay: 0.9 },
                    { cx: 80, cy: 280, r: 2.5, color: "#137fec", delay: 1.1 },
                    { cx: 350, cy: 400, r: 2.5, color: "#137fec", delay: 1.3 },
                ].map((node, i) => (
                    <motion.g key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: node.delay }}
                    >
                        <circle cx={node.cx} cy={node.cy} r={node.r} fill={node.color} opacity="0.8" />
                        <circle cx={node.cx} cy={node.cy} r={node.r * 2.5} fill={node.color} opacity="0.1" />
                    </motion.g>
                ))}

                {/* Pulsing center glow */}
                <motion.circle
                    cx="250" cy="250" r="125"
                    fill="url(#globeGlow)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                <defs>
                    <radialGradient id="globeGlow">
                        <stop offset="0%" stopColor="#137fec" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#137fec" stopOpacity="0" />
                    </radialGradient>
                </defs>
            </svg>
        </div>
    );
}
