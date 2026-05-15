import { expect, test } from "@playwright/test";

test.describe("ProjectChatScreen", () => {
  test("renders three panes with correct test IDs", async ({ page }) => {
    await page.goto("/test-org/projects/test-project");

    const leftPane = page.locator('[data-testid="pane-history"]');
    const middlePane = page.locator('[data-testid="pane-chat"]');
    const rightPane = page.locator('[data-testid="pane-orchestration"]');

    await expect(leftPane).toBeVisible();
    await expect(middlePane).toBeVisible();
    await expect(rightPane).toBeVisible();
  });

  test("sidebar shows task tree area", async ({ page }) => {
    await page.goto("/test-org/projects/test-project");
    await expect(page.getByRole("complementary").last()).toBeVisible();
  });
});
