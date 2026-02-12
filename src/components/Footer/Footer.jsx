import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer__container">
                <div className="footer__top">
                    <div className="footer__brand">
                        <div className="footer__logo">
                            <svg viewBox="0 0 559 825" height="36" width="24" fill="#FC8019">
                                <path d="M462.8 65.6C462.8 29.4 433.4 0 397.2 0H162.8C126.6 0 97.2 29.4 97.2 65.6V355.4C97.2 391.6 126.6 421 162.8 421H397.2C433.4 421 462.8 391.6 462.8 355.4V65.6Z" />
                                <path d="M280 285C307.614 285 330 262.614 330 235C330 207.386 307.614 185 280 185C252.386 185 230 207.386 230 235C230 262.614 252.386 285 280 285Z" fill="white" />
                                <path d="M0 533C0 507.043 21.0426 486 47 486H513C538.957 486 560 507.043 560 533V778C560 803.957 538.957 825 513 825H47C21.0426 825 0 803.957 0 778V533Z" />
                                <path d="M280 715C307.614 715 330 692.614 330 665C330 637.386 307.614 615 280 615C252.386 615 230 637.386 230 665C230 692.614 252.386 715 280 715Z" fill="white" />
                            </svg>
                            <span>Swiggy</span>
                        </div>
                        <p className="footer__tagline">© 2024 Swiggy Clone. Made with ❤️</p>
                    </div>

                    <div className="footer__links-group">
                        <h4>Company</h4>
                        <Link to="/about">About</Link>
                        <Link to="/careers">Careers</Link>
                        <Link to="/team">Team</Link>
                        <Link to="/blog">Swiggy Blog</Link>
                    </div>

                    <div className="footer__links-group">
                        <h4>Contact us</h4>
                        <Link to="/help">Help & Support</Link>
                        <Link to="/partner">Partner with us</Link>
                        <Link to="/ride">Ride with us</Link>
                    </div>

                    <div className="footer__links-group">
                        <h4>Available in</h4>
                        <Link to="/">Bangalore</Link>
                        <Link to="/">Mumbai</Link>
                        <Link to="/">Delhi</Link>
                        <Link to="/">Hyderabad</Link>
                        <Link to="/">Chennai</Link>
                        <Link to="/">Pune</Link>
                    </div>

                    <div className="footer__links-group">
                        <h4>Life at Swiggy</h4>
                        <Link to="/explore">Explore with Swiggy</Link>
                        <Link to="/super">Swiggy Super</Link>
                        <Link to="/instamart">Swiggy Instamart</Link>
                        <Link to="/genie">Swiggy Genie</Link>
                    </div>
                </div>

                <div className="footer__bottom">
                    <div className="footer__social">
                        <a href="#" className="footer__social-link"><FiInstagram /></a>
                        <a href="#" className="footer__social-link"><FiFacebook /></a>
                        <a href="#" className="footer__social-link"><FiTwitter /></a>
                    </div>
                    <div className="footer__app-badges">
                        <a href="#" className="footer__app-badge">
                            <img src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/portal/m/play_store.png" alt="Google Play" />
                        </a>
                        <a href="#" className="footer__app-badge">
                            <img src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/portal/m/app_store.png" alt="App Store" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
