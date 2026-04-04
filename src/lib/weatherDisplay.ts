import type { ForecastDay, WeatherFact, WeatherPart } from '../types/weather'

export function pickDayPart(day: ForecastDay | undefined): WeatherPart | undefined {
  if (!day?.parts) return undefined
  return (
    day.parts.day ??
    day.parts.day_short ??
    day.parts.morning ??
    day.parts.evening
  )
}

export function mergeFactForDay(
  fact: WeatherFact | undefined,
  day: ForecastDay | undefined,
  forecasts: ForecastDay[] | undefined,
  selectedDate: string | null,
): { fact: WeatherFact | undefined; fromForecast: boolean } {
  if (!selectedDate || !day) {
    return { fact, fromForecast: false }
  }
  const firstDate = forecasts?.[0]?.date
  if (firstDate && selectedDate === firstDate && fact) {
    return { fact, fromForecast: false }
  }
  const part = pickDayPart(day)
  if (!part) return { fact: undefined, fromForecast: true }
  const synthetic: WeatherFact = {
    temp: part.temp_avg ?? part.temp ?? fact?.temp ?? 0,
    feels_like: part.feels_like ?? part.temp_avg ?? 0,
    icon: part.icon,
    condition: part.condition,
    wind_speed: part.wind_speed,
    wind_gust: part.wind_gust,
    wind_dir: part.wind_dir,
    pressure_mm: part.pressure_mm,
    pressure_pa: part.pressure_pa,
    humidity: part.humidity,
    prec_type: part.prec_type,
    prec_strength: part.prec_strength,
    cloudness: part.cloudness,
  }
  return { fact: synthetic, fromForecast: true }
}

export function filterForecastsByRange(
  days: ForecastDay[] | undefined,
  from: string,
  to: string,
): ForecastDay[] {
  if (!days?.length) return []
  if (!from && !to) return days
  return days.filter((d) => {
    if (from && d.date < from) return false
    if (to && d.date > to) return false
    return true
  })
}
