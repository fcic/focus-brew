import { useCallback } from "react";
import { trackEvent } from "@/lib/utils";
import { AppId } from "@/lib/constants";

type EventCategory =
  | "app_interaction"
  | "app_settings"
  | "task_management"
  | "focus_timer"
  | "habit_tracking"
  | "user_preference"
  | "ambient_sound"
  | "youtube";

interface UseAnalyticsOptions {
  appId: AppId;
  appName: string;
}

/**
 * Hook for tracking analytics events within specific apps
 *
 * @param options Configuration options including appId and appName
 * @returns An object with methods for tracking different types of events
 */
export function useAnalytics({ appId, appName }: UseAnalyticsOptions) {
  /**
   * Track a feature usage event
   */
  const trackFeatureUsage = useCallback(
    (featureName: string, additionalParams?: Record<string, any>) => {
      trackEvent("feature_usage", {
        app_id: appId,
        app_name: appName,
        feature_name: featureName,
        ...additionalParams,
      });
    },
    [appId, appName]
  );

  /**
   * Track an error that occurred
   */
  const trackError = useCallback(
    (errorName: string, errorDetails?: string) => {
      trackEvent("app_error", {
        app_id: appId,
        app_name: appName,
        error_name: errorName,
        error_details: errorDetails,
      });
    },
    [appId, appName]
  );

  /**
   * Track an app-specific event with a custom category
   */
  const trackAppEvent = useCallback(
    (
      eventName: string,
      category: EventCategory,
      additionalParams?: Record<string, any>
    ) => {
      trackEvent(eventName, {
        app_id: appId,
        app_name: appName,
        category,
        ...additionalParams,
      });
    },
    [appId, appName]
  );

  /**
   * Track when a setting is changed
   */
  const trackSettingChange = useCallback(
    (settingName: string, oldValue: any, newValue: any) => {
      trackEvent("setting_change", {
        app_id: appId,
        app_name: appName,
        setting_name: settingName,
        old_value: String(oldValue),
        new_value: String(newValue),
      });
    },
    [appId, appName]
  );

  return {
    trackFeatureUsage,
    trackError,
    trackAppEvent,
    trackSettingChange,
  };
}
