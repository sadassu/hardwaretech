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
      searchQuery: "",
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
      setSearchQuery: (query) =>
        set({ searchQuery: query, page: 1, expandedRow: null }),

      // ✅ Fetch reservations from API
      fetchReservations: async (
        token,
        { page = 1, limit = 20, status = "all", search = "" } = {}
      ) => {
        set({ loading: true, error: null });
        try {
          const params = {
            page,
            limit,
            sortBy: "reservationDate",
            sortOrder: "desc",
          };
          if (status !== "all") params.status = status;
          if (search && search.trim()) params.search = search.trim();

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

      fetchUserReservations: async (
        token,
        userId,
        { page = 1, limit = 20, status = "all" } = {}
      ) => {
        set({ loading: true, error: null });
        try {
          const params = { page, limit, sortOrder: "desc" }; 
          if (status !== "all") params.status = status;

          const res = await api.get(`/reservations/user/${userId}`, {
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
          console.error("Fetch user reservations failed:", err);
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
      // If the new status doesn't match the current filter, remove it from the list
      // If it does match, update it in place
      updateReservation: (updated) => {
        const state = get();
        const currentFilter = state.statusFilter;
        const newStatus = updated.status;
        
        // If filtering by a specific status and the updated reservation's status doesn't match, remove it
        if (currentFilter !== "all" && newStatus !== currentFilter) {
          const newReservations = state.reservations.filter((r) => r._id !== updated._id);
          const newTotal = Math.max(0, state.total - 1);
          
          // If current page becomes empty and we're not on page 1, adjust page
          let newPage = state.page;
          if (newReservations.length === 0 && state.page > 1) {
            newPage = Math.max(1, state.page - 1);
          }
          
          set({
            reservations: newReservations,
            total: newTotal,
            page: newPage,
          });
        } else {
          // Update in place if status matches filter or filter is "all"
          set({
            reservations: state.reservations.map((r) =>
              r._id === updated._id ? updated : r
            ),
          });
        }
      },

      // ✅ Update status counts after a reservation status change
      updateStatusCounts: async (token) => {
        try {
          const res = await api.get("/reservations", {
            params: { page: 1, limit: 1 },
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data.statusCounts) {
            set({ statusCounts: res.data.statusCounts });
          }
        } catch (err) {
          console.error("Failed to update status counts:", err);
        }
      },

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
