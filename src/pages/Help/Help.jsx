import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiMail, FiPhone, FiMessageSquare } from 'react-icons/fi';
import './Help.css';

const faqs = [
    { q: 'How do I place an order?', a: 'Browse restaurants on the homepage, select items from the menu, add them to your cart, and proceed to checkout. You can pay via COD or online payment.' },
    { q: 'How can I track my order?', a: 'After placing an order, you will be redirected to the order tracking page where you can see real-time updates on your order status.' },
    { q: 'What if my order is delayed?', a: 'If your order is delayed beyond the estimated delivery time, please contact our support team. We will investigate and resolve the issue promptly.' },
    { q: 'How do I apply a coupon?', a: 'On the cart page, click "Apply Coupon" to see available coupons. Select one that meets the minimum order requirement to apply the discount.' },
    { q: 'Can I cancel my order?', a: 'You can cancel your order before the restaurant starts preparing it. Go to the order tracking page and look for the cancel option.' },
    { q: 'How do I report an issue with my order?', a: 'Go to Help > Report an Issue, select your order, and describe the problem. Our team will respond within 24 hours.' },
    { q: 'Is there a minimum order value?', a: 'Minimum order values vary by restaurant. Some restaurants may have a minimum order requirement for delivery.' },
    { q: 'How does Swiggy Super work?', a: 'Swiggy Super is a membership program that offers free delivery on all orders above ₹149 and exclusive deals. Subscribe from the app for monthly or annual plans.' },
];

export default function Help() {
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="help-page">
            <div className="help-page__container">
                <div className="help-page__hero">
                    <h1>Help & Support</h1>
                    <p>We're here to help. Get in touch with us or find answers below.</p>
                </div>

                <div className="help-page__contact-cards">
                    <div className="help-page__contact-card">
                        <FiPhone className="help-page__contact-icon" />
                        <h3>Call Us</h3>
                        <p>Available 24/7</p>
                        <a href="tel:+911234567890">+91 123 456 7890</a>
                    </div>
                    <div className="help-page__contact-card">
                        <FiMail className="help-page__contact-icon" />
                        <h3>Email Us</h3>
                        <p>Response within 24 hours</p>
                        <a href="mailto:support@swiggy.in">support@swiggy.in</a>
                    </div>
                    <div className="help-page__contact-card">
                        <FiMessageSquare className="help-page__contact-icon" />
                        <h3>Live Chat</h3>
                        <p>Chat with our team</p>
                        <button>Start Chat</button>
                    </div>
                </div>

                <div className="help-page__faq">
                    <h2>Frequently Asked Questions</h2>
                    {faqs.map((faq, i) => (
                        <div key={i} className={`help-page__faq-item ${openFaq === i ? 'open' : ''}`}>
                            <div className="help-page__faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                <span>{faq.q}</span>
                                {openFaq === i ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                            {openFaq === i && (
                                <div className="help-page__faq-answer">
                                    <p>{faq.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
