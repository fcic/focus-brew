"use client";

import { useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // If the item exists, try to parse it as JSON
      if (item) {
        try {
          return JSON.parse(item);
        } catch (e) {
          // If parsing fails, return the raw value
          return item as T;
        }
      }
      return initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== "undefined") {
        // If the value is a string, number, or boolean, store it directly
        if (
          typeof valueToStore === "string" ||
          typeof valueToStore === "number" ||
          typeof valueToStore === "boolean"
        ) {
          window.localStorage.setItem(key, String(valueToStore));
        } else {
          // Otherwise, stringify it
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
