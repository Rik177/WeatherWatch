import type { CityBookmark } from '../types/weather'

const KEY = 'weatherwatch_bookmarks'

export function loadBookmarks(): CityBookmark[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CityBookmark[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveBookmarks(list: CityBookmark[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}
