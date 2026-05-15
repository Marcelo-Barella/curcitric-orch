import { expect, test } from "@playwright/test";

/**
 * /auth/callback without contacting Supabase OAuth:
 * Missing `code` redirects to same-origin `/` (route uses NextResponse.redirect).
 * Next.js route handlers default that helper to HTTP 307; product docs may say 302.
 * E2E uses request.get(..., { maxRedirects: 0 }) so the first hop is asserted, not /.
 */
test.describe("OAuth callback route", () => {
  test("missing code redirects to site root with 3xx (not 404)", async ({
    request,
    baseURL,
  }) => {
    const response = await request.get("/auth/callback", { maxRedirects: 0 });
    expect(response.status()).not.toBe(404);
    const status = response.status();
    expect(status).toBeGreaterThanOrEqual(300);
    expect(status).toBeLessThan(400);
    expect([302, 307]).toContain(status);
    const location = response.headers().location;
    expect(location).toBeTruthy();
    const resolved = new URL(location!, baseURL ?? "http://localhost:3000");
    expect(resolved.pathname).toBe("/");
    expect(resolved.search).toBe("");
  });
});
