"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Cloud,
  CloudRain,
  Sun,
  Snowflake,
  CloudFog,
  Loader2,
  AlertCircle,
  MapPin,
  Thermometer,
  Droplets,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
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

interface CachedWeatherData {
  data: WeatherData;
  timestamp: number;
  coordinates?: Coordinates;
  unit: TemperatureUnit;
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

// Weather data cache
const weatherCache: Record<string, CachedWeatherData> = {};

// Check if cache is valid for a location
function isCacheValid(cacheKey: string, currentUnit: TemperatureUnit): boolean {
  const cached = weatherCache[cacheKey];
  if (!cached) return false;

  const now = Date.now();
  const isExpired = now - cached.timestamp > CACHE_DURATION;
  const unitMismatch = cached.unit !== currentUnit;

  return !isExpired && !unitMismatch;
}

// Generate cache key
function getCacheKey(coordinates?: Coordinates, cityName?: string): string {
  if (coordinates) {
    return `${coordinates.lat.toFixed(2)},${coordinates.lon.toFixed(2)}`;
  }
  return cityName || DEFAULT_CITY;
}

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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
    null
  );
  const [locationName, setLocationName] = useState<string | null>(null);

  // Lock ref to prevent multiple fetches
  const lockRef = useRef(false);

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
            const coordinates = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            };
            setCurrentLocation(coordinates);
            resolve(coordinates);
          },
          (error) => {
            console.warn("Error getting location:", error);
            setCurrentLocation(null);
            resolve(null);
          },
          GEOLOCATION_OPTIONS
        );
      }),
    []
  );

  // Convert temperature between units if needed
  const convertTemperature = useCallback(
    (
      temp: number,
      fromUnit: TemperatureUnit,
      toUnit: TemperatureUnit
    ): number => {
      if (fromUnit === toUnit) return temp;

      if (fromUnit === "C" && toUnit === "F") {
        return (temp * 9) / 5 + 32;
      } else {
        return ((temp - 32) * 5) / 9;
      }
    },
    []
  );

  // Attempt to convert cached weather data between temperature units
  const convertCachedWeather = useCallback(
    (cachedData: CachedWeatherData, toUnit: TemperatureUnit): WeatherData => {
      if (cachedData.unit === toUnit) return cachedData.data;

      const convertedData = { ...cachedData.data };
      convertedData.main = {
        ...convertedData.main,
        temp: convertTemperature(
          convertedData.main.temp,
          cachedData.unit,
          toUnit
        ),
        feels_like: convertTemperature(
          convertedData.main.feels_like,
          cachedData.unit,
          toUnit
        ),
      };

      return convertedData;
    },
    [convertTemperature]
  );

  // Fetch weather data
  const fetchWeather = useCallback(
    async (forceRefresh = false) => {
      // Prevent multiple simultaneous fetches
      if (loading || lockRef.current) return;

      lockRef.current = true;

      try {
        setLoading(true);
        setError(null);

        const location = await getLocation();
        const cacheKey = getCacheKey(
          location || undefined,
          locationName || undefined
        );

        // Check cache first (unless force refresh is requested)
        if (!forceRefresh && isCacheValid(cacheKey, unit)) {
          const cached = weatherCache[cacheKey];
          setWeather(cached.data);
          setLastUpdated(new Date(cached.timestamp));
          return;
        }

        // If we have cached data for different unit but same location, convert it
        const cachedForLocation = weatherCache[cacheKey];
        if (
          !forceRefresh &&
          cachedForLocation &&
          Date.now() - cachedForLocation.timestamp <= CACHE_DURATION
        ) {
          try {
            const convertedData = convertCachedWeather(cachedForLocation, unit);
            setWeather(convertedData);
            setLastUpdated(new Date(cachedForLocation.timestamp));

            // Update cache with converted data
            weatherCache[cacheKey] = {
              data: convertedData,
              timestamp: cachedForLocation.timestamp,
              coordinates: location || undefined,
              unit,
            };

            return;
          } catch (error) {
            console.warn("Error converting cached weather data:", error);
            // Continue with fresh fetch if conversion fails
          }
        }

        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!apiKey) {
          setError("Weather API key not found. Please add a valid OpenWeather API key in your environment variables.");
          setLoading(false);
          lockRef.current = false;
          return;
        }

        const url = new URL("https://api.openweathermap.org/data/2.5/weather");
        url.searchParams.append("appid", apiKey);
        url.searchParams.append("units", unit === "C" ? "metric" : "imperial");

        if (location) {
          url.searchParams.append("lat", location.lat.toString());
          url.searchParams.append("lon", location.lon.toString());
        } else {
          url.searchParams.append("q", locationName || DEFAULT_CITY);
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();

        // Cache the new data
        weatherCache[cacheKey] = {
          data,
          timestamp: Date.now(),
          coordinates: location || undefined,
          unit,
        };

        setWeather(data);
        setLocationName(data.name);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching weather:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load weather data"
        );
        // Keep previous weather data if available to avoid blank display
      } finally {
        setLoading(false);
        lockRef.current = false;
      }
    },
    [getLocation, unit, locationName, convertCachedWeather]
  );

  // Handle temperature unit changes from settings
  useEffect(() => {
    const handleUnitChange = (event: WeatherUnitChangeEvent) => {
      const newUnit = event.detail;

      if (newUnit === unit) return; // No change
      setUnit(newUnit);

      // Try to use cached data with unit conversion first
      if (currentLocation || locationName) {
        const cacheKey = getCacheKey(
          currentLocation || undefined,
          locationName || undefined
        );
        const cached = weatherCache[cacheKey];

        if (cached && Date.now() - cached.timestamp <= CACHE_DURATION) {
          try {
            const convertedData = convertCachedWeather(cached, newUnit);
            setWeather(convertedData);

            // Update cache with converted data
            weatherCache[cacheKey] = {
              ...cached,
              data: convertedData,
              unit: newUnit,
            };

            return;
          } catch (error) {
            console.warn("Error converting weather on unit change:", error);
            // Fall through to fetch if conversion fails
          }
        }
      }

      // If conversion fails or no valid cache, fetch fresh data
      fetchWeather(true);
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
  }, [
    unit,
    setUnit,
    fetchWeather,
    currentLocation,
    locationName,
    convertCachedWeather,
  ]);

  // Listen for refresh events from menu bar
  useEffect(() => {
    const handleRefresh = () => {
      fetchWeather(true); // Force refresh
    };

    window.addEventListener("refresh_weather", handleRefresh);

    return () => {
      window.removeEventListener("refresh_weather", handleRefresh);
    };
  }, [fetchWeather]);

  // Initial fetch once on mount
  useEffect(() => {
    setMounted(true);

    // Make sure the unit is synced with localStorage
    const storedUnit = localStorage.getItem("weather_unit");
    if (storedUnit === "C" || storedUnit === "F") {
      if (storedUnit !== unit) {
        setUnit(storedUnit);
      }
    }

    // Initial fetch with cache check - only once on mount
    fetchWeather();

    // No auto-refresh interval
  }, []); // Empty dependency array to run only once

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

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2 text-xs">
        <Popover open={dialogOpen} onOpenChange={setDialogOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-2 text-xs flex items-center gap-1 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
              aria-label="Weather details"
            >
              {error ? (
                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
              ) : (
                getWeatherIcon(weather?.weather[0]?.id ?? null)
              )}
              <span>{error ? "Error" : `${formattedTemperature}°${unit}`}</span>
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
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Error loading weather</span>
                </div>
                <p className="text-xs text-muted-foreground">{error}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => fetchWeather(true)}
                >
                  Try again
                </Button>
              </div>
            ) : weather ? (
              <div className="space-y-1">
                <div className="group flex items-center text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm">
                  <div className="flex items-center gap-2">
                    {getWeatherIcon(weather.weather[0]?.id ?? null)}
                    <span className="capitalize">
                      {weather.weather[0].description}
                    </span>
                  </div>
                </div>

                <div className="group flex items-center justify-between text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-3.5 w-3.5" />
                    <span>Temperature</span>
                  </div>
                  <span>
                    {formattedTemperature}°{unit}
                  </span>
                </div>

                <div className="group flex items-center justify-between text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-3.5 w-3.5" />
                    <span>Humidity</span>
                  </div>
                  <span>{weather.main.humidity}%</span>
                </div>

                <div className="group flex items-center justify-between text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-3.5 w-3.5" />
                    <span>Feels Like</span>
                  </div>
                  <span>
                    {Math.round(weather.main.feels_like)}°{unit}
                  </span>
                </div>

                <div className="group flex items-center justify-between text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Location</span>
                  </div>
                  <span>{weather.name}</span>
                </div>

                {timeSinceUpdate && (
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    Last updated: {timeSinceUpdate}
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => fetchWeather(true)}
                >
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="p-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Remove separate error icon since error is now shown in the main button */}
        {loading && !error && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
        )}
      </div>
    </TooltipProvider>
  );
}
