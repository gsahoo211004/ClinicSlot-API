const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('clinicslot_token');
}

async function parseResponse(res) {
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }
  if (!res.ok) {
    const message = data?.error || data?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
}

export async function apiGet(path, auth = false) {
  const headers = {};
  if (auth) {
    const token = getToken();
    if (!token) throw new Error('Not logged in');
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { headers, credentials: 'include' });
  return parseResponse(res);
}

export async function apiPost(path, body, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (!token) throw new Error('Not logged in');
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return parseResponse(res);
}

export async function apiPatch(path, auth = true) {
  const headers = {};
  const token = getToken();
  if (!token) throw new Error('Not logged in');
  headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers,
    credentials: 'include',
  });
  return parseResponse(res);
}

export function saveSession({ token, user }) {
  localStorage.setItem('clinicslot_token', token);
  localStorage.setItem('clinicslot_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('clinicslot_token');
  localStorage.removeItem('clinicslot_user');
}

export function getStoredUser() {
  const raw = localStorage.getItem('clinicslot_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export { API_BASE };
