import { useEffect, useRef, useState } from 'react'

/**
 * Counts down `durationMs` from mount. Takes a duration rather than a deadline so the clock is
 * never read during render, and the initial state is exact without reading it at all.
 *
 * Ticks once a minute: the label has minute resolution, so a per-second interval would re-render
 * sixty times to display the same string.
 */
export function useCountdown(durationMs: number) {
  const [remaining, setRemaining] = useState(durationMs)

  useEffect(() => {
    const deadline = Date.now() + durationMs
    const id = setInterval(() => setRemaining(Math.max(0, deadline - Date.now())), 60_000)
    return () => clearInterval(id)
  }, [durationMs])

  const minutes = Math.floor(remaining / 60_000)
  const pad = (n: number) => String(n).padStart(2, '0')

  return {
    expired: remaining <= 0,
    label: `${pad(Math.floor(minutes / 1440))}d ${pad(Math.floor((minutes % 1440) / 60))}h ${pad(
      minutes % 60,
    )}m`,
  }
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [locked])
}

/** Escape-to-close, shared by every overlay. */
export function useEscape(active: boolean, onEscape: () => void) {
  const handler = useRef(onEscape)
  useEffect(() => {
    handler.current = onEscape
  })
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && handler.current()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])
}

/** True once the page has scrolled past `offset` — drives the condensed header. */
export function useScrolledPast(offset: number) {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > offset)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset])
  return past
}
