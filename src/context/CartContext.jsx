import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
            if (existingIndex >= 0) {
                const newItems = [...state.items];
                newItems[existingIndex].quantity += 1;
                return { ...state, items: newItems };
            }
            return {
                ...state,
                restaurantId: action.payload.restaurantId || state.restaurantId,
                restaurantName: action.payload.restaurantName || state.restaurantName,
                items: [...state.items, { ...action.payload, quantity: 1 }]
            };
        }
        case 'REMOVE_ITEM': {
            const idx = state.items.findIndex(item => item.id === action.payload);
            if (idx >= 0) {
                const newItems = [...state.items];
                if (newItems[idx].quantity > 1) {
                    newItems[idx].quantity -= 1;
                } else {
                    newItems.splice(idx, 1);
                }
                return {
                    ...state,
                    items: newItems,
                    restaurantId: newItems.length === 0 ? null : state.restaurantId,
                    restaurantName: newItems.length === 0 ? '' : state.restaurantName
                };
            }
            return state;
        }
        case 'CLEAR_CART':
            return { items: [], restaurantId: null, restaurantName: '', coupon: null };
        case 'APPLY_COUPON':
            return { ...state, coupon: action.payload };
        case 'REMOVE_COUPON':
            return { ...state, coupon: null };
        case 'SET_RESTAURANT': {
            if (state.restaurantId && state.restaurantId !== action.payload.restaurantId && state.items.length > 0) {
                // Different restaurant, clear cart
                return {
                    items: [],
                    restaurantId: action.payload.restaurantId,
                    restaurantName: action.payload.restaurantName,
                    coupon: null
                };
            }
            return {
                ...state,
                restaurantId: action.payload.restaurantId,
                restaurantName: action.payload.restaurantName
            };
        }
        default:
            return state;
    }
};

const initialState = {
    items: [],
    restaurantId: null,
    restaurantName: '',
    coupon: null
};

export function CartProvider({ children }) {
    const [cart, dispatch] = useReducer(cartReducer, initialState, () => {
        try {
            const saved = localStorage.getItem('swiggy_cart');
            return saved ? JSON.parse(saved) : initialState;
        } catch {
            return initialState;
        }
    });

    useEffect(() => {
        localStorage.setItem('swiggy_cart', JSON.stringify(cart));
    }, [cart]);

    const addItem = (item, restaurantId, restaurantName) => {
        dispatch({ type: 'ADD_ITEM', payload: { ...item, restaurantId, restaurantName } });
    };

    const removeItem = (itemId) => {
        dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const applyCoupon = (coupon) => {
        dispatch({ type: 'APPLY_COUPON', payload: coupon });
    };

    const removeCoupon = () => {
        dispatch({ type: 'REMOVE_COUPON' });
    };

    const setRestaurant = (restaurantId, restaurantName) => {
        dispatch({ type: 'SET_RESTAURANT', payload: { restaurantId, restaurantName } });
    };

    const getItemQuantity = (itemId) => {
        const item = cart.items.find(i => i.id === itemId);
        return item ? item.quantity : 0;
    };

    const getTotalItems = () => {
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
    };

    const getSubtotal = () => {
        return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const getDiscount = () => {
        if (!cart.coupon) return 0;
        const subtotal = getSubtotal();
        if (subtotal < cart.coupon.minOrder) return 0;
        if (cart.coupon.type === 'flat') return cart.coupon.value;
        if (cart.coupon.type === 'percent') {
            const discount = (subtotal * cart.coupon.value) / 100;
            return Math.min(discount, cart.coupon.maxDiscount);
        }
        return 0;
    };

    return (
        <CartContext.Provider value={{
            cart,
            addItem,
            removeItem,
            clearCart,
            applyCoupon,
            removeCoupon,
            setRestaurant,
            getItemQuantity,
            getTotalItems,
            getSubtotal,
            getDiscount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}
