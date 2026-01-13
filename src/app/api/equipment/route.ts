/**
 * @fileoverview Equipment API Route
 *
 * GET /api/equipment - Get all equipment
 * POST /api/equipment - Create new equipment
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendGetEquipment, backendCreateEquipment } from '@/services/backendApi';

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie');
    const equipment = await backendGetEquipment(cookie || undefined);

    return NextResponse.json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    console.error('Get equipment error:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie');
    const body = await request.json();

    const equipment = await backendCreateEquipment(body, cookie || undefined);

    return NextResponse.json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    console.error('Create equipment error:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create equipment' },
      { status: 500 }
    );
  }
}

