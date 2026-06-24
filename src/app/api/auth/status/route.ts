/**
 * @fileoverview Auth status API route — GET /api/auth/status
 *
 * Returns `{ authenticated, userid, username, role }`. A 503 (backend
 * unreachable) lets the client fall back to mock auth; anything else non-2xx is
 * reported as unauthenticated.
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendRequest } from '@/services/backendApi';

export async function GET(request: NextRequest) {
  const cookie = request.headers.get('cookie');
  const result = await backendRequest('/api/auth/status', { method: 'GET', cookie });

  if (result.status >= 200 && result.status < 300) {
    const data = typeof result.data === 'object' && result.data !== null ? result.data : {};
    return NextResponse.json({ success: true, data: { authenticated: true, ...data } });
  }

  return NextResponse.json(
    { authenticated: false, error: 'Not authenticated' },
    { status: result.status === 503 ? 503 : 401 },
  );
}
