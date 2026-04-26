import { expect, test } from "@playwright/test";
import { signupAndLogin } from "./helpers/auth";
import { createDictat, uniqueEmail } from "./helpers/dictats";

test.describe("Dictat management", () => {
  test("list edit action opens the edit screen", async ({ page }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    await createDictat(page, "gat gos");

    await page.goto("/list");
    await page.locator('[title="Editar"]').click();
    await page.waitForURL(/\/edit\//, { timeout: 10000 });
    await expect(page.getByText("Text del dictat")).toBeVisible();
  });

  test("list practice action opens the practice screen", async ({ page }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    await createDictat(page, "gat gos");

    await page.goto("/list");
    await page.locator('[title="Practicar"]').click();
    await page.waitForURL(/\/practice\//, { timeout: 10000 });
    await expect(page.getByRole("button", { name: "Revisar" })).toBeVisible();
  });

  test("deleting from the edit screen removes the dictat", async ({ page }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    await createDictat(page, "gat gos");
    await page.getByRole("button", { name: "Eliminar aquest dictat" }).click();
    await page.getByText("Eliminar", { exact: true }).click();

    await page.waitForURL("/list", { timeout: 10000 });
    await expect(page.getByText("Encara no tens cap dictat guardat.")).toBeVisible({
      timeout: 10000,
    });
  });

  test("users only see their own dictats", async ({ page, browser }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    await createDictat(page, "dictat privat del primer usuari");

    const other = await browser.newPage();
    await signupAndLogin(other, { email: uniqueEmail(), password: "password123" });
    await other.goto("/list");
    await expect(other.getByText("dictat privat del primer usuari")).toHaveCount(0);
    await expect(other.getByText("Encara no tens cap dictat guardat.")).toBeVisible();
    await other.close();
  });
});
