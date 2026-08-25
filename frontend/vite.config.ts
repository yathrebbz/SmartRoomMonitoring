import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// En développement, l'API FastAPI tourne sur le port 8000 : Vite relaie
// /api (et la documentation OpenAPI) pour éviter toute configuration CORS.
const API_URL = process.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: API_URL, changeOrigin: true },
      "/docs": { target: API_URL, changeOrigin: true },
      "/openapi.json": { target: API_URL, changeOrigin: true },
    },
  },
});
