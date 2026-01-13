/**
 * @fileoverview Equipment by ID API Route
 *
 * PUT /api/equipment/[id] - Update equipment
 * DELETE /api/equipment/[id] - Delete equipment
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendUpdateEquipment, backendDeleteEquipment } from '@/services/backendApi';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookie = request.headers.get('cookie');
    const body = await request.json();
    const { id } = params;

    const equipment = await backendUpdateEquipment(id, body, cookie || undefined);

    return NextResponse.json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    console.error('Update equipment error:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update equipment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookie = request.headers.get('cookie');
    const { id } = params;

    await backendDeleteEquipment(id, cookie || undefined);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete equipment error:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete equipment' },
      { status: 500 }
    );
  }
}

