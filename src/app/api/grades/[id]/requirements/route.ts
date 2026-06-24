/**
 * @fileoverview Grade requirements API route (a grade's equipment list)
 *
 * GET /api/grades/[id]/requirements -> backend GET /api/admin/grades/[id]/requirements
 * PUT /api/grades/[id]/requirements -> backend PUT /api/admin/grades/[id]/requirements
 *   body: { items: [{ equipmentId, quantity }] }  (replace-all)
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyToBackend(request, `/api/admin/grades/${id}/requirements`, { method: 'GET' });
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const json = await request.json().catch(() => ({}));
  return proxyToBackend(request, `/api/admin/grades/${id}/requirements`, { method: 'PUT', json });
}
