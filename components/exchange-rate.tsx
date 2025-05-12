"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  Loader2Icon,
  AlertCircleIcon,
  RefreshCwIcon,
  CoinsIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "./ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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
  const [mounted, setMounted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Lock ref to prevent multiple fetches
  const lockRef = useRef(false);

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
    // Skip if already loading or locked
    if (loading || lockRef.current) return;

    lockRef.current = true;
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
      lockRef.current = false;
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
      } catch (fallbackError) {
        // Just set error message without retrying
        setError(
          fallbackError instanceof Error
            ? fallbackError.message
            : "Failed to load exchange rate"
        );
        // Keep previous rate if available to avoid blank display
        console.error("Exchange rate error:", fallbackError);
      }
    } finally {
      setLoading(false);
      lockRef.current = false;
    }
  }, [base, target]);

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

  // Initial fetch only once on mount
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

    // No interval, only manual refresh
  }, []); // Empty dependencies to run only once on mount

  // Get time since last update
  const timeSinceUpdate = useMemo(() => {
    if (!lastUpdated || !mounted) return null;
    const minutes = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
    return minutes < 1 ? "Just now" : `${minutes}m ago`;
  }, [lastUpdated, mounted]);

  // Format display rate
  const formattedRate = useMemo(() => {
    if (!rate) return "--";
    return rate.toFixed(2);
  }, [rate]);

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
        <Popover open={dialogOpen} onOpenChange={setDialogOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-2 text-xs flex items-center gap-1 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
              aria-label="Exchange Rate"
            >
              {error ? (
                <>
                  <AlertCircleIcon className="w-3.5 h-3.5 text-red-400" />
                  <span>Error</span>
                </>
              ) : (
                <>
                  <CoinsIcon className="w-3.5 h-3.5" />
                  <span>
                    1 {base.toUpperCase()} = {formattedRate}{" "}
                    {target.toUpperCase()}
                  </span>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="bg-popover/90 backdrop-blur-md rounded-md border border-border mt-1 p-1"
            align="end"
            sideOffset={4}
            alignOffset={-4}
          >
            {error ? (
              <div className="space-y-2 p-2">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircleIcon className="h-4 w-4" />
                  <span className="font-medium">
                    Error loading exchange rate
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{error}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => fetchRate()}
                >
                  Try again
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="group flex items-center text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm">
                  <div className="flex items-center gap-2">
                    <CoinsIcon className="h-3.5 w-3.5" />
                    <span className="font-medium">Exchange Rate</span>
                  </div>
                </div>

                <div className="group flex items-center justify-between text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm">
                  <div className="flex items-center gap-2">
                    <span>Base Currency</span>
                  </div>
                  <span className="font-medium">{base.toUpperCase()}</span>
                </div>

                <div className="group flex items-center justify-between text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm">
                  <div className="flex items-center gap-2">
                    <span>Target Currency</span>
                  </div>
                  <span className="font-medium">{target.toUpperCase()}</span>
                </div>

                <div className="group flex items-center justify-between text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm">
                  <div className="flex items-center gap-2">
                    <span>Value</span>
                  </div>
                  <span className="font-medium">{formattedRate}</span>
                </div>

                {timeSinceUpdate && (
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    Updated: {timeSinceUpdate}
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => fetchRate()}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2Icon className="h-3 w-3 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCwIcon className="h-3 w-3 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {loading && (
          <Loader2Icon className="w-3 h-3 animate-spin text-zinc-400" />
        )}
      </div>
    </TooltipProvider>
  );
}
