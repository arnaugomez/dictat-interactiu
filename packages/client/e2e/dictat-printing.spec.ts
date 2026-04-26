import { expect, test } from "@playwright/test";
import { signupAndLogin } from "./helpers/auth";
import { createDictat, installPrintCapture, uniqueEmail } from "./helpers/dictats";

test.describe("Dictat printing", () => {
  test("prints the source text", async ({ page }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    await createDictat(page, "gat gos");
    await installPrintCapture(page);

    await page.getByRole("button", { name: /Imprimir/ }).click();
    await page.getByRole("button", { name: /Text del dictat/ }).click();
    const printedHtml = await page.evaluate(
      () => (window as Window & { __printedHtml?: string }).__printedHtml,
    );
    expect(printedHtml).toContain("<h2>Text</h2>");
    expect(printedHtml).toContain("gat");
    expect(printedHtml).toContain("gos");
  });

  test("prints the exercise with blanks", async ({ page }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    await createDictat(page, "gat gos");
    await installPrintCapture(page);

    await page.getByRole("button", { name: /Imprimir/ }).click();
    await page.getByRole("button", { name: /Exercici de dictat/ }).click();
    const printedHtml = await page.evaluate(
      () => (window as Window & { __printedHtml?: string }).__printedHtml,
    );
    expect(printedHtml).toContain("<h2>Exercici</h2>");
    expect(printedHtml).toContain('class="box"');
  });

  test("prints source text and exercise together", async ({ page }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    await createDictat(page, "gat gos");
    await installPrintCapture(page);

    await page.getByRole("button", { name: /Imprimir/ }).click();
    await page.getByRole("button", { name: /Text i exercici/ }).click();
    const printedHtml = await page.evaluate(
      () => (window as Window & { __printedHtml?: string }).__printedHtml,
    );
    expect(printedHtml).toContain("<h2>Text</h2>");
    expect(printedHtml).toContain("<h2>Exercici</h2>");
    expect(printedHtml).toContain("page-break-before:always");
  });
});
