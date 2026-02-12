/**
 * Delivery Calculator Utility
 * Calculates distance between user and restaurant using Haversine formula,
 * applies traffic factor, and returns dynamic delivery time estimates.
 */

/**
 * Calculate distance between two lat/lng points using Haversine formula
 * @returns distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Get traffic multiplier based on time of day
 * Peak hours (8-10am, 12-2pm, 6-9pm) have higher traffic
 * @returns multiplier between 1.0 and 2.0
 */
function getTrafficFactor(hour) {
    if (hour === undefined || hour === null) {
        hour = new Date().getHours();
    }
    // Morning rush
    if (hour >= 8 && hour <= 10) return 1.5;
    // Lunch rush
    if (hour >= 12 && hour <= 14) return 1.7;
    // Evening rush
    if (hour >= 18 && hour <= 21) return 1.8;
    // Late night (less traffic)
    if (hour >= 22 || hour <= 5) return 1.0;
    // Normal hours
    return 1.2;
}

/**
 * Calculate dynamic delivery time based on distance and traffic
 * @returns { minTime, maxTime, distance, trafficFactor }
 */
function calculateDeliveryTime(userLat, userLng, restLat, restLng) {
    const distance = calculateDistance(userLat, userLng, restLat, restLng);
    const trafficFactor = getTrafficFactor();

    // Base prep time: 10-15 minutes
    const basePrepMin = 10;
    const basePrepMax = 15;

    // Travel time: average speed 25 km/h in city, adjusted for traffic
    const avgSpeedKmh = 25;
    const travelTimeMinutes = (distance / avgSpeedKmh) * 60 * trafficFactor;

    // Add some randomness for realism (+/- 3 minutes)
    const jitter = Math.floor(Math.random() * 3);

    const minTime = Math.round(basePrepMin + travelTimeMinutes + jitter);
    const maxTime = Math.round(basePrepMax + travelTimeMinutes + jitter + 5);

    return {
        minTime: Math.max(10, minTime),
        maxTime: Math.max(15, maxTime),
        distance: Math.round(distance * 10) / 10, // 1 decimal place
        trafficFactor: Math.round(trafficFactor * 10) / 10,
        deliveryTime: `${Math.max(10, minTime)}-${Math.max(15, maxTime)}`
    };
}

/**
 * Check if a restaurant is within delivery radius of user
 */
function isWithinDeliveryRadius(userLat, userLng, restaurant) {
    const distance = calculateDistance(userLat, userLng, restaurant.latitude, restaurant.longitude);
    return distance <= (restaurant.deliveryRadius || 10);
}

module.exports = {
    calculateDistance,
    getTrafficFactor,
    calculateDeliveryTime,
    isWithinDeliveryRadius
};
