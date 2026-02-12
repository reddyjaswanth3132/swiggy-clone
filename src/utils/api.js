const API_BASE = 'http://localhost:3001/api';

export const fetchRestaurants = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/restaurants${query ? '?' + query : ''}`);
    const data = await res.json();
    return data;
};

export const fetchRestaurantById = async (id, locationParams = {}) => {
    const query = new URLSearchParams(locationParams).toString();
    const res = await fetch(`${API_BASE}/restaurants/${id}${query ? '?' + query : ''}`);
    const data = await res.json();
    return data;
};

export const fetchMenu = async (restaurantId) => {
    const res = await fetch(`${API_BASE}/menu/${restaurantId}`);
    const data = await res.json();
    return data;
};

export const loginUser = async (phone, otp) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
    });
    return await res.json();
};

export const signupUser = async (name, phone, email) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email })
    });
    return await res.json();
};

export const placeOrder = async (orderData) => {
    const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
    return await res.json();
};

export const getOrderStatus = async (orderId) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}`);
    return await res.json();
};

export const fetchDeliveryTime = async (userLat, userLng, restLat, restLng) => {
    const res = await fetch(`${API_BASE}/delivery-time?userLat=${userLat}&userLng=${userLng}&restLat=${restLat}&restLng=${restLng}`);
    return await res.json();
};

// Fallback placeholder image for dishes
export const DISH_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop';

// Get dish image with fallback
export const getDishImage = (imageUrl) => {
    if (!imageUrl || imageUrl.trim() === '') return DISH_FALLBACK_IMAGE;
    return imageUrl;
};
