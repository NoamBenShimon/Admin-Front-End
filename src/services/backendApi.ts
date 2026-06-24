/**
 * @fileoverview Backend proxy (server-side)
 *
 * Helpers used by the Next.js `/api/*` route handlers to forward requests to
 * the Go backend. The backend URL stays server-side (never exposed to the
 * browser) and the session cookie is forwarded in both directions, so the
 * httpOnly `sessionid` cookie the backend issues on login reaches the browser.
 *
 * Admin endpoints are namespaced under the backend's `/api/admin/*`; until the
 * backend implements them, calls fail and the client falls back to mock data
 * (see `services/api.ts`). When the backend can't be reached at all this returns
 * HTTP 503 so that fallback kicks in.
 *
 * @module services/backendApi
 */

import { NextRequest, NextResponse } from 'next/server';

function getBackendUrl(): string {
  const url = process.env.API_URL;
  if (!url) {
    throw new Error('API_URL environment variable is not set');
  }
  return url;
}

export interface BackendResult {
  status: number;
  data: unknown;
  setCookie: string | null;
}

/** Low-level call to the backend. Never throws on connectivity — returns 503. */
export async function backendRequest(
  endpoint: string,
  opts: { method?: string; cookie?: string | null; json?: unknown; body?: BodyInit } = {},
): Promise<BackendResult> {
  const { method = 'GET', cookie } = opts;
  const headers: Record<string, string> = {};
  if (cookie) headers['Cookie'] = cookie;

  let body = opts.body;
  if (opts.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.json);
  }

  let response: Response;
  try {
    response = await fetch(`${getBackendUrl()}${endpoint}`, { method, headers, body });
  } catch {
    return { status: 503, data: { error: 'Backend unavailable' }, setCookie: null };
  }

  const contentType = response.headers.get('content-type');
  const data =
    contentType && contentType.includes('application/json')
      ? await response.json()
      : await response.text();

  return { status: response.status, data, setCookie: response.headers.get('set-cookie') };
}

/**
 * Proxy an incoming Next request to the backend and build a Next response,
 * wrapping success bodies in the `{ success, data }` envelope the client
 * expects and forwarding any `Set-Cookie` (e.g. the login session) to the browser.
 */
export async function proxyToBackend(
  request: NextRequest,
  endpoint: string,
  opts: { method?: string; json?: unknown } = {},
): Promise<NextResponse> {
  const cookie = request.headers.get('cookie');
  const result = await backendRequest(endpoint, {
    method: opts.method ?? request.method,
    cookie,
    json: opts.json,
  });

  const ok = result.status >= 200 && result.status < 300;
  const payload = ok
    ? { success: true, data: result.data }
    : typeof result.data === 'object' && result.data !== null
      ? result.data
      : { error: String(result.data) };

  const response = NextResponse.json(payload, { status: result.status });
  if (result.setCookie) response.headers.set('set-cookie', result.setCookie);
  return response;
}
