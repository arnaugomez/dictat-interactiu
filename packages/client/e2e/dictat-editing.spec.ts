import { expect, test } from "@playwright/test";
import { signupAndLogin } from "./helpers/auth";
import { createDictat, uniqueEmail, waitForDictatUpdate } from "./helpers/dictats";

test.describe("Dictat editing", () => {
  test("renaming a dictat persists in the list", async ({ page }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    await createDictat(page, "El gat juga.");
    await page.getByRole("button", { name: /202/ }).click();
    await page.getByRole("textbox").first().fill("Animals del pati");
    await page.keyboard.press("Enter");
    await waitForDictatUpdate(page);

    await page.goto("/list");
    await expect(page.getByText("Animals del pati")).toBeVisible({ timeout: 10000 });
  });

  test("editing text changes the practice blanks", async ({ page }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    const dictatId = await createDictat(page, "gat gos");
    await page.getByPlaceholder("Escriu aquí el text del dictat...").fill("gat gos sol");
    await waitForDictatUpdate(page);

    await page.goto(`/practice/${dictatId}`);
    await expect(page.locator("input")).toHaveCount(3);
  });

  test("clicking a hidden preview token reveals it in practice", async ({ page }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    const dictatId = await createDictat(page, "gat gos");
    await page.locator('[title="Clic per desocultar"]').first().click();
    await waitForDictatUpdate(page);

    await page.goto(`/practice/${dictatId}`);
    await expect(page.getByText("gat")).toBeVisible();
    await expect(page.locator("input")).toHaveCount(1);
  });

  test("clicking a visible preview token hides it in practice", async ({ page }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    const dictatId = await createDictat(page, "gat gos");
    await page.locator('[title="Clic per desocultar"]').first().click();
    await waitForDictatUpdate(page);
    await page.getByText("gat", { exact: true }).click();
    await waitForDictatUpdate(page);

    await page.goto(`/practice/${dictatId}`);
    await expect(page.locator("input")).toHaveCount(2);
  });

  test("uppercase configuration transforms practice input", async ({ page }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    const dictatId = await createDictat(page, "gat");
    await page.locator("button[aria-pressed]").first().click();
    await waitForDictatUpdate(page);

    await page.goto(`/practice/${dictatId}`);
    await page.locator("input").first().fill("gat");
    await expect(page.locator("input").first()).toHaveValue("GAT");
    await expect(page.getByText("LLETRA DE PAL")).toBeVisible();
  });

  test("font size controls update the configured practice size", async ({ page }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    const dictatId = await createDictat(page, "gat");
    await page
      .getByText("Mida de lletra", { exact: true })
      .locator("xpath=following-sibling::div/button[2]")
      .click();
    await waitForDictatUpdate(page);

    await page.goto(`/practice/${dictatId}`);
    await expect(page.getByText("24")).toBeVisible();
  });

  test("font type configuration is shown in the dictat list", async ({ page }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    await createDictat(page, "gat");
    await page.getByRole("button", { name: "Lligada" }).click();
    await waitForDictatUpdate(page);

    await page.goto("/list");
    await expect(page.getByText("Ll")).toBeVisible({ timeout: 10000 });
  });

  test("hidden percentage controls how many words are practiced", async ({ page }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    const dictatId = await createDictat(page, "u dos tres quatre cinc");
    const range = page.locator('input[type="range"]');
    await range.fill("40");
    await range.dispatchEvent("mouseup");
    await waitForDictatUpdate(page);

    await page.goto(`/practice/${dictatId}`);
    await expect(page.locator("input")).toHaveCount(2);
  });
});
