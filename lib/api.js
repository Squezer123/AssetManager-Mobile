import { API_URL, getToken } from './auth';

async function authorizedFetch(path, options = {}) {
  const token = await getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Wystąpił błąd');
  }

  return data;
}

export function editReservation(id, { startDate, endDate }) {
  return authorizedFetch(`/reservations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ startDate, endDate }),
  });
}

export function getMyReservations() {
  return authorizedFetch('/reservations/me');
}

export function cancelReservation(id) {
  return authorizedFetch(`/reservations/${id}/cancel`, { method: 'PATCH' });
}

export function returnReservation(id) {
  return authorizedFetch(`/reservations/${id}/return`, { method: 'PATCH' });
}
