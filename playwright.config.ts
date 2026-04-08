import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "retain-on-failure"
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        port: 3000,
        reuseExistingServer: !process.env.CI
      },
  projects: [
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 7"]
      }
    }
  ]
});
