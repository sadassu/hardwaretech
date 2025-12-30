import React, { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useReservationStore } from "../store/reservationStore";
import { useLiveResourceRefresh } from "../hooks/useLiveResourceRefresh";
import { useIsMobile } from "../hooks/useIsMobile";
import { Link } from "react-router";
import { formatDatePHT } from "../utils/formatDate";
import { formatPrice } from "../utils/formatPrice";
import { formatVariantLabel } from "../utils/formatVariantLabel";
import Modal from "./Modal";
import api from "../utils/api";

const ReservationNotification = () => {
  const { user } = useAuthContext();
  const { fetchUserReservations, reservations, statusCounts } = useReservationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [lastChecked, setLastChecked] = useState(null);
  const dropdownRef = useRef(null);
  const processedReservationsRef = useRef(new Set());
  const previousReservationsRef = useRef([]);
  const reservationsLiveKey = useLiveResourceRefresh(["reservations", "sales"]);
  const { isMobile } = useIsMobile();
  const isInitialLoadRef = useRef(true);

  // Only show for regular users (not admin/cashier)
  const canShowNotifications =
    user && !user.roles?.includes("admin") && !user.roles?.includes("cashier");

  // Storage key for localStorage
  const STORAGE_KEY = `reservation_notifications_${user?.userId || "guest"}`;
  const LAST_CHECKED_KEY = `reservation_last_checked_${user?.userId || "guest"}`;

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (!user?.userId || !canShowNotifications) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedLastChecked = localStorage.getItem(LAST_CHECKED_KEY);
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Filter out notifications older than 30 days and invalid entries
          const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
          const recentNotifications = parsed
            .filter(n => {
              if (!n || !n.id || !n.message) return false; // Skip invalid entries
              try {
                const notificationDate = new Date(n.date).getTime();
                return notificationDate > thirtyDaysAgo && !isNaN(notificationDate);
              } catch {
                return false; // Skip entries with invalid dates
              }
            })
            .map(n => ({
              ...n,
              date: n.date instanceof Date ? n.date : new Date(n.date || Date.now()),
            }));
          
          setNotifications(recentNotifications);
          
          // Restore processed keys
          recentNotifications.forEach(n => {
            if (n.id) {
              processedReservationsRef.current.add(n.id);
            }
          });
        } catch (parseError) {
          console.error("Failed to parse stored notifications:", parseError);
          // Clear corrupted data
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      
      if (storedLastChecked) {
        setLastChecked(new Date(storedLastChecked));
      }
    } catch (error) {
      console.error("Failed to load notifications from localStorage:", error);
    }
  }, [user?.userId, canShowNotifications, STORAGE_KEY, LAST_CHECKED_KEY]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (!user?.userId || !canShowNotifications || isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error("Failed to save notifications to localStorage:", error);
    }
  }, [notifications, user?.userId, canShowNotifications, STORAGE_KEY]);

  // Save lastChecked to localStorage whenever it changes
  useEffect(() => {
    if (!user?.userId || !canShowNotifications || !lastChecked) return;

    try {
      localStorage.setItem(LAST_CHECKED_KEY, lastChecked.toISOString());
    } catch (error) {
      console.error("Failed to save lastChecked to localStorage:", error);
    }
  }, [lastChecked, user?.userId, canShowNotifications, LAST_CHECKED_KEY]);

  // Fetch reservations and check for updates
  useEffect(() => {
    if (!user?.token || !user?.userId || !canShowNotifications) return;

    const fetchReservations = async () => {
      try {
        await fetchUserReservations(user.token, user.userId, {
          page: 1,
          limit: 50, // Get more to check for updates
          status: "all",
        });
      } catch (error) {
        console.error("Failed to fetch reservations for notifications:", error);
      }
    };

    fetchReservations();
  }, [user?.token, user?.userId, canShowNotifications, fetchUserReservations, reservationsLiveKey]);

  // Set initial last checked time only once (separate effect)
  useEffect(() => {
    if (!lastChecked && user?.token && user?.userId && canShowNotifications) {
      // Try to load from localStorage first, otherwise use current time
      const storedLastChecked = localStorage.getItem(LAST_CHECKED_KEY);
      if (storedLastChecked) {
        setLastChecked(new Date(storedLastChecked));
      } else {
        setLastChecked(new Date());
      }
    }
  }, [user?.token, user?.userId, canShowNotifications, LAST_CHECKED_KEY]);

  // Fetch reservation updates from database on mount to generate notifications
  useEffect(() => {
    if (!user?.token || !user?.userId || !canShowNotifications || !reservations || reservations.length === 0) return;
    
    // Only fetch once on initial load or when reservations change significantly
    if (!isInitialLoadRef.current && !reservationsLiveKey) return;

    const fetchUpdatesFromDatabase = async () => {
      try {
        // Fetch updates for all user's reservations
        const updatePromises = reservations.map(async (reservation) => {
          try {
            const response = await api.get(`/reservations/${reservation._id}/updates`, {
              headers: { Authorization: `Bearer ${user.token}` },
              params: { limit: 10 }, // Get last 10 updates per reservation
            });
            return {
              reservationId: reservation._id,
              updates: response.data.updates || [],
            };
          } catch (error) {
            console.error(`Failed to fetch updates for reservation ${reservation._id}:`, error);
            return null;
          }
        });

        const results = await Promise.all(updatePromises);
        
        // Generate notifications from database updates
        const newNotificationsFromDB = [];
        // Use a more comprehensive set of existing IDs including processed keys
        const existingNotificationIds = new Set([
          ...notifications.map(n => n.id),
          ...Array.from(processedReservationsRef.current),
        ]);

        results.forEach((result) => {
          if (!result || !result.updates) return;

          const reservation = reservations.find(
            (r) => r._id === result.reservationId
          );
          if (!reservation) return;

          result.updates.forEach((update) => {
            // Skip updates performed by the reservation owner themselves.
            // For those, we already generate notifications via local
            // change-detection on the reservations list, and showing
            // database-derived notifications as well causes duplicates.
            const ownerId = reservation.userId;
            const updatedById =
              update.updatedBy?._id || update.updatedById || update.updatedBy;
            if (
              ownerId &&
              updatedById &&
              String(ownerId) === String(updatedById)
            ) {
              return;
            }
            // Use ReservationUpdate _id as the unique key (most reliable)
            const updateId = update._id || update.reservationUpdateId;
            const updateKey = updateId 
              ? `update-${updateId}` 
              : `${update.reservationId}-${update.updateType}-${new Date(update.createdAt).getTime()}`;
            
            // Skip if we already have a notification for this update
            if (existingNotificationIds.has(updateKey)) return;

            // Only create notifications for updates that are relevant to the user
            // Skip "created" updates as they're not really notifications
            if (update.updateType === "created") return;

            // Only show notifications for updates after lastChecked (if lastChecked exists)
            if (lastChecked) {
              const updateDate = new Date(update.createdAt);
              if (updateDate <= lastChecked) {
                return; // This update was already seen
              }
            }

            // If this is only a price change that happens together with details_updated,
            // skip the price notification to avoid duplicates.
            if (update.updateType === "total_price_changed" && Array.isArray(result.updates)) {
              const hasNearbyDetailsUpdate = result.updates.some((other) => {
                if (!other || other === update) return false;
                if (other.updateType !== "details_updated") return false;
                const t1 = new Date(update.createdAt).getTime();
                const t2 = new Date(other.createdAt).getTime();
                return Math.abs(t1 - t2) < 5000; // within 5 seconds
              });

              if (hasNearbyDetailsUpdate) {
                return; // details_updated notification will cover this change
              }
            }

            let message = "";
            let icon = Clock;
            let color = "text-blue-600";

            switch (update.updateType) {
              case "status_changed":
                switch (update.newValue) {
                  case "confirmed":
                    message = "Your reservation has been confirmed!";
                    icon = CheckCircle;
                    color = "text-green-600";
                    break;
                  case "cancelled":
                    message = "Your reservation has been cancelled.";
                    icon = XCircle;
                    color = "text-red-600";
                    break;
                  case "completed":
                    message = "Your reservation has been completed!";
                    icon = CheckCircle;
                    color = "text-green-600";
                    break;
                  default:
                    message = `Your reservation status changed to ${update.newValue}.`;
                    icon = AlertCircle;
                    color = "text-blue-600";
                }
                break;
              case "remarks_updated":
                message = update.newValue && update.newValue !== "no remarks"
                  ? "Remarks have been added to your reservation."
                  : "Your reservation has been updated.";
                icon = AlertCircle;
                color = "text-blue-600";
                break;
              case "details_updated": {
                const changes = update.changes || {};
                const added = changes.added || 0;
                const updatedCount = changes.updated || 0;
                const deleted = changes.deleted || 0;

                // Default message
                message = "Your reservation details have been updated.";

                const reservationIdShort = reservation._id
                  ? `#${String(reservation._id).slice(-6)}`
                  : "";

                // If products were added, build a more specific message
                if (added > 0 && Array.isArray(reservation.reservationDetails)) {
                  // Get the most recently added items (last N items where N = added count)
                  const recentDetails = reservation.reservationDetails
                    .slice(-added)
                    .map((detail) => {
                      const variant = detail.productVariantId;
                      const product = variant?.product || detail.productVariantId?.product;
                      return product?.name || variant?.product?.name || "Unknown Product";
                    })
                    .filter(Boolean);

                  const uniqueProducts = Array.from(new Set(recentDetails));

                  if (uniqueProducts.length === 1) {
                    message = `${uniqueProducts[0]} has been added to your reservation ${reservationIdShort}.`;
                  } else if (uniqueProducts.length === 2) {
                    message = `${uniqueProducts[0]} and ${uniqueProducts[1]} have been added to your reservation ${reservationIdShort}.`;
                  } else if (uniqueProducts.length > 2) {
                    message = `${uniqueProducts[0]} and ${
                      uniqueProducts.length - 1
                    } more product(s) have been added to your reservation ${reservationIdShort}.`;
                  } else {
                    message =
                      added === 1
                        ? `A product has been added to your reservation ${reservationIdShort}.`
                        : `${added} product(s) have been added to your reservation ${reservationIdShort}.`;
                  }
                } else if (updatedCount > 0 && deleted === 0 && added === 0) {
                  // Only updates (no adds/deletes)
                  message =
                    updatedCount === 1
                      ? "A product in your reservation has been updated."
                      : `${updatedCount} product(s) in your reservation have been updated.`;
                } else if (deleted > 0 && added === 0 && updatedCount === 0) {
                  // Only deletions
                  message =
                    deleted === 1
                      ? "A product has been removed from your reservation."
                      : `${deleted} product(s) have been removed from your reservation.`;
                }

                icon = AlertCircle;
                color = "text-blue-600";
                break;
              }
              case "total_price_changed":
                message = "Your reservation total price has been updated.";
                icon = AlertCircle;
                color = "text-blue-600";
                break;
              default:
                message = update.description || "Your reservation has been updated.";
                icon = AlertCircle;
                color = "text-blue-600";
            }

            // Prepare reservation details for display
            const reservationDetails = reservation.reservationDetails?.map((detail) => {
              const variant = detail.productVariantId;
              const product = variant?.product || detail.productVariantId?.product;
              return {
                productName: product?.name || variant?.product?.name || "Unknown Product",
                variantLabel: formatVariantLabel(variant || detail),
                quantity: detail.quantity || 0,
                price: detail.price || variant?.price || 0,
                subtotal: detail.subtotal || (detail.quantity || 0) * (detail.price || variant?.price || 0),
              };
            }).filter(detail => detail.productName) || [];

            // Map icon component to string identifier
            const iconMap = {
              [CheckCircle]: "CheckCircle",
              [Clock]: "Clock",
              [XCircle]: "XCircle",
              [AlertCircle]: "AlertCircle",
            };
            const iconName = iconMap[icon] || "AlertCircle";

            // Get the correct remarks value - use newValue from update if it's a remarks update
            let notificationRemarks = reservation.remarks;
            if (update.updateType === "remarks_updated" && update.newValue) {
              notificationRemarks = update.newValue !== "no remarks" ? update.newValue : "";
            }

            newNotificationsFromDB.push({
              id: updateKey,
              reservationId: reservation._id,
              reservationUpdateId: updateId, // Store the update ID for reference
              message,
              status: reservation.status,
              date: new Date(update.createdAt).toISOString(), // Store as ISO string
              totalPrice: reservation.totalPrice,
              remarks: notificationRemarks, // Use the correct remarks value
              reservationDetails: reservationDetails,
              icon: iconName, // Store as string identifier
              color,
              read: false,
            });
            
            // Mark as processed to prevent duplicates
            processedReservationsRef.current.add(updateKey);
          });
        });

        // Merge with existing notifications - use more robust deduplication
        if (newNotificationsFromDB.length > 0) {
          setNotifications((prev) => {
            const existingKeys = new Set(prev.map(n => n.id));
            const existingUpdateIds = new Set(
              prev
                .filter(n => n.reservationUpdateId)
                .map(n => n.reservationUpdateId)
            );
            
            // Filter out duplicates by both id and reservationUpdateId
            // Also check for similar notifications from change detection
            const uniqueNew = newNotificationsFromDB.filter(n => {
              if (existingKeys.has(n.id)) {
                processedReservationsRef.current.add(n.id);
                return false;
              }
              if (n.reservationUpdateId && existingUpdateIds.has(n.reservationUpdateId)) {
                processedReservationsRef.current.add(n.id);
                return false;
              }
              
              // Check for similar notifications from change detection (same reservation + status + time)
              const nDate = new Date(n.date).getTime();
              const similar = prev.find(p => {
                if (p.reservationId !== n.reservationId) return false;
                if (p.status !== n.status) return false;
                const pDate = new Date(p.date).getTime();
                return Math.abs(pDate - nDate) < 10000; // Within 10 seconds
              });
              
              if (similar) {
                // Mark both as processed
                processedReservationsRef.current.add(n.id);
                if (similar.id) {
                  processedReservationsRef.current.add(similar.id);
                }
                return false;
              }
              
              return true;
            });
            
            if (uniqueNew.length === 0) return prev;
            
            // Mark all new notifications as processed
            uniqueNew.forEach(n => {
              processedReservationsRef.current.add(n.id);
            });
            
            // Sort by date (newest first) and keep last 20
            const merged = [...uniqueNew, ...prev]
              .sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateB - dateA;
              })
              .slice(0, 20);
            
            return merged;
          });
        }
      } catch (error) {
        console.error("Failed to fetch reservation updates from database:", error);
      }
    };

    // Only fetch on initial load or when reservations change significantly
    if (isInitialLoadRef.current || reservationsLiveKey) {
      fetchUpdatesFromDatabase();
    }
  }, [user?.token, user?.userId, canShowNotifications, reservations, reservationsLiveKey]);

  // Track reservation status changes and create notifications
  useEffect(() => {
    if (!reservations || reservations.length === 0 || !lastChecked) {
      previousReservationsRef.current = reservations || [];
      return;
    }

    // Check if reservations actually changed by comparing a signature
    // Include status, updatedAt, totalPrice, reservationDetails count, and remarks to detect all changes
    const currentSignature = reservations.map(r => {
      const detailsCount = r.reservationDetails?.length || 0;
      const remarks = r.remarks || "";
      return `${r._id}-${r.status}-${r.updatedAt}-${r.totalPrice || 0}-${detailsCount}-${remarks}`;
    }).join('|');
    const previousSignature = previousReservationsRef.current.map(r => {
      const detailsCount = r.reservationDetails?.length || 0;
      const remarks = r.remarks || "";
      return `${r._id}-${r.status}-${r.updatedAt}-${r.totalPrice || 0}-${detailsCount}-${remarks}`;
    }).join('|');
    
    if (currentSignature === previousSignature && previousReservationsRef.current.length > 0) {
      return; // No changes, skip processing
    }

    const newNotifications = [];
    const checkTime = lastChecked;

    reservations.forEach((reservation) => {
      const reservationDate = new Date(reservation.updatedAt || reservation.reservationDate);
      
      // Find previous version of this reservation
      const previousReservation = previousReservationsRef.current.find(
        (prev) => prev._id === reservation._id
      );
      
      // Check if status changed
      const statusChanged = previousReservation && previousReservation.status !== reservation.status;
      
      // Check if details changed (totalPrice, details count, or items changed)
      const detailsChanged = previousReservation && (
        previousReservation.totalPrice !== reservation.totalPrice ||
        (previousReservation.reservationDetails?.length || 0) !== (reservation.reservationDetails?.length || 0)
      );
      
      // Check if remarks changed
      const remarksChanged = previousReservation && 
        (previousReservation.remarks || "") !== (reservation.remarks || "");
      
      // Create unique key for this update (include change type and timestamp)
      const changeType = statusChanged ? 'status' : (remarksChanged ? 'remarks' : 'details');
      // Use a more precise timestamp to avoid duplicates
      const timestamp = reservationDate.getTime();
      const reservationKey = `reservation-${reservation._id}-${reservation.status}-${timestamp}-${changeType}`;
      
      // Skip if already processed
      if (processedReservationsRef.current.has(reservationKey)) {
        return;
      }
      
      // For status changes, prioritize database updates over change detection
      // Check if we already have a notification from database for this status change
      if (statusChanged) {
        const dbNotification = notifications.find(n => {
          if (n.reservationId !== reservation._id) return false;
          if (n.status !== reservation.status) return false;
          // Check if it has a reservationUpdateId (from database) or is very recent
          if (n.reservationUpdateId) return true; // Definitely from database
          const nDate = new Date(n.date).getTime();
          const timeDiff = Math.abs(nDate - timestamp);
          return timeDiff < 10000; // Within 10 seconds
        });
        
        if (dbNotification) {
          // Mark as processed to prevent future duplicates
          processedReservationsRef.current.add(reservationKey);
          return; // Skip - database update already created notification
        }
      }
      
      // Check if we already have a notification for this reservation with same status and similar time
      // (within 10 seconds to account for timing differences and async operations)
      const existingNotification = notifications.find(n => {
        if (n.reservationId !== reservation._id) return false;
        if (n.status !== reservation.status) return false;
        const nDate = new Date(n.date).getTime();
        const timeDiff = Math.abs(nDate - timestamp);
        return timeDiff < 10000; // Within 10 seconds
      });
      
      if (existingNotification) {
        // Mark as processed to prevent future duplicates
        processedReservationsRef.current.add(reservationKey);
        return; // Skip duplicate
      }
      
      // Also check processedReservationsRef for similar keys (from database updates)
      // This prevents creating notifications that were already created from database
      const similarProcessedKey = Array.from(processedReservationsRef.current).find(key => {
        if (typeof key === 'string' && key.includes(reservation._id)) {
          // Check if it's a database update key (starts with "update-")
          if (key.startsWith('update-')) {
            // For status changes, skip if we have any database update for this reservation
            if (statusChanged) return true;
          }
          // Check timestamp match for other keys
          if (key.includes(reservation.status)) {
            const keyMatch = key.match(/(\d{13,})/); // Match 13+ digit timestamp
            if (keyMatch) {
              const keyTimestamp = parseInt(keyMatch[1]);
              return Math.abs(keyTimestamp - timestamp) < 10000; // Within 10 seconds
            }
          }
        }
        return false;
      });
      
      if (similarProcessedKey) {
        processedReservationsRef.current.add(reservationKey);
        return; // Skip - already processed from database
      }

      // Show notifications for reservations updated after last check OR if we detect a change from previous state
      // This handles both new updates and changes detected via live updates
      const isRecentUpdate = reservationDate > checkTime;
      const hasChange = statusChanged || detailsChanged || remarksChanged;
      
      // Only notify if:
      // 1. It's a recent update (after last check), OR
      // 2. We have a previous reservation to compare and detected a change
      // This prevents notifying about existing reservations on initial load
      if (isRecentUpdate || (hasChange && previousReservation && previousReservationsRef.current.length > 0)) {
        let message = "";
        let icon = Clock;
        let color = "text-blue-600";

        // If status changed, show status-specific message
        if (statusChanged) {
          switch (reservation.status) {
            case "confirmed":
              message = "Your reservation has been confirmed!";
              icon = CheckCircle;
              color = "text-green-600";
              break;
            case "pending":
              message = "Your reservation is pending confirmation.";
              icon = Clock;
              color = "text-amber-600";
              break;
            case "cancelled":
              message = "Your reservation has been cancelled.";
              icon = XCircle;
              color = "text-red-600";
              break;
            case "completed":
              message = "Your reservation has been completed!";
              icon = CheckCircle;
              color = "text-green-600";
              break;
            default:
              message = "Your reservation status has been updated.";
              icon = AlertCircle;
              color = "text-blue-600";
          }
        } else if (remarksChanged && !detailsChanged) {
          // If only remarks changed
          // Get the new remarks value (from current reservation, which has the updated value)
          const newRemarks = reservation.remarks && reservation.remarks !== "no remarks" 
            ? reservation.remarks 
            : "";
          message = newRemarks
            ? "Remarks have been added to your reservation."
            : "Your reservation has been updated.";
          icon = AlertCircle;
          color = "text-blue-600";
        } else if (detailsChanged) {
          // If details changed but status didn't, show detail update message
          message = "Your reservation details have been updated.";
          icon = AlertCircle;
          color = "text-blue-600";
        } else {
          // Fallback for other updates
          message = "Your reservation has been updated.";
          icon = AlertCircle;
          color = "text-blue-600";
        }

        // Prepare reservation details for display
        const reservationDetails = reservation.reservationDetails?.map((detail) => {
          const variant = detail.productVariantId;
          const product = variant?.product || detail.productVariantId?.product;
          return {
            productName: product?.name || variant?.product?.name || "Unknown Product",
            variantLabel: formatVariantLabel(variant || detail),
            quantity: detail.quantity || 0,
            price: detail.price || variant?.price || 0,
            subtotal: detail.subtotal || (detail.quantity || 0) * (detail.price || variant?.price || 0),
          };
        }).filter(detail => detail.productName) || [];

        // Map icon component to string identifier
        const iconMap = {
          [CheckCircle]: "CheckCircle",
          [Clock]: "Clock",
          [XCircle]: "XCircle",
          [AlertCircle]: "AlertCircle",
        };
        const iconName = iconMap[icon] || "AlertCircle";

        // Get the correct remarks value - ensure we use the current (updated) value
        const notificationRemarks = reservation.remarks && reservation.remarks !== "no remarks"
          ? reservation.remarks
          : "";

        newNotifications.push({
          id: reservationKey,
          reservationId: reservation._id,
          message,
          status: reservation.status,
          date: reservationDate.toISOString(), // Store as ISO string
          totalPrice: reservation.totalPrice,
          remarks: notificationRemarks, // Use the correct remarks value
          reservationDetails: reservationDetails,
          icon: iconName, // Store as string identifier
          color,
          read: false,
        });

        // Mark as processed
        processedReservationsRef.current.add(reservationKey);
      }
    });

    // Add new notifications (unread count will be calculated by separate useEffect)
    if (newNotifications.length > 0) {
      setNotifications((prev) => {
        // Remove duplicates - check by id, reservationUpdateId, and similar reservation+status+time
        const existingKeys = new Set(prev.map((n) => n.id));
        const existingUpdateIds = new Set(
          prev
            .filter(n => n.reservationUpdateId)
            .map(n => n.reservationUpdateId)
        );
        
        const uniqueNew = newNotifications.filter((n) => {
          // Skip if ID already exists
          if (existingKeys.has(n.id)) {
            processedReservationsRef.current.add(n.id);
            return false;
          }
          
          // Skip if reservationUpdateId already exists
          if (n.reservationUpdateId && existingUpdateIds.has(n.reservationUpdateId)) {
            processedReservationsRef.current.add(n.id);
            return false;
          }
          
          // Check for similar notifications (same reservation, status, and time within 10 seconds)
          const nDate = new Date(n.date).getTime();
          const similar = prev.find(p => {
            if (p.reservationId !== n.reservationId) return false;
            if (p.status !== n.status) return false;
            const pDate = new Date(p.date).getTime();
            return Math.abs(pDate - nDate) < 10000; // Within 10 seconds
          });
          
          if (similar) {
            processedReservationsRef.current.add(n.id);
            return false;
          }
          
          return true;
        });
        
        if (uniqueNew.length === 0) return prev;
        
        // Mark all new notifications as processed
        uniqueNew.forEach(n => {
          processedReservationsRef.current.add(n.id);
        });
        
        // Sort by date (newest first) and keep last 20
        const merged = [...uniqueNew, ...prev]
          .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
          })
          .slice(0, 20);
        
        return merged;
      });
    }

    // Update previous reservations reference
    previousReservationsRef.current = reservations;
  }, [reservations, lastChecked]);

  // Calculate unread count from notifications (only when notifications change, not on every render)
  useEffect(() => {
    const unread = notifications.filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Mark notifications as read when dropdown opens
  useEffect(() => {
    if (isOpen && notifications.length > 0) {
      setNotifications((prev) => {
        const hasUnread = prev.some((n) => !n.read);
        if (!hasUnread) return prev; // No need to update if all are already read
        const updated = prev.map((n) => ({ ...n, read: true }));
        // Save to localStorage immediately
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error("Failed to save read status to localStorage:", error);
        }
        return updated;
      });
    }
  }, [isOpen, notifications.length, STORAGE_KEY]);

  // Close dropdown when clicking outside (desktop only, mobile uses Modal)
  useEffect(() => {
    if (isMobile) return; // Modal handles click outside for mobile
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isMobile]);

  // Listen to live updates for reservation changes via WebSocket
  useEffect(() => {
    if (!user?.token || !user?.userId || !canShowNotifications) return;

    const handleLiveUpdate = (event) => {
      const detail = event.detail || {};
      const { topics, path, userId, reservationId } = detail;
      
      // Check if this is a reservation-related update
      const isReservationUpdate = 
        topics?.includes("reservations") || 
        path?.includes("/reservations") ||
        path?.includes("/reservation");
      
      // Only process if it's a reservation update AND it's for this user (if userId is provided)
      if (isReservationUpdate && (!userId || userId === user.userId)) {
        if (import.meta.env.DEV) {
          console.log("🔔 ReservationNotification: WebSocket update received", {
            topics,
            path,
            reservationId,
            userId,
          });
        }
        
        // Refresh reservations when live update is received
        // Small delay to ensure backend has saved the changes
        setTimeout(() => {
          fetchUserReservations(user.token, user.userId, {
            page: 1,
            limit: 50,
            status: "all",
          }).then(() => {
            // Reset lastChecked to a time slightly before now to catch the update
            // This ensures we detect the change even if updatedAt is very recent
            setLastChecked(new Date(Date.now() - 1000)); // 1 second ago
          }).catch((error) => {
            console.error("Failed to refresh reservations after WebSocket update:", error);
          });
        }, 500);
      }
    };

    window.addEventListener("live-update", handleLiveUpdate);
    window.addEventListener("live-update:reservations", handleLiveUpdate);

    return () => {
      window.removeEventListener("live-update", handleLiveUpdate);
      window.removeEventListener("live-update:reservations", handleLiveUpdate);
    };
  }, [user?.token, user?.userId, canShowNotifications, fetchUserReservations]);

  if (!canShowNotifications) return null;

  const Icon = Bell;

      return (
        <div className="relative" ref={dropdownRef}>
          {/* Bell Button */}
          <button
            className="relative group cursor-pointer btn btn-ghost hover:bg-gray-400 transition-all duration-300 ease-in-out transform hover:scale-105 p-0 m-0"
            onClick={() => setIsOpen(!isOpen)}
            title="Reservation Updates"
          >
        <div className="relative">
          <Icon className="h-7 w-7 text-white" />
          {unreadCount > 0 && (
            <div className="absolute -top-3 -right-3 bg-[#F05454] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-bounce">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </div>
      </button>

      {/* Mobile: Centered Modal | Desktop: Right Side Dropdown */}
      {isMobile ? (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          className="bg-white rounded-2xl max-w-md w-full p-0 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-red-400 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between border-b border-red-500/30 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h3 className="font-semibold text-lg">Reservation Updates</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-2 min-h-0" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No new updates</p>
                <p className="text-xs text-gray-400 mt-1">
                  You'll be notified when your reservation status changes
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => {
                  // Map icon string back to component
                  const iconMap = {
                    CheckCircle,
                    Clock,
                    XCircle,
                    AlertCircle,
                  };
                  const IconComponent = iconMap[notification.icon] || AlertCircle;
                  
                  // Ensure date is a valid Date object
                  const notificationDate = notification.date instanceof Date 
                    ? notification.date 
                    : new Date(notification.date || Date.now());
                  
                  // Ensure notification has required fields
                  if (!notification.message || !notification.id) {
                    return null; // Skip invalid notifications
                  }
                  
                  return (
                    <Link
                      key={notification.id}
                      to={`/reservations/user/${user.userId}`}
                      onClick={() => setIsOpen(false)}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            notification.status === "confirmed" || notification.status === "completed"
                              ? "bg-green-100"
                              : notification.status === "pending"
                              ? "bg-amber-100"
                              : notification.status === "cancelled"
                              ? "bg-red-100"
                              : "bg-blue-100"
                          }`}
                        >
                          <IconComponent
                            className={`w-5 h-5 ${notification.color}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.message}
                          </p>
                          
                          {/* Reservation Details */}
                          {notification.reservationDetails && notification.reservationDetails.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {notification.reservationDetails.slice(0, 3).map((detail, idx) => (
                                <div key={idx} className="text-xs text-gray-600 flex items-center justify-between">
                                  <span className="truncate flex-1">
                                    {detail.productName}
                                    {detail.variantLabel && ` (${detail.variantLabel})`}
                                    {detail.quantity > 1 && ` × ${detail.quantity}`}
                                  </span>
                                  <span className="ml-2 font-medium text-gray-700">
                                    {formatPrice(detail.subtotal)}
                                  </span>
                                </div>
                              ))}
                              {notification.reservationDetails.length > 3 && (
                                <p className="text-xs text-gray-500 italic">
                                  +{notification.reservationDetails.length - 3} more item(s)
                                </p>
                              )}
                            </div>
                          )}
                          
                            {/* Remarks */}
                            {notification.remarks && notification.remarks !== "no remarks" && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 border-l-2 border-blue-400">
                                <span className="font-medium">Remarks: </span>
                                <span>{notification.remarks}</span>
                              </div>
                            )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {formatDatePHT(notificationDate)}
                            </p>
                            {notification.totalPrice && (
                              <p className="text-xs font-semibold text-black">
                                Total: {formatPrice(notification.totalPrice)}
                              </p>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-2xl flex-shrink-0">
              <Link
                to={`/reservations/user/${user.userId}`}
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm font-medium text-red-400 hover:text-red-500"
              >
                View All Reservations
              </Link>
            </div>
          )}
        </Modal>
      ) : (
        <>
          {/* Desktop: Dropdown Menu */}
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
                onClick={() => setIsOpen(false)}
              />

              {/* Notification Panel */}
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="bg-red-400 text-white px-4 py-3 rounded-t-xl flex items-center justify-between border-b border-red-500/30">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Reservation Updates</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-2 min-h-0" style={{ maxHeight: '450px' }}>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No new updates</p>
                  <p className="text-xs text-gray-400 mt-1">
                    You'll be notified when your reservation status changes
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => {
                    // Map icon string back to component
                    const iconMap = {
                      CheckCircle,
                      Clock,
                      XCircle,
                      AlertCircle,
                    };
                    const IconComponent = iconMap[notification.icon] || AlertCircle;
                    
                    // Ensure date is a valid Date object
                    const notificationDate = notification.date instanceof Date 
                      ? notification.date 
                      : new Date(notification.date || Date.now());
                    
                    // Ensure notification has required fields
                    if (!notification.message || !notification.id) {
                      return null; // Skip invalid notifications
                    }
                    
                    return (
                      <Link
                        key={notification.id}
                        to={`/reservations/user/${user.userId}`}
                        onClick={() => setIsOpen(false)}
                        className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              notification.status === "confirmed" || notification.status === "completed"
                                ? "bg-green-100"
                                : notification.status === "pending"
                                ? "bg-amber-100"
                                : notification.status === "cancelled"
                                ? "bg-red-100"
                                : "bg-blue-100"
                            }`}
                          >
                            <IconComponent
                              className={`w-5 h-5 ${notification.color}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.message}
                            </p>
                            
                            {/* Reservation Details */}
                            {notification.reservationDetails && notification.reservationDetails.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {notification.reservationDetails.slice(0, 3).map((detail, idx) => (
                                  <div key={idx} className="text-xs text-gray-600 flex items-center justify-between">
                                    <span className="truncate flex-1">
                                      {detail.productName}
                                      {detail.variantLabel && ` (${detail.variantLabel})`}
                                      {detail.quantity > 1 && ` × ${detail.quantity}`}
                                    </span>
                                    <span className="ml-2 font-medium text-gray-700">
                                      {formatPrice(detail.subtotal)}
                                    </span>
                                  </div>
                                ))}
                                {notification.reservationDetails.length > 3 && (
                                  <p className="text-xs text-gray-500 italic">
                                    +{notification.reservationDetails.length - 3} more item(s)
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {/* Remarks */}
                            {notification.remarks && notification.remarks !== "no remarks" && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 border-l-2 border-blue-400">
                                <span className="font-medium">Remarks: </span>
                                <span>{notification.remarks}</span>
                              </div>
                            )}
                            
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {formatDatePHT(notificationDate)}
                            </p>
                            {notification.totalPrice && (
                              <p className="text-xs font-semibold text-black">
                                Total: {formatPrice(notification.totalPrice)}
                              </p>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </Link>
                  );
                }).filter(Boolean)} {/* Filter out null entries */}
              </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-xl">
                <Link
                  to={`/reservations/user/${user.userId}`}
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm font-medium text-red-400 hover:text-red-500"
                >
                  View All Reservations
                </Link>
              </div>
            )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ReservationNotification;

