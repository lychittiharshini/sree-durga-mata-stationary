export interface XeroxRates {
  bw_single: number | null;
  bw_double: number | null;
  color_single: number | null;
  color_double: number | null;
}

export interface PublicSettings {
  whatsappNumber: string;
  isConfigured: boolean;
  shopName: string;
  shopSubtitle: string;
  shopAddress?: string;
  showXeroxPrices: boolean;
  xeroxRates?: XeroxRates;
}

export interface ProductItem {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category: string;
  image_url: string | null;
  is_available: boolean;
}

export interface OfferItem {
  id: number;
  title: string;
  description: string;
  applicable_item?: string;
  offer_price?: number | null;
  discount_percentage?: number | null;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

export interface ShopImageItem {
  id: number;
  image_url: string;
  title?: string;
  description?: string;
}

export interface AdditionalServiceItem {
  id: number;
  service_name: string;
  description: string;
  details?: string;
  is_active: boolean;
}

// ==========================================
// PUBLIC API CALLS
// ==========================================

export async function fetchPublicSettings(): Promise<PublicSettings> {
  const res = await fetch('/api/settings/public');
  if (!res.ok) throw new Error('Failed to fetch shop settings');
  return res.json();
}

export async function fetchProducts(search?: string, category?: string): Promise<ProductItem[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category && category !== 'All') params.append('category', category);

  const res = await fetch(`/api/products?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return data.products || [];
}

export async function fetchOffers(): Promise<OfferItem[]> {
  const res = await fetch('/api/offers');
  if (!res.ok) return [];
  const data = await res.json();
  return data.offers || [];
}

export async function fetchShopImages(): Promise<ShopImageItem[]> {
  const res = await fetch('/api/shop-images');
  if (!res.ok) return [];
  const data = await res.json();
  return data.images || [];
}

export async function fetchAdditionalServices(): Promise<AdditionalServiceItem[]> {
  const res = await fetch('/api/additional-services');
  if (!res.ok) return [];
  const data = await res.json();
  return data.services || [];
}

// ==========================================
// ADMIN AUTH CALLS
// ==========================================

export async function loginAdmin(username: string, password: string): Promise<{ token: string; username: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to authenticate');
  }
  return data;
}

export async function logoutAdmin(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
  sessionStorage.removeItem('admin_token');
}

export async function checkAdminSession(token?: string): Promise<{ authenticated: boolean; user?: { username: string } }> {
  const authToken = token || sessionStorage.getItem('admin_token');
  if (!authToken) return { authenticated: false };

  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${authToken}` }
  });

  if (!res.ok) return { authenticated: false };
  return res.json();
}

export async function updateAdminCredentials(
  data: { currentPassword: string; newUsername?: string; newPassword?: string },
  token: string
): Promise<{ success: boolean; token: string; username: string; message: string }> {
  const res = await fetch('/api/admin/change-credentials', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to update credentials');
  }
  return body;
}

export async function updateShopWhatsAppNumber(whatsappNumber: string, token: string): Promise<{ success: boolean; whatsappNumber: string; message: string }> {
  const res = await fetch('/api/settings/whatsapp', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ whatsappNumber })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update WhatsApp number');
  }
  return data;
}

// ==========================================
// ADMIN MANAGEMENT CALLS
// ==========================================

// Products
export async function fetchAdminProducts(token: string): Promise<ProductItem[]> {
  const res = await fetch('/api/admin/products', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch admin products');
  const data = await res.json();
  return data.products || [];
}

export async function createAdminProduct(productData: Partial<ProductItem>, token: string): Promise<ProductItem> {
  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create product');
  return data.product;
}

export async function updateAdminProduct(id: number, productData: Partial<ProductItem>, token: string): Promise<ProductItem> {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update product');
  return data.product;
}

export async function deleteAdminProduct(id: number, token: string): Promise<void> {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    let errMsg = `Failed to delete product (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) errMsg = data.error;
    } catch {
      // not JSON
    }
    throw new Error(errMsg);
  }
}

// Offers
export async function fetchAdminOffers(token: string): Promise<OfferItem[]> {
  const res = await fetch('/api/admin/offers', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.offers || [];
}

export async function createAdminOffer(offerData: Partial<OfferItem>, token: string): Promise<OfferItem> {
  const res = await fetch('/api/admin/offers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(offerData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create offer');
  return data.offer;
}

export async function updateAdminOffer(id: number, offerData: Partial<OfferItem>, token: string): Promise<OfferItem> {
  const res = await fetch(`/api/admin/offers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(offerData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update offer');
  return data.offer;
}

export async function deleteAdminOffer(id: number, token: string): Promise<void> {
  const res = await fetch(`/api/admin/offers/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete offer');
}

// Shop Images
export async function addAdminShopImage(imageData: { image_url: string; title?: string; description?: string }, token: string): Promise<ShopImageItem> {
  const res = await fetch('/api/admin/shop-images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(imageData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add image');
  return data.image;
}

export async function deleteAdminShopImage(id: number, token: string): Promise<void> {
  const res = await fetch(`/api/admin/shop-images/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete image');
}

// Additional Services
export async function fetchAdminAdditionalServices(token: string): Promise<AdditionalServiceItem[]> {
  const res = await fetch('/api/admin/additional-services', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.services || [];
}

export async function createAdminAdditionalService(svcData: Partial<AdditionalServiceItem>, token: string): Promise<AdditionalServiceItem> {
  const res = await fetch('/api/admin/additional-services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(svcData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create service');
  return data.service;
}

export async function updateAdminAdditionalService(id: number, svcData: Partial<AdditionalServiceItem>, token: string): Promise<AdditionalServiceItem> {
  const res = await fetch(`/api/admin/additional-services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(svcData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update service');
  return data.service;
}

export async function deleteAdminAdditionalService(id: number, token: string): Promise<void> {
  const res = await fetch(`/api/admin/additional-services/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete service');
}

// Xerox Rates API
export async function fetchXeroxRates(): Promise<{ rates: XeroxRates; showPrices: boolean }> {
  const res = await fetch('/api/settings/xerox-rates');
  if (!res.ok) return { rates: { bw_single: 5, bw_double: 6, color_single: 10, color_double: 20 }, showPrices: false };
  const data = await res.json();
  return {
    rates: data.rates || { bw_single: 5, bw_double: 6, color_single: 10, color_double: 20 },
    showPrices: Boolean(data.showPrices)
  };
}

export async function updateXeroxRates(
  data: {
    bw_single?: number | null;
    bw_double?: number | null;
    color_single?: number | null;
    color_double?: number | null;
    show_xerox_prices?: boolean;
  },
  token: string
): Promise<{ rates: XeroxRates; showPrices: boolean; message: string }> {
  const res = await fetch('/api/settings/xerox-rates', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || 'Failed to update Xerox rates');
  return {
    rates: resData.rates,
    showPrices: Boolean(resData.showPrices),
    message: resData.message
  };
}

export async function updateXeroxVisibility(
  showPrices: boolean,
  token: string
): Promise<{ showPrices: boolean; rates: XeroxRates; message: string }> {
  const res = await fetch('/api/settings/xerox-visibility', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ showPrices })
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || 'Failed to update price visibility');
  return resData;
}
