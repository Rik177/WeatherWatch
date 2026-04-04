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

  const pathTail = slugPath(req.query, 'slug')
  if (pathTail !== 'search' && pathTail !== 'reverse') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.status(404).json({ error: 'Not found' })
  }

  const u = new URL(req.url || '/', 'https://localhost')
  const upstream = `https://nominatim.openstreetmap.org/${pathTail}${u.search}`

  const upstreamRes = await fetch(upstream, {
    method: req.method,
    headers: {
      'User-Agent':
        process.env.NOMINATIM_USER_AGENT ??
        'WeatherWatch/1.0 (Vercel; study project)',
      Accept: 'application/json',
    },
  })

  const ct = upstreamRes.headers.get('content-type')
  if (ct) res.setHeader('Content-Type', ct)

  const body = Buffer.from(await upstreamRes.arrayBuffer())
  return res.status(upstreamRes.status).send(body)
}
