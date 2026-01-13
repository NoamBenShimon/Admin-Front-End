/**
 * @fileoverview Orders API Route
 *
 * GET /api/orders - Get all orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendGetOrders } from '@/services/backendApi';

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie');

    // Extract query parameters for filtering
    const { searchParams } = new URL(request.url);
    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      filters[key] = value;
    });

    const orders = await backendGetOrders(
      Object.keys(filters).length > 0 ? filters : undefined,
      cookie || undefined
    );

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

