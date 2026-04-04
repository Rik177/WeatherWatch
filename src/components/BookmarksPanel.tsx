import type { CityBookmark } from '../types/weather'

interface Props {
  bookmarks: CityBookmark[]
  onSelect: (b: CityBookmark) => void
  onRemove: (id: string) => void
}

export function BookmarksPanel({ bookmarks, onSelect, onRemove }: Props) {
  if (!bookmarks.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-10 text-center text-slate-500">
        <p className="text-lg text-slate-300">Закладок пока нет</p>
        <p className="mt-2 text-sm">
          Найдите город в поиске и нажмите «В закладки».
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((b) => (
        <div
          key={b.id}
          className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
        >
          <p className="font-medium text-white">{b.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {b.lat.toFixed(4)}, {b.lon.toFixed(4)}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => onSelect(b)}
              className="flex-1 rounded-xl bg-orange-500/90 py-2 text-sm font-medium text-white hover:bg-orange-400"
            >
              Открыть
            </button>
            <button
              type="button"
              onClick={() => onRemove(b.id)}
              className="rounded-xl border border-white/15 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
            >
              Удалить
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
