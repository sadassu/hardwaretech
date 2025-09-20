import { useEffect, useState } from "react";

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

  const syncCart = (newCart) => {
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const addToCart = (item) => {
    setCart((prevCart) => {
      const cartCopy = [...prevCart];
      const existingIndex = cartCopy.findIndex(
        (c) => c.productId === item.productId && c.variantId === item.variantId
      );

      if (existingIndex >= 0) {
        cartCopy[existingIndex].quantity += item.quantity;
        cartCopy[existingIndex].total =
          cartCopy[existingIndex].quantity * cartCopy[existingIndex].price;
      } else {
        cartCopy.push(item);
      }

      syncCart(cartCopy);
      return cartCopy;
    });
  };

  const removeFromCart = (productId, variantId) => {
    const newCart = cart.filter(
      (c) => !(c.productId === productId && c.variantId === variantId)
    );
    syncCart(newCart);
  };

  const clearCart = () => {
    syncCart([]);
  };

  const updateQuantity = (productId, variantId, newQty) => {
    const newCart = cart.map((c) =>
      c.productId === productId && c.variantId === variantId
        ? {
            ...c,
            quantity: newQty,
            total: newQty * c.price,
          }
        : c
    );
    syncCart(newCart);
  };

  // 👇 Add derived values
  const cartItems = cart;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.total, 0);

  return {
    cartItems,
    cartCount,
    totalPrice,
    addToCart,
    updateQuantity,
    removeItem: removeFromCart, // alias for your component
    clearCart,
  };
}
