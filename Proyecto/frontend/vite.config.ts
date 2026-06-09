import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-data": [
            "@tanstack/react-query",
            "axios",
            "zustand",
            "socket.io-client",
          ],
          "vendor-charts": ["recharts"],
          "vendor-maps": ["leaflet", "react-leaflet"],
          "vendor-ui": ["lucide-react", "framer-motion"],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
