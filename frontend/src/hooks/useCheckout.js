// hooks/useCheckout.js
import { useState } from "react";
import { useCart } from "./useCart";
import { useAuthContext } from "./useAuthContext";
import api from "../utils/api";
import { useSaleStore } from "../store/saleStore";

export function useCheckout() {
  const { user } = useAuthContext();
  const { cartItems, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkout = async ({ notes, reservationDate }) => {
    if (!user) {
      setError("You must be logged in");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const noteValue =
        notes && notes.trim() !== "" ? notes.trim() : "no note provided";

      const reservationDetails = cartItems.map((item) => ({
        productId: item.productId,
        productVariantId: item.variantId,
        variantId: item.variantId,
        quantity: item.quantity,
        size: item.size,
        unit: item.unit,
        price: item.price,
        total: item.total,
      }));

      const payload = {
        notes: noteValue,
        totalPrice: Number(totalPrice),
        reservationDate,
        reservationDetails,
      };

      const { data } = await api.post("/reservations", payload, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // ✅ Clear cart on success
      clearCart();

      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Checkout failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // admin check out
  const adminCheckout = async ({ amountPaid }) => {
    if (!user) {
      setError("You must be logged in");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const saleItems = cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        size: item.size,
        unit: item.unit,
        price: item.price,
        total: item.total,
      }));

      const payload = {
        amountPaid: Number(amountPaid),
        cashier: user.userId,
        items: saleItems,
      };

      const { data } = await api.post("/sales", payload, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // ✅ Clear cart on success
      clearCart();

      const { fetchDailySales, fetchAnnualSales, fetchThisYearSales } =
        useSaleStore.getState();
      await Promise.all([
        fetchDailySales(),
        fetchAnnualSales(),
        fetchThisYearSales(),
      ]);

      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Checkout failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { checkout, adminCheckout, loading, error };
}
