import { beforeEach, describe, expect, it } from 'vitest'
import { loadBookmarks, saveBookmarks } from './bookmarksStorage'
import type { CityBookmark } from '../types/weather'

describe('bookmarksStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('UC8: сохраняет и загружает закладки городов', () => {
    const list: CityBookmark[] = [
      { id: '1', name: 'Казань', lat: 55.79, lon: 49.12 },
    ]
    saveBookmarks(list)
    expect(loadBookmarks()).toEqual(list)
  })
})
