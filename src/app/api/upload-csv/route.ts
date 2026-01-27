/**
 * @fileoverview CSV Upload API Route
 *
 * POST /api/upload-csv - Upload a CSV file to the backend
 *
 * This route proxies the file upload request to the backend server,
 * forwarding the session cookie for authentication.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Get backend API base URL from environment
 */
function getBackendUrl(): string {
    const url = process.env.API_URL;
    if (!url) {
        throw new Error('API_URL environment variable is not set');
    }
    return url;
}

export async function POST(request: NextRequest) {
    try {
        const cookie = request.headers.get('cookie');

        // Get the form data from the request
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: 'No file provided or invalid file' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.name.endsWith('.csv')) {
            return NextResponse.json(
                { error: 'Only CSV files are allowed' },
                { status: 400 }
            );
        }

        // Create a new FormData to send to the backend
        const backendFormData = new FormData();
        backendFormData.append('file', file);

        // Forward the request to the backend
        const backendUrl = `${getBackendUrl()}/api/upload-csv`;

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: cookie ? { Cookie: cookie } : {},
            body: backendFormData,
        });

        // Parse the response
        let data: unknown;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            const errorMessage =
                (typeof data === 'object' && data !== null && 'error' in data && typeof (data as Record<string, unknown>).error === 'string'
                    ? (data as Record<string, unknown>).error
                    : null) ||
                (typeof data === 'object' && data !== null && 'message' in data && typeof (data as Record<string, unknown>).message === 'string'
                    ? (data as Record<string, unknown>).message
                    : null) ||
                `Upload failed with status ${response.status}`;

            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('CSV upload error:', error);

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to upload CSV file' },
            { status: 500 }
        );
    }
}