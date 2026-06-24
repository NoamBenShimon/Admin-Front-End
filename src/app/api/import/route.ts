/**
 * @fileoverview CSV import API route — POST /api/import
 *
 * Forwards the uploaded CSV (multipart) to backend POST /api/admin/import.
 * Expected columns: school,grade,equipment,price,quantity
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendRequest } from '@/services/backendApi';

export async function POST(request: NextRequest) {
  const cookie = request.headers.get('cookie');

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided or invalid file' }, { status: 400 });
  }
  if (!file.name.endsWith('.csv')) {
    return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 });
  }

  const forward = new FormData();
  forward.append('file', file);

  const result = await backendRequest('/api/admin/import', { method: 'POST', cookie, body: forward });
  const ok = result.status >= 200 && result.status < 300;
  const payload = ok
    ? { success: true, data: result.data }
    : typeof result.data === 'object' && result.data !== null
      ? result.data
      : { error: String(result.data) };

  return NextResponse.json(payload, { status: result.status });
}
