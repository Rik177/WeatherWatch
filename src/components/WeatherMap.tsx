import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const DARK_RASTER_STYLE = {
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
    },
  },
  layers: [
    {
      id: 'carto',
      type: 'raster',
      source: 'carto',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
} satisfies StyleSpecification

interface Props {
  lat: number
  lon: number
  className?: string
}

export function WeatherMap({ lat, lon, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const map = new maplibregl.Map({
      container: ref.current,
      style: DARK_RASTER_STYLE,
      center: [lon, lat],
      zoom: 9,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-left')

    const marker = new maplibregl.Marker({ color: '#f97316' })
      .setLngLat([lon, lat])
      .addTo(map)

    mapRef.current = map
    markerRef.current = marker

    const container = ref.current
    const ro = new ResizeObserver(() => {
      map.resize()
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
      marker.remove()
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const marker = markerRef.current
    if (!map || !marker) return
    marker.setLngLat([lon, lat])
    map.setCenter([lon, lat])
  }, [lat, lon])

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 ${className}`}
    >
      <div ref={ref} className="h-full min-h-[280px] w-full" />
    </div>
  )
}
