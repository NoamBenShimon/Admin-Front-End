/**
 * @fileoverview Authentication Login API Route
 *
 * POST /api/auth/login
 * Proxies login requests to the backend with enhanced security.
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendLogin } from '@/services/backendApi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Call backend login
    const response = await backendLogin(username, password);

    // Create response with session cookie if backend provides one
    const nextResponse = NextResponse.json({
      success: true,
      data: response,
    });

    // TODO: If backend returns a session cookie, forward it
    // Note: This depends on how backend handles sessions

    return nextResponse;
  } catch (error) {
    console.error('Login API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    const statusCode = errorMessage.includes('401') || errorMessage.includes('Invalid') ? 401 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

