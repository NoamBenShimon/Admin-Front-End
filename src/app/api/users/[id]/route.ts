/**
 * @fileoverview User-by-id API route
 *
 * PUT    /api/users/[id] -> backend PUT    /api/admin/users/[id]  (rename / reset password)
 * DELETE /api/users/[id] -> backend DELETE /api/admin/users/[id]
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const json = await request.json().catch(() => ({}));
  return proxyToBackend(request, `/api/admin/users/${id}`, { method: 'PUT', json });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyToBackend(request, `/api/admin/users/${id}`, { method: 'DELETE' });
}
