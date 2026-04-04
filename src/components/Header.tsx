interface NavTab {
    id: string
    label: string
}

const TABS: NavTab[] = [
    { id: 'dashboard', label: 'Главная' },
    { id: 'map', label: 'Карта' },
    { id: 'bookmarks', label: 'Закладки' },
]

interface Props {
    activeTab: string
    onTab: (id: string) => void
    searchQuery: string
    onSearchChange: (q: string) => void
    onSearchSubmit: () => void
    useFahrenheit: boolean
    onToggleUnits: () => void
}

export default function Header({
    activeTab,
    onTab,
    searchQuery,
    onSearchChange,
    onSearchSubmit,
    useFahrenheit,
    onToggleUnits,
}: Props) {
    return (
        <header className="border-b border-white/10 bg-[#141022]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
            <div className="flex items-center gap-3">
            <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-xl shadow-lg"
                aria-hidden
            >
                ☀
            </div>
            <div>
                <p className="text-lg font-semibold tracking-tight text-white">
                    WeatherWatch
                </p>
                <p className="text-xs text-slate-400">Погодный дозор</p>
            </div>
            </div>

            <form
            className="flex w-full max-w-md flex-1 items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 backdrop-blur-sm md:flex-initial"
            onSubmit={(e) => {
                e.preventDefault()
                onSearchSubmit()
            }}
            >
            <span className="text-slate-500" aria-hidden>
                🔍
            </span>
            <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Город (например, Казань)"
                className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                aria-label="Поиск города"
            />
            <button
                type="submit"
                className="rounded-xl bg-orange-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-400"
            >
                Найти
            </button>
            </form>

            <button
                type="button"
                onClick={onToggleUnits}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
                title="Переключить °C / °F"
            >
                {useFahrenheit ? '°F' : '°C'}
            </button>
        </div>

        <nav className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 pb-3 md:px-6">
            {TABS.map((t) => {
            const isActive =
                activeTab === t.id ||
                (t.id === 'dashboard' && activeTab === 'hourly')
            return (
            <button
                key={t.id}
                type="button"
                onClick={() => onTab(t.id)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
                isActive
                    ? 'bg-white/15 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
            >
                {t.label}
            </button>
            )
            })}
        </nav>
        </header>
    )
}
