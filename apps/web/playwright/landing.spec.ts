import { expect, test } from "@playwright/test";

test.describe("LandingScreen", () => {
  test("shows sign-in button", async ({ page }) => {
    await page.goto("/");
    const signIn = page.getByRole("button", { name: /sign in/i });
    await expect(signIn).toBeVisible();
  });

  test("displays hero tagline", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
  });
});
