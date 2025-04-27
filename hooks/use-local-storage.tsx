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
        // Tenta fazer o parse do valor
        const parsedItem = JSON.parse(item) as T;

        // Validação básica
        if (parsedItem === null || parsedItem === undefined) {
          console.warn(`Valor inválido no localStorage para a chave "${key}"`);
          return initialValue;
        }

        return parsedItem;
      } catch (e) {
        console.warn(`Error parsing localStorage key "${key}":`, e);
        // Remove o item inválido do localStorage
        localStorage.removeItem(key);
        return initialValue;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Use um ref para armazenar a versão atual do valor para evitar problemas com closures
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

        // Validação básica antes de salvar
        if (valueToStore === undefined) {
          console.warn(
            `Tentativa de salvar undefined no localStorage para a chave "${key}"`
          );
          return;
        }

        // Verifica se o valor mudou para evitar atualizações desnecessárias
        if (JSON.stringify(valueRef.current) === JSON.stringify(valueToStore)) {
          return; // Não atualiza se o valor for idêntico
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
    [key] // Remove storedValue da dependência para evitar loops
  );

  return [storedValue, setValue] as const;
}
