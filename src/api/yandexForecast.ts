import type { ApiVersion, YandexForecastResponse } from '../types/weather'

export interface ForecastRequestParams {
  lat: number
  lon: number
  lang?: string
  limit?: number
  hours?: boolean
  extra?: boolean
  version: ApiVersion
}

function buildSearchParams(p: ForecastRequestParams): URLSearchParams {
  const sp = new URLSearchParams()
  sp.set('lat', String(p.lat))
  sp.set('lon', String(p.lon))
  if (p.lang) sp.set('lang', p.lang)
  if (p.limit != null) sp.set('limit', String(p.limit))
  sp.set('hours', p.hours === false ? 'false' : 'true')
  if (p.extra) sp.set('extra', 'true')
  return sp
}

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const j = JSON.parse(text) as { message?: string; error?: string; status?: number }
    return (j.message ?? j.error ?? text) || `${res.status} ${res.statusText}`
  } catch {
    return text || `${res.status} ${res.statusText}`
  }
}

export async function fetchYandexForecast(
  p: ForecastRequestParams,
): Promise<YandexForecastResponse> {
  const qs = buildSearchParams(p)
  const url = `/api/yandex/${p.version}/forecast?${qs.toString()}`
  const res = await fetch(url)
  if (!res.ok) {
    const msg = await readErrorMessage(res)
    throw new Error(msg)
  }
  return res.json() as Promise<YandexForecastResponse>
}
