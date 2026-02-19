const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Mock orders storage
const orders = [];
let orderClients = {};

// Sanitize string inputs
function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>"'&]/g, '').trim();
}

// POST /api/orders - Place a new order
router.post('/',
    body('items').isArray({ min: 1, max: 50 }).withMessage('Order must have 1-50 items'),
    body('items.*.name').isString().withMessage('Item name is required'),
    body('items.*.price').isNumeric().withMessage('Item price must be a number'),
    body('items.*.quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be 1-99'),
    body('restaurantId').notEmpty().withMessage('Restaurant ID is required'),
    body('total').isNumeric().withMessage('Total must be a number'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const { items, restaurantId, restaurantName, address, total, paymentMethod } = req.body;

        const order = {
            id: 'ORD' + Date.now(),
            items: items.map(i => ({
                ...i,
                name: sanitize(i.name),
                price: Number(i.price),
                quantity: Number(i.quantity)
            })),
            restaurantId,
            restaurantName: sanitize(restaurantName || 'Restaurant'),
            address: sanitize(address || 'Home - 123, Example Street'),
            total: Number(total),
            paymentMethod: ['COD', 'UPI', 'CARD'].includes(paymentMethod) ? paymentMethod : 'COD',
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
    }
);

// Server-side order progression
function startOrderProgression(order) {
    const stages = [1, 2, 3, 4];
    const delays = [5000, 12000, 20000, 30000];

    stages.forEach((stageIdx, i) => {
        setTimeout(() => {
            if (order.timeline[stageIdx]) {
                order.timeline[stageIdx].completed = true;
                order.timeline[stageIdx].time = new Date().toISOString();
                order.status = order.timeline[stageIdx].status;

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
    const orderId = sanitize(req.params.id);
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        // Return a mock order for demo purposes
        const mockOrder = {
            id: orderId,
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

        orders.push(mockOrder);
        startOrderProgression(mockOrder);

        return res.json({ success: true, data: mockOrder });
    }
    res.json({ success: true, data: order });
});

// SSE: Live order tracking
router.get('/:id/live', (req, res) => {
    const orderId = sanitize(req.params.id);

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
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
