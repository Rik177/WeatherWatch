export interface GeocodeResult {
  display_name: string
  lat: string
  lon: string
}

export async function searchCity(query: string): Promise<GeocodeResult[]> {
  const q = query.trim()
  if (!q) return []
  const url = `/api/nominatim/search?format=json&q=${encodeURIComponent(q)}&limit=5`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Геокодинг: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<GeocodeResult[]>
}

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<string | null> {
  const url = `/api/nominatim/reverse?format=json&lat=${lat}&lon=${lon}`
  const res = await fetch(url)
  if (!res.ok) return null
  const j = (await res.json()) as { display_name?: string }
  return j.display_name ?? null
}
