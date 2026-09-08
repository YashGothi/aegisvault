/**
 * AegisVault API Service
 * Handles DRF requests, JWT Bearer headers, and automatic token refresh.
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const TOKEN_KEY_ACCESS = 'aegis_access_token';
const TOKEN_KEY_REFRESH = 'aegis_refresh_token';
const USER_KEY = 'aegis_user_info';

export const authStorage = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEY_ACCESS),
  getRefreshToken: () => localStorage.getItem(TOKEN_KEY_REFRESH),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },
  setTokens: (access, refresh, user = null) => {
    if (access) localStorage.setItem(TOKEN_KEY_ACCESS, access);
    if (refresh) localStorage.setItem(TOKEN_KEY_REFRESH, refresh);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY_ACCESS);
    localStorage.removeItem(TOKEN_KEY_REFRESH);
    localStorage.removeItem(USER_KEY);
  },
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY_ACCESS),
};

export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = authStorage.getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  let response = await fetch(url, config);

  // If 401, attempt refresh token once
  if (response.status === 401 && authStorage.getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${authStorage.getAccessToken()}`;
      config.headers = headers;
      response = await fetch(url, config);
    } else {
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(data?.detail || data?.message || (data ? JSON.stringify(data) : 'API Request Failed'));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function refreshAccessToken() {
  const refresh = authStorage.getRefreshToken();
  if (!refresh) {
    authStorage.clearAuth();
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (response.ok) {
      const data = await response.json();
      authStorage.setTokens(data.access, data.refresh || refresh);
      return true;
    } else {
      authStorage.clearAuth();
      return false;
    }
  } catch (err) {
    console.error('Failed to refresh token:', err);
    authStorage.clearAuth();
    return false;
  }
}

// ==================== AUTH API ====================
export const authApi = {
  async register(userData) {
    const data = await request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.access) {
      authStorage.setTokens(data.access, data.refresh, data.user);
    }
    return data;
  },

  async login(username, password) {
    const data = await request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.access) {
      authStorage.setTokens(data.access, data.refresh, data.user);
    }
    return data;
  },

  async getCurrentUser() {
    const user = await request('/auth/user/');
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  async logout() {
    const refresh = authStorage.getRefreshToken();
    if (refresh) {
      try {
        await request('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh }),
        });
      } catch (err) {
        console.warn('Logout API warning:', err);
      }
    }
    authStorage.clearAuth();
  },
};

// ==================== VAULT API ====================
export const vaultApi = {
  async getPasswords({ category = '', search = '', favorite = null, page = 1 } = {}) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('q', search);
    if (favorite !== null) params.append('is_favorite', favorite);
    if (page > 1) params.append('page', page);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return await request(`/vault/passwords/${queryStr}`);
  },

  async getPassword(id) {
    return await request(`/vault/passwords/${id}/`);
  },

  async createPassword(entryData) {
    return await request('/vault/passwords/', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  },

  async updatePassword(id, entryData) {
    return await request(`/vault/passwords/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(entryData),
    });
  },

  async deletePassword(id) {
    return await request(`/vault/passwords/${id}/`, {
      method: 'DELETE',
    });
  },

  async toggleFavorite(id) {
    return await request(`/vault/passwords/${id}/toggle-favorite/`, {
      method: 'POST',
    });
  },

  async getVaultStats() {
    return await request('/vault/passwords/stats/');
  },

  async evaluateStrength(password) {
    return await request('/vault/passwords/evaluate-strength/', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
};
