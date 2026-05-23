import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import * as yandexApi from './api/yandexForecast'
import * as geocodeApi from './api/geocode'
import { mockForecastResponse } from './test/fixtures'

vi.mock('./components/WeatherMap', () => ({
  WeatherMap: () => <div data-testid="weather-map" />,
}))

function stubGeolocation(
  impl: 'success' | 'denied',
) {
  const geo = {
    getCurrentPosition: vi.fn(
      (
        success?: PositionCallback,
        error?: PositionErrorCallback,
      ) => {
        if (impl === 'success') {
          success?.({
            coords: { latitude: 55.75, longitude: 37.62 },
          } as GeolocationPosition)
          return
        }
        error?.({
          code: 1,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
          message: 'User denied',
        } as GeolocationPositionError)
      },
    ),
  }
  Object.defineProperty(navigator, 'geolocation', {
    value: geo,
    configurable: true,
  })
}

describe('App (use cases)', () => {
  const fetchForecast = vi.spyOn(yandexApi, 'fetchYandexForecast')
  const searchCity = vi.spyOn(geocodeApi, 'searchCity')
  const reverseGeocode = vi.spyOn(geocodeApi, 'reverseGeocode')

  beforeEach(() => {
    localStorage.clear()
    fetchForecast.mockResolvedValue(mockForecastResponse)
    reverseGeocode.mockResolvedValue('Москва, Россия')
    searchCity.mockResolvedValue([
      {
        display_name: 'Казань, Республика Татарстан, Россия',
        lat: '55.7887',
        lon: '49.1221',
      },
    ])
    stubGeolocation('success')
  })

  it('UC1/7: после загрузки показывает текущую погоду', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('15°C')).toBeInTheDocument()
    })
    expect(screen.getByText(/САНКТ-ПЕТЕРБУРГ|Москва/i)).toBeInTheDocument()
    expect(fetchForecast).toHaveBeenCalled()
  })

  it('UC2: при ошибке загрузки показывает сообщение', async () => {
    fetchForecast.mockRejectedValue(new Error('Сервис недоступен'))
    render(<App />)

    await waitFor(() => {
      expect(screen.getAllByText('Сервис недоступен').length).toBeGreaterThan(0)
    })
  })

  it('UC3: поиск города обновляет отображаемую локацию', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => expect(screen.getByText('15°C')).toBeInTheDocument())

    await user.type(
      screen.getByRole('searchbox', { name: /поиск города/i }),
      'Казань',
    )
    await user.click(screen.getByRole('button', { name: /найти/i }))

    await waitFor(() => {
      expect(searchCity).toHaveBeenCalledWith('Казань')
    })
    expect(
      within(screen.getByRole('main')).getByText(/КАЗАНЬ/i),
    ).toBeInTheDocument()
  })

  it('UC4: фильтр по датам оставляет только дни в интервале', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => expect(screen.getByText('15°C')).toBeInTheDocument())

    const from = screen.getByLabelText(/с даты/i)
    const to = screen.getByLabelText(/по дату/i)
    await user.clear(from)
    await user.type(from, '2026-05-24')
    await user.clear(to)
    await user.type(to, '2026-05-24')

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /24/i }),
      ).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('button', { name: /25/i }),
    ).not.toBeInTheDocument()
  })

  it('UC1 (alt) / UC8: при отказе в геолокации подсказывает поиск; закладки сохраняются', async () => {
    stubGeolocation('denied')
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(
        screen.getByText(/геолокации запрещён|введите город в поиске/i),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'В закладки' }))

    await waitFor(() => {
      expect(screen.getByText(/добавлено в закладки/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Закладки' }))
    expect(screen.getByText(/САНКТ-ПЕТЕРБУРГ/i)).toBeInTheDocument()
  })
})
