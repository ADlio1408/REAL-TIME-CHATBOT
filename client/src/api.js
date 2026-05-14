const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const token = localStorage.getItem('chat-token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export function login(username, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function register(username, password) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function getUsers() {
  return request('/api/auth/users');
}

export function getRooms() {
  return request('/api/rooms');
}

export function createRoom(payload) {
  return request('/api/rooms', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMessages(roomId) {
  return request(`/api/messages/${roomId}?page=1&limit=60`);
}

export function sendMessage(roomId, text) {
  return request('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ roomId, text }),
  });
}

export { API_URL };
