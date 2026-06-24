/**
 * @fileoverview Payments API route
 *
 * GET /api/payments -> backend GET /api/admin/payments  (live Stripe charges)
 */

import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/services/backendApi';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/admin/payments', { method: 'GET' });
}
