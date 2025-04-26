"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Snowflake, CloudFog } from "lucide-react";

interface WeatherData {
  main: {
    temp: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
  }[];
}

export function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("weather_unit") || "C";
    }
    return "C";
  });
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          setCoords(null);
        }
      );
    } else {
      setCoords(null);
    }
  }, []);

  // Listen for temperature unit changes from settings
  useEffect(() => {
    const handleUnitChange = (event: CustomEvent) => {
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
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        let url = "";
        if (coords) {
          url = `https://api.openweathermap.org/data/2.5/weather?lat=${
            coords.lat
          }&lon=${coords.lon}&units=${
            unit === "C" ? "metric" : "imperial"
          }&appid=${apiKey}`;
        } else {
          url = `https://api.openweathermap.org/data/2.5/weather?q=London&units=${
            unit === "C" ? "metric" : "imperial"
          }&appid=${apiKey}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError("Could not load weather");
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [coords, unit]);

  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="h-3.5 w-3.5" />;

    const weatherId = weather.weather[0].id;

    // Weather condition codes: https://openweathermap.org/weather-conditions
    if (weatherId >= 200 && weatherId < 600) {
      return <CloudRain className="h-3.5 w-3.5" />;
    } else if (weatherId >= 600 && weatherId < 700) {
      return <Snowflake className="h-3.5 w-3.5" />;
    } else if (weatherId >= 700 && weatherId < 800) {
      return <CloudFog className="h-3.5 w-3.5" />;
    } else if (weatherId === 800) {
      return <Sun className="h-3.5 w-3.5" />;
    } else {
      return <Cloud className="h-3.5 w-3.5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-1 text-xs">
        <Cloud className="h-3.5 w-3.5 animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-1 text-xs">
        <Cloud className="h-3.5 w-3.5" />
        <span>--°C</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 text-xs">
      {getWeatherIcon()}
      <span>
        {weather ? Math.round(weather.main.temp) : "--"}°{unit}
      </span>
    </div>
  );
}
