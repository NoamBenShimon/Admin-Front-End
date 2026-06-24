/**
 * @fileoverview Grade-by-id API route
 *
 * GET    /api/grades/[id] -> backend GET    /api/admin/grades/[id]
 * PUT    /api/grades/[id] -> backend PUT    /api/admin/grades/[id]
 * DELETE /api/grades/[id] -> backend DELETE /api/admin/grades/[id]
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyToBackend(request, `/api/admin/grades/${id}`, { method: 'GET' });
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const json = await request.json().catch(() => ({}));
  return proxyToBackend(request, `/api/admin/grades/${id}`, { method: 'PUT', json });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyToBackend(request, `/api/admin/grades/${id}`, { method: 'DELETE' });
}
