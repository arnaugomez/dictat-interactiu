import { test, expect } from "@playwright/test";
import { signupAndLogin } from "./helpers/auth";

const uniqueEmail = () => `test+${Date.now()}@example.com`;

test.describe("Dictats", () => {
  test("create dictat from home navigates to edit screen", async ({ page }) => {
    const email = uniqueEmail();
    await signupAndLogin(page, { email, password: "password123" });

    // Should be on home screen
    await expect(page.getByText("Dictat Interactiu")).toBeVisible({ timeout: 10000 });

    // Fill in text and create dictat
    await page.getByPlaceholder("Escriu aquí el text del dictat...").fill("El gat seia al coixí.");
    await page.getByRole("button", { name: "Crea el dictat 🚀" }).click();

    // Should navigate to edit screen
    await expect(page.url()).toContain("/edit/", { timeout: 10000 });
  });

  test("navigate to list and see created dictat", async ({ page }) => {
    const email = uniqueEmail();
    await signupAndLogin(page, { email, password: "password123" });

    // Create a dictat
    await expect(page.getByText("Dictat Interactiu")).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder("Escriu aquí el text del dictat...").fill("El gat seia al coixí.");
    await page.getByRole("button", { name: "Crea el dictat 🚀" }).click();

    // Wait for edit screen
    await expect(page.url()).toContain("/edit/", { timeout: 10000 });

    // Navigate to list
    await page.goto("/list");
    await expect(page.getByText("Els meus dictats")).toBeVisible({ timeout: 10000 });

    // Should see the dictat in the list (it may show title or "Dictat")
    await expect(page.locator('[title="Editar"]').first()).toBeVisible({ timeout: 10000 });
  });

  test("delete dictat removes it from list", async ({ page }) => {
    const email = uniqueEmail();
    await signupAndLogin(page, { email, password: "password123" });

    // Create a dictat
    await expect(page.getByText("Dictat Interactiu")).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder("Escriu aquí el text del dictat...").fill("El gat seia al coixí.");
    await page.getByRole("button", { name: "Crea el dictat 🚀" }).click();

    // Wait for edit screen
    await expect(page.url()).toContain("/edit/", { timeout: 10000 });

    // Navigate to list
    await page.goto("/list");
    await expect(page.getByText("Els meus dictats")).toBeVisible({ timeout: 10000 });

    // Should see the dictat
    const deleteButtons = page.locator('[title="Eliminar"]');
    await expect(deleteButtons.first()).toBeVisible({ timeout: 10000 });

    // Click delete
    await deleteButtons.first().click();

    // Confirm delete in modal
    await expect(page.getByText("Aquesta acció no es pot desfer.")).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "Eliminar" }).click();

    // Should show empty state or fewer dictats
    await expect(page.getByText("Encara no tens cap dictat guardat.")).toBeVisible({
      timeout: 10000,
    });
  });
});
