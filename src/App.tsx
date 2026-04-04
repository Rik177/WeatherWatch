import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import Header from './components/Header'
import { ToastStack, type ToastItem, type ToastKind } from './components/ToastStack'
import { WeatherMap } from './components/WeatherMap'
import { ForecastStrip } from './components/ForecastStrip'
import { MainWeatherCard } from './components/MainWeatherCard'
import { HourlyPanel } from './components/HourlyPanel'
import { BookmarksPanel } from './components/BookmarksPanel'
import { fetchYandexForecast } from './api/yandexForecast'
import { searchCity, reverseGeocode } from './api/geocode'
import type {
  ApiVersion,
  CityBookmark,
  YandexForecastResponse,
} from './types/weather'
import { loadBookmarks, saveBookmarks } from './lib/bookmarksStorage'
import {
  filterForecastsByRange,
  mergeFactForDay,
} from './lib/weatherDisplay'

const DEFAULT_COORDS = { lat: 59.9343, lon: 30.3351 }

const FORECAST_DEFAULTS: {
  version: ApiVersion
  limit: number
  hours: boolean
  extra: boolean
  lang: string
} = {
  version: 'v2',
  limit: 10,
  hours: true,
  extra: false,
  lang: 'ru_RU',
}

function nextToastId() {
  return Date.now() + Math.random()
}

function isGeolocationContextOk(): boolean {
  if (typeof window === 'undefined') return false
  if (window.isSecureContext) return true
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]'
}

