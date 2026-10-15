import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();
const CART_STORAGE_KEY = 'freshmart_customer_cart_v1';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved cart from AsyncStorage on app initialization
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            setCart(parsed);
          }
        }
      } catch (error) {
        console.log('Error loading cart from AsyncStorage:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadCart();
  }, []);

  // Save cart changes to AsyncStorage automatically
  useEffect(() => {
    if (!isLoaded) return;
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.log('Error saving cart to AsyncStorage:', error);
      }
    };

    saveCart();
  }, [cart, isLoaded]);

  const addToCart = (product) => {
    const isOutOfStock =
      product.stock !== undefined
        ? product.stock <= 0
        : product.isAvailable === false || product.isActive === false;
    if (isOutOfStock) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product._id === product._id);
      const availableStock =
        product.stock !== undefined && product.stock !== null ? product.stock : Infinity;

      if (existing) {
        if (existing.quantity >= availableStock) {
          return prevCart;
        }
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

  const clearCart = async () => {
    setCart([]);
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.log('Error clearing cart storage:', e);
    }
  };

  const removeOutOfStockItems = () => {
    setCart((prevCart) =>
      prevCart.filter((item) => {
        const isOutOfStock =
          item.product.stock !== undefined
            ? item.product.stock <= 0
            : item.product.isAvailable === false || item.product.isActive === false;
        return !isOutOfStock;
      })
    );
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      const isOutOfStock =
        item.product.stock !== undefined
          ? item.product.stock <= 0
          : item.product.isAvailable === false || item.product.isActive === false;
      if (isOutOfStock) return sum;

      const availableStock =
        item.product.stock !== undefined && item.product.stock !== null
          ? item.product.stock
          : Infinity;
      const billableQty = Math.min(item.quantity, availableStock);

      return sum + item.product.price * billableQty;
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => {
      const isOutOfStock =
        item.product.stock !== undefined
          ? item.product.stock <= 0
          : item.product.isAvailable === false || item.product.isActive === false;
      if (isOutOfStock) return sum;

      const availableStock =
        item.product.stock !== undefined && item.product.stock !== null
          ? item.product.stock
          : Infinity;
      const billableQty = Math.min(item.quantity, availableStock);

      return sum + billableQty;
    }, 0);
  };

  const syncCartStock = (freshProducts) => {
    if (!Array.isArray(freshProducts) || freshProducts.length === 0) return;
    const map = new Map(freshProducts.map((p) => [p._id, p]));
    setCart((prevCart) =>
      prevCart.map((item) => {
        const fresh = map.get(item.product._id);
        if (fresh) {
          return {
            ...item,
            product: {
              ...item.product,
              stock: fresh.stock !== undefined ? fresh.stock : item.product.stock,
              isAvailable: fresh.isAvailable !== undefined ? fresh.isAvailable : item.product.isAvailable,
              isActive: fresh.isActive !== undefined ? fresh.isActive : item.product.isActive,
              price: fresh.price !== undefined ? fresh.price : item.product.price,
            },
          };
        }
        return item;
      })
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        removeOutOfStockItems,
        syncCartStock,
        getCartTotal,
        getCartCount,
        isLoaded,
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
