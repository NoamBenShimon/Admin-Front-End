/**
 * @fileoverview Schools API route
 *
 * GET  /api/schools  -> backend GET  /api/admin/schools  (list, includes nameHe)
 * POST /api/schools  -> backend POST /api/admin/schools  (create)
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/admin/schools', { method: 'GET' });
}

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => ({}));
  return proxyToBackend(request, '/api/admin/schools', { method: 'POST', json });
}
