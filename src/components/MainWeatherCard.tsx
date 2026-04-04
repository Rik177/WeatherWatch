import type { WeatherFact } from '../types/weather'
import { labelCondition, labelWindDir } from '../lib/conditions'
import { formatTemp, msToMph, precipPercent } from '../lib/units'

interface Props {
  locationLabel: string
  localTimeLabel: string
  fact: WeatherFact | undefined
  useFahrenheit: boolean
  useMph: boolean
  fromForecast: boolean
  onOpenHourly: () => void
}

function iconUrl(icon: string | undefined): string | null {
  if (!icon) return null
  return `https://yastatic.net/weather/i/icons/funky/dark/${icon}.svg`
}

export function MainWeatherCard({
  locationLabel,
  localTimeLabel,
  fact,
  useFahrenheit,
  useMph,
  onOpenHourly,
}: Props) {
  if (!fact) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-500">
        Нет данных о погоде. Выполните запрос или выберите день.
      </div>
    )
  }

  const wind =
    fact.wind_speed != null
      ? useMph
        ? `${msToMph(fact.wind_speed)} миль/ч ${labelWindDir(fact.wind_dir)}`
        : `${fact.wind_speed.toFixed(1)} м/с ${labelWindDir(fact.wind_dir)}`
      : '—'

  const humidity = fact.humidity != null ? `${fact.humidity}%` : '—'
  const precip = `${precipPercent(fact.prec_strength)}%`
  const pressure =
    fact.pressure_mm != null ? `${fact.pressure_mm} мм рт. ст.` : '—'

  const img = iconUrl(fact.icon)

  return (
    <div className="relative rounded-3xl border border-white/10 bg-white/[0.07] p-6 pb-6 shadow-xl backdrop-blur-xl md:p-8 md:pb-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-orange-400/90">
            <span aria-hidden>📍</span>
            {locationLabel}
          </p>
          <p className="mt-1 text-sm text-slate-400">{localTimeLabel}</p>


          <div className="mt-6 flex flex-wrap items-end gap-4">
            <span className="text-6xl font-bold tracking-tight text-white md:text-7xl">
              {formatTemp(fact.temp, useFahrenheit)}
            </span>
            {img && (
              <img
                src={img}
                alt=""
                className="h-20 w-20 md:h-24 md:w-24"
              />
            )}
          </div>
          <p className="mt-2 text-xl text-slate-200">
            {labelCondition(fact.condition)}
          </p>
          <p className="text-sm text-slate-400">
            Ощущается как {formatTemp(fact.feels_like, useFahrenheit)}
          </p>
        </div>

        <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-4 lg:shrink-0">
          <Metric label="Ветер" value={wind} />
          <Metric label="Влажность" value={humidity} />
          <Metric label="Давление" value={pressure} />
          <Metric
            label="Осадки (интенс.)"
            value={precip}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenHourly}
        className="absolute bottom-4 right-4 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition hover:border-orange-400/50 hover:bg-orange-500/25 md:bottom-6 md:right-6"
        aria-label="Открыть почасовой прогноз"
      >
        По часам
      </button>
    </div>
  )
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-slate-600">{hint}</p>}
    </div>
  )
}
