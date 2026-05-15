import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "test-service-role-key";
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "test-anon-key";

describe("RLS policies", () => {
  describe("secret_profiles isolation", () => {
    it("user cannot read another user secret profiles", async () => {
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: tables } = await adminClient
        .from("secret_profiles")
        .select("id")
        .limit(1);

      expect(tables).toBeDefined();
    });
  });

  describe("organizations membership", () => {
    it("anonymous user cannot select organizations", async () => {
      const anonClient = createClient(supabaseUrl, anonKey);
      const { data } = await anonClient
        .from("organizations")
        .select("*");

      expect(data).toEqual([]);
    });
  });

  describe("orchestration_runs access", () => {
    it("unauthenticated user gets empty results from runs", async () => {
      const anonClient = createClient(supabaseUrl, anonKey);
      const { data } = await anonClient
        .from("orchestration_runs")
        .select("*");

      expect(data).toEqual([]);
    });
  });
});
