/**
 * @fileoverview Equipment-by-id API route
 *
 * GET    /api/equipment/[id] -> backend GET    /api/admin/equipment/[id]
 * PUT    /api/equipment/[id] -> backend PUT    /api/admin/equipment/[id]
 * DELETE /api/equipment/[id] -> backend DELETE /api/admin/equipment/[id]
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyToBackend(request, `/api/admin/equipment/${id}`, { method: 'GET' });
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const json = await request.json().catch(() => ({}));
  return proxyToBackend(request, `/api/admin/equipment/${id}`, { method: 'PUT', json });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyToBackend(request, `/api/admin/equipment/${id}`, { method: 'DELETE' });
}
