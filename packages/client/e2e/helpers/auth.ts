import type { Page } from "@playwright/test";
import { Database } from "bun:sqlite";

const SERVER_URL = "http://localhost:3000";
const DB_PATH = "../server/test.db";

function getVerificationToken(dbPath: string, email: string): string {
  const db = new Database(dbPath);
  const row = db
    .query(
      "SELECT evt.id FROM email_verification_tokens evt JOIN users u ON evt.user_id = u.id WHERE u.email = ?",
    )
    .get(email);
  db.close();
  return (row as { id: string }).id;
}

export interface AuthParams {
  name?: string;
  email: string;
  password: string;
}

export async function signupAndLogin(page: Page, params: AuthParams): Promise<void> {
  const { name = "Test User", email, password } = params;

  // Sign up via API
  const signupRes = await fetch(`${SERVER_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!signupRes.ok) {
    throw new Error(`Signup failed: ${signupRes.status} ${await signupRes.text()}`);
  }

  const setCookieHeader = signupRes.headers.get("set-cookie");
  const sessionMatch = setCookieHeader?.match(/session=([^;]+)/);
  const sessionId = sessionMatch?.[1];

  if (!sessionId) {
    throw new Error("No session cookie returned from signup");
  }

  // Get verification token from DB
  const token = getVerificationToken(DB_PATH, email.toLowerCase());

  // Verify email via API
  const verifyRes = await fetch(`${SERVER_URL}/api/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `session=${sessionId}`,
    },
    body: JSON.stringify({ token }),
  });

  if (!verifyRes.ok) {
    throw new Error(`Email verification failed: ${verifyRes.status} ${await verifyRes.text()}`);
  }

  // Set the session cookie in the browser
  await page.goto("/");
  await page.context().addCookies([
    {
      name: "session",
      value: sessionId,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  // Reload to apply the cookie
  await page.reload();
}

export async function loginViaApi(page: Page, params: { email: string; password: string }): Promise<void> {
  const { email, password } = params;

  const loginRes = await fetch(`${SERVER_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
  }

  const setCookieHeader = loginRes.headers.get("set-cookie");
  const sessionMatch = setCookieHeader?.match(/session=([^;]+)/);
  const sessionId = sessionMatch?.[1];

  if (!sessionId) {
    throw new Error("No session cookie returned from login");
  }

  // Navigate to the app first so we can set cookies on the domain
  await page.goto("/");
  await page.context().addCookies([
    {
      name: "session",
      value: sessionId,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  // Reload to apply the cookie
  await page.reload();
}
