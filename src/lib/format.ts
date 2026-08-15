/**
 * The reference site is inconsistent: cards render "Rs.1,499.00" (no space) while the PDP
 * renders "Rs. 2,999.00" (with one). Reproduced faithfully via the `spaced` option — flip
 * SPACED_EVERYWHERE to true if the client prefers one consistent form.
 */
const SPACED_EVERYWHERE = false

const group = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function formatPrice(amount: number, opts: { spaced?: boolean } = {}) {
  const spaced = SPACED_EVERYWHERE || opts.spaced
  return `Rs.${spaced ? ' ' : ''}${group(amount)}`
}

export function unitPrice(amount: number, packSize: number) {
  return amount / packSize
}

export function formatUnitPrice(amount: number, packSize: number, opts: { spaced?: boolean } = {}) {
  return `${formatPrice(unitPrice(amount, packSize), opts)}/pc`
}

/** "10 pcs" — the piece count half of the pack line. */
export function formatPieces(packSize: number) {
  return `${packSize} pcs`
}

export function formatRating(average: number) {
  return average.toFixed(1)
}

/** Rounds to the nearest half star, as the reference does (4.7 → 4.5 stars). */
export function starFill(average: number, index: number) {
  const rounded = Math.round(average * 2) / 2
  if (rounded >= index + 1) return 'full'
  if (rounded >= index + 0.5) return 'half'
  return 'empty'
}
