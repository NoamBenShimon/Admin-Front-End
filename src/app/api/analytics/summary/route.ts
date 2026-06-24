/**
 * @fileoverview Analytics summary API route
 *
 * GET /api/analytics/summary -> backend GET /api/admin/analytics/summary
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/admin/analytics/summary', { method: 'GET' });
}
