import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/api';

/**
 * Custom hook for real-time restaurant updates via Server-Sent Events (SSE)
 * Falls back to polling if SSE is not supported or fails
 */
export function useRealTimeUpdates(onUpdate) {
    const [connected, setConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const eventSourceRef = useRef(null);
    const fallbackIntervalRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const onUpdateRef = useRef(onUpdate);

    // Keep callback ref updated
    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    const connect = useCallback(() => {
        // Clean up existing connections
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        try {
            const es = new EventSource(`${API_BASE}/live-updates`);
            eventSourceRef.current = es;

            es.onopen = () => {
                setConnected(true);
                console.log('📡 SSE Connected - Live updates active');
                // Clear fallback polling if SSE connects
                if (fallbackIntervalRef.current) {
                    clearInterval(fallbackIntervalRef.current);
                    fallbackIntervalRef.current = null;
                }
            };

            es.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'restaurant_updates' && onUpdateRef.current) {
                        setLastUpdate(data.timestamp);
                        onUpdateRef.current(data.updates);
                    }
                } catch (e) {
                    console.warn('Failed to parse SSE data:', e);
                }
            };

            es.onerror = () => {
                setConnected(false);
                es.close();
                eventSourceRef.current = null;

                // Attempt reconnection after 5 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('📡 SSE Reconnecting...');
                    connect();
                }, 5000);
            };
        } catch (e) {
            console.warn('SSE not supported, falling back to polling');
            startPollingFallback();
        }
    }, []);

    const startPollingFallback = useCallback(() => {
        if (fallbackIntervalRef.current) return;

        fallbackIntervalRef.current = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/restaurants`);
                const data = await res.json();
                if (data.success && onUpdateRef.current) {
                    // Simulate update format
                    const updates = data.data.slice(0, 3).map(r => ({
                        id: r.id,
                        field: 'deliveryTime',
                        value: r.deliveryTime
                    }));
                    onUpdateRef.current(updates);
                    setLastUpdate(new Date().toISOString());
                }
            } catch (e) {
                console.warn('Polling fallback failed:', e);
            }
        }, 15000);
    }, []);

    useEffect(() => {
        connect();

        return () => {
            if (eventSourceRef.current) eventSourceRef.current.close();
            if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, [connect]);

    const disconnect = useCallback(() => {
        if (eventSourceRef.current) eventSourceRef.current.close();
        if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        setConnected(false);
    }, []);

    return { connected, lastUpdate, disconnect };
}

/**
 * Custom hook for real-time order tracking via SSE
 */
export function useOrderTracking(orderId) {
    const [orderData, setOrderData] = useState(null);
    const [connected, setConnected] = useState(false);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        if (!orderId) return;

        const es = new EventSource(`${API_BASE}/orders/${orderId}/live`);
        eventSourceRef.current = es;

        es.onopen = () => setConnected(true);

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'order_state') {
                    setOrderData(data.order);
                } else if (data.type === 'order_update') {
                    setOrderData(prev => prev ? {
                        ...prev,
                        status: data.status,
                        timeline: data.timeline
                    } : prev);
                }
            } catch (e) {
                console.warn('Failed to parse order SSE:', e);
            }
        };

        es.onerror = () => {
            setConnected(false);
            es.close();
        };

        return () => {
            es.close();
            setConnected(false);
        };
    }, [orderId]);

    return { orderData, connected };
}
