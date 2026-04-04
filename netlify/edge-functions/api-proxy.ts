import type { Config, Context } from '@netlify/edge-functions'

const NOMINATIM_UA =
  'WeatherWatch/1.0 (study project; +https://example.local)'

export default async function handler(request: Request, _context: Context) {
  const url = new URL(request.url)
  const { pathname, search } = url

  if (pathname.startsWith('/api/yandex')) {
    const key = Netlify.env.get('YANDEX_WEATHER_KEY')
    if (!key) {
      return new Response(
        JSON.stringify({
          error: 'YANDEX_WEATHER_KEY is not set in Netlify environment variables',
        }),
        { status: 503, headers: { 'content-type': 'application/json' } },
      )
    }
    const upstreamPath = pathname.replace(/^\/api\/yandex/, '') || '/'
    const upstream = `https://api.weather.yandex.ru${upstreamPath}${search}`
    const res = await fetch(upstream, {
      headers: { 'X-Yandex-Weather-Key': key },
    })
    const ct = res.headers.get('content-type') ?? 'application/json'
    return new Response(res.body, {
      status: res.status,
      headers: { 'content-type': ct },
    })
  }

  if (pathname.startsWith('/api/nominatim')) {
    const upstreamPath = pathname.replace(/^\/api\/nominatim/, '') || '/'
    const upstream = `https://nominatim.openstreetmap.org${upstreamPath}${search}`
    const res = await fetch(upstream, {
      headers: {
        'User-Agent': NOMINATIM_UA,
        'Accept-Language': 'en',
      },
    })
    const ct = res.headers.get('content-type') ?? 'application/json'
    return new Response(res.body, {
      status: res.status,
      headers: { 'content-type': ct },
    })
  }

  return new Response('Not found', { status: 404 })
}

export const config: Config = {
  pattern: '^/api/(yandex|nominatim)/.+',
}
