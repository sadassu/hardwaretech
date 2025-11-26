import { useEffect, useState, useCallback } from "react";

export function useCart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);

    const handleCartUpdated = () => {
      const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCart(updatedCart);
    };

    window.addEventListener("cartUpdated", handleCartUpdated);
    return () => window.removeEventListener("cartUpdated", handleCartUpdated);
  }, []);

  const syncCart = useCallback((newCart) => {
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
    // Use setTimeout to avoid state updates during render
    setTimeout(() => {
      window.dispatchEvent(new Event("cartUpdated"));
    }, 0);
  }, []);

  const addToCart = useCallback((item) => {
    setCart((prevCart) => {
      const cartCopy = [...prevCart];
      const existingIndex = cartCopy.findIndex(
        (c) => c.productId === item.productId && c.variantId === item.variantId
      );

      if (existingIndex >= 0) {
        const existingItem = cartCopy[existingIndex];
        const newQuantity = existingItem.quantity + item.quantity;
        // Use the maximum available stock (prefer new value if provided, otherwise keep existing)
        const maxAvailable = item.quantityAvailable !== undefined 
          ? item.quantityAvailable 
          : (existingItem.quantityAvailable ?? Infinity);
        
        // Ensure we don't exceed available stock
        const finalQuantity = Math.min(newQuantity, maxAvailable);
        
        cartCopy[existingIndex].quantity = finalQuantity;
        cartCopy[existingIndex].total = finalQuantity * cartCopy[existingIndex].price;
        // Update quantityAvailable if provided (use the variant's actual stock)
        if (item.quantityAvailable !== undefined) {
          cartCopy[existingIndex].quantityAvailable = item.quantityAvailable;
        }
      } else {
        cartCopy.push(item);
      }

      // Update localStorage and dispatch event after state update
      localStorage.setItem("cart", JSON.stringify(cartCopy));
      setTimeout(() => {
        window.dispatchEvent(new Event("cartUpdated"));
      }, 0);

      return cartCopy;
    });
  }, []);

  const removeFromCart = useCallback((productId, variantId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter(
        (c) => !(c.productId === productId && c.variantId === variantId)
      );

      localStorage.setItem("cart", JSON.stringify(newCart));
      setTimeout(() => {
        window.dispatchEvent(new Event("cartUpdated"));
      }, 0);

      return newCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
    setTimeout(() => {
      window.dispatchEvent(new Event("cartUpdated"));
    }, 0);
  }, []);

  const updateQuantity = useCallback((productId, variantId, newQty) => {
    setCart((prevCart) => {
      const newCart = prevCart.map((c) => {
        if (c.productId === productId && c.variantId === variantId) {
          // Check if quantityAvailable exists and enforce limit
          const maxAvailable = c.quantityAvailable ?? Infinity;
          const finalQty = Math.min(newQty, maxAvailable);
          
          return {
            ...c,
            quantity: finalQty,
            total: finalQty * c.price,
          };
        }
        return c;
      });

      localStorage.setItem("cart", JSON.stringify(newCart));
      setTimeout(() => {
        window.dispatchEvent(new Event("cartUpdated"));
      }, 0);

      return newCart;
    });
  }, []);

  // Derived values - these are computed during render and don't cause side effects
  const cartItems = cart;
  const cartCount = cart.length; // Count of unique products, not total quantity
  const totalPrice = cart.reduce((sum, item) => sum + item.total, 0);

  return {
    cartItems,
    cartCount,
    totalPrice,
    addToCart,
    updateQuantity,
    removeItem: removeFromCart,
    clearCart,
  };
}
