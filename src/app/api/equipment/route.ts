/**
 * @fileoverview Equipment catalog API route
 *
 * GET  /api/equipment -> backend GET  /api/admin/equipment  (catalog list)
 * POST /api/equipment -> backend POST /api/admin/equipment  (create)
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/admin/equipment', { method: 'GET' });
}

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => ({}));
  return proxyToBackend(request, '/api/admin/equipment', { method: 'POST', json });
}
