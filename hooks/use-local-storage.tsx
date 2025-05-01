"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type SetValue<T> = T | ((val: T) => T);

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue;
      }

      try {
        // Try to parse the value
        const parsedItem = JSON.parse(item) as T;

        // Basic validation
        if (parsedItem === null || parsedItem === undefined) {
          console.warn(`Invalid value in localStorage for key "${key}"`);
          return initialValue;
        }

        return parsedItem;
      } catch (e) {
        console.warn(`Error parsing localStorage key "${key}":`, e);
        // Remove the invalid item from localStorage
        localStorage.removeItem(key);
        return initialValue;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Use a ref to store the current version of the value to avoid issues with closures
  const valueRef = useRef(storedValue);
  useEffect(() => {
    valueRef.current = storedValue;
  }, [storedValue]);

  // Return a memoized version of the setter function that
  // persists the new value to localStorage.
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(valueRef.current) : value;

        // Basic validation before saving
        if (valueToStore === undefined) {
          console.warn(
            `Attempt to save undefined in localStorage for key "${key}"`
          );
          return;
        }

        // Check if the value has changed to avoid unnecessary updates
        if (JSON.stringify(valueRef.current) === JSON.stringify(valueToStore)) {
          return; // Don't update if the value is identical
        }

        // Save state
        setStoredValue(valueToStore);

        // Save to local storage
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (e) {
            console.error(`Error saving to localStorage key "${key}":`, e);
          }
        }
      } catch (error) {
        console.error(
          `Error processing value for localStorage key "${key}":`,
          error
        );
      }
    },
    [key] // Remove storedValue from dependency to avoid loops
  );

  return [storedValue, setValue] as const;
}
