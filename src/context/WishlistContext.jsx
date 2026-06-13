import { createContext, useContext, useReducer, useEffect } from 'react';

const WishlistContext = createContext(null);

function wishlistReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE': {
      const exists = state.find(i => i.id === action.item.id);
      return exists ? state.filter(i => i.id !== action.item.id) : [...state, action.item];
    }
    case 'REMOVE':
      return state.filter(i => i.id !== action.id);
    default:
      return state;
  }
}

const initial = () => {
  try {
    const saved = localStorage.getItem('sq_wishlist');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export function WishlistProvider({ children }) {
  const [items, dispatch] = useReducer(wishlistReducer, null, initial);

  useEffect(() => {
    localStorage.setItem('sq_wishlist', JSON.stringify(items));
  }, [items]);

  const toggleWishlist = item => dispatch({ type: 'TOGGLE', item });
  const removeFromWishlist = id => dispatch({ type: 'REMOVE', id });
  const isWishlisted = id => items.some(i => i.id === id);

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, removeFromWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
