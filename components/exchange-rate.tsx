"use client";

import { useEffect, useState } from "react";
import { Euro, ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const DEFAULT_BASE = "usd";
const DEFAULT_TARGET = "brl";
const COMMON_CURRENCIES = [
  "usd", "eur", "gbp", "jpy", "cny", "aud", "cad", "chf", "sek", "nzd", "brl", "inr"
];

interface ExchangeData {
  [currency: string]: number;
}

export function ExchangeRate() {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currencies, setCurrencies] = useState<string[]>(COMMON_CURRENCIES);
  const [openBase, setOpenBase] = useState(false);
  const [openTarget, setOpenTarget] = useState(false);

  // Remove shared search state, use local search for each combobox
  const [baseSearch, setBaseSearch] = useState("");
  const [targetSearch, setTargetSearch] = useState("");

  // Filtered lists for each combobox
  const filteredBase = baseSearch
    ? currencies.filter((cur) => cur.toLowerCase().includes(baseSearch.toLowerCase()))
    : currencies;
  const filteredTarget = targetSearch
    ? currencies.filter((cur) => cur.toLowerCase().includes(targetSearch.toLowerCase()))
    : currencies;

  const getLabel = (cur: string) => cur.toUpperCase();

  // Read base/target from localStorage and listen for changes
  const [base, setBase] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("currency_base") || "usd" : "usd"
  );
  const [target, setTarget] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("currency_target") || "brl" : "brl"
  );
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.base) setBase(e.detail.base);
      if (e.detail?.target) setTarget(e.detail.target);
    };
    window.addEventListener("currency_changed", handler as EventListener);
    return () => window.removeEventListener("currency_changed", handler as EventListener);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBase(localStorage.getItem("currency_base") || "usd");
      setTarget(localStorage.getItem("currency_target") || "brl");
    }
  }, []);

  useEffect(() => {
    // Fetch all available currencies for dropdown
    const fetchCurrencies = async () => {
      try {
        const url = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json";
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCurrencies(Object.keys(data));
      } catch {
        // fallback to common
        setCurrencies(COMMON_CURRENCIES);
      }
    };
    fetchCurrencies();
  }, []);

  useEffect(() => {
    const fetchRate = async () => {
      setLoading(true);
      setError(null);
      // Try primary endpoint first
      let url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base}.json`;
      let fallbackUrl = `https://latest.currency-api.pages.dev/v1/currencies/${base}.json`;
      try {
        let res = await fetch(url);
        if (!res.ok) throw new Error("Primary API failed");
        let data = await res.json();
        setRate(data[base]?.[target] ?? null);
      } catch {
        // Try fallback
        try {
          let res = await fetch(fallbackUrl);
          if (!res.ok) throw new Error("Fallback API failed");
          let data = await res.json();
          setRate(data[base]?.[target] ?? null);
        } catch {
          setError("Could not load exchange rate");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRate();
    const interval = setInterval(fetchRate, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [base, target]);

  return (
    <div className="flex items-center space-x-2 text-xs">
      <span>
        {loading ? "--" : rate ? `${base.toUpperCase()}: ${rate.toFixed(2)}` : "--"}
      </span>
    </div>
  );
}
