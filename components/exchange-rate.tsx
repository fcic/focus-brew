"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Loader2Icon, AlertCircleIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "./ui/tooltip";

// Types
type Currency = string;

interface ExchangeData {
  [currency: Currency]: {
    [currency: Currency]: number;
  };
}

interface CurrencyChangeEvent extends CustomEvent {
  detail: {
    base: Currency;
    target: Currency;
  };
}

interface CachedRate {
  rate: number;
  timestamp: number;
  pair: string;
}

// Constants
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ERROR_RETRY_DELAY = 5000; // 5 seconds

// Cache for exchange rates
const rateCache: Record<string, CachedRate> = {};

const DEFAULT_CURRENCIES = {
  base: "usd",
  target: "brl",
} as const;

const COMMON_CURRENCIES = [
  "usd",
  "eur",
  "gbp",
  "jpy",
  "cny",
  "aud",
  "cad",
  "chf",
  "sek",
  "nzd",
  "brl",
  "inr",
] as const;

const API_ENDPOINTS = {
  currencies:
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json",
  rates: (base: Currency) =>
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base}.json`,
  fallbackRates: (base: Currency) =>
    `https://latest.currency-api.pages.dev/v1/currencies/${base}.json`,
} as const;

export function ExchangeRate() {
  // State
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Local Storage
  const [base, setBase] = useLocalStorage<Currency>(
    "currency_base",
    DEFAULT_CURRENCIES.base
  );
  const [target, setTarget] = useLocalStorage<Currency>(
    "currency_target",
    DEFAULT_CURRENCIES.target
  );

  // Fetch exchange rate data
  const fetchRate = useCallback(async () => {
    setLoading(true);
    setError(null);

    const currencyPair = `${base}:${target}`;
    const now = Date.now();

    // Check if we have a valid cached value
    const cached = rateCache[currencyPair];
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      setRate(cached.rate);
      setLastUpdated(new Date(cached.timestamp));
      setLoading(false);
      return;
    }

    try {
      // Try primary endpoint
      let res = await fetch(API_ENDPOINTS.rates(base));
      if (!res.ok) throw new Error("Primary API failed");

      const data: ExchangeData = await res.json();
      const newRate = data[base]?.[target];

      if (newRate === undefined) {
        throw new Error(`Invalid currency pair: ${base}/${target}`);
      }

      // Cache the result
      rateCache[currencyPair] = {
        rate: newRate,
        timestamp: now,
        pair: currencyPair,
      };

      setRate(newRate);
      setLastUpdated(new Date());
      setRetryCount(0);
    } catch (primaryError) {
      try {
        // Try fallback endpoint
        let res = await fetch(API_ENDPOINTS.fallbackRates(base));
        if (!res.ok) throw new Error("Fallback API failed");

        const data: ExchangeData = await res.json();
        const newRate = data[base]?.[target];

        if (newRate === undefined) {
          throw new Error(`Invalid currency pair: ${base}/${target}`);
        }

        // Cache the result
        rateCache[currencyPair] = {
          rate: newRate,
          timestamp: now,
          pair: currencyPair,
        };

        setRate(newRate);
        setLastUpdated(new Date());
        setRetryCount(0);
      } catch (fallbackError) {
        const errorMessage =
          retryCount >= 3
            ? "Could not load exchange rate after multiple attempts"
            : "Could not load exchange rate, retrying...";
        setError(errorMessage);
        setRetryCount((prev) => prev + 1);

        // Auto-retry if under retry limit
        if (retryCount < 3) {
          setTimeout(fetchRate, ERROR_RETRY_DELAY);
        }

        console.error("Exchange rate error:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, [base, target, retryCount]);

  // Listen for currency changes from settings
  useEffect(() => {
    const handleCurrencyChange = (event: CurrencyChangeEvent) => {
      const { base: newBase, target: newTarget } = event.detail;

      // Only update if the values actually changed
      const baseChanged = newBase !== base;
      const targetChanged = newTarget !== target;

      if (baseChanged) {
        setBase(newBase);
      }

      if (targetChanged) {
        setTarget(newTarget);
      }

      // Only fetch new data if either currency changed
      if (baseChanged || targetChanged) {
        // Check if we have a cached value first
        const currencyPair = `${newBase}:${newTarget}`;
        const cached = rateCache[currencyPair];
        const now = Date.now();

        if (cached && now - cached.timestamp < CACHE_DURATION) {
          setRate(cached.rate);
          setLastUpdated(new Date(cached.timestamp));
        } else {
          // Fetch new rate if no valid cache exists
          fetchRate();
        }
      }
    };

    window.addEventListener(
      "currency_changed",
      handleCurrencyChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "currency_changed",
        handleCurrencyChange as EventListener
      );
    };
  }, [base, target, setBase, setTarget, fetchRate]);

  // Listen for refresh events from menu bar
  useEffect(() => {
    const handleRefresh = () => {
      fetchRate();
    };

    window.addEventListener("refresh_exchange", handleRefresh);

    return () => {
      window.removeEventListener("refresh_exchange", handleRefresh);
    };
  }, [fetchRate]);

  // Auto-refresh effect
  useEffect(() => {
    setMounted(true);

    // Initial fetch that respects cache
    const initialFetch = () => {
      const currencyPair = `${base}:${target}`;
      const cached = rateCache[currencyPair];
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_DURATION) {
        setRate(cached.rate);
        setLastUpdated(new Date(cached.timestamp));
      } else {
        fetchRate();
      }
    };

    // Run initial fetch
    initialFetch();

    // Set up interval that respects cache
    const interval = setInterval(() => {
      const currencyPair = `${base}:${target}`;
      const cached = rateCache[currencyPair];
      const now = Date.now();

      // Only fetch if cache is expired or doesn't exist
      if (!cached || now - cached.timestamp >= REFRESH_INTERVAL) {
        fetchRate();
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [base, target, fetchRate]);

  // Format display rate
  const formattedRate = useMemo(() => {
    if (!rate) return "--";
    return rate.toFixed(2);
  }, [rate]);

  // Get time since last update
  const timeSinceUpdate = useMemo(() => {
    if (!lastUpdated || !mounted) return null;
    const minutes = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
    return minutes < 1 ? "Just now" : `${minutes}m ago`;
  }, [lastUpdated, mounted]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span>
          1 {base.toUpperCase()} = -- {target.toUpperCase()}
        </span>
        <Loader2Icon className="w-3 h-3 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 text-xs">
        <span>
          1 {base.toUpperCase()} = {formattedRate} {target.toUpperCase()}
        </span>

        {loading ? (
          <Loader2Icon className="w-3 h-3 animate-spin text-zinc-400" />
        ) : error ? (
          <Tooltip>
            <TooltipTrigger>
              <AlertCircleIcon className="w-3 h-3 text-red-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{error}</p>
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
