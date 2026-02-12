import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiMapPin, FiZap } from 'react-icons/fi';
import FoodCategorySlider from '../../components/FoodCategorySlider/FoodCategorySlider';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';
import { fetchRestaurants } from '../../utils/api';
import { useLocation } from '../../context/LocationContext';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import './Home.css';

const filterOptions = [
    { label: 'Fast Delivery', value: 'deliveryTime' },
    { label: 'Ratings 4.0+', value: 'rating' },
    { label: 'Pure Veg', value: 'veg' },
    { label: '₹300-₹600', value: 'costMid' },
    { label: 'Less than ₹300', value: 'costLow' },
];

const sortOptions = [
    { label: 'Relevance', value: '' },
    { label: 'Delivery Time', value: 'deliveryTime' },
    { label: 'Rating', value: 'rating' },
    { label: 'Cost: Low to High', value: 'costLowToHigh' },
    { label: 'Cost: High to Low', value: 'costHighToLow' },
    { label: 'Distance', value: 'distance' },
];

export default function Home() {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState([]);
    const [activeSort, setActiveSort] = useState('');
    const [topChainIndex, setTopChainIndex] = useState(0);
    const [liveUpdates, setLiveUpdates] = useState([]);
    const navigate = useNavigate();
    const { location } = useLocation();

    // Real-time updates via SSE
    const handleLiveUpdate = useCallback((updates) => {
        setLiveUpdates(updates);
        setRestaurants(prev => {
            const updated = [...prev];
            updates.forEach(update => {
                const idx = updated.findIndex(r => r.id === update.id);
                if (idx >= 0) {
                    if (update.field === 'rating') updated[idx] = { ...updated[idx], rating: update.value, hasLiveUpdate: true };
                    else if (update.field === 'deliveryTime') updated[idx] = { ...updated[idx], dynamicDeliveryTime: update.value, hasLiveUpdate: true };
                    else if (update.field === 'isAvailable') updated[idx] = { ...updated[idx], isAvailable: update.value, hasLiveUpdate: true };
                    else if (update.field === 'newOffer') updated[idx] = { ...updated[idx], liveOffer: update.value, hasLiveUpdate: true };
                }
            });
            return updated;
        });

        // Clear live badges after 8 seconds
        setTimeout(() => {
            setRestaurants(prev => prev.map(r => ({ ...r, hasLiveUpdate: false })));
        }, 8000);
    }, []);

    const { connected } = useRealTimeUpdates(handleLiveUpdate);

    // Load restaurants whenever location changes
    useEffect(() => {
        loadRestaurants();
    }, [location.latitude, location.longitude]);

    const loadRestaurants = async () => {
        setLoading(true);
        try {
            const params = {
                lat: location.latitude,
                lng: location.longitude,
                radius: 10
            };
            const res = await fetchRestaurants(params);
            if (res.success) {
                setRestaurants(res.data);
                setFilteredRestaurants(res.data);
            }
        } catch (err) {
            console.error('Failed to load restaurants:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        let result = [...restaurants];

        activeFilters.forEach(filter => {
            switch (filter) {
                case 'rating': result = result.filter(r => r.rating >= 4.0); break;
                case 'veg': result = result.filter(r => r.isVeg); break;
                case 'costMid': result = result.filter(r => r.costForTwo >= 300 && r.costForTwo <= 600); break;
                case 'costLow': result = result.filter(r => r.costForTwo < 300); break;
                case 'deliveryTime': result = result.sort((a, b) => parseInt(a.dynamicDeliveryTime || a.deliveryTime) - parseInt(b.dynamicDeliveryTime || b.deliveryTime)); break;
            }
        });

        switch (activeSort) {
            case 'rating': result.sort((a, b) => b.rating - a.rating); break;
            case 'deliveryTime': result.sort((a, b) => parseInt(a.dynamicDeliveryTime || a.deliveryTime) - parseInt(b.dynamicDeliveryTime || b.deliveryTime)); break;
            case 'costLowToHigh': result.sort((a, b) => a.costForTwo - b.costForTwo); break;
            case 'costHighToLow': result.sort((a, b) => b.costForTwo - a.costForTwo); break;
            case 'distance': result.sort((a, b) => (a.distance || 999) - (b.distance || 999)); break;
        }

        setFilteredRestaurants(result);
    }, [activeFilters, activeSort, restaurants]);

    const toggleFilter = (value) => {
        setActiveFilters(prev =>
            prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]
        );
    };

    const topChains = restaurants.slice(0, 10);
    const visibleChains = 4;

    const scrollTopChains = (dir) => {
        if (dir === 'left') setTopChainIndex(Math.max(0, topChainIndex - 1));
        else setTopChainIndex(Math.min(topChains.length - visibleChains, topChainIndex + 1));
    };

    return (
        <div className="home">
            <div className="home__container">
                {/* Hero Banner */}
                <section className="home__hero">
                    <div className="home__hero-content">
                        <h1>Hungry?</h1>
                        <p>Order food from favourite restaurants near you.</p>
                        {/* Location info banner */}
                        <div className="home__location-badge">
                            <FiMapPin /> Delivering to <strong>{location.address || location.city}</strong>
                            {location.latitude && <span className="home__location-coords">({location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E)</span>}
                        </div>
                    </div>
                    <div className="home__hero-bg">
                        <div className="home__hero-circle home__hero-circle--1" />
                        <div className="home__hero-circle home__hero-circle--2" />
                        <div className="home__hero-circle home__hero-circle--3" />
                    </div>
                </section>

                {/* Live Status Indicator */}
                {connected && (
                    <div className="home__live-indicator">
                        <span className="home__live-dot" />
                        <FiZap /> Live updates active
                    </div>
                )}

                {/* Food Categories */}
                <FoodCategorySlider />

                {/* Top Restaurant Chains */}
                <section className="home__top-chains">
                    <div className="home__section-header">
                        <h2>Top restaurant chains in {location.city || 'your area'}</h2>
                        <div className="home__section-arrows">
                            <button onClick={() => scrollTopChains('left')} disabled={topChainIndex === 0} className="home__arrow-btn"><FiChevronLeft /></button>
                            <button onClick={() => scrollTopChains('right')} disabled={topChainIndex >= topChains.length - visibleChains} className="home__arrow-btn"><FiChevronRight /></button>
                        </div>
                    </div>
                    <div className="home__top-chains-slider">
                        <div className="home__top-chains-track" style={{ transform: `translateX(-${topChainIndex * 280}px)` }}>
                            {topChains.map(r => (
                                <div key={r.id} className={`home__top-chain-card ${r.hasLiveUpdate ? 'live-pulse' : ''}`} onClick={() => navigate(`/restaurant/${r.id}`)}>
                                    <div className="home__top-chain-img-wrap">
                                        <img src={r.image} alt={r.name}
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop'; }}
                                        />
                                        <div className="home__top-chain-gradient" />
                                        {r.liveOffer && <span className="home__top-chain-offer home__live-offer">{r.liveOffer}</span>}
                                        {!r.liveOffer && r.offers[0] && <span className="home__top-chain-offer">{r.offers[0]}</span>}
                                        {r.hasLiveUpdate && <span className="home__live-badge">LIVE</span>}
                                    </div>
                                    <h4>{r.name}</h4>
                                    <div className="home__top-chain-meta">
                                        <span className="home__top-chain-rating">★ {r.rating}</span>
                                        <span>•</span>
                                        <span>{r.dynamicDeliveryTime || r.deliveryTime} mins</span>
                                        {r.distance && <><span>•</span><span>{r.distance} km</span></>}
                                    </div>
                                    <p>{r.cuisines.slice(0, 3).join(', ')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Restaurants with Filters */}
                <section className="home__restaurants">
                    <h2>Restaurants with online food delivery in {location.city || 'your area'}</h2>

                    <div className="home__filters">
                        <div className="home__sort-group">
                            <span className="home__sort-label">Sort By:</span>
                            {sortOptions.map(opt => (
                                <button key={opt.value}
                                    className={`home__filter-chip ${activeSort === opt.value ? 'active' : ''}`}
                                    onClick={() => setActiveSort(activeSort === opt.value ? '' : opt.value)}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <div className="home__filter-group">
                            {filterOptions.map(opt => (
                                <button key={opt.value}
                                    className={`home__filter-chip ${activeFilters.includes(opt.value) ? 'active' : ''}`}
                                    onClick={() => toggleFilter(opt.value)}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="home__loading">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="home__skeleton-card">
                                    <div className="home__skeleton-img shimmer" />
                                    <div className="home__skeleton-text shimmer" />
                                    <div className="home__skeleton-text home__skeleton-text--short shimmer" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="home__restaurant-grid">
                            {filteredRestaurants.map(r => (
                                <RestaurantCard key={r.id} restaurant={r} />
                            ))}
                        </div>
                    )}

                    {!loading && filteredRestaurants.length === 0 && (
                        <div className="home__no-results">
                            <h3>No restaurants found</h3>
                            <p>Try adjusting your filters or changing your location</p>
                            <button onClick={() => { setActiveFilters([]); setActiveSort(''); }}>Clear all filters</button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
