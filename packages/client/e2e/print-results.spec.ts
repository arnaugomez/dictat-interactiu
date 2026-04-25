import { expect, test } from "@playwright/test";
import { signupAndLogin } from "./helpers/auth";
import { createDictat, enablePublicLink, installPrintCapture, uniqueEmail } from "./helpers/dictats";

test.describe("Result printing", () => {
  test("reviewed practice results can be printed with corrections", async ({ page }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    const dictatId = await createDictat(page, "gat gos");
    await page.goto(`/practice/${dictatId}`);
    await expect(page.getByRole("button", { name: "Imprimir resultats" })).toHaveCount(0);
    await page.locator("input").nth(0).fill("gat");
    await page.locator("input").nth(1).fill("gat");
    await page.getByRole("button", { name: "Revisar" }).click();
    await expect(page.getByText("1 / 2 correctes")).toBeVisible();
    await installPrintCapture(page);
    await page.getByRole("button", { name: "Imprimir resultats" }).click();

    const printedHtml = await page.evaluate(
      () => (window as Window & { __printedHtml?: string }).__printedHtml,
    );
    expect(printedHtml).toContain("1 / 2 correctes");
    expect(printedHtml).toContain("gat");
    expect(printedHtml).toContain("gos");
    expect(printedHtml).toContain("answer wrong");
  });

  test("public practice visitors can print reviewed results", async ({ page, browser }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    await createDictat(page, "gat gos");
    const publicUrl = await enablePublicLink(page);

    const anonymous = await browser.newPage();
    await anonymous.goto(publicUrl);
    await anonymous.locator("input").nth(0).fill("gat");
    await anonymous.locator("input").nth(1).fill("gos");
    await anonymous.getByRole("button", { name: "Revisar" }).click();
    await expect(anonymous.getByText("2 / 2 correctes")).toBeVisible();
    await installPrintCapture(anonymous);
    await anonymous.getByRole("button", { name: "Imprimir resultats" }).click();
    const printedHtml = await anonymous.evaluate(
      () => (window as Window & { __printedHtml?: string }).__printedHtml,
    );
    expect(printedHtml).toContain("2 / 2 correctes");
    expect(printedHtml).toContain("gat");
    expect(printedHtml).toContain("gos");
    await anonymous.close();
  });
});
