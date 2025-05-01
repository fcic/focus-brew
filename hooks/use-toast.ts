/**
 * @deprecated Use @/lib/toast instead
 * This module is a compatibility layer for the old toast system
 */

import { toast as sonnerToast } from "sonner";

// Simple adapter for backward compatibility
function adaptToast(props: any) {
  if (props.variant === "destructive") {
    return sonnerToast.error(props.title, {
      description: props.description,
    });
  }
  return sonnerToast(props.title, {
    description: props.description,
  });
}

export const toast = adaptToast;

export function useToast() {
  return {
    toast: adaptToast,
    // For backward compatibility
    toasts: [],
    dismiss: () => {},
  };
}
