// src/store/useReservationStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../utils/api";

export const useReservationStore = create(
  persist(
    (set, get) => ({
      reservations: [],
      pages: 1,
      total: 0,
      page: 1,
      loading: false,
      error: null,
      expandedRow: null,
      statusFilter: "all",
      statusCounts: {
        all: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        failed: 0,
        completed: 0,
      },

      // ✅ UI State setters
      setPage: (page) => set({ page }),
      setExpandedRow: (rowId) => set({ expandedRow: rowId }),
      toggleExpandedRow: (reservationId) =>
        set((state) => ({
          expandedRow:
            state.expandedRow === reservationId ? null : reservationId,
        })),
      setStatusFilter: (status) =>
        set({ statusFilter: status, page: 1, expandedRow: null }),

      // ✅ Fetch reservations from API
      fetchReservations: async (
        token,
        { page = 1, limit = 20, status = "all" } = {}
      ) => {
        set({ loading: true, error: null });
        try {
          const params = {
            page,
            limit,
            sortBy: "reservationDate",
            sortOrder: "asc",
          };
          if (status !== "all") params.status = status;

          const res = await api.get("/reservations", {
            params,
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = res.data;
          set({
            reservations: data.reservations || [],
            total: data.total || 0,
            page: data.page || 1,
            pages: data.pages || 1,
            statusCounts: data.statusCounts || get().statusCounts,
            loading: false,
            error: null,
          });
        } catch (err) {
          console.error("Fetch reservations failed:", err);
          set({
            reservations: [],
            error: err.response?.data?.message || err.message,
            loading: false,
          });
        }
      },

      // ✅ Set reservations manually (used after successful update)
      setReservations: ({ reservations, total, page, pages }) =>
        set({ reservations, total, page, pages }),

      // ✅ Update a single reservation in the list
      updateReservation: (updated) =>
        set({
          reservations: get().reservations.map((r) =>
            r._id === updated._id ? updated : r
          ),
        }),

      // ✅ Reset store state
      reset: () =>
        set({
          reservations: [],
          pages: 1,
          total: 0,
          page: 1,
          error: null,
          loading: false,
          expandedRow: null,
          statusFilter: "all",
        }),
    }),
    {
      name: "reservation-storage",
      partialize: (state) => ({
        reservations: state.reservations,
        pages: state.pages,
        total: state.total,
        statusCounts: state.statusCounts,
        // Don't persist UI state like expandedRow, page, statusFilter
      }),
    }
  )
);
