const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || '/api';

/**
 * Safe fetch wrapper with error handling
 */
async function safeFetch(url, options = {}) {
    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `Request failed (${res.status})`);
        }
        return await res.json();
    } catch (err) {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
            throw new Error('Unable to connect to server. Please check if the backend is running.');
        }
        throw err;
    }
}

export const fetchRestaurants = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return safeFetch(`${API_BASE}/restaurants${query ? '?' + query : ''}`);
};

export const fetchRestaurantById = async (id, locationParams = {}) => {
    const query = new URLSearchParams(locationParams).toString();
    return safeFetch(`${API_BASE}/restaurants/${id}${query ? '?' + query : ''}`);
};

export const fetchMenu = async (restaurantId) => {
    return safeFetch(`${API_BASE}/menu/${restaurantId}`);
};

export const loginUser = async (phone, otp) => {
    return safeFetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
    });
};

export const signupUser = async (name, phone, email) => {
    return safeFetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email })
    });
};

export const placeOrder = async (orderData) => {
    return safeFetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
};

export const getOrderStatus = async (orderId) => {
    return safeFetch(`${API_BASE}/orders/${orderId}`);
};

export const fetchDeliveryTime = async (userLat, userLng, restLat, restLng) => {
    return safeFetch(`${API_BASE}/delivery-time?userLat=${userLat}&userLng=${userLng}&restLat=${restLat}&restLng=${restLng}`);
};

// Fallback placeholder image for dishes
export const DISH_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop';

// Get dish image with fallback
export const getDishImage = (imageUrl) => {
    if (!imageUrl || imageUrl.trim() === '') return DISH_FALLBACK_IMAGE;
    return imageUrl;
};
