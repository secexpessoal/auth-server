import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
// Note: Because we use vitest.workspace.ts, this file acts as a globally shared base config.

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
const dirname = import.meta.dirname;

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react() as any],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup-ui.ts"],
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./src/__tests__/setup-ui.ts"],
          include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }) as any,
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}) as any,
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@lib": path.resolve(dirname, "./src/lib"),
      "@app": path.resolve(dirname, "./src/app"),
      "@store": path.resolve(dirname, "./src/store"),
      "@assets": path.resolve(dirname, "./src/assets"),
      "@modules": path.resolve(dirname, "./src/modules"),
      "@components": path.resolve(dirname, "./src/components"),
      // NOTE: Testes
      "@tests": path.resolve(dirname, "./src/__tests__"),
      "@fixtures": path.resolve(dirname, "./src/__fixtures__"),
    },
  },
});
