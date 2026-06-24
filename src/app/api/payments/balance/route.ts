/**
 * @fileoverview Stripe balance API route
 *
 * GET /api/payments/balance -> backend GET /api/admin/payments/balance
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/admin/payments/balance', { method: 'GET' });
}
