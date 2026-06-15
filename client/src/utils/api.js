const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('portfolio_auth_token');
  }
  return null;
}

export function setToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('portfolio_auth_token', token);
  }
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('portfolio_auth_token');
  }
}

export function isAuthenticated() {
  return !!getToken();
}

export async function fetchApi(endpoint, options = {}) {
  const token = getToken();
  
  // Clean endpoint path: ensure starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (_) {
      // Ignore text parse errors
    }
    // Log full error detail to browser console for debugging
    console.error(`[API Error] ${options.method || 'GET'} ${url} → ${response.status}`, errorData);
    const message = errorData?.title || errorData?.error || errorData?.message || `HTTP error! status: ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.detail = errorData;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
