/**
 * @fileoverview Parent users API route
 *
 * GET  /api/users -> backend GET  /api/admin/users  (list)
 * POST /api/users -> backend POST /api/admin/users  (create)
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/admin/users', { method: 'GET' });
}

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => ({}));
  return proxyToBackend(request, '/api/admin/users', { method: 'POST', json });
}
