import type { YandexForecastResponse } from '../types/weather'

export const mockForecastResponse: YandexForecastResponse = {
  now_dt: '2026-05-23T12:00:00+03:00',
  fact: {
    temp: 15,
    feels_like: 13,
    icon: 'ovc',
    condition: 'cloudy',
    wind_speed: 3.5,
    wind_dir: 'nw',
    pressure_mm: 750,
    humidity: 65,
    prec_strength: 0.2,
  },
  forecasts: [
    {
      date: '2026-05-23',
      date_ts: 1747987200,
      parts: {
        day: {
          temp_max: 18,
          temp_min: 10,
          temp_avg: 14,
          icon: 'skc_d',
          condition: 'clear',
        },
      },
    },
    {
      date: '2026-05-24',
      date_ts: 1748073600,
      parts: {
        day: {
          temp_max: 20,
          temp_min: 12,
          temp_avg: 16,
          feels_like: 15,
          humidity: 70,
          pressure_mm: 755,
          wind_speed: 4,
          wind_dir: 's',
          condition: 'rain',
          icon: 'ra_d',
          prec_strength: 0.5,
        },
      },
    },
    {
      date: '2026-05-25',
      date_ts: 1748160000,
      parts: {
        day: { temp_max: 22, temp_min: 14, icon: 'ovc', condition: 'cloudy' },
      },
    },
  ],
}
