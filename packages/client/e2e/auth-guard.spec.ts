import { test, expect } from "@playwright/test";

test.describe("Auth guard", () => {
  test("unauthenticated visit to /list shows login page", async ({ page }) => {
    await page.goto("/list");

    // Should be redirected to login page (app shows login for unauthenticated users)
    await expect(page.getByText("Iniciar sessió")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "Iniciar sessió" })).toBeVisible();
  });

  test("unauthenticated visit to /edit/some-id shows login page", async ({ page }) => {
    await page.goto("/edit/some-id");

    // Should be redirected to login page (app shows login for unauthenticated users)
    await expect(page.getByText("Iniciar sessió")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "Iniciar sessió" })).toBeVisible();
  });
});
