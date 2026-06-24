/**
 * @fileoverview Login API route — POST /api/auth/login
 *
 * Proxies to the backend and forwards the backend's `sessionid` cookie to the
 * browser so subsequent requests are authenticated.
 */

import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = body?.username;
  const password = body?.password;

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Username and password are required' },
      { status: 400 },
    );
  }

  return proxyToBackend(request, '/api/login', {
    method: 'POST',
    json: { username, password },
  });
}
