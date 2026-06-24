/**
 * @fileoverview School-by-id API route
 *
 * GET    /api/schools/[id] -> backend GET    /api/admin/schools/[id]
 * PUT    /api/schools/[id] -> backend PUT    /api/admin/schools/[id]
 * DELETE /api/schools/[id] -> backend DELETE /api/admin/schools/[id]
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyToBackend(request, `/api/admin/schools/${id}`, { method: 'GET' });
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const json = await request.json().catch(() => ({}));
  return proxyToBackend(request, `/api/admin/schools/${id}`, { method: 'PUT', json });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyToBackend(request, `/api/admin/schools/${id}`, { method: 'DELETE' });
}
