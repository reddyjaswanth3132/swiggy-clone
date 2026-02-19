import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiStar, FiClock, FiMapPin, FiChevronDown, FiChevronUp, FiSearch, FiNavigation, FiAlertCircle } from 'react-icons/fi';
import { fetchRestaurantById, fetchMenu, getDishImage } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import './Restaurant.css';

export default function Restaurant() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem, removeItem, getItemQuantity, cart, setRestaurant } = useCart();
    const { location } = useLocation();
    const [restaurant, setRestaurantData] = useState(null);
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [vegOnly, setVegOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDiffRestaurantModal, setShowDiffRestaurantModal] = useState(false);
    const [pendingItem, setPendingItem] = useState(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const locationParams = {};
            if (location.latitude) {
                locationParams.lat = location.latitude;
                locationParams.lng = location.longitude;
            }
            const [resData, menuData] = await Promise.all([
                fetchRestaurantById(id, locationParams),
                fetchMenu(id)
            ]);
            if (resData.success) setRestaurantData(resData.data);
            if (menuData.success) {
                setMenu(menuData.data);
                const expanded = {};
                menuData.data.categories.forEach((cat, i) => { expanded[i] = i < 3; });
                setExpandedCategories(expanded);
            }
        } catch (err) {
            console.error('Failed to load restaurant:', err);
            setError(err.message || 'Failed to load restaurant. Please try again.');
        }
        setLoading(false);
    };

    const toggleCategory = (index) => {
        setExpandedCategories(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleAddItem = (item) => {
        if (cart.restaurantId && cart.restaurantId !== parseInt(id) && cart.items.length > 0) {
            setPendingItem(item);
            setShowDiffRestaurantModal(true);
            return;
        }
        addItem(item, parseInt(id), restaurant.name);
    };

    const confirmNewCart = () => {
        setRestaurant(parseInt(id), restaurant.name);
        addItem(pendingItem, parseInt(id), restaurant.name);
        setShowDiffRestaurantModal(false);
        setPendingItem(null);
    };

    const filterItems = (items) => {
        let filtered = items;
        if (vegOnly) filtered = filtered.filter(item => item.isVeg);
        if (searchTerm) filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered;
    };

    if (loading) {
        return (
            <div className="restaurant-page">
                <div className="restaurant-page__container">
                    <div className="restaurant-page__loading">
                        <div className="shimmer" style={{ height: 200, borderRadius: 16 }} />
                        <div className="shimmer" style={{ height: 30, width: '60%', marginTop: 20, borderRadius: 8 }} />
                        <div className="shimmer" style={{ height: 20, width: '40%', marginTop: 12, borderRadius: 8 }} />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="restaurant-page">
                <div className="restaurant-page__container">
                    <div className="restaurant-page__error">
                        <FiAlertCircle size={32} />
                        <h2>Something went wrong</h2>
                        <p>{error}</p>
                        <div className="restaurant-page__error-actions">
                            <button onClick={loadData}>Try Again</button>
                            <button onClick={() => navigate('/')}>Go Home</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="restaurant-page">
                <div className="restaurant-page__container">
                    <div className="restaurant-page__not-found">
                        <h2>Restaurant not found</h2>
                        <button onClick={() => navigate('/')}>Go back home</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="restaurant-page">
            <div className="restaurant-page__container">
                {/* Restaurant Header */}
                <div className="restaurant-page__header">
                    <div className="restaurant-page__info">
                        <h1>{restaurant.name}</h1>
                        <p className="restaurant-page__cuisines">{restaurant.cuisines.join(', ')}</p>
                        <p className="restaurant-page__area"><FiMapPin /> {restaurant.area} — {restaurant.address}</p>
                    </div>
                    <div className="restaurant-page__rating-box">
                        <div className="restaurant-page__rating-top">
                            <FiStar /> {restaurant.rating}
                        </div>
                        <div className="restaurant-page__rating-bottom">1K+ ratings</div>
                    </div>
                </div>

                {/* Delivery Info */}
                <div className="restaurant-page__delivery-info">
                    <div className="restaurant-page__delivery-item">
                        <FiClock />
                        <div>
                            <strong>{restaurant.dynamicDeliveryTime || restaurant.deliveryTime} mins</strong>
                            <span>{restaurant.dynamicDeliveryTime ? 'Live ETA' : 'Delivery Time'}</span>
                        </div>
                    </div>
                    <div className="restaurant-page__delivery-item">
                        <span className="restaurant-page__rupee">₹</span>
                        <div>
                            <strong>₹{restaurant.costForTwo} for two</strong>
                            <span>Cost for two</span>
                        </div>
                    </div>
                    {restaurant.distance && (
                        <div className="restaurant-page__delivery-item">
                            <FiNavigation />
                            <div>
                                <strong>{restaurant.distance} km</strong>
                                <span>Distance</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Offers */}
                {restaurant.offers && restaurant.offers.length > 0 && (
                    <div className="restaurant-page__offers">
                        {restaurant.offers.map((offer, i) => (
                            <div key={i} className="restaurant-page__offer-card">
                                <span className="restaurant-page__offer-icon">%</span>
                                <span>{offer}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Menu Controls */}
                <div className="restaurant-page__menu-controls">
                    <div className="restaurant-page__veg-toggle">
                        <label className="restaurant-page__toggle">
                            <input type="checkbox" checked={vegOnly} onChange={() => setVegOnly(!vegOnly)} />
                            <span className="restaurant-page__toggle-slider" />
                        </label>
                        <span>Veg Only</span>
                    </div>
                    <div className="restaurant-page__menu-search">
                        <FiSearch />
                        <input type="text" placeholder="Search for dishes..." value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                {/* Menu */}
                <div className="restaurant-page__menu">
                    {menu && menu.categories.map((category, catIdx) => {
                        const filteredItems = filterItems(category.items);
                        if (filteredItems.length === 0) return null;
                        return (
                            <div key={catIdx} className="restaurant-page__category">
                                <div className="restaurant-page__category-header" onClick={() => toggleCategory(catIdx)}>
                                    <h3>{category.name} ({filteredItems.length})</h3>
                                    {expandedCategories[catIdx] ? <FiChevronUp /> : <FiChevronDown />}
                                </div>
                                {expandedCategories[catIdx] && (
                                    <div className="restaurant-page__items">
                                        {filteredItems.map(item => {
                                            const qty = getItemQuantity(item.id);
                                            return (
                                                <div key={item.id} className="restaurant-page__item">
                                                    <div className="restaurant-page__item-info">
                                                        <div className="restaurant-page__item-type">
                                                            <span className={`restaurant-page__veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`}>
                                                                <span />
                                                            </span>
                                                            {item.isBestseller && <span className="restaurant-page__bestseller">★ Bestseller</span>}
                                                        </div>
                                                        <h4>{item.name}</h4>
                                                        <p className="restaurant-page__item-price">₹{item.price}</p>
                                                        {item.rating && (
                                                            <div className="restaurant-page__item-rating">
                                                                <FiStar /> {item.rating} ({item.ratingCount})
                                                            </div>
                                                        )}
                                                        <p className="restaurant-page__item-desc">{item.description}</p>
                                                    </div>
                                                    <div className="restaurant-page__item-right">
                                                        <img src={getDishImage(item.image)} alt={item.name} className="restaurant-page__item-img"
                                                            loading="lazy"
                                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop'; }} />
                                                        {qty === 0 ? (
                                                            <button className="restaurant-page__add-btn" onClick={() => handleAddItem(item)}>
                                                                ADD
                                                            </button>
                                                        ) : (
                                                            <div className="restaurant-page__qty-control">
                                                                <button onClick={() => removeItem(item.id)}>−</button>
                                                                <span>{qty}</span>
                                                                <button onClick={() => handleAddItem(item)}>+</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <div className="restaurant-page__category-divider" />
                            </div>
                        );
                    })}
                </div>

                {/* Cart Footer */}
                {cart.items.length > 0 && cart.restaurantId === parseInt(id) && (
                    <div className="restaurant-page__cart-footer" onClick={() => navigate('/cart')}>
                        <span>{cart.items.reduce((s, i) => s + i.quantity, 0)} item(s) added</span>
                        <span>VIEW CART →</span>
                    </div>
                )}

                {/* Different Restaurant Modal */}
                {showDiffRestaurantModal && (
                    <>
                        <div className="restaurant-page__modal-overlay" onClick={() => setShowDiffRestaurantModal(false)} />
                        <div className="restaurant-page__modal">
                            <h3>Items already in cart</h3>
                            <p>Your cart contains items from <strong>{cart.restaurantName}</strong>. Would you like to reset your cart for adding items from <strong>{restaurant.name}</strong>?</p>
                            <div className="restaurant-page__modal-actions">
                                <button onClick={() => setShowDiffRestaurantModal(false)}>NO</button>
                                <button className="restaurant-page__modal-confirm" onClick={confirmNewCart}>YES, START AFRESH</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
