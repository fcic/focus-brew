"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Cloud,
  CloudRain,
  Sun,
  Snowflake,
  CloudFog,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "./ui/tooltip";

// Types
interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  name: string;
}

interface Coordinates {
  lat: number;
  lon: number;
}

type TemperatureUnit = "C" | "F";

interface WeatherUnitChangeEvent extends CustomEvent {
  detail: TemperatureUnit;
}

// Constants
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const ERROR_RETRY_DELAY = 5000; // 5 seconds
const MAX_RETRIES = 3;
const DEFAULT_CITY = "London";
const GEOLOCATION_OPTIONS = {
  timeout: 5000,
  maximumAge: 10 * 60 * 1000, // 10 minutes
} as const;

const WEATHER_ICONS = {
  thunderstorm: <CloudRain className="h-3.5 w-3.5" />,
  drizzle: <CloudRain className="h-3.5 w-3.5" />,
  rain: <CloudRain className="h-3.5 w-3.5" />,
  snow: <Snowflake className="h-3.5 w-3.5" />,
  atmosphere: <CloudFog className="h-3.5 w-3.5" />,
  clear: <Sun className="h-3.5 w-3.5" />,
  clouds: <Cloud className="h-3.5 w-3.5" />,
  default: <Cloud className="h-3.5 w-3.5" />,
} as const;

// Helper functions
function getWeatherIcon(weatherId: number | null) {
  if (!weatherId) return WEATHER_ICONS.default;

  // Weather condition codes: https://openweathermap.org/weather-conditions
  if (weatherId >= 200 && weatherId < 300) return WEATHER_ICONS.thunderstorm;
  if (weatherId >= 300 && weatherId < 400) return WEATHER_ICONS.drizzle;
  if (weatherId >= 500 && weatherId < 600) return WEATHER_ICONS.rain;
  if (weatherId >= 600 && weatherId < 700) return WEATHER_ICONS.snow;
  if (weatherId >= 700 && weatherId < 800) return WEATHER_ICONS.atmosphere;
  if (weatherId === 800) return WEATHER_ICONS.clear;
  if (weatherId > 800) return WEATHER_ICONS.clouds;

  return WEATHER_ICONS.default;
}

export function Weather() {
  // State
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  // Local Storage
  const [unit, setUnit] = useLocalStorage<TemperatureUnit>("weather_unit", "C");

  // Get user location
  const getLocation = useCallback(
    () =>
      new Promise<Coordinates | null>((resolve) => {
        if (!navigator.geolocation) {
          console.warn("Geolocation is not supported");
          resolve(null);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
          },
          (error) => {
            console.warn("Error getting location:", error);
            resolve(null);
          },
          GEOLOCATION_OPTIONS
        );
      }),
    []
  );

  // Fetch weather data
  const fetchWeather = useCallback(async () => {
    // Don't fetch if cache is still valid
    if (
      lastUpdated &&
      Date.now() - lastUpdated.getTime() <= CACHE_DURATION &&
      weather
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!apiKey) {
        throw new Error("Weather API key not found");
      }

      const location = await getLocation();
      const url = new URL("https://api.openweathermap.org/data/2.5/weather");
      url.searchParams.append("appid", apiKey);
      url.searchParams.append("units", unit === "C" ? "metric" : "imperial");

      if (location) {
        url.searchParams.append("lat", location.lat.toString());
        url.searchParams.append("lon", location.lon.toString());
      } else {
        url.searchParams.append("q", DEFAULT_CITY);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      setWeather(data);
      setLastUpdated(new Date());
      setRetryCount(0);
    } catch (error) {
      console.error("Error fetching weather:", error);
      const errorMessage =
        retryCount >= MAX_RETRIES
          ? "Could not load weather after multiple attempts"
          : "Could not load weather, retrying...";
      setError(errorMessage);
      setRetryCount((prev) => prev + 1);

      // Auto-retry if under retry limit
      if (retryCount < MAX_RETRIES) {
        setTimeout(fetchWeather, ERROR_RETRY_DELAY);
      }
    } finally {
      setLoading(false);
    }
  }, [getLocation, lastUpdated, unit, weather, retryCount]);

  // Handle temperature unit changes from settings
  useEffect(() => {
    const handleUnitChange = (event: WeatherUnitChangeEvent) => {
      setUnit(event.detail);
    };

    window.addEventListener(
      "temperature_unit_changed",
      handleUnitChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "temperature_unit_changed",
        handleUnitChange as EventListener
      );
    };
  }, [setUnit]);

  // Listen for refresh events from menu bar
  useEffect(() => {
    const handleRefresh = () => {
      fetchWeather();
    };

    window.addEventListener("refresh_weather", handleRefresh);

    return () => {
      window.removeEventListener("refresh_weather", handleRefresh);
    };
  }, [fetchWeather]);

  // Initial fetch and refresh interval
  useEffect(() => {
    setMounted(true);
    fetchWeather();
    const interval = setInterval(fetchWeather, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  // Format temperature
  const formattedTemperature = useMemo(() => {
    if (!weather) return "--";
    return Math.round(weather.main.temp);
  }, [weather]);

  // Format tooltip text
  const tooltipText = useMemo(() => {
    if (!weather) return "";
    return [
      `${weather.name}: ${weather.weather[0].description}`,
      `Feels like: ${Math.round(weather.main.feels_like)}°${unit}`,
      `Humidity: ${weather.main.humidity}%`,
    ].join("\n");
  }, [weather, unit]);

  // Get time since last update
  const timeSinceUpdate = useMemo(() => {
    if (!lastUpdated || !mounted) return null;
    const minutes = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
    return minutes < 1 ? "Just now" : `${minutes}m ago`;
  }, [lastUpdated, mounted]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center space-x-1 text-xs">
        <Cloud className="h-3.5 w-3.5 text-zinc-400" />
        <span>--°{unit}</span>
      </div>
    );
  }

  if (loading && !weather) {
    return (
      <div className="flex items-center space-x-1 text-xs">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
        <span>Loading weather...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2 text-xs">
        <Tooltip>
          <TooltipTrigger className="flex items-center space-x-1">
            {getWeatherIcon(weather?.weather[0]?.id ?? null)}
            <span>
              {formattedTemperature}°{unit}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="whitespace-pre-line">{tooltipText}</p>
            {timeSinceUpdate && (
              <p className="mt-1 text-xs text-zinc-400">
                Last updated: {timeSinceUpdate}
              </p>
            )}
          </TooltipContent>
        </Tooltip>

        {error ? (
          <Tooltip>
            <TooltipTrigger>
              <AlertCircle className="h-3.5 w-3.5 text-red-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{error}</p>
            </TooltipContent>
          </Tooltip>
        ) : loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
        ) : null}
      </div>
    </TooltipProvider>
  );
}
