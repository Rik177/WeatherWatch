import { describe, expect, it } from 'vitest'
import { filterForecastsByRange, mergeFactForDay } from './weatherDisplay'
import { mockForecastResponse } from '../test/fixtures'

const forecasts = mockForecastResponse.forecasts!

describe('weatherDisplay', () => {
  it('UC4: фильтрует прогноз по интервалу дат', () => {
    const filtered = filterForecastsByRange(
      forecasts,
      '2026-05-24',
      '2026-05-24',
    )
    expect(filtered).toHaveLength(1)
    expect(filtered[0].date).toBe('2026-05-24')
  })

  it('UC5: при выборе дня подставляет детальные параметры из части прогноза', () => {
    const day = forecasts[1]
    const { fact, fromForecast } = mergeFactForDay(
      mockForecastResponse.fact,
      day,
      forecasts,
      '2026-05-24',
    )

    expect(fromForecast).toBe(true)
    expect(fact?.humidity).toBe(70)
    expect(fact?.pressure_mm).toBe(755)
    expect(fact?.wind_speed).toBe(4)
    expect(fact?.condition).toBe('rain')
  })
})
