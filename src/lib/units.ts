export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32)
}

export function msToMph(ms: number): number {
  return Math.round(ms * 2.236936)
}

export function formatTemp(c: number, useF: boolean): string {
  if (useF) return `${cToF(c)}°F`
  return `${Math.round(c)}°C`
}

export function formatTempPair(
  minC: number | undefined,
  maxC: number | undefined,
  useF: boolean,
): string {
  if (minC == null && maxC == null) return '—'
  if (minC != null && maxC != null) {
    return `${formatTemp(maxC, useF)} / ${formatTemp(minC, useF)}`
  }
  const v = minC ?? maxC ?? 0
  return formatTemp(v, useF)
}

export function precipPercent(strength: number | undefined): number {
  if (strength == null || Number.isNaN(strength)) return 0
  return Math.min(100, Math.round(strength * 100))
}
