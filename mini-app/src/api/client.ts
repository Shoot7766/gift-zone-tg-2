const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

let token: string | null = null;

export function setAuthToken(t: string | null) {
  token = t;
}

export function getAuthToken() {
  return token;
}

async function parseJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function api<T>(
  path: string,
  options: RequestInit & { json?: unknown; formData?: FormData } = {}
): Promise<T> {
  const { json, formData, ...fetchInit } = options;
  const headers: Record<string, string> = {
    ...(fetchInit.headers as Record<string, string>),
  };
  let body: BodyInit | undefined = fetchInit.body as BodyInit | undefined;

  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }
  if (formData) {
    body = formData;
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, {
    ...fetchInit,
    headers,
    body,
  });
  const data = (await parseJson(res)) as T;
  if (!res.ok) {
    const err = new Error("api_error") as Error & { status: number; data: unknown };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const apiBase = base;
