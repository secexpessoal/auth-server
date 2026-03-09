import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react() as any, tailwindcss() as any],
  resolve: {
    alias: {
      "@lib": path.resolve(import.meta.dirname, "./src/lib"),
      "@app": path.resolve(import.meta.dirname, "./src/app"),
      "@store": path.resolve(import.meta.dirname, "./src/store"),
      "@assets": path.resolve(import.meta.dirname, "./src/assets"),
      "@modules": path.resolve(import.meta.dirname, "./src/modules"),
      "@components": path.resolve(import.meta.dirname, "./src/components"),

      // NOTE: Testes
      "@tests": path.resolve(import.meta.dirname, "./src/__tests__"),
      "@fixtures": path.resolve(import.meta.dirname, "./src/__fixtures__"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/v1": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
