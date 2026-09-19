import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [currentStoreId, setCurrentStoreId] = useState(null);
  const [currentStoreName, setCurrentStoreName] = useState('');

  const addToCart = (item, storeId, storeName) => {
    // If adding from a different store, clear cart
    if (currentStoreId && currentStoreId !== storeId) {
      if (!window.confirm(`Your cart has items from "${currentStoreName}". Clear cart and add from this store?`)) return;
      setCartItems([]);
    }
    setCurrentStoreId(storeId);
    setCurrentStoreName(storeName);

    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((i) => i._id !== itemId));
  };

  const updateQuantity = (itemId, qty) => {
    if (qty < 1) { removeFromCart(itemId); return; }
    setCartItems((prev) => prev.map((i) => i._id === itemId ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => {
    setCartItems([]);
    setCurrentStoreId(null);
    setCurrentStoreName('');
  };

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, currentStoreId, currentStoreName,
      addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
