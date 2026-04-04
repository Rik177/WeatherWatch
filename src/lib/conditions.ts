export const conditionLabelRu: Record<string, string> = {
  clear: 'Ясно',
  'partly-cloudy': 'Малооблачно',
  cloudy: 'Облачно',
  overcast: 'Пасмурно',
  drizzle: 'Морось',
  'light-rain': 'Небольшой дождь',
  rain: 'Дождь',
  'moderate-rain': 'Умеренный дождь',
  'heavy-rain': 'Сильный дождь',
  'continuous-heavy-rain': 'Продолжительный сильный дождь',
  showers: 'Ливни',
  'wet-snow': 'Дождь со снегом',
  'light-snow': 'Небольшой снег',
  snow: 'Снег',
  'snow-showers': 'Снегопад',
  hail: 'Град',
  thunderstorm: 'Гроза',
  'thunderstorm-with-rain': 'Дождь с грозой',
  'thunderstorm-with-hail': 'Гроза с градом',
  'partly-cloudy-and-light-rain': 'Облачно, небольшой дождь',
  'partly-cloudy-and-rain': 'Облачно, дождь',
  'overcast-and-rain': 'Пасмурно, дождь',
  'overcast-thunderstorms-with-rain': 'Сильный дождь, гроза',
  'cloudy-and-light-rain': 'Облачно, небольшой дождь',
  'overcast-and-light-rain': 'Пасмурно, небольшой дождь',
  'cloudy-and-rain': 'Облачно, дождь',
  'overcast-and-wet-snow': 'Мокрый снег',
  'partly-cloudy-and-light-snow': 'Небольшой снег',
  'partly-cloudy-and-snow': 'Облачно, снег',
  'overcast-and-snow': 'Снегопад',
  'cloudy-and-light-snow': 'Облачно, небольшой снег',
  'overcast-and-light-snow': 'Пасмурно, небольшой снег',
  'cloudy-and-snow': 'Облачно, снег',
  fog: 'Туман',
  mist: 'Дымка',
}

export function labelCondition(code: string | undefined): string {
  if (!code) return '—'
  return conditionLabelRu[code] ?? code.replace(/-/g, ' ')
}

const windRu: Record<string, string> = {
  nw: 'СЗ',
  n: 'С',
  ne: 'СВ',
  e: 'В',
  se: 'ЮВ',
  s: 'Ю',
  sw: 'ЮЗ',
  w: 'З',
  c: 'штиль',
}

export function labelWindDir(dir: string | undefined): string {
  if (!dir) return ''
  return windRu[dir] ?? dir.toUpperCase()
}
