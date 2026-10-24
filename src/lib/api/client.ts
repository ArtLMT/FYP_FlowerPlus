import { ApiError, type ErrorMessages } from "./errors";

/** Spring Data page envelope returned by every paged endpoint. */
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** Sent as JSON, or as-is when it is FormData. */
  body?: unknown;
  headers?: HeadersInit;
  /** How this call words its failures; defaults to the shared messages. */
  errors?: ErrorMessages;
}

/**
 * The one place the frontend talks to the backend.
 *
 * In the browser, requests stay same-origin: Next.js rewrites /api/* to Spring Boot, so the HttpOnly
 * auth cookies travel with them. On the server, requests go straight to FLOWERPLUS_API_ORIGIN.
 * Responses are never cached. Every failure is thrown as an ApiError with a display-ready message.
 */
export async function api<T>(
  path: string,
  { method = "GET", body, headers, errors }: RequestOptions = {},
): Promise<T> {
  const isJson = body !== undefined && !(body instanceof FormData);
  const url = typeof window === "undefined"
    ? new URL(path, process.env.FLOWERPLUS_API_ORIGIN ?? "http://localhost:8080").toString()
    : path;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      body: isJson ? JSON.stringify(body) : (body as FormData | undefined),
      credentials: "same-origin",
      headers: { ...(isJson ? { "Content-Type": "application/json" } : {}), ...headers },
      cache: "no-store",
    });
  } catch {
    throw ApiError.network(errors);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new ApiError(response.status, payload, errors);
  }
  if (response.status === 204) return undefined as T;
  return response.json().catch(() => {
    throw ApiError.network(errors);
  });
}

/** Builds an API path, URL-encoding every interpolated value: path`/api/addresses/${id}`. */
export function path(strings: TemplateStringsArray, ...values: Array<string | number>): string {
  return strings.reduce((url, part, index) => url + encodeURIComponent(String(values[index - 1])) + part);
}

/** Appends a query string, leaving out empty values. */
export function withQuery(url: string, params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const search = query.toString();
  return search ? `${url}?${search}` : url;
}
