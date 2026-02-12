import { useState } from 'react';
import { FiX, FiPhone, FiMail, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { loginUser, signupUser } from '../../utils/api';
import './AuthModal.css';

export default function AuthModal() {
    const { showAuthModal, closeAuthModal, login } = useAuth();
    const [mode, setMode] = useState('login');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!showAuthModal) return null;

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (phone.length < 10) { setError('Please enter a valid 10-digit phone number'); return; }
        setLoading(true); setError('');
        try { await loginUser(phone); setMode('otp'); } catch { setError('Failed to send OTP.'); }
        setLoading(false);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 4) { setError('Please enter the 4-digit OTP'); return; }
        setLoading(true); setError('');
        try {
            const res = await loginUser(phone, otp);
            if (res.success) login(res.data); else setError(res.message || 'Invalid OTP');
        } catch { setError('Verification failed'); }
        setLoading(false);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!name || phone.length < 10) { setError('Please fill all required fields'); return; }
        setLoading(true); setError('');
        try {
            const res = await signupUser(name, phone, email);
            if (res.success) login(res.data);
        } catch { setError('Signup failed'); }
        setLoading(false);
    };

    return (
        <>
            <div className="auth-overlay" onClick={closeAuthModal} />
            <div className="auth-modal">
                <button className="auth-modal__close" onClick={closeAuthModal}><FiX /></button>

                {mode === 'login' && (
                    <div className="auth-modal__content">
                        <h2>Login</h2>
                        <p className="auth-modal__subtitle">or <span onClick={() => { setMode('signup'); setError(''); }}>create an account</span></p>
                        <div className="auth-modal__divider" />
                        <form onSubmit={handleSendOTP}>
                            <div className="auth-modal__input-group">
                                <FiPhone className="auth-modal__input-icon" />
                                <input type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
                            </div>
                            {error && <p className="auth-modal__error">{error}</p>}
                            <button type="submit" className="auth-modal__submit" disabled={loading}>{loading ? 'Sending OTP...' : 'SEND OTP'}</button>
                        </form>
                        <p className="auth-modal__terms">By clicking on Login, I accept the <a href="#">Terms & Conditions</a> & <a href="#">Privacy Policy</a></p>
                    </div>
                )}

                {mode === 'otp' && (
                    <div className="auth-modal__content">
                        <h2>Enter OTP</h2>
                        <p className="auth-modal__subtitle">We've sent a 4-digit OTP to +91{phone}</p>
                        <div className="auth-modal__divider" />
                        <form onSubmit={handleVerifyOTP}>
                            <div className="auth-modal__otp-inputs">
                                {[0, 1, 2, 3].map(i => (
                                    <input key={i} type="text" maxLength={1} className="auth-modal__otp-digit"
                                        value={otp[i] || ''} autoFocus={i === 0}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            const newOtp = otp.split(''); newOtp[i] = val; setOtp(newOtp.join(''));
                                            if (val && e.target.nextSibling) e.target.nextSibling.focus();
                                        }} />
                                ))}
                            </div>
                            <p className="auth-modal__hint">Hint: Enter any 4 digits for demo</p>
                            {error && <p className="auth-modal__error">{error}</p>}
                            <button type="submit" className="auth-modal__submit" disabled={loading}>{loading ? 'Verifying...' : 'VERIFY'}</button>
                        </form>
                        <p className="auth-modal__resend" onClick={() => setMode('login')}>← Change phone number</p>
                    </div>
                )}

                {mode === 'signup' && (
                    <div className="auth-modal__content">
                        <h2>Sign up</h2>
                        <p className="auth-modal__subtitle">or <span onClick={() => { setMode('login'); setError(''); }}>login to your account</span></p>
                        <div className="auth-modal__divider" />
                        <form onSubmit={handleSignup}>
                            <div className="auth-modal__input-group"><FiUser className="auth-modal__input-icon" /><input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} /></div>
                            <div className="auth-modal__input-group"><FiPhone className="auth-modal__input-icon" /><input type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} /></div>
                            <div className="auth-modal__input-group"><FiMail className="auth-modal__input-icon" /><input type="email" placeholder="Email (optional)" value={email} onChange={e => setEmail(e.target.value)} /></div>
                            {error && <p className="auth-modal__error">{error}</p>}
                            <button type="submit" className="auth-modal__submit" disabled={loading}>{loading ? 'Creating Account...' : 'CREATE ACCOUNT'}</button>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
}
