import { Effect, Context, Layer } from "effect";
import { Resend } from "resend";

export class Email extends Context.Service<
  Email,
  {
    readonly sendVerificationEmail: (
      email: string,
      token: string,
      baseUrl: string,
    ) => Effect.Effect<void>;
    readonly sendPasswordResetEmail: (
      email: string,
      token: string,
      baseUrl: string,
    ) => Effect.Effect<void>;
  }
>()("@dictat/Email") {}

export const EmailLive = Layer.sync(Email, () => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || "noreply@dictteasy.com";

  return {
    sendVerificationEmail: (email: string, token: string, baseUrl: string) =>
      Effect.promise(() =>
        resend.emails.send({
          from,
          to: email,
          subject: "Verifica el teu correu - Dictat Interactiu",
          html: `
            <h1>Benvingut a Dictat Interactiu!</h1>
            <p>Fes clic a l'enllaç per verificar el teu correu electrònic:</p>
            <p><a href="${baseUrl}/verify-email?token=${token}">Verificar correu</a></p>
            <p>Aquest enllaç caduca en 1 hora.</p>
          `,
        }),
      ).pipe(Effect.asVoid),

    sendPasswordResetEmail: (email: string, token: string, baseUrl: string) =>
      Effect.promise(() =>
        resend.emails.send({
          from,
          to: email,
          subject: "Restablir contrasenya - Dictat Interactiu",
          html: `
            <h1>Restablir contrasenya</h1>
            <p>Fes clic a l'enllaç per restablir la teva contrasenya:</p>
            <p><a href="${baseUrl}/reset-password?token=${token}">Restablir contrasenya</a></p>
            <p>Aquest enllaç caduca en 1 hora.</p>
          `,
        }),
      ).pipe(Effect.asVoid),
  };
});

export const EmailMock = Layer.sync(Email, () => {
  const sentEmails: Array<{ to: string; type: string; token: string }> = [];

  return {
    sendVerificationEmail: (email: string, token: string, _baseUrl: string) =>
      Effect.sync(() => {
        sentEmails.push({ to: email, type: "verification", token });
        console.log(`[MOCK EMAIL] Verification email to ${email} with token ${token}`);
      }),

    sendPasswordResetEmail: (email: string, token: string, _baseUrl: string) =>
      Effect.sync(() => {
        sentEmails.push({ to: email, type: "password-reset", token });
        console.log(`[MOCK EMAIL] Password reset email to ${email} with token ${token}`);
      }),
  };
});
