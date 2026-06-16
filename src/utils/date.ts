/** Short Ukrainian date: "20 лист.". Returns the input if it isn't a valid ISO date. */
export function formatDateShort(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
}

/** Full Ukrainian date: "16.06.2026". Returns the input if it isn't a valid ISO date. */
export function formatDateLong(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('uk-UA')
}
