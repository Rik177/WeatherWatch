import type { ForecastDay, HourPart } from '../types/weather'
import { labelCondition } from '../lib/conditions'
import { formatTemp } from '../lib/units'

interface Props {
  days: ForecastDay[]
  selectedDate: string | null
  useFahrenheit: boolean
  onBack: () => void
}

function isHourList(h: ForecastDay['hours']): h is HourPart[] {
  return Array.isArray(h)
}

export function HourlyPanel({
  days,
  selectedDate,
  useFahrenheit,
  onBack,
}: Props) {
  const targetDate = selectedDate ?? days[0]?.date
  const day = days.find((d) => d.date === targetDate) ?? days[0]
  const hours = day && isHourList(day.hours) ? day.hours : []

  if (!hours.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:p-6">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-lg text-white transition hover:bg-white/15"
            aria-label="Назад на главную"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold text-white">По часам</h2>
        </div>
        <p className="text-center text-slate-500">
          Почасовой прогноз недоступен для этого дня.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl md:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-lg text-white transition hover:bg-white/15"
          aria-label="Назад на главную"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold text-white">
          По часам
          {day && (
            <span className="ml-2 text-sm font-normal text-slate-400">
              {new Date(day.date + 'T12:00:00').toLocaleDateString('ru-RU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </span>
          )}
        </h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {hours.map((h) => (
          <div
            key={h.hour_ts}
            className="flex min-w-[72px] shrink-0 flex-col items-center gap-1 rounded-2xl border border-white/10 bg-black/25 px-2 py-3"
          >
            <span className="text-xs text-slate-400">{h.hour}:00</span>
            {h.icon && (
              <img
                src={`https://yastatic.net/weather/i/icons/funky/dark/${h.icon}.svg`}
                alt=""
                className="h-8 w-8"
              />
            )}
            <span className="text-sm font-semibold text-white">
              {formatTemp(h.temp, useFahrenheit)}
            </span>
            <span className="line-clamp-2 text-center text-[9px] text-slate-500">
              {labelCondition(h.condition)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
