// Open-Meteo's free forecast API only covers roughly the next 16 days, and
// the event date is much further out for most of the time this page is
// live. Until the event falls inside that forecast window, show typical
// late-October climate normals for Dallas instead of a live (and wrong)
// forecast; once it's close enough, fetch the real forecast for that date.

type ForecastResponse = {
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_mean?: number[];
    weathercode?: number[];
  };
};

const WEATHER_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mostly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Foggy", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌦️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "🌨️" },
  75: { label: "Heavy snow", icon: "❄️" },
  80: { label: "Rain showers", icon: "🌦️" },
  81: { label: "Rain showers", icon: "🌧️" },
  82: { label: "Heavy rain showers", icon: "⛈️" },
  95: { label: "Thunderstorms", icon: "⛈️" },
  96: { label: "Thunderstorms", icon: "⛈️" },
  99: { label: "Thunderstorms", icon: "⛈️" },
};

function describeWeatherCode(code: number | undefined) {
  return (code !== undefined && WEATHER_CODES[code]) || { label: "Weather", icon: "🌡️" };
}

// Not a component — a plain helper, so the time-based (impure) computation
// it does isn't happening directly inside a component's render body.
function daysUntilEvent(eventDate: string): number {
  return Math.ceil(
    (new Date(`${eventDate}T00:00:00`).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

type Forecast = {
  label: string;
  icon: string;
  high: number;
  low: number;
  rainChance: number | null;
};

async function fetchForecast(
  eventDate: string,
  latitude: number,
  longitude: number
): Promise<Forecast | null> {
  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      daily:
        "temperature_2m_max,temperature_2m_min,precipitation_probability_mean,weathercode",
      temperature_unit: "fahrenheit",
      timezone: "America/Chicago",
      start_date: eventDate,
      end_date: eventDate,
    });

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      next: { revalidate: 6 * 60 * 60 },
    });
    if (!res.ok) return null;

    const data: ForecastResponse = await res.json();
    const idx = data.daily?.time?.indexOf(eventDate) ?? -1;
    if (idx === -1) return null;

    const high = data.daily?.temperature_2m_max?.[idx];
    const low = data.daily?.temperature_2m_min?.[idx];
    const rainChance = data.daily?.precipitation_probability_mean?.[idx];
    if (typeof high !== "number" || typeof low !== "number") return null;

    const { label, icon } = describeWeatherCode(data.daily?.weathercode?.[idx]);
    return {
      label,
      icon,
      high,
      low,
      rainChance: typeof rainChance === "number" ? rainChance : null,
    };
  } catch {
    return null;
  }
}

function ClimateNormalFallback() {
  return (
    <div className="flex items-center gap-4">
      <span className="text-5xl" aria-hidden>
        🌤️
      </span>
      <div>
        <p className="text-lg font-medium text-paper">Typically mild &amp; sunny</p>
        <p className="text-paper-dim">Late-October average: ~79°F / 57°F</p>
        <p className="mt-1 text-xs text-paper-dim/70">
          Live forecast appears here about two weeks before the event.
        </p>
      </div>
    </div>
  );
}

export default async function WeatherWidget({
  eventDate,
  latitude,
  longitude,
}: {
  eventDate: string;
  latitude: number;
  longitude: number;
}) {
  const daysUntil = daysUntilEvent(eventDate);
  const forecast =
    daysUntil > 15 || daysUntil < 0
      ? null
      : await fetchForecast(eventDate, latitude, longitude);

  if (!forecast) {
    return <ClimateNormalFallback />;
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-5xl" aria-hidden>
        {forecast.icon}
      </span>
      <div>
        <p className="text-lg font-medium text-paper">{forecast.label}</p>
        <p className="text-paper-dim">
          {Math.round(forecast.high)}° / {Math.round(forecast.low)}°F
          {forecast.rainChance !== null &&
            ` · ${Math.round(forecast.rainChance)}% chance of rain`}
        </p>
      </div>
    </div>
  );
}
