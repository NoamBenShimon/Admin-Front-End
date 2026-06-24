/**
 * @fileoverview Order-by-id API route
 *
 * GET /api/orders/[id] -> backend GET /api/admin/orders/[id]
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyToBackend(request, `/api/admin/orders/${id}`, { method: 'GET' });
}
