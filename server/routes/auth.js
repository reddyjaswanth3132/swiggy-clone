const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Mock user storage
const users = [];

// Stricter rate limit for auth routes — 5 attempts per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many login attempts. Please try after 15 minutes.' }
});

// Sanitize string inputs
function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>"'&]/g, '').trim();
}

// POST /api/auth/login
router.post('/login',
    authLimiter,
    body('phone').isString().isLength({ min: 10, max: 10 }).isNumeric().withMessage('Phone must be exactly 10 digits'),
    body('otp').optional().isString().isLength({ min: 4, max: 6 }).isNumeric().withMessage('OTP must be 4-6 digits'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const { phone, otp } = req.body;

        // OTP verification step
        if (otp && otp.length >= 4) {
            const user = users.find(u => u.phone === phone) || {
                id: Date.now(),
                name: 'User',
                phone: sanitize(phone),
                email: ''
            };
            return res.json({ success: true, message: 'Login successful', data: user });
        }

        // Send OTP step
        res.json({ success: true, message: 'OTP sent successfully', otpSent: true });
    }
);

// POST /api/auth/signup
router.post('/signup',
    authLimiter,
    body('name').isString().isLength({ min: 1, max: 100 }).withMessage('Name is required (max 100 chars)'),
    body('phone').isString().isLength({ min: 10, max: 10 }).isNumeric().withMessage('Phone must be exactly 10 digits'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const { name, phone, email } = req.body;

        // Check if user already exists
        if (users.find(u => u.phone === phone)) {
            return res.status(409).json({ success: false, message: 'User with this phone already exists' });
        }

        const newUser = {
            id: Date.now(),
            name: sanitize(name),
            phone: sanitize(phone),
            email: sanitize(email || '')
        };
        users.push(newUser);
        res.json({ success: true, message: 'Account created successfully', data: newUser });
    }
);

module.exports = router;
