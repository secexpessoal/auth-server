import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@lib": path.resolve(import.meta.dirname, "./src/lib"),
      "@routes": path.resolve(import.meta.dirname, "./src/routes"),
      "@assets": path.resolve(import.meta.dirname, "./src/assets"),

      // NOTE: Testes
      "@fixtures": path.resolve(import.meta.dirname, "./fixtures"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/v1": {
        target: "http://test-auth-server.secexpessoal.org/",
        changeOrigin: true,
      },
    },
  },
});
