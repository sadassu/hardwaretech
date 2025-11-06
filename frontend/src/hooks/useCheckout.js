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

      const form = new FormData();
      form.append("notes", noteValue);
      form.append("totalPrice", totalPrice);
      form.append("reservationDate", reservationDate);

      cartItems.forEach((item, idx) => {
        form.append(`reservationDetails[${idx}][productId]`, item.productId);
        form.append(`reservationDetails[${idx}][variantId]`, item.variantId);
        form.append(`reservationDetails[${idx}][quantity]`, item.quantity);
        form.append(`reservationDetails[${idx}][size]`, item.size);
        form.append(`reservationDetails[${idx}][unit]`, item.unit);
        form.append(`reservationDetails[${idx}][price]`, item.price);
        form.append(`reservationDetails[${idx}][total]`, item.total);
      });

      const { data } = await api.post("/reservations", form, {
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
      const form = new FormData();
      form.append("amountPaid", amountPaid);
      form.append("cashier", user.userId);

      cartItems.forEach((item, idx) => {
        form.append(`items[${idx}][productId]`, item.productId);
        form.append(`items[${idx}][variantId]`, item.variantId);
        form.append(`items[${idx}][quantity]`, item.quantity);
        form.append(`items[${idx}][size]`, item.size);
        form.append(`items[${idx}][unit]`, item.unit);
        form.append(`items[${idx}][price]`, item.price);
        form.append(`items[${idx}][total]`, item.total);
      });

      const { data } = await api.post("/sales", form, {
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
