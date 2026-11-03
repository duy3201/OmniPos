export const API_BASE_URL = '/api';

export async function fetchProducts(category?: string, query?: string) {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'ALL') params.append('category', category);
    if (query) params.append('q', query);

    const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (err) {
    console.warn('API error, falling back to local dataset:', err);
    return null;
  }
}

export async function fetchCustomers(query?: string) {
  try {
    const params = new URLSearchParams();
    if (query) params.append('q', query);

    const res = await fetch(`${API_BASE_URL}/customers?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return await res.json();
  } catch (err) {
    console.warn('API error, falling back to local dataset:', err);
    return null;
  }
}

export async function fetchPrescriptions() {
  try {
    const res = await fetch(`${API_BASE_URL}/prescriptions`);
    if (!res.ok) throw new Error('Failed to fetch prescriptions');
    return await res.json();
  } catch (err) {
    console.warn('API error, falling back to local dataset:', err);
    return null;
  }
}

export async function fetchFefoBatches() {
  try {
    const res = await fetch(`${API_BASE_URL}/batches/fefo-alerts`);
    if (!res.ok) throw new Error('Failed to fetch fefo alerts');
    return await res.json();
  } catch (err) {
    console.warn('API error, falling back to local dataset:', err);
    return null;
  }
}

export async function createPosOrder(orderData: any) {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error('Failed to create order');
  return await res.json();
}
