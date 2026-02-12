import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheck, FiClock, FiMapPin, FiPhone, FiZap } from 'react-icons/fi';
import { getOrderStatus } from '../../utils/api';
import { useOrderTracking } from '../../hooks/useRealTimeUpdates';
import './OrderTracking.css';

export default function OrderTracking() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // SSE-based real-time order tracking
    const { orderData: sseOrderData, connected: sseConnected } = useOrderTracking(orderId);

    // Load initial order data
    useEffect(() => {
        loadOrder();
    }, [orderId]);

    // Merge SSE updates with order state
    useEffect(() => {
        if (sseOrderData) {
            setOrder(prev => ({
                ...(prev || {}),
                ...sseOrderData
            }));
        }
    }, [sseOrderData]);

    const loadOrder = async () => {
        try {
            const res = await getOrderStatus(orderId);
            if (res.success) setOrder(res.data);
        } catch (err) {
            console.error('Failed to load order:', err);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="tracking-page">
                <div className="tracking-page__container">
                    <div className="tracking-page__loading">
                        <div className="shimmer" style={{ height: 200, borderRadius: 16 }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="tracking-page">
                <div className="tracking-page__container">
                    <div className="tracking-page__not-found">
                        <h2>Order not found</h2>
                        <Link to="/">Go back home</Link>
                    </div>
                </div>
            </div>
        );
    }

    const allDelivered = order.timeline?.every(t => t.completed) || false;

    return (
        <div className="tracking-page">
            <div className="tracking-page__container">
                {/* SSE Connection Status */}
                {sseConnected && (
                    <div className="tracking-page__live-badge">
                        <span className="tracking-page__live-dot" />
                        <FiZap /> Live tracking active
                    </div>
                )}

                {/* Success Animation */}
                <div className={`tracking-page__success ${allDelivered ? 'delivered' : ''}`}>
                    <div className="tracking-page__checkmark">
                        {allDelivered ? '🎉' : '🍳'}
                    </div>
                    <h1>{allDelivered ? 'Order Delivered!' : 'Your order is on its way!'}</h1>
                    <p className="tracking-page__orderId">Order #{order.id}</p>
                </div>

                {/* Timeline */}
                <div className="tracking-page__timeline">
                    {order.timeline?.map((step, i) => (
                        <div key={i} className={`tracking-page__step ${step.completed ? 'completed' : ''} ${i === order.timeline.findIndex(t => !t.completed) ? 'current' : ''}`}>
                            <div className="tracking-page__step-dot">
                                {step.completed ? <FiCheck /> : <span>{i + 1}</span>}
                            </div>
                            {i < order.timeline.length - 1 && <div className="tracking-page__step-line" />}
                            <div className="tracking-page__step-info">
                                <h4>{step.status}</h4>
                                {step.time && <span>{new Date(step.time).toLocaleTimeString()}</span>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Delivery Partner */}
                {order.deliveryPartner && !allDelivered && (
                    <div className="tracking-page__partner">
                        <span className="tracking-page__partner-photo">{order.deliveryPartner.photo}</span>
                        <div className="tracking-page__partner-info">
                            <h4>{order.deliveryPartner.name}</h4>
                            <span>{order.deliveryPartner.vehicle} • {order.deliveryPartner.phone}</span>
                        </div>
                        <a href={`tel:${order.deliveryPartner.phone}`} className="tracking-page__call-btn">
                            <FiPhone />
                        </a>
                    </div>
                )}

                {/* ETA */}
                {!allDelivered && (
                    <div className="tracking-page__eta">
                        <FiClock />
                        <div>
                            <h4>Estimated delivery time</h4>
                            <p>{order.estimatedDelivery || '25-30 min'}</p>
                        </div>
                    </div>
                )}

                {/* Order Details */}
                <div className="tracking-page__details">
                    <h3>Order Details</h3>
                    <div className="tracking-page__restaurant">
                        <strong>{order.restaurantName}</strong>
                    </div>
                    {order.items && (
                        <div className="tracking-page__items">
                            {order.items.map((item, i) => (
                                <div key={i} className="tracking-page__item">
                                    <span>{item.name} × {item.quantity}</span>
                                    <span>₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="tracking-page__order-total">
                        <span>Total</span>
                        <span>₹{order.total}</span>
                    </div>
                </div>

                {/* Delivery Address */}
                <div className="tracking-page__address">
                    <FiMapPin />
                    <div>
                        <h4>Delivery Address</h4>
                        <p>{order.address || 'Home - 123, Example Street, Bangalore'}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="tracking-page__actions">
                    <button className="tracking-page__help-btn"><FiPhone /> Get Help</button>
                    <Link to="/" className="tracking-page__home-btn">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
