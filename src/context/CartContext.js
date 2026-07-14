import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product._id === product._id);
      if (existing) {
        return prevCart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product._id === productId);
      if (existing && existing.quantity > 1) {
        return prevCart.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevCart.filter((item) => item.product._id !== productId);
    });
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.product._id !== productId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product._id === productId ? { ...item, quantity: qty } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
