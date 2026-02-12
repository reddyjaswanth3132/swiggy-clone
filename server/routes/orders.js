const express = require('express');
const router = express.Router();

// Mock orders storage
const orders = [];
let orderClients = {};

// POST /api/orders - Place a new order
router.post('/', (req, res) => {
    const { items, restaurantId, restaurantName, address, total, paymentMethod } = req.body;
    if (!items || !items.length) {
        return res.status(400).json({ success: false, message: 'Order items are required' });
    }
    const order = {
        id: 'ORD' + Date.now(),
        items,
        restaurantId,
        restaurantName,
        address: address || 'Home - 123, Example Street',
        total,
        paymentMethod: paymentMethod || 'COD',
        status: 'confirmed',
        placedAt: new Date().toISOString(),
        estimatedDelivery: '30-40 min',
        deliveryPartner: {
            name: 'Rahul K.',
            phone: '+91 98765 43210',
            vehicle: 'Bike',
            photo: '🏍️'
        },
        timeline: [
            { status: 'Order Placed', time: new Date().toISOString(), completed: true },
            { status: 'Restaurant Accepted', time: null, completed: false },
            { status: 'Being Prepared', time: null, completed: false },
            { status: 'Out for Delivery', time: null, completed: false },
            { status: 'Delivered', time: null, completed: false }
        ]
    };
    orders.push(order);

    // Auto-advance order timeline on server-side
    startOrderProgression(order);

    res.json({ success: true, message: 'Order placed successfully', data: order });
});

// Server-side order progression
function startOrderProgression(order) {
    const stages = [1, 2, 3, 4]; // Indices to advance
    const delays = [5000, 12000, 20000, 30000]; // Delays for each stage

    stages.forEach((stageIdx, i) => {
        setTimeout(() => {
            if (order.timeline[stageIdx]) {
                order.timeline[stageIdx].completed = true;
                order.timeline[stageIdx].time = new Date().toISOString();
                order.status = order.timeline[stageIdx].status;

                // Notify SSE clients watching this order
                const clients = orderClients[order.id] || [];
                const payload = JSON.stringify({
                    type: 'order_update',
                    orderId: order.id,
                    status: order.status,
                    timeline: order.timeline,
                    stageIndex: stageIdx
                });
                clients.forEach(client => {
                    try { client.res.write(`data: ${payload}\n\n`); } catch (e) { }
                });
            }
        }, delays[i]);
    });
}

// GET /api/orders/:id - Get order status
router.get('/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
        // Return a mock order for demo purposes
        const mockOrder = {
            id: req.params.id,
            restaurantName: 'Pizza Hut',
            status: 'Being Prepared',
            total: 549,
            estimatedDelivery: '25-30 min',
            placedAt: new Date(Date.now() - 600000).toISOString(),
            deliveryPartner: {
                name: 'Rahul K.',
                phone: '+91 98765 43210',
                vehicle: 'Bike',
                photo: '🏍️'
            },
            timeline: [
                { status: 'Order Placed', time: new Date(Date.now() - 600000).toISOString(), completed: true },
                { status: 'Restaurant Accepted', time: new Date(Date.now() - 300000).toISOString(), completed: true },
                { status: 'Being Prepared', time: new Date().toISOString(), completed: true },
                { status: 'Out for Delivery', time: null, completed: false },
                { status: 'Delivered', time: null, completed: false }
            ],
            items: [
                { name: 'Margherita Pizza', quantity: 1, price: 199 },
                { name: 'Pepperoni Pizza', quantity: 1, price: 349 }
            ],
            address: 'Home - 123, Example Street, Bangalore'
        };

        // Start progression for mock order too
        orders.push(mockOrder);
        startOrderProgression(mockOrder);

        return res.json({ success: true, data: mockOrder });
    }
    res.json({ success: true, data: order });
});

// SSE: Live order tracking
router.get('/:id/live', (req, res) => {
    const orderId = req.params.id;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    // Send current state immediately
    const order = orders.find(o => o.id === orderId);
    if (order) {
        res.write(`data: ${JSON.stringify({ type: 'order_state', order })}\n\n`);
    }

    // Track this client
    const clientId = Date.now();
    if (!orderClients[orderId]) orderClients[orderId] = [];
    orderClients[orderId].push({ id: clientId, res });

    req.on('close', () => {
        if (orderClients[orderId]) {
            orderClients[orderId] = orderClients[orderId].filter(c => c.id !== clientId);
        }
    });
});

module.exports = router;
