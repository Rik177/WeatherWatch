import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchCity } from './geocode'

describe('searchCity (API)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('UC3: находит город по запросу через nominatim', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            display_name: 'Казань, Республика Татарстан, Россия',
            lat: '55.7887',
            lon: '49.1221',
          },
        ],
      }),
    )

    const results = await searchCity('Казань')

    expect(results).toHaveLength(1)
    expect(results[0].lat).toBe('55.7887')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/nominatim/search'),
    )
  })
})
