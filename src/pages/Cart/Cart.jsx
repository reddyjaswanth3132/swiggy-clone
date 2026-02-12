import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiTag, FiX, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { placeOrder } from '../../utils/api';
import './Cart.css';

const availableCoupons = [
    { id: 1, code: 'TRYNEW', description: '40% OFF up to ₹80', minOrder: 149, type: 'percent', value: 40, maxDiscount: 80 },
    { id: 2, code: 'SWIGGYIT', description: '50% OFF up to ₹100', minOrder: 199, type: 'percent', value: 50, maxDiscount: 100 },
    { id: 3, code: 'FLAT100', description: 'Flat ₹100 OFF', minOrder: 599, type: 'flat', value: 100, maxDiscount: 100 },
    { id: 5, code: 'WELCOME50', description: '50% OFF up to ₹150', minOrder: 249, type: 'percent', value: 50, maxDiscount: 150 },
];

export default function Cart() {
    const navigate = useNavigate();
    const { cart, addItem, removeItem, clearCart, applyCoupon, removeCoupon, getSubtotal, getDiscount } = useCart();
    const { user, openAuthModal } = useAuth();
    const [showCoupons, setShowCoupons] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    const subtotal = getSubtotal();
    const discount = getDiscount();
    const deliveryFee = subtotal > 199 ? 0 : 30;
    const gst = Math.round((subtotal - discount) * 0.05);
    const total = subtotal - discount + deliveryFee + gst;

    const handlePlaceOrder = async () => {
        if (!user) { openAuthModal(); return; }
        setPlacingOrder(true);
        try {
            const res = await placeOrder({
                items: cart.items,
                restaurantId: cart.restaurantId,
                restaurantName: cart.restaurantName,
                total,
                address: 'Home - 123, Example Street, Bangalore',
                paymentMethod: 'COD'
            });
            if (res.success) {
                clearCart();
                navigate(`/order/${res.data.id}`);
            }
        } catch (err) {
            console.error('Order failed:', err);
        }
        setPlacingOrder(false);
    };

    if (cart.items.length === 0) {
        return (
            <div className="cart-page">
                <div className="cart-page__empty">
                    <div className="cart-page__empty-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>You can go to home page to view more restaurants</p>
                    <Link to="/" className="cart-page__browse-btn">SEE RESTAURANTS NEAR YOU</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-page__container">
                <button className="cart-page__back" onClick={() => navigate(-1)}><FiArrowLeft /> Back</button>

                <div className="cart-page__layout">
                    <div className="cart-page__items-section">
                        <div className="cart-page__restaurant-info">
                            <h2>{cart.restaurantName}</h2>
                            <Link to={`/restaurant/${cart.restaurantId}`}>View full menu →</Link>
                        </div>

                        <div className="cart-page__items">
                            {cart.items.map(item => (
                                <div key={item.id} className="cart-page__item">
                                    <div className="cart-page__item-left">
                                        <span className={`cart-page__veg ${item.isVeg ? 'veg' : 'non-veg'}`}><span /></span>
                                        <div>
                                            <h4>{item.name}</h4>
                                            <p>₹{item.price}</p>
                                        </div>
                                    </div>
                                    <div className="cart-page__item-controls">
                                        <div className="cart-page__qty">
                                            <button onClick={() => removeItem(item.id)}><FiMinus /></button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => addItem(item, cart.restaurantId, cart.restaurantName)}><FiPlus /></button>
                                        </div>
                                        <span className="cart-page__item-total">₹{item.price * item.quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <textarea className="cart-page__instructions" placeholder="Any suggestions? We will pass it on to the restaurant..." />
                    </div>

                    <div className="cart-page__bill-section">
                        {/* Coupon */}
                        <div className="cart-page__coupon-bar" onClick={() => setShowCoupons(!showCoupons)}>
                            <FiTag />
                            {cart.coupon ? (
                                <div className="cart-page__coupon-applied">
                                    <span>{cart.coupon.code} applied</span>
                                    <button onClick={(e) => { e.stopPropagation(); removeCoupon(); }}><FiX /></button>
                                </div>
                            ) : (
                                <span>Apply Coupon</span>
                            )}
                        </div>

                        {showCoupons && !cart.coupon && (
                            <div className="cart-page__coupons">
                                {availableCoupons.map(coupon => (
                                    <div key={coupon.id} className={`cart-page__coupon-card ${subtotal < coupon.minOrder ? 'disabled' : ''}`}
                                        onClick={() => { if (subtotal >= coupon.minOrder) { applyCoupon(coupon); setShowCoupons(false); } }}>
                                        <div className="cart-page__coupon-code">{coupon.code}</div>
                                        <p>{coupon.description}</p>
                                        <span>Min order: ₹{coupon.minOrder}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Bill Details */}
                        <div className="cart-page__bill">
                            <h3>Bill Details</h3>
                            <div className="cart-page__bill-row">
                                <span>Item Total</span>
                                <span>₹{subtotal}</span>
                            </div>
                            {discount > 0 && (
                                <div className="cart-page__bill-row cart-page__bill-row--discount">
                                    <span>Coupon Discount ({cart.coupon?.code})</span>
                                    <span>-₹{discount}</span>
                                </div>
                            )}
                            <div className="cart-page__bill-row">
                                <span>Delivery Fee</span>
                                <span>{deliveryFee === 0 ? <span className="cart-page__free">FREE</span> : `₹${deliveryFee}`}</span>
                            </div>
                            <div className="cart-page__bill-row">
                                <span>GST & Charges</span>
                                <span>₹{gst}</span>
                            </div>
                            <div className="cart-page__bill-total">
                                <span>TO PAY</span>
                                <span>₹{total}</span>
                            </div>
                        </div>

                        {/* Address & Checkout */}
                        <div className="cart-page__address">
                            <h4>Delivery Address</h4>
                            <p>🏠 Home - 123, Example Street, Bangalore</p>
                        </div>

                        <button className="cart-page__checkout-btn" onClick={handlePlaceOrder} disabled={placingOrder}>
                            {placingOrder ? 'Placing Order...' : `PLACE ORDER  •  ₹${total}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
