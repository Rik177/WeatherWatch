import type { ForecastDay } from '../types/weather'
import { labelCondition } from '../lib/conditions'
import { formatTempPair } from '../lib/units'
import { pickDayPart } from '../lib/weatherDisplay'

interface Props {
  days: ForecastDay[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
  useFahrenheit: boolean
}

function yandexIconUrl(icon: string | undefined): string | null {
  if (!icon) return null
  return `https://yastatic.net/weather/i/icons/funky/dark/${icon}.svg`
}

function weekdayShort(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('ru-RU', { weekday: 'short' })
}

function dayMonth(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export function ForecastStrip({
  days,
  selectedDate,
  onSelectDate,
  useFahrenheit,
}: Props) {
  if (!days.length) {
    return (
      <p className="text-center text-sm text-slate-500">Нет данных прогноза</p>
    )
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {days.map((day, index) => {
        const part = pickDayPart(day)
        const hi = part?.temp_max ?? part?.temp
        const lo = part?.temp_min ?? part?.temp
        const isToday = index === 0
        const active = selectedDate === day.date || (!selectedDate && isToday)
        const iconUrl = yandexIconUrl(part?.icon)

        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelectDate(day.date)}
            className={`flex min-w-[100px] shrink-0 flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-left transition ${
              active
                ? 'border-orange-400 bg-orange-500/15 shadow-[0_0_20px_rgba(249,115,22,0.25)]'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            } ${isToday ? 'ring-1 ring-orange-400/40' : ''}`}
          >
            <span className="text-xs font-medium uppercase text-slate-400">
              {weekdayShort(day.date)}
            </span>
            <span className="text-[11px] text-slate-500">{dayMonth(day.date)}</span>
            {iconUrl ? (
              <img src={iconUrl} alt="" className="h-10 w-10" />
            ) : (
              <span className="text-2xl" aria-hidden>
                —
              </span>
            )}
            <span className="text-sm font-semibold text-white">
              {formatTempPair(lo, hi, useFahrenheit)}
            </span>
            <span className="line-clamp-2 text-center text-[10px] leading-tight text-slate-400">
              {labelCondition(part?.condition)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
