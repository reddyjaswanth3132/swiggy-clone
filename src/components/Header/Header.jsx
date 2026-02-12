import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiMapPin, FiChevronDown, FiHelpCircle, FiPercent, FiMenu, FiX, FiNavigation, FiLoader } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import './Header.css';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [addressInput, setAddressInput] = useState('');
    const [searchingAddress, setSearchingAddress] = useState(false);
    const { getTotalItems } = useCart();
    const { user, openAuthModal, logout } = useAuth();
    const { location, loading: gpsLoading, error: gpsError, detectLocation, setManualLocation, setCity } = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowLocationDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when dropdown opens
    useEffect(() => {
        if (showLocationDropdown && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [showLocationDropdown]);

    const handleDetectLocation = async () => {
        await detectLocation();
        setShowLocationDropdown(false);
    };

    const handleAddressSearch = async (e) => {
        e.preventDefault();
        if (!addressInput.trim()) return;
        setSearchingAddress(true);
        const result = await setManualLocation(addressInput);
        setSearchingAddress(false);
        if (result) {
            setAddressInput('');
            setShowLocationDropdown(false);
        }
    };

    const handleCitySelect = (city) => {
        setCity(city);
        setShowLocationDropdown(false);
    };

    const totalItems = getTotalItems();

    return (
        <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
            <div className="header__container">
                <div className="header__left">
                    <Link to="/" className="header__logo">
                        <svg viewBox="0 0 559 825" height="49" width="34" fill="#FC8019">
                            <path d="M462.8 65.6C462.8 29.4 433.4 0 397.2 0H162.8C126.6 0 97.2 29.4 97.2 65.6V355.4C97.2 391.6 126.6 421 162.8 421H397.2C433.4 421 462.8 391.6 462.8 355.4V65.6Z" />
                            <path d="M280 285C307.614 285 330 262.614 330 235C330 207.386 307.614 185 280 185C252.386 185 230 207.386 230 235C230 262.614 252.386 285 280 285Z" fill="white" />
                            <path d="M0 533C0 507.043 21.0426 486 47 486H513C538.957 486 560 507.043 560 533V778C560 803.957 538.957 825 513 825H47C21.0426 825 0 803.957 0 778V533Z" />
                            <path d="M280 715C307.614 715 330 692.614 330 665C330 637.386 307.614 615 280 615C252.386 615 230 637.386 230 665C230 692.614 252.386 715 280 715Z" fill="white" />
                        </svg>
                        <span className="header__logo-text">swiggy</span>
                    </Link>

                    <div className="header__location" ref={dropdownRef} onClick={() => setShowLocationDropdown(!showLocationDropdown)}>
                        <FiMapPin className="header__location-icon" />
                        <span className="header__location-label">
                            <strong>{location.city || 'Select Location'}</strong>
                            <span className="header__location-sub">{location.address?.split(',').slice(0, 2).join(', ') || 'Tap to set location'}</span>
                        </span>
                        <FiChevronDown className={`header__location-arrow ${showLocationDropdown ? 'rotated' : ''}`} />

                        {showLocationDropdown && (
                            <div className="header__location-dropdown" onClick={(e) => e.stopPropagation()}>
                                {/* GPS Detect Button */}
                                <button
                                    className="header__gps-btn"
                                    onClick={handleDetectLocation}
                                    disabled={gpsLoading}
                                >
                                    {gpsLoading ? (
                                        <><FiLoader className="header__gps-spinner" /> Detecting...</>
                                    ) : (
                                        <><FiNavigation /> Detect my location</>
                                    )}
                                </button>

                                {gpsError && <div className="header__gps-error">{gpsError}</div>}

                                {/* Manual Address Search */}
                                <form className="header__address-form" onSubmit={handleAddressSearch}>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Search for area, street name..."
                                        value={addressInput}
                                        onChange={(e) => setAddressInput(e.target.value)}
                                        className="header__address-input"
                                    />
                                    <button type="submit" disabled={searchingAddress} className="header__address-search-btn">
                                        {searchingAddress ? <FiLoader className="header__gps-spinner" /> : <FiSearch />}
                                    </button>
                                </form>

                                <div className="header__location-divider">
                                    <span>Popular Cities</span>
                                </div>

                                {/* City List */}
                                <div className="header__city-grid">
                                    {cities.map(city => (
                                        <div
                                            key={city}
                                            className={`header__location-item ${city === location.city ? 'active' : ''}`}
                                            onClick={() => handleCitySelect(city)}
                                        >
                                            <FiMapPin /> {city}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button className="header__mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <FiX /> : <FiMenu />}
                </button>

                <nav className={`header__nav ${mobileMenuOpen ? 'header__nav--open' : ''}`}>
                    <Link to="/search" className="header__nav-item" onClick={() => setMobileMenuOpen(false)}>
                        <FiSearch /> <span>Search</span>
                    </Link>
                    <Link to="/offers" className="header__nav-item" onClick={() => setMobileMenuOpen(false)}>
                        <FiPercent /> <span>Offers</span>
                    </Link>
                    <Link to="/help" className="header__nav-item" onClick={() => setMobileMenuOpen(false)}>
                        <FiHelpCircle /> <span>Help</span>
                    </Link>
                    {user ? (
                        <div className="header__nav-item header__user-menu">
                            <FiUser /> <span>{user.name}</span>
                            <div className="header__user-dropdown">
                                <button onClick={() => { logout(); setMobileMenuOpen(false); }}>Logout</button>
                            </div>
                        </div>
                    ) : (
                        <button className="header__nav-item header__signin-btn" onClick={() => { openAuthModal(); setMobileMenuOpen(false); }}>
                            <FiUser /> <span>Sign In</span>
                        </button>
                    )}
                    <Link to="/cart" className="header__nav-item header__cart" onClick={() => setMobileMenuOpen(false)}>
                        <FiShoppingCart />
                        <span>Cart</span>
                        {totalItems > 0 && <span className="header__cart-badge">{totalItems}</span>}
                    </Link>
                </nav>
            </div>
        </header>
    );
}
