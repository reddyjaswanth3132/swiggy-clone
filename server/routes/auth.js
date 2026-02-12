const express = require('express');
const router = express.Router();

// Mock user storage
const users = [];

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { phone, otp } = req.body;
    if (!phone) {
        return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    // Mock OTP verification (accept any 4-digit OTP)
    if (otp && otp.length === 4) {
        const user = users.find(u => u.phone === phone) || {
            id: Date.now(),
            name: 'User',
            phone,
            email: ''
        };
        return res.json({ success: true, message: 'Login successful', data: user });
    }
    // Send OTP step
    res.json({ success: true, message: 'OTP sent successfully', otpSent: true });
});

// POST /api/auth/signup
router.post('/signup', (req, res) => {
    const { name, phone, email } = req.body;
    if (!name || !phone) {
        return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }
    const newUser = {
        id: Date.now(),
        name,
        phone,
        email: email || ''
    };
    users.push(newUser);
    res.json({ success: true, message: 'Account created successfully', data: newUser });
});

module.exports = router;
