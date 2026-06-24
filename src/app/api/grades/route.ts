/**
 * @fileoverview Grades API route
 *
 * GET  /api/grades?school_id=  -> backend GET  /api/admin/grades?school_id=  (list, includes nameHe)
 * POST /api/grades             -> backend POST /api/admin/grades             (create)
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

export async function GET(request: NextRequest) {
  const schoolId = new URL(request.url).searchParams.get('school_id') ?? '';
  return proxyToBackend(request, `/api/admin/grades?school_id=${encodeURIComponent(schoolId)}`, {
    method: 'GET',
  });
}

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => ({}));
  return proxyToBackend(request, '/api/admin/grades', { method: 'POST', json });
}
