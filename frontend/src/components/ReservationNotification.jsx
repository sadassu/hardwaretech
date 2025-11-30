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

  // Only show for regular users (not admin/cashier)
  const canShowNotifications =
    user && !user.roles?.includes("admin") && !user.roles?.includes("cashier");

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
      setLastChecked(new Date());
    }
  }, [user?.token, user?.userId, canShowNotifications]);

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
      
      // Create unique key for this update (include change type)
      const changeType = statusChanged ? 'status' : (remarksChanged ? 'remarks' : 'details');
      const reservationKey = `${reservation._id}-${reservation.status}-${reservationDate.getTime()}-${changeType}`;
      
      // Skip if already processed
      if (processedReservationsRef.current.has(reservationKey)) {
        return;
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
          message = reservation.remarks 
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

        newNotifications.push({
          id: reservationKey,
          reservationId: reservation._id,
          message,
          status: reservation.status,
          date: reservationDate,
          totalPrice: reservation.totalPrice,
          remarks: reservation.remarks,
          reservationDetails: reservationDetails,
          icon,
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
        // Remove duplicates and add new ones (check by reservation ID and status combination)
        const existingKeys = new Set(prev.map((n) => n.id));
        const uniqueNew = newNotifications.filter((n) => !existingKeys.has(n.id));
        return [...uniqueNew, ...prev].slice(0, 20); // Keep last 20 notifications
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
        return prev.map((n) => ({ ...n, read: true }));
      });
    }
  }, [isOpen, notifications.length]);

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

  // Listen to live updates for reservation changes
  useEffect(() => {
    const handleLiveUpdate = (event) => {
      const { topics, path } = event.detail || {};
      
      // Check if this is a reservation-related update
      const isReservationUpdate = 
        topics?.includes("reservations") || 
        path?.includes("/reservations/");
      
      if (isReservationUpdate) {
        // Refresh reservations when live update is received
        if (user?.token && user?.userId) {
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
            });
          }, 500);
        }
      }
    };

    window.addEventListener("live-update", handleLiveUpdate);
    window.addEventListener("live-update:reservations", handleLiveUpdate);

    return () => {
      window.removeEventListener("live-update", handleLiveUpdate);
      window.removeEventListener("live-update:reservations", handleLiveUpdate);
    };
  }, [user?.token, user?.userId, fetchUserReservations]);

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
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between border-b border-blue-800/30 flex-shrink-0">
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
                  const IconComponent = notification.icon;
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
                          {notification.remarks && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 border-l-2 border-blue-400">
                              <span className="font-medium">Remarks: </span>
                              <span>{notification.remarks}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {formatDatePHT(notification.date)}
                            </p>
                            {notification.totalPrice && (
                              <p className="text-xs font-semibold text-blue-600">
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
                className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-t-xl flex items-center justify-between border-b border-blue-800/30">
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
                    const IconComponent = notification.icon;
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
                            {notification.remarks && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 border-l-2 border-blue-400">
                                <span className="font-medium">Remarks: </span>
                                <span>{notification.remarks}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-500">
                                {formatDatePHT(notification.date)}
                              </p>
                              {notification.totalPrice && (
                                <p className="text-xs font-semibold text-blue-600">
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
              <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-xl">
                <Link
                  to={`/reservations/user/${user.userId}`}
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
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

