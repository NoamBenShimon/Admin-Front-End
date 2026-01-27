/**
 * @fileoverview Backend API Client (Server-Side)
 *
 * This module provides server-side functions for communicating with the backend API.
 * Used by Next.js API routes to proxy requests securely.
 *
 * SECURITY FEATURES:
 * - Backend URL is kept server-side (not exposed to client)
 * - Session validation happens on server
 * - Credentials and tokens are managed server-side
 *
 * @module services/backendApi
 */

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

/**
 * Generic backend API request function
 */
export async function backendFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
  const url = `${getBackendUrl()}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
          (typeof data === 'object' && data?.error) ||
          (typeof data === 'object' && data?.message) ||
          `Backend request failed with status ${response.status}`;

      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('Backend API error:', error);
    throw error;
  }
}

// =============================================================================
// Authentication with Backend
// =============================================================================

/**
 * Authenticate with backend
 */
export async function backendLogin(username: string, password: string) {
  return backendFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

/**
 * Logout from backend
 */
export async function backendLogout(sessionCookie?: string) {
  return backendFetch('/api/logout', {
    method: 'POST',
    headers: sessionCookie ? { Cookie: sessionCookie } : {},
  });
}

/**
 * Check auth status with backend
 */
export async function backendCheckAuth(sessionCookie?: string) {
  return backendFetch('/api/auth/status', {
    method: 'GET',
    headers: sessionCookie ? { Cookie: sessionCookie } : {},
  });
}

// =============================================================================
// Equipment API
// =============================================================================

export async function backendGetEquipment(sessionCookie?: string) {
  return backendFetch('/api/equipment', {
    method: 'GET',
    headers: sessionCookie ? { Cookie: sessionCookie } : {},
  });
}

export async function backendCreateEquipment(data: any, sessionCookie?: string) {
  return backendFetch('/api/equipment', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: sessionCookie ? { Cookie: sessionCookie } : {},
  });
}

export async function backendUpdateEquipment(id: string, data: any, sessionCookie?: string) {
  return backendFetch(`/api/equipment/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: sessionCookie ? { Cookie: sessionCookie } : {},
  });
}

export async function backendDeleteEquipment(id: string, sessionCookie?: string) {
  return backendFetch(`/api/equipment/${id}`, {
    method: 'DELETE',
    headers: sessionCookie ? { Cookie: sessionCookie } : {},
  });
}

// =============================================================================
// Orders API
// =============================================================================

export async function backendGetOrders(filters?: Record<string, string>, sessionCookie?: string) {
  const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
  return backendFetch(`/api/orders${query}`, {
    method: 'GET',
    headers: sessionCookie ? { Cookie: sessionCookie } : {},
  });
}

export async function backendUpdateOrderStatus(id: string, data: any, sessionCookie?: string) {
  return backendFetch(`/api/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: sessionCookie ? { Cookie: sessionCookie } : {},
  });
}

// =============================================================================
// CSV Upload API
// =============================================================================

/**
 * Upload a CSV file to the backend
 * Note: This uses a different approach than backendFetch because we need to send FormData
 */
export async function backendUploadCsv(file: File, sessionCookie?: string) {
  const url = process.env.API_URL;
  if (!url) {
    throw new Error('API_URL environment variable is not set');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${url}/api/upload-csv`, {
    method: 'POST',
    headers: sessionCookie ? { Cookie: sessionCookie } : {},
    body: formData,
  });

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
        (typeof data === 'object' && data?.error) ||
        (typeof data === 'object' && data?.message) ||
        `CSV upload failed with status ${response.status}`;

    throw new Error(errorMessage);
  }

  return data;
}
