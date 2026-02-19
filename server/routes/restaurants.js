const express = require('express');
const router = express.Router();
const restaurants = require('../data/restaurants.json');
const { calculateDistance, calculateDeliveryTime, isWithinDeliveryRadius } = require('../utils/deliveryCalculator');

// Sanitize string inputs
function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>"'&]/g, '').trim();
}

// GET /api/restaurants - Get all restaurants with optional filters including location
router.get('/', (req, res) => {
    let results = [...restaurants];
    const { cuisine, rating, veg, sort, search, area, lat, lng, radius } = req.query;

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius) || 10;

    // Validate radius range
    if (maxRadius < 0 || maxRadius > 100) {
        return res.status(400).json({ success: false, message: 'Radius must be between 0 and 100 km' });
    }

    // Validate coordinates range
    if (!isNaN(userLat) && (userLat < -90 || userLat > 90)) {
        return res.status(400).json({ success: false, message: 'Latitude must be between -90 and 90' });
    }
    if (!isNaN(userLng) && (userLng < -180 || userLng > 180)) {
        return res.status(400).json({ success: false, message: 'Longitude must be between -180 and 180' });
    }

    // Filter by location (if coordinates provided)
    if (!isNaN(userLat) && !isNaN(userLng)) {
        results = results.filter(r => {
            const distance = calculateDistance(userLat, userLng, r.latitude, r.longitude);
            return distance <= maxRadius && distance <= (r.deliveryRadius || 10);
        });

        // Enrich with distance and dynamic delivery time
        results = results.map(r => {
            const delivery = calculateDeliveryTime(userLat, userLng, r.latitude, r.longitude);
            return {
                ...r,
                distance: delivery.distance,
                dynamicDeliveryTime: delivery.deliveryTime,
                trafficFactor: delivery.trafficFactor
            };
        });
    }

    // Filter by cuisine (sanitized)
    if (cuisine) {
        const cuisineFilter = sanitize(cuisine).toLowerCase();
        results = results.filter(r =>
            r.cuisines.some(c => c.toLowerCase().includes(cuisineFilter))
        );
    }

    // Filter by area (sanitized)
    if (area) {
        const areaFilter = sanitize(area).toLowerCase();
        results = results.filter(r =>
            r.area.toLowerCase().includes(areaFilter)
        );
    }

    // Filter by rating
    if (rating) {
        const ratingVal = parseFloat(rating);
        if (!isNaN(ratingVal) && ratingVal >= 0 && ratingVal <= 5) {
            results = results.filter(r => r.rating >= ratingVal);
        }
    }

    // Filter by veg
    if (veg === 'true') {
        results = results.filter(r => r.isVeg);
    }

    // Search by name or cuisine (sanitized)
    if (search) {
        const searchLower = sanitize(search).toLowerCase();
        results = results.filter(r =>
            r.name.toLowerCase().includes(searchLower) ||
            r.cuisines.some(c => c.toLowerCase().includes(searchLower))
        );
    }

    // Sort
    if (sort) {
        switch (sort) {
            case 'rating':
                results.sort((a, b) => b.rating - a.rating);
                break;
            case 'deliveryTime':
                results.sort((a, b) => parseInt(a.dynamicDeliveryTime || a.deliveryTime) - parseInt(b.dynamicDeliveryTime || b.deliveryTime));
                break;
            case 'costLowToHigh':
                results.sort((a, b) => a.costForTwo - b.costForTwo);
                break;
            case 'costHighToLow':
                results.sort((a, b) => b.costForTwo - a.costForTwo);
                break;
            case 'distance':
                results.sort((a, b) => (a.distance || 999) - (b.distance || 999));
                break;
            default:
                break;
        }
    }

    res.json({
        success: true,
        count: results.length,
        data: results
    });
});

// GET /api/restaurants/:id - Get restaurant by ID with optional location for dynamic delivery time
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid restaurant ID' });
    }

    const restaurant = restaurants.find(r => r.id === id);
    if (!restaurant) {
        return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const { lat, lng } = req.query;
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    let enriched = { ...restaurant };
    if (!isNaN(userLat) && !isNaN(userLng)) {
        const delivery = calculateDeliveryTime(userLat, userLng, restaurant.latitude, restaurant.longitude);
        enriched = {
            ...enriched,
            distance: delivery.distance,
            dynamicDeliveryTime: delivery.deliveryTime,
            trafficFactor: delivery.trafficFactor
        };
    }

    res.json({ success: true, data: enriched });
});

module.exports = router;
