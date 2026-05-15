import { defineConfig, devices } from "@playwright/test";

const e2ePort = Number(process.env.E2E_PLAYWRIGHT_PORT ?? "3100");
const baseURL = `http://127.0.0.1:${e2ePort}`;
const webServerSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const webServerSupabaseAnon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

export default defineConfig({
  testDir: "./playwright",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `pnpm exec next dev --port ${e2ePort}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: webServerSupabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: webServerSupabaseAnon,
    },
  },
});
