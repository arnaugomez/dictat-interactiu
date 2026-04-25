import { expect, test } from "@playwright/test";
import { signupAndLogin } from "./helpers/auth";
import { createDictat, enablePublicLink, uniqueEmail } from "./helpers/dictats";

test.describe("Public links", () => {
  test("anonymous visitors can practice public dictations without edit navigation", async ({
    page,
    browser,
  }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    await createDictat(page, "gat gos");
    const publicUrl = await enablePublicLink(page);

    const anonymous = await browser.newPage();
    await anonymous.goto(publicUrl);
    await expect(anonymous.getByText("gat gos")).not.toBeVisible();
    await expect(anonymous.getByRole("button", { name: "Editar" })).toHaveCount(0);
    await anonymous.locator("input").nth(0).fill("gat");
    await anonymous.locator("input").nth(1).fill("gat");
    await anonymous.getByRole("button", { name: "Revisar" }).click();
    await expect(anonymous.getByText("1 / 2 correctes")).toBeVisible();
    await anonymous.getByRole("button", { name: "Veure correcció" }).click();
    await expect(anonymous.getByText("gos")).toBeVisible();
    await anonymous.close();
  });

  test("disabling and re-enabling sharing keeps the same URL", async ({ page, browser }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    await createDictat(page, "gat gos");
    const publicUrl = await enablePublicLink(page);
    await page.getByRole("button", { name: "Activar enllaç públic" }).click();
    await expect(page.getByRole("button", { name: "Copiar" })).toBeDisabled();

    const anonymous = await browser.newPage();
    await anonymous.goto(publicUrl);
    await expect(anonymous.getByText("Dictat no trobat.")).toBeVisible({ timeout: 10000 });
    await anonymous.close();

    await page.getByRole("button", { name: "Activar enllaç públic" }).click();
    await expect(page.getByRole("button", { name: "Copiar" })).toBeEnabled();
    await expect(page.getByRole("textbox", { name: "Enllaç públic" })).toHaveValue(publicUrl);

    const anonymousAgain = await browser.newPage();
    await anonymousAgain.goto(publicUrl);
    await expect(anonymousAgain.getByRole("button", { name: "Revisar" })).toBeVisible({
      timeout: 10000,
    });
    await anonymousAgain.close();
  });

  test("owner sees edit navigation on the public URL and non-owner does not", async ({
    page,
    browser,
  }) => {
    await signupAndLogin(page, { email: uniqueEmail(), password: "password123" });
    await createDictat(page, "gat gos");
    const publicUrl = await enablePublicLink(page);

    await page.goto(publicUrl);
    await expect(page).toHaveURL(publicUrl);
    await expect(page.getByRole("button", { name: "Editar" })).toBeVisible({ timeout: 10000 });

    const nonOwner = await browser.newPage();
    await signupAndLogin(nonOwner, { email: uniqueEmail(), password: "password123" });
    await nonOwner.goto(publicUrl);
    await expect(nonOwner.getByRole("button", { name: "Editar" })).toHaveCount(0);
    await nonOwner.close();
  });
});
