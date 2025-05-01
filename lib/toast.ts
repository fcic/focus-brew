/**
 * Standardized toast notifications using sonner library
 */

import { toast as sonnerToast } from "sonner";

// We're using the sonner library directly without a wrapper
// This file provides a convenient centralized import

// Re-export everything from sonner
export const toast = sonnerToast;

/**
 * Helper function to show an appropriate toast based on browser notification permission status
 */
export const showNotificationPermissionToast = (
  permission: NotificationPermission
) => {
  switch (permission) {
    case "granted":
      toast.success("Notifications enabled!", {
        description: "You will receive browser notifications as configured.",
      });
      break;
    case "denied":
      toast.error("Notifications blocked", {
        description: "Please enable notifications in your browser settings.",
      });
      break;
    case "default":
      toast.info("Notification permission required", {
        description: "Please accept the notification permission prompt.",
      });
      break;
  }
};
