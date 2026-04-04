import type { VercelRequest, VercelResponse } from '@vercel/node'

function slugPath(query: VercelRequest['query'], key: string): string {
  const raw = query[key]
  if (raw == null) return ''
  return Array.isArray(raw) ? raw.join('/') : raw
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).end()
  }

  const key = process.env.YANDEX_WEATHER_KEY
  if (!key) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res
      .status(503)
      .json({ message: 'YANDEX_WEATHER_KEY is not configured' })
  }

  const pathTail = slugPath(req.query, 'slug')
  if (!pathTail) {
    return res.status(400).end()
  }

  const u = new URL(req.url || '/', 'https://localhost')
  const upstream = `https://api.weather.yandex.ru/${pathTail}${u.search}`

  const upstreamRes = await fetch(upstream, {
    method: req.method,
    headers: {
      'X-Yandex-Weather-Key': key,
    },
  })

  const ct = upstreamRes.headers.get('content-type')
  if (ct) res.setHeader('Content-Type', ct)

  const body = Buffer.from(await upstreamRes.arrayBuffer())
  return res.status(upstreamRes.status).send(body)
}
