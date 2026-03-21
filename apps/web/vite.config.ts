import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ["three", "@react-three/fiber", "@react-three/drei"],
                    leaflet: ["leaflet", "react-leaflet"],
                    recharts: ["recharts"],
                    radix: [
                        "@radix-ui/react-accordion",
                        "@radix-ui/react-dialog",
                        "@radix-ui/react-dropdown-menu",
                        "@radix-ui/react-select",
                        "@radix-ui/react-tabs",
                        "@radix-ui/react-tooltip",
                    ],
                },
            },
        },
    },
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:8787",
                changeOrigin: true,
            },
        },
    },
});
