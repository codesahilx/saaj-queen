import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const ACTIONS = {
  ADD:    'ADD',
  REMOVE: 'REMOVE',
  UPDATE: 'UPDATE',
  CLEAR:  'CLEAR',
};

function cartReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD: {
      const exists = state.items.find(i => i.id === action.item.id);
      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.item, qty: 1 }] };
    }
    case ACTIONS.REMOVE:
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case ACTIONS.UPDATE:
      if (action.qty <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.id) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id ? { ...i, qty: action.qty } : i
        ),
      };
    case ACTIONS.CLEAR:
      return { ...state, items: [] };
    default:
      return state;
  }
}

const initial = () => {
  try {
    const saved = localStorage.getItem('sq_cart');
    return saved ? JSON.parse(saved) : { items: [] };
  } catch {
    return { items: [] };
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, null, initial);

  useEffect(() => {
    localStorage.setItem('sq_cart', JSON.stringify(state));
  }, [state]);

  const addToCart    = item  => dispatch({ type: ACTIONS.ADD, item });
  const removeFromCart = id  => dispatch({ type: ACTIONS.REMOVE, id });
  const updateQty = (id, qty) => dispatch({ type: ACTIONS.UPDATE, id, qty });
  const clearCart  = ()      => dispatch({ type: ACTIONS.CLEAR });

  const itemCount = state.items.reduce((s, i) => s + i.qty, 0);
  const total     = state.items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items: state.items, addToCart, removeFromCart, updateQty, clearCart, itemCount, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
