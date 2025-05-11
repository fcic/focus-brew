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

// Constants
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ERROR_RETRY_DELAY = 5000; // 5 seconds

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

    try {
      // Try primary endpoint
      let res = await fetch(API_ENDPOINTS.rates(base));
      if (!res.ok) throw new Error("Primary API failed");

      const data: ExchangeData = await res.json();
      const newRate = data[base]?.[target];

      if (newRate === undefined) {
        throw new Error(`Invalid currency pair: ${base}/${target}`);
      }

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
      setBase(newBase);
      setTarget(newTarget);
      // Fetch new rate immediately when currency changes
      setTimeout(() => fetchRate(), 100); // Small timeout to ensure state updates first
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
  }, [setBase, setTarget, fetchRate]);

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
    fetchRate();
    const interval = setInterval(fetchRate, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRate]);

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
