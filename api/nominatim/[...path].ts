import type { VercelRequest, VercelResponse } from '@vercel/node'

const UPSTREAM = 'https://nominatim.openstreetmap.org'

function userAgent(): string {
  const host = process.env.VERCEL_URL
  const origin = host ? `https://${host}` : 'https://localhost'
  return `WeatherWatch/1.0 (+${origin})`
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).setHeader('Allow', 'GET, HEAD').end('Method Not Allowed')
    return
  }

  const rawUrl = req.url ?? '/'
  const q = rawUrl.indexOf('?')
  const pathname = q >= 0 ? rawUrl.slice(0, q) : rawUrl
  const search = q >= 0 ? rawUrl.slice(q) : ''

  const prefix = '/api/nominatim'
  let rest = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname
  if (!rest || rest === '') rest = '/'
  if (!rest.startsWith('/')) rest = `/${rest}`

  const targetUrl = `${UPSTREAM}${rest}${search}`

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: {
      Accept: 'application/json',
      'User-Agent': userAgent(),
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
