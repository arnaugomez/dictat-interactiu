import { test, expect } from "@playwright/test";
import { requestPasswordResetToken, signupAndLogin } from "./helpers/auth";

const uniqueEmail = () => `test+${Date.now()}@example.com`;

test.describe("Auth", () => {
  test("signup redirects to verify email page", async ({ page }) => {
    const email = uniqueEmail();

    await page.goto("/signup");
    await page.getByLabel("Nom").fill("Test User");
    await page.getByLabel("Correu electrònic").fill(email);
    // Use first password field (not confirm)
    const passwordFields = page.getByLabel("Contrasenya");
    await passwordFields.first().fill("password123");
    await page.getByLabel("Confirma la contrasenya").fill("password123");
    await page.getByRole("button", { name: "Crear compte" }).click();

    // Should be redirected to verify email screen
    await expect(page.getByText("Verifica el teu correu")).toBeVisible({ timeout: 10000 });
  });

  test("login with valid credentials shows home screen", async ({ page }) => {
    const email = uniqueEmail();

    // Set up a verified user
    await signupAndLogin(page, { email, password: "password123" });

    // Should be on home screen after successful login
    await expect(page.getByText("Dictat Interactiu")).toBeVisible({ timeout: 10000 });
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/");

    // Try to login with wrong credentials
    await page.getByLabel("Correu electrònic").fill("nonexistent@example.com");
    await page.getByLabel("Contrasenya").fill("wrongpassword");
    await page.getByRole("button", { name: "Iniciar sessió" }).click();

    // Should show error message
    await expect(page.getByText("Invalid email or password")).toBeVisible({ timeout: 10000 });
  });

  test("logout redirects to login page", async ({ page }) => {
    const email = uniqueEmail();

    // Set up a verified user and log in
    await signupAndLogin(page, { email, password: "password123" });

    // Should be on home screen
    await expect(page.getByText("Dictat Interactiu")).toBeVisible({ timeout: 10000 });

    // Click logout button
    await page.getByRole("button", { name: "Sortir" }).click();

    // Should be redirected to login page
    await expect(page.getByRole("heading", { name: "Iniciar sessió" })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole("button", { name: "Iniciar sessió" })).toBeVisible();
  });

  test("signup rejects mismatched passwords", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Nom").fill("Test User");
    await page.getByLabel("Correu electrònic").fill(uniqueEmail());
    await page.getByLabel("Contrasenya").first().fill("password123");
    await page.getByLabel("Confirma la contrasenya").fill("password456");
    await page.getByRole("button", { name: "Crear compte" }).click();

    await expect(page.getByText("Les contrasenyes no coincideixen")).toBeVisible();
  });

  test("forgot password shows the email sent confirmation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Has oblidat la contrasenya?" }).click();
    await page.getByLabel("Correu electrònic").fill("recover@example.com");
    await page.getByRole("button", { name: "Enviar enllaç" }).click();

    await expect(page.getByText("Hem enviat un correu")).toBeVisible({ timeout: 10000 });
  });

  test("password reset lets the user login with the new password", async ({ page }) => {
    const email = uniqueEmail();
    await signupAndLogin(page, { email, password: "password123" });
    await page.getByRole("button", { name: "Sortir" }).click();
    const token = await requestPasswordResetToken(email);

    await page.goto(`/reset-password?token=${token}`);
    await page.getByLabel("Nova contrasenya", { exact: true }).fill("newpassword123");
    await page.getByLabel("Confirma la nova contrasenya").fill("newpassword123");
    await page.getByRole("button", { name: "Canviar contrasenya" }).click();
    await expect(page.getByText("La contrasenya s'ha canviat correctament.")).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("button", { name: "Anar a l'inici de sessió" }).click();
    await page.getByLabel("Correu electrònic").fill(email);
    await page.getByLabel("Contrasenya").fill("newpassword123");
    await page.getByRole("button", { name: "Iniciar sessió" }).click();
    await expect(page.getByText("Dictat Interactiu")).toBeVisible({ timeout: 10000 });
  });
});
