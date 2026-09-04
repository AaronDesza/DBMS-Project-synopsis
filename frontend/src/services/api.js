const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Universal JSON fetch helper with standard error handling
 */
async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({
    success: false,
    message: `Server returned non-JSON response (${response.status})`
  }));

  if (!response.ok && data.success !== false) {
    data.success = false;
    data.message = data.message || data.error || `HTTP error ${response.status}`;
  }

  return data;
}

// Tours & Destinations
export async function fetchDestinations() {
  return fetchJson('/tours/destinations');
}

export async function fetchTours(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters.difficulty && filters.difficulty !== 'All') params.append('difficulty', filters.difficulty);
  if (filters.destinationId) params.append('destinationId', filters.destinationId);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

  const queryString = params.toString();
  return fetchJson(`/tours${queryString ? '?' + queryString : ''}`);
}

export async function fetchTourById(tourId) {
  return fetchJson(`/tours/${tourId}`);
}

// Bookings
export async function fetchBookings(userId, status) {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (status) params.append('status', status);

  const queryString = params.toString();
  return fetchJson(`/bookings${queryString ? '?' + queryString : ''}`);
}

export async function createBooking(bookingData) {
  return fetchJson('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  });
}

export async function cancelBooking(bookingId) {
  return fetchJson(`/bookings/${bookingId}/cancel`, {
    method: 'PUT'
  });
}

// Reviews
export async function submitReview(reviewData) {
  return fetchJson('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
  });
}

// DBMS Explorer & Analytics
export async function fetchDbmsSchema() {
  return fetchJson('/dbms/schema');
}

export async function fetchTableRows(tableName, limit = 50) {
  return fetchJson(`/dbms/table/${encodeURIComponent(tableName)}?limit=${limit}`);
}

export async function executeCustomSqlQuery(sqlQuery) {
  return fetchJson('/dbms/query', {
    method: 'POST',
    body: JSON.stringify({ query: sqlQuery })
  });
}

export async function fetchDbmsAnalytics() {
  return fetchJson('/dbms/analytics');
}

export default {
  fetchDestinations,
  fetchTours,
  fetchTourById,
  fetchBookings,
  createBooking,
  cancelBooking,
  submitReview,
  fetchDbmsSchema,
  fetchTableRows,
  executeCustomSqlQuery,
  fetchDbmsAnalytics,
};
