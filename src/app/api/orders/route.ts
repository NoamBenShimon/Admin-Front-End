/**
 * @fileoverview Orders API route
 *
 * GET /api/orders?school_id=&grade_id=&user_id=&from=&to=
 *   -> backend GET /api/admin/orders (same query)  (read-only history)
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

export async function GET(request: NextRequest) {
  const search = new URL(request.url).search; // includes leading '?' or ''
  return proxyToBackend(request, `/api/admin/orders${search}`, { method: 'GET' });
}
