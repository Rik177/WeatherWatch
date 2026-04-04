import type { VercelRequest, VercelResponse } from '@vercel/node'

const UPSTREAM = 'https://api.weather.yandex.ru'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).setHeader('Allow', 'GET, HEAD').end('Method Not Allowed')
    return
  }

  const key = process.env.YANDEX_WEATHER_KEY
  if (!key) {
    res
      .status(503)
      .setHeader('Content-Type', 'application/json; charset=utf-8')
      .end(
        JSON.stringify({
          error: 'YANDEX_WEATHER_KEY is not set in Vercel Environment Variables',
        }),
      )
    return
  }

  const rawUrl = req.url ?? '/'
  const q = rawUrl.indexOf('?')
  const pathname = q >= 0 ? rawUrl.slice(0, q) : rawUrl
  const search = q >= 0 ? rawUrl.slice(q) : ''

  const prefix = '/api/yandex'
  let rest = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname
  if (!rest || rest === '') rest = '/'
  if (!rest.startsWith('/')) rest = `/${rest}`

  const targetUrl = `${UPSTREAM}${rest}${search}`

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: {
      Accept: 'application/json',
      'X-Yandex-Weather-Key': key,
    },
  })

  const ct =
    upstream.headers.get('content-type') ?? 'application/json; charset=utf-8'
  res.status(upstream.status).setHeader('Content-Type', ct)

  if (req.method === 'HEAD') {
    res.end()
    return
  }

  const buf = Buffer.from(await upstream.arrayBuffer())
  res.send(buf)
}
