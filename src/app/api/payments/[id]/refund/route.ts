/**
 * @fileoverview Refund API route
 *
 * POST /api/payments/[id]/refund -> backend POST /api/admin/payments/[id]/refund
 *   where [id] is the Stripe charge id.
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyToBackend(request, `/api/admin/payments/${id}/refund`, { method: 'POST' });
}
