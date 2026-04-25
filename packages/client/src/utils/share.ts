/**
 * Options for building a stable public dictation practice URL.
 */
export interface PublicDictatUrlOptions {
  /** Browser origin that should prefix the public path. */
  origin: string;
  /** Stable dictation identifier used in the public route. */
  dictatId: string;
}

/**
 * Builds the stable public practice URL for a dictation.
 *
 * @param options Public URL construction options.
 * @returns Absolute public practice URL.
 */
export function buildPublicDictatUrl(options: PublicDictatUrlOptions): string {
  return `${options.origin}/public/practice/${encodeURIComponent(options.dictatId)}`;
}
