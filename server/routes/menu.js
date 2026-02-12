const express = require('express');
const router = express.Router();
const menus = require('../data/menus.json');

// GET /api/menu/:restaurantId - Get menu for a restaurant
router.get('/:restaurantId', (req, res) => {
    const menu = menus[req.params.restaurantId];
    if (!menu) {
        // Generate a default menu for restaurants without specific menu data
        const defaultMenu = {
            restaurantId: parseInt(req.params.restaurantId),
            categories: [
                {
                    name: "Recommended",
                    items: [
                        { id: 9901, name: "Special Thali", description: "Chef's special thali with variety of dishes", price: 299, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=300&fit=crop", isVeg: true, isBestseller: true, rating: 4.3, ratingCount: 654 },
                        { id: 9902, name: "Chicken Biryani", description: "Fragrant basmati rice with tender chicken pieces", price: 349, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=300&fit=crop", isVeg: false, isBestseller: true, rating: 4.4, ratingCount: 876 }
                    ]
                },
                {
                    name: "Starters",
                    items: [
                        { id: 9903, name: "Paneer Tikka", description: "Marinated paneer grilled to perfection", price: 229, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=300&fit=crop", isVeg: true, isBestseller: false, rating: 4.2, ratingCount: 321 },
                        { id: 9904, name: "Chicken Tikka", description: "Succulent chicken pieces marinated in spices", price: 259, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=300&fit=crop", isVeg: false, isBestseller: true, rating: 4.5, ratingCount: 543 },
                        { id: 9905, name: "Crispy Corn", description: "Deep fried corn with Chinese seasoning", price: 179, image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=300&fit=crop", isVeg: true, isBestseller: false, rating: 4.0, ratingCount: 234 }
                    ]
                },
                {
                    name: "Main Course",
                    items: [
                        { id: 9906, name: "Dal Makhani", description: "Creamy black lentils slow-cooked overnight", price: 249, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=300&fit=crop", isVeg: true, isBestseller: true, rating: 4.4, ratingCount: 765 },
                        { id: 9907, name: "Butter Chicken", description: "Tender chicken in rich tomato butter gravy", price: 299, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=300&fit=crop", isVeg: false, isBestseller: true, rating: 4.5, ratingCount: 987 },
                        { id: 9908, name: "Naan (2 pcs)", description: "Freshly baked tandoori naan", price: 79, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=300&fit=crop", isVeg: true, isBestseller: false, rating: 4.1, ratingCount: 432 }
                    ]
                },
                {
                    name: "Desserts",
                    items: [
                        { id: 9909, name: "Gulab Jamun (2 pcs)", description: "Soft dumplings soaked in sugar syrup", price: 89, image: "https://images.unsplash.com/photo-1666190440592-eba2a82e45f4?w=300&h=300&fit=crop", isVeg: true, isBestseller: false, rating: 4.3, ratingCount: 321 },
                        { id: 9910, name: "Ice Cream Sundae", description: "Vanilla ice cream with chocolate sauce", price: 149, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=300&fit=crop", isVeg: true, isBestseller: false, rating: 4.2, ratingCount: 213 }
                    ]
                }
            ]
        };
        return res.json({ success: true, data: defaultMenu });
    }
    res.json({ success: true, data: menu });
});

module.exports = router;
