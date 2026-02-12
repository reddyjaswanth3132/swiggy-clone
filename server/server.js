const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const restaurantRoutes = require('./routes/restaurants');
const menuRoutes = require('./routes/menu');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Swiggy Clone API is running' });
});

// ============================================================
// SSE: Real-Time Live Updates for Restaurant Data
// Simulates changes in availability, ratings, and delivery times
// ============================================================
const restaurants = require('./data/restaurants.json');
let liveClients = [];

app.get('/api/live-updates', (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Send initial heartbeat
  res.write('data: {"type":"connected","message":"Live updates connected"}\n\n');

  // Track client
  const clientId = Date.now();
  const client = { id: clientId, res };
  liveClients.push(client);
  console.log(`📡 Live client connected: ${clientId} (Total: ${liveClients.length})`);

  // Remove client on disconnect
  req.on('close', () => {
    liveClients = liveClients.filter(c => c.id !== clientId);
    console.log(`📡 Live client disconnected: ${clientId} (Total: ${liveClients.length})`);
  });
});

// Simulate live restaurant updates every 10 seconds
setInterval(() => {
  if (liveClients.length === 0) return;

  // Pick 2-4 random restaurants to update
  const numUpdates = 2 + Math.floor(Math.random() * 3);
  const updates = [];

  for (let i = 0; i < numUpdates; i++) {
    const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];

    const update = {
      id: restaurant.id,
      name: restaurant.name
    };

    // Randomly decide what to update
    const updateType = Math.random();
    if (updateType < 0.3) {
      // Rating fluctuation (+/- 0.1)
      update.field = 'rating';
      update.value = Math.round((restaurant.rating + (Math.random() * 0.2 - 0.1)) * 10) / 10;
      update.value = Math.max(3.5, Math.min(5.0, update.value));
    } else if (updateType < 0.6) {
      // Delivery time change
      update.field = 'deliveryTime';
      const baseMin = parseInt(restaurant.deliveryTime.split('-')[0]);
      const jitter = Math.floor(Math.random() * 10) - 5;
      const newMin = Math.max(10, baseMin + jitter);
      update.value = `${newMin}-${newMin + 10}`;
    } else if (updateType < 0.8) {
      // Availability toggle
      update.field = 'isAvailable';
      update.value = Math.random() > 0.15; // 85% chance available
    } else {
      // New offer
      const offers = ['🔥 FLAT ₹50 OFF', '⚡ 30% OFF up to ₹75', '🎉 Free Delivery', '✨ Buy 1 Get 1'];
      update.field = 'newOffer';
      update.value = offers[Math.floor(Math.random() * offers.length)];
    }

    updates.push(update);
  }

  const payload = JSON.stringify({
    type: 'restaurant_updates',
    timestamp: new Date().toISOString(),
    updates
  });

  liveClients.forEach(client => {
    client.res.write(`data: ${payload}\n\n`);
  });
}, 10000);

// ============================================================
// Delivery Time Calculator API
// ============================================================
const { calculateDeliveryTime } = require('./utils/deliveryCalculator');

app.get('/api/delivery-time', (req, res) => {
  const { userLat, userLng, restLat, restLng } = req.query;
  const uLat = parseFloat(userLat);
  const uLng = parseFloat(userLng);
  const rLat = parseFloat(restLat);
  const rLng = parseFloat(restLng);

  if (isNaN(uLat) || isNaN(uLng) || isNaN(rLat) || isNaN(rLng)) {
    return res.status(400).json({ success: false, message: 'Invalid coordinates' });
  }

  const result = calculateDeliveryTime(uLat, uLng, rLat, rLng);
  res.json({ success: true, data: result });
});

app.listen(PORT, () => {
  console.log(`🚀 Swiggy Clone API Server running on http://localhost:${PORT}`);
  console.log(`📡 SSE Live Updates: http://localhost:${PORT}/api/live-updates`);
  console.log(`📍 Delivery Time: http://localhost:${PORT}/api/delivery-time?userLat=12.93&userLng=77.63&restLat=12.97&restLng=77.64`);
});
