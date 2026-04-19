import { Effect, Context, Layer, Data } from "effect";
import { Resend, type ErrorResponse } from "resend";

export class EmailNetworkError extends Data.TaggedError("EmailNetworkError")<{
  readonly message: string;
  readonly cause: Error;
}> {}

export class EmailApiError extends Data.TaggedError("EmailApiError")<{
  readonly message: string;
  readonly cause: ErrorResponse;
}> {}

export type EmailError = EmailNetworkError | EmailApiError;

export class Email extends Context.Service<
  Email,
  {
    readonly sendVerificationEmail: (
      email: string,
      token: string,
      baseUrl: string,
    ) => Effect.Effect<void, EmailError>;
    readonly sendPasswordResetEmail: (
      email: string,
      token: string,
      baseUrl: string,
    ) => Effect.Effect<void, EmailError>;
  }
>()("@dictat/Email") {}

export const EmailLive = Layer.sync(Email, () => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || "noreply@dictteasy.com";

  const sendEmail = (
    options: Parameters<typeof resend.emails.send>[0],
  ): Effect.Effect<void, EmailError> =>
    Effect.tryPromise({
      try: () => resend.emails.send(options),
      catch: (cause) =>
        new EmailNetworkError({
          message: cause instanceof Error ? cause.message : String(cause),
          cause: cause instanceof Error ? cause : new Error(String(cause)),
        }),
    }).pipe(
      Effect.flatMap((response) => {
        if (response.error) {
          return Effect.fail(
            new EmailApiError({
              message: response.error.message,
              cause: response.error,
            }),
          );
        }
        return Effect.void;
      }),
    );

  return {
    sendVerificationEmail: (email: string, token: string, baseUrl: string) =>
      sendEmail({
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

    sendPasswordResetEmail: (email: string, token: string, baseUrl: string) =>
      sendEmail({
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
  };
});

export const EmailMock = Layer.sync(Email, () => {
  const sentEmails: Array<{ to: string; type: string; token: string }> = [];

  return {
    sendVerificationEmail: (email: string, token: string, baseUrl: string) =>
      Effect.sync(() => {
        sentEmails.push({ to: email, type: "verification", token });
        console.log(`[MOCK EMAIL] Verification email to ${email}`);
        console.log(`  → ${baseUrl}/verify-email?token=${token}`);
      }),

    sendPasswordResetEmail: (email: string, token: string, baseUrl: string) =>
      Effect.sync(() => {
        sentEmails.push({ to: email, type: "password-reset", token });
        console.log(`[MOCK EMAIL] Password reset email to ${email}`);
        console.log(`  → ${baseUrl}/reset-password?token=${token}`);
      }),
  };
});
