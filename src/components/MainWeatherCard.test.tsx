import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MainWeatherCard } from './MainWeatherCard'
import { mockForecastResponse } from '../test/fixtures'

describe('MainWeatherCard', () => {
  it('UC1/5/6/7: показывает температуру, осадки, ветер, влажность и иконку', () => {
    const fact = mockForecastResponse.fact!

    const { container } = render(
      <MainWeatherCard
        locationLabel="САНКТ-ПЕТЕРБУРГ"
        localTimeLabel="пт, 12:00"
        fact={fact}
        useFahrenheit={false}
        useMph={false}
        fromForecast={false}
        onOpenHourly={() => {}}
      />,
    )

    expect(screen.getByText('15°C')).toBeInTheDocument()
    expect(screen.getByText('Облачно')).toBeInTheDocument()
    expect(screen.getByText('Ветер')).toBeInTheDocument()
    expect(screen.getByText(/3\.5 м\/с СЗ/)).toBeInTheDocument()
    expect(screen.getByText('65%')).toBeInTheDocument()
    expect(screen.getByText('20%')).toBeInTheDocument()
    const icon = container.querySelector('img[src*="ovc"]')
    expect(icon).not.toBeNull()
  })
})
