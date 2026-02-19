const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const restaurantRoutes = require('./routes/restaurants');
const menuRoutes = require('./routes/menu');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const { calculateDeliveryTime } = require('./utils/deliveryCalculator');
const restaurants = require('./data/restaurants.json');

const app = express();
const PORT = process.env.PORT || 8080;

// ---------- SECURITY MIDDLEWARE ----------

// HTTP security headers (XSS protection, content-type sniffing, etc.)
app.use(helmet());

// CORS — restrict to known origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173'
];

// In production, allow all origins (App Runner domain)
const isProduction = process.env.NODE_ENV === 'production' || process.env.PORT;
app.use(cors({
  origin: (origin, callback) => {
    // In production, allow all origins; in dev, restrict to known origins
    if (isProduction || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser with size limit to prevent payload flooding
app.use(express.json({ limit: '10kb' }));

// Global rate limiter — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use(globalLimiter);

// ---------- ROUTES ----------

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Delivery time calculator
app.get('/api/delivery-time', (req, res) => {
  const { userLat, userLng, restLat, restLng } = req.query;
  if (!userLat || !userLng || !restLat || !restLng) {
    return res.status(400).json({ success: false, message: 'Missing coordinates' });
  }
  const lat1 = parseFloat(userLat), lng1 = parseFloat(userLng);
  const lat2 = parseFloat(restLat), lng2 = parseFloat(restLng);
  if ([lat1, lng1, lat2, lng2].some(isNaN)) {
    return res.status(400).json({ success: false, message: 'Coordinates must be valid numbers' });
  }
  const result = calculateDeliveryTime(lat1, lng1, lat2, lng2);
  res.json({ success: true, data: result });
});

// SSE: Live restaurant updates
let clients = [];
app.get('/api/live-updates', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const clientId = Date.now();
  clients.push({ id: clientId, res });

  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

// Simulate live updates
setInterval(() => {
  if (clients.length === 0) return;
  const updates = [];
  const fields = ['rating', 'deliveryTime', 'isAvailable', 'newOffer'];
  const count = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < count; i++) {
    const rest = restaurants[Math.floor(Math.random() * restaurants.length)];
    const field = fields[Math.floor(Math.random() * fields.length)];
    let value;
    switch (field) {
      case 'rating': value = (3.5 + Math.random() * 1.5).toFixed(1); break;
      case 'deliveryTime': value = `${15 + Math.floor(Math.random() * 25)}-${30 + Math.floor(Math.random() * 20)}`; break;
      case 'isAvailable': value = Math.random() > 0.2; break;
      case 'newOffer': value = ['20% OFF up to ₹100', '₹75 OFF above ₹249', 'FREE delivery'][Math.floor(Math.random() * 3)]; break;
    }
    updates.push({ id: rest.id, field, value, timestamp: new Date().toISOString() });
  }
  const payload = JSON.stringify(updates);
  clients.forEach(client => {
    try { client.res.write(`data: ${payload}\n\n`); } catch (e) { }
  });
}, 15000);

// ---------- SERVE STATIC FRONTEND ----------
app.use(express.static(path.join(__dirname, '..', 'dist')));

// SPA catch-all — serve index.html for client-side routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// ---------- GLOBAL ERROR HANDLER ----------
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'CORS: Origin not allowed' });
  }
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ---------- START ----------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`CORS allowed origins: ${isProduction ? 'ALL' : allowedOrigins.join(', ')}`);
});
