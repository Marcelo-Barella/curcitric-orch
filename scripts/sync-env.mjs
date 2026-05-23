import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const rootKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "GITHUB_APP_ID",
  "GITHUB_APP_PRIVATE_KEY",
  "WORKER_ID",
  "POLL_INTERVAL_MS",
];

const webKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GITHUB_APP_ID",
  "GITHUB_APP_PRIVATE_KEY",
];

function formatEnvLine(key, value) {
  if (value === undefined || value === "") return `${key}=\n`;
  if (/[\s#"\\]/.test(value) || value.includes("\n")) {
    const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
    return `${key}="${escaped}"\n`;
  }
  return `${key}=${value}\n`;
}

function writeEnvFile(path, keys) {
  const lines = keys.map((key) => formatEnvLine(key, process.env[key] ?? ""));
  writeFileSync(path, lines.join(""), "utf8");
}

writeEnvFile(join(root, ".env"), rootKeys);
writeEnvFile(join(root, "apps/web/.env.local"), webKeys);

console.log(`Wrote ${join(root, ".env")}`);
console.log(`Wrote ${join(root, "apps/web/.env.local")}`);
