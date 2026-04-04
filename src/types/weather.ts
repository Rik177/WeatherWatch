export type ApiVersion = 'v1' | 'v2'

export interface WeatherPart {
  temp_min?: number
  temp_max?: number
  temp_avg?: number
  temp?: number
  feels_like?: number
  icon?: string
  condition?: string
  wind_speed?: number
  wind_gust?: number
  wind_dir?: string
  pressure_mm?: number
  pressure_pa?: number
  humidity?: number
  prec_mm?: number
  prec_type?: number
  prec_strength?: number
  cloudness?: number | string
  daytime?: string
}

export interface HourPart {
  hour: string
  hour_ts: number
  temp: number
  feels_like: number
  icon?: string
  condition?: string
  wind_speed?: number
  wind_dir?: string
  pressure_mm?: number
  humidity?: number
  prec_type?: number
  prec_strength?: number
  cloudness?: number | string
}

export interface ForecastDay {
  date: string
  date_ts: number
  sunrise?: string
  sunset?: string
  parts?: Record<string, WeatherPart | undefined>
  hours?: HourPart[] | string
}

export interface WeatherFact {
  temp: number
  feels_like: number
  icon?: string
  condition?: string
  wind_speed?: number
  wind_gust?: number
  wind_dir?: string
  pressure_mm?: number
  pressure_pa?: number
  humidity?: number
  prec_type?: number
  prec_strength?: number
  cloudness?: number | string
  daytime?: string
  season?: string
  obs_time?: number
}

export interface YandexForecastResponse {
  now?: number
  now_dt?: string
  info?: {
    lat: number
    lon: number
    tzinfo?: { offset: number; name?: string; abbr?: string }
    url?: string
  }
  fact?: WeatherFact
  forecasts?: ForecastDay[]
}

export interface CityBookmark {
  id: string
  name: string
  lat: number
  lon: number
}
