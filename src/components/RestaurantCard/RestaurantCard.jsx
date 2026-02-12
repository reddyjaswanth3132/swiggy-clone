import { Link } from 'react-router-dom';
import { FiStar, FiClock, FiMapPin } from 'react-icons/fi';
import './RestaurantCard.css';

export default function RestaurantCard({ restaurant }) {
    const { id, name, image, cuisines, rating, deliveryTime, dynamicDeliveryTime, costForTwo, offers, distance, liveOffer, hasLiveUpdate, isAvailable } = restaurant;

    // Use dynamic delivery time if available, otherwise fall back to static
    const displayTime = dynamicDeliveryTime || deliveryTime;

    return (
        <Link to={`/restaurant/${id}`} className={`restaurant-card ${hasLiveUpdate ? 'restaurant-card--live' : ''} ${isAvailable === false ? 'restaurant-card--closed' : ''}`}>
            <div className="restaurant-card__image-wrapper">
                <img
                    src={image}
                    alt={name}
                    className="restaurant-card__image"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop';
                    }}
                />
                <div className="restaurant-card__gradient" />
                {liveOffer && (
                    <div className="restaurant-card__offer restaurant-card__offer--live">{liveOffer}</div>
                )}
                {!liveOffer && offers && offers.length > 0 && (
                    <div className="restaurant-card__offer">{offers[0]}</div>
                )}
                {isAvailable === false && (
                    <div className="restaurant-card__closed-overlay">
                        <span>Currently Closed</span>
                    </div>
                )}
                {hasLiveUpdate && <span className="restaurant-card__live-badge">LIVE</span>}
            </div>
            <div className="restaurant-card__info">
                <h3 className="restaurant-card__name">{name}</h3>
                <div className="restaurant-card__meta">
                    <span className="restaurant-card__rating">
                        <FiStar className="restaurant-card__star" />
                        {rating}
                    </span>
                    <span className="restaurant-card__dot">•</span>
                    <span className="restaurant-card__time">
                        <FiClock /> {displayTime} mins
                    </span>
                    {distance && (
                        <>
                            <span className="restaurant-card__dot">•</span>
                            <span className="restaurant-card__distance">
                                <FiMapPin /> {distance} km
                            </span>
                        </>
                    )}
                </div>
                <p className="restaurant-card__cuisines">{cuisines.join(', ')}</p>
                <p className="restaurant-card__cost">₹{costForTwo} for two</p>
            </div>
        </Link>
    );
}