function geolocationErrorMessage(err: GeolocationPositionError): string {
  if (err.code === err.PERMISSION_DENIED) {
    return 'Доступ к геолокации запрещён. Разрешите доступ в настройках сайта в браузере или введите город в поиске.'
  }
  if (err.code === err.POSITION_UNAVAILABLE) {
    return 'Позиция недоступна (нет данных от устройства). Попробуйте позже или укажите город вручную.'
  }
  if (err.code === err.TIMEOUT) {
    return 'Геолокация: превышено время ожидания. Нажмите «Моё местоположение» ещё раз или выберите город в поиске.'
  }
  return 'Не удалось определить местоположение.'
}

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [coords, setCoords] = useState(DEFAULT_COORDS)
  const [locationName, setLocationName] = useState('Санкт-Петербург')
  const [weather, setWeather] = useState<YandexForecastResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [useFahrenheit, setUseFahrenheit] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [bookmarks, setBookmarks] = useState<CityBookmark[]>(loadBookmarks)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const autoGeolocationStartedRef = useRef(false)

  const pushToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = nextToastId()
    setToasts((t) => [...t, { id, message, kind }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  useEffect(() => {
    saveBookmarks(bookmarks)
  }, [bookmarks])

  const runForecast = useCallback(
    async (opts: {
      lat: number
      lon: number
      version: ApiVersion
      limit: number
      hours: boolean
      extra: boolean
      lang: string
    }) => {
      setLoading(true)
      try {
        const data = await fetchYandexForecast({
          lat: opts.lat,
          lon: opts.lon,
          version: opts.version,
          limit: opts.limit,
          hours: opts.hours,
          extra: opts.extra,
          lang: opts.lang,
        })
        setWeather(data)
        setSelectedDate(null)
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setWeather(null)
        pushToast(msg, 'error')
      } finally {
        setLoading(false)
      }
    },
    [pushToast],
  )

  const refreshWeather = useCallback(() => {
    void runForecast({
      lat: coords.lat,
      lon: coords.lon,
      ...FORECAST_DEFAULTS,
    })
  }, [coords.lat, coords.lon, runForecast])

  useEffect(() => {
    void runForecast({
      lat: coords.lat,
      lon: coords.lon,
      ...FORECAST_DEFAULTS,
    })
  }, [coords.lat, coords.lon, runForecast])

  const requestGeolocation = useCallback(
    (source: 'auto' | 'manual') => {
      if (!navigator.geolocation) {
        pushToast(
          'Ваш браузер не поддерживает геолокацию. Воспользуйтесь поиском города.',
          'warning',
        )
        return
      }
      if (!isGeolocationContextOk()) {
        pushToast(
          'Геолокация в браузере работает только по HTTPS или на http://localhost. Если вы открыли сайт по IP (например http://192.168.…), используйте http://localhost:5173 на этом компьютере или поиск города.',
          'warning',
        )
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude
          const lon = pos.coords.longitude
          setCoords({ lat, lon })
          try {
            const name = await reverseGeocode(lat, lon)
            if (name) {
              const short = name.split(',').slice(0, 2).join(', ')
              setLocationName(short)
            } else {
              setLocationName('Моё местоположение')
            }
          } catch {
            setLocationName('Моё местоположение')
          }
          if (source === 'manual') {
            pushToast('Местоположение обновлено', 'info')
          }
        },
        (err) => {
          pushToast(geolocationErrorMessage(err), 'warning')
        },
        {
          enableHighAccuracy: false,
          maximumAge: 120_000,
          timeout: 25_000,
        },
      )
    },
    [pushToast],
  )

  useEffect(() => {
    if (autoGeolocationStartedRef.current) return
    autoGeolocationStartedRef.current = true
    requestGeolocation('auto')
  }, [requestGeolocation])

  const forecasts = useMemo(
    () => weather?.forecasts ?? [],
    [weather],
  )
  const filteredForecasts = useMemo(
    () => filterForecastsByRange(forecasts, dateFrom, dateTo),
    [forecasts, dateFrom, dateTo],
  )

  useEffect(() => {
    if (
      selectedDate &&
      !filteredForecasts.some((d) => d.date === selectedDate)
    ) {
      setSelectedDate(null)
    }
  }, [filteredForecasts, selectedDate])

  const dayForSelection = selectedDate
    ? forecasts.find((d) => d.date === selectedDate)
    : undefined
  const { fact: displayFact, fromForecast } = mergeFactForDay(
    weather?.fact,
    dayForSelection,
    forecasts,
    selectedDate,
  )

  const localTimeLabel = useMemo(() => {
    if (weather?.now_dt) {
      return new Date(weather.now_dt).toLocaleString('ru-RU', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
      })
    }
    return new Date().toLocaleString('ru-RU', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [weather?.now_dt])

  const handleSearchSubmit = async () => {
    const q = searchQuery.trim()
    if (!q) {
      pushToast('Введите название города', 'warning')
      return
    }
    try {
      const results = await searchCity(q)
      if (!results.length) {
        pushToast('Город не найден', 'warning')
        return
      }
      const top = results[0]
      const lat = parseFloat(top.lat)
      const lon = parseFloat(top.lon)
      setCoords({ lat, lon })
      const short = top.display_name.split(',').slice(0, 2).join(', ')
      setLocationName(short)
      pushToast(`Загружено: ${short}`, 'info')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      pushToast(msg, 'error')
    }
  }

  const addBookmark = () => {
    const name = locationName || 'Точка на карте'
    const id = crypto.randomUUID()
    const next: CityBookmark = { id, name, lat: coords.lat, lon: coords.lon }
    if (bookmarks.some((b) => Math.abs(b.lat - coords.lat) < 1e-4 && Math.abs(b.lon - coords.lon) < 1e-4)) {
      pushToast('Этот город уже в закладках', 'info')
      return
    }
    setBookmarks((b) => [...b, next])
    pushToast('Добавлено в закладки', 'info')
  }

  const openBookmark = (b: CityBookmark) => {
    setCoords({ lat: b.lat, lon: b.lon })
    setLocationName(b.name)
    setTab('dashboard')
  }

  return (
    <div className="ww-viewport min-h-screen bg-[#141022]">
      <div className="ww-scale min-h-screen text-slate-100">
      <Header
        activeTab={tab}
        onTab={setTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        useFahrenheit={useFahrenheit}
        onToggleUnits={() => setUseFahrenheit((v) => !v)}
      />

      <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
        {tab === 'dashboard' && (
          <div className="space-y-6">

            <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <label className="text-sm">
                <span className="text-slate-400">С даты</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1 block rounded-xl border border-white/15 bg-[#1a162d] px-3 py-2 text-white"
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-400">По дату</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1 block rounded-xl border border-white/15 bg-[#1a162d] px-3 py-2 text-white"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setDateFrom('')
                  setDateTo('')
                }}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/10"
              >
                Сбросить период
              </button>
              <button
                type="button"
                onClick={addBookmark}
                className="rounded-xl bg-orange-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-orange-400"
              >
                В закладки
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={refreshWeather}
                className="rounded-xl border border-orange-400/50 px-4 py-2 text-sm text-orange-200 hover:bg-orange-500/10 disabled:opacity-50"
              >
                Обновить погоду
              </button>
              <button
                type="button"
                onClick={() => requestGeolocation('manual')}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                title="Запросить координаты у браузера ещё раз"
              >
                Моё местоположение
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,36%)] lg:items-start">
              <div className="space-y-6">
                <MainWeatherCard
                  locationLabel={locationName.toUpperCase()}
                  localTimeLabel={localTimeLabel}
                  fact={displayFact}
                  useFahrenheit={useFahrenheit}
                  useMph={useFahrenheit}
                  fromForecast={fromForecast}
                  onOpenHourly={() => setTab('hourly')}
                />
                <section>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Прогноз по дням
                  </h2>
                  <ForecastStrip
                    days={filteredForecasts}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    useFahrenheit={useFahrenheit}
                  />
                  <p className="mt-3 text-xs text-slate-500">
                    Нажмите на день, чтобы увидеть подробный прогноз.
                  </p>
                </section>
              </div>
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Карта
                </h2>
                <WeatherMap lat={coords.lat} lon={coords.lon} className="h-[320px] lg:h-[420px]" />
              </div>
            </div>
          </div>
        )}

        {tab === 'hourly' && (
          <HourlyPanel
            days={filteredForecasts.length ? filteredForecasts : forecasts}
            selectedDate={selectedDate}
            useFahrenheit={useFahrenheit}
            onBack={() => setTab('dashboard')}
          />
        )}

        {tab === 'map' && (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold text-white">Карта локации</h1>
            <WeatherMap lat={coords.lat} lon={coords.lon} className="h-[min(70vh,560px)]" />
          </div>
        )}

        {tab === 'bookmarks' && (
          <BookmarksPanel
            bookmarks={bookmarks}
            onSelect={openBookmark}
            onRemove={(id) =>
              setBookmarks((b) => b.filter((x) => x.id !== id))
            }
          />
        )}

      </main>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </div>
    </div>
  )
}
