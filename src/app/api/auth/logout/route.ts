/**
 * @fileoverview Logout API route — POST /api/auth/logout
 *
 * Proxies to the backend and forwards the cookie-clearing `Set-Cookie` header.
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/api/logout', { method: 'POST' });
}
