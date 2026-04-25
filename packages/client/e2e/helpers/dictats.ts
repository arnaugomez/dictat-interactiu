import { expect, type Page } from "@playwright/test";

/**
 * Creates a unique e2e account email address.
 *
 * @returns A unique email address for an isolated test user.
 */
export function uniqueEmail(): string {
  return `test+${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

/**
 * Creates a dictation through the UI and returns its identifier.
 *
 * @param page Playwright page where an authenticated user is on the home screen.
 * @param text Dictation text to create.
 * @returns The created dictation identifier from the edit URL.
 */
export async function createDictat(page: Page, text: string): Promise<string> {
  await expect(page.getByText("Dictat Interactiu")).toBeVisible({ timeout: 10000 });
  await page.getByPlaceholder("Escriu aquí el text del dictat...").fill(text);
  await page.getByRole("button", { name: "Crea el dictat 🚀" }).click();
  await page.waitForURL(/\/edit\//, { timeout: 10000 });
  return new URL(page.url()).pathname.split("/").at(-1) ?? "";
}

/**
 * Enables the public sharing link for the current dictation.
 *
 * @param page Playwright page where the owner is viewing a dictation edit screen.
 * @returns The public URL generated for the dictation.
 */
export async function enablePublicLink(page: Page): Promise<string> {
  await page.getByRole("button", { name: /Compartir/ }).click();
  await expect(page.getByRole("dialog", { name: "Compartir dictat" })).toBeVisible();
  const linkInput = page.getByRole("textbox", { name: "Enllaç públic" });
  const publicUrl = await linkInput.inputValue();
  await expect(page.getByRole("button", { name: "Copiar" })).toBeDisabled();
  const sharingEnabled = page.waitForResponse(
    (response) =>
      response.request().method() === "PUT" &&
      /\/api\/dictats\/[^/]+$/.test(new URL(response.url()).pathname) &&
      response.ok(),
  );
  await page.getByRole("button", { name: "Activar enllaç públic" }).click();
  await sharingEnabled;
  await expect(page.getByRole("button", { name: "Copiar" })).toBeEnabled();
  return publicUrl;
}

/**
 * Replaces the print window with a capture object for print assertions.
 *
 * @param page Playwright page where a print action will be triggered.
 * @returns Nothing.
 */
export async function installPrintCapture(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as Window & { __printedHtml?: string }).__printedHtml = "";
    window.open = () =>
      ({
        document: {
          write: (html: string) => {
            (window as Window & { __printedHtml?: string }).__printedHtml = html;
          },
          close: () => {},
        },
        focus: () => {},
        print: () => {},
      }) as Window;
  });
}
