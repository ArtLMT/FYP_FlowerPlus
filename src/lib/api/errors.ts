import { COMMON_CODES, NETWORK_MESSAGE, requestFailed } from "./messages";

/**
 * API errors, already worded for the screen.
 *
 * Every failed request becomes an ApiError: `message` is the text to show, and `fieldErrors` holds
 * per-field messages when the backend rejected a form. Services pick the wording by passing an
 * ErrorMessages table to api(); screens only read what the error already says.
 */

export interface ValidationFieldError {
  field: string;
  rule: string;
  message?: string;
}

export interface ApiErrorDetails {
  fields?: ValidationFieldError[];
  [key: string]: unknown;
}

/** Messages per form field, keyed by the backend field path (e.g. "recipe[0].quantityRequired"). */
export type FieldErrors = Record<string, string[]>;

type Message = string | ((error: ApiError) => string);

/**
 * How a service words its errors. Lookup order: network → status → codes → fallback.
 * A table without its own `fallback` also uses the shared Vietnamese COMMON_CODES.
 */
export interface ErrorMessages {
  /** The server could not be reached. */
  network?: string;
  status?: Record<number, Message>;
  codes?: Record<string, Message>;
  fallback?: Message;
  /** Words VALIDATION_FAILED field details as per-field messages. */
  fields?: (fields: ValidationFieldError[]) => FieldErrors;
}

const NO_RESPONSE = 0;

export class ApiError extends Error {
  /** HTTP status, or 0 when the server could not be reached. */
  readonly status: number;
  readonly code?: string;
  readonly details: ApiErrorDetails;
  readonly fieldErrors: FieldErrors;

  constructor(
    status: number,
    body: { errorCode?: string; details?: ApiErrorDetails } = {},
    messages: ErrorMessages = {},
  ) {
    super();
    this.name = "ApiError";
    this.status = status;
    this.code = body.errorCode;
    this.details = body.details ?? {};
    this.fieldErrors = this.code === "VALIDATION_FAILED" && messages.fields
      ? messages.fields(this.details.fields ?? [])
      : {};
    this.message = describe(this, messages);
  }

  static network(messages?: ErrorMessages) {
    return new ApiError(NO_RESPONSE, {}, messages);
  }

  get isNetworkError() {
    return this.status === NO_RESPONSE;
  }

  is(...codes: string[]) {
    return this.code !== undefined && codes.includes(this.code);
  }

  /** Every field message once, in the order the backend reported them. */
  get fieldMessages(): string[] {
    return [...new Set(Object.values(this.fieldErrors).flat())];
  }

  /** How long the backend asked us to wait before retrying (0 when it did not say). */
  get retryAfterSeconds(): number {
    const seconds = this.details.retryAfterSeconds;
    return typeof seconds === "number" && seconds > 0 ? seconds : 0;
  }
}

function describe(error: ApiError, messages: ErrorMessages): string {
  if (error.isNetworkError) return messages.network ?? NETWORK_MESSAGE;

  const code = error.code ?? "";
  const message = messages.status?.[error.status]
    ?? messages.codes?.[code]
    ?? (messages.fallback === undefined ? COMMON_CODES[code] : undefined)
    ?? messages.fallback
    ?? requestFailed(error.status);
  return typeof message === "function" ? message(error) : message;
}

/** Narrows a caught value. Anything that is not an ApiError is reported as a connection problem. */
export function asApiError(cause: unknown): ApiError {
  return cause instanceof ApiError ? cause : ApiError.network();
}

/** A table that shows the same message whatever went wrong. */
export function onAnyError(message: string): ErrorMessages {
  return { network: message, fallback: message };
}

/** Groups field details by field path, wording each one with `toMessage`. */
export function groupFieldErrors(
  fields: ValidationFieldError[],
  toMessage: (field: ValidationFieldError) => string,
): FieldErrors {
  const grouped: FieldErrors = {};
  for (const field of fields) {
    grouped[field.field] = [...(grouped[field.field] ?? []), toMessage(field)];
  }
  return grouped;
}
