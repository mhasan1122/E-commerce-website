/**
 * Thin fetch wrapper for the User app.
 * Prepends NEXT_PUBLIC_API_URL, injects Bearer token, throws ApiError on !ok.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userToken");
}

export async function api<T = unknown>(
  path: string,
  opts: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, body, ...rest } = opts;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body && typeof body !== "string" ? JSON.stringify(body) : body,
    cache: "no-store",
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : null) || res.statusText;
    throw new ApiError(res.status, message, data);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const http = {
  get: <T>(path: string, opts?: RequestInit & { auth?: boolean }) =>
    api<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: RequestInit & { auth?: boolean }) =>
    api<T>(path, { ...opts, method: "POST", body: body as BodyInit }),
  put: <T>(path: string, body?: unknown, opts?: RequestInit & { auth?: boolean }) =>
    api<T>(path, { ...opts, method: "PUT", body: body as BodyInit }),
  patch: <T>(path: string, body?: unknown, opts?: RequestInit & { auth?: boolean }) =>
    api<T>(path, { ...opts, method: "PATCH", body: body as BodyInit }),
  delete: <T>(path: string, opts?: RequestInit & { auth?: boolean }) =>
    api<T>(path, { ...opts, method: "DELETE" }),
};
