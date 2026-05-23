import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchYandexForecast } from './yandexForecast'
import { mockForecastResponse } from '../test/fixtures'

describe('fetchYandexForecast (API)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('UC1/7: возвращает прогноз при успешном ответе', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockForecastResponse,
      }),
    )

    const data = await fetchYandexForecast({
      lat: 59.93,
      lon: 30.33,
      version: 'v2',
    })

    expect(data.fact?.temp).toBe(15)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/yandex\/v2\/forecast\?.*lat=59\.93/),
    )
  })

  it('UC2: при ошибке API пробрасывает сообщение', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        text: async () => JSON.stringify({ message: 'Сервис недоступен' }),
      }),
    )

    await expect(
      fetchYandexForecast({ lat: 55.75, lon: 37.62, version: 'v2' }),
    ).rejects.toThrow('Сервис недоступен')
  })
})
