const UPSTREAM = 'https://nominatim.openstreetmap.org'

function userAgent(): string {
  const host = process.env.VERCEL_URL
  const origin = host ? `https://${host}` : 'https://localhost'
  return `WeatherWatch/1.0 (+${origin})`
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'GET, HEAD' },
      })
    }

    const url = new URL(request.url)
    const pathname = url.pathname
    const search = url.search

    const prefix = '/api/nominatim'
    let rest = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname
    if (!rest || rest === '') rest = '/'
    if (!rest.startsWith('/')) rest = `/${rest}`

    const targetUrl = `${UPSTREAM}${rest}${search}`

    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: {
        Accept: 'application/json',
        'User-Agent': userAgent(),
      },
    })

    const ct =
      upstream.headers.get('content-type') ?? 'application/json; charset=utf-8'

    if (request.method === 'HEAD') {
      return new Response(null, {
        status: upstream.status,
        headers: { 'Content-Type': ct },
      })
    }

    const body = await upstream.arrayBuffer()
    return new Response(body, {
      status: upstream.status,
      headers: { 'Content-Type': ct },
    })
  },
}
