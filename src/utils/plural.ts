/**
 * Ukrainian plural form picker (rule-of-three: 1 / 2-4 / 5+).
 * Pass the three word forms in the order `[one, few, many]`, e.g.
 * `pluralUk(n, ['проект', 'проекти', 'проектів'])`. Case (nominative,
 * instrumental, …) is the caller's choice — only the picker is shared.
 */
export function pluralUk(
  n: number,
  forms: readonly [one: string, few: string, many: string],
): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1]
  return forms[2]
}
