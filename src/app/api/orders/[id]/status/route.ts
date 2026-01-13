/**
 * @fileoverview Order Status Update API Route
 *
 * PUT /api/orders/[id]/status - Update order status
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendUpdateOrderStatus } from '@/services/backendApi';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookie = request.headers.get('cookie');
    const body = await request.json();
    const { id } = params;

    const order = await backendUpdateOrderStatus(id, body, cookie || undefined);

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Update order status error:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update order status' },
      { status: 500 }
    );
  }
}

