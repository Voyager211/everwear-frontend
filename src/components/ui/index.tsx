import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { CloseIcon, LongArrow, StarIcon } from './icons'
import { useEscape, useLockBodyScroll } from '../../lib/hooks'
import { formatRating, starFill } from '../../lib/format'

/** Full-width row: caps label left, arrow (or custom controls) flush right. */
export function SectionHeaderRow({
  label,
  href,
  controls,
}: {
  label: string
  href?: string
  controls?: ReactNode
}) {
  const inner = (
    <>
      <span className="section-head__label">{label}</span>
      {controls ?? <LongArrow className="arrow" />}
    </>
  )
  return href ? (
    <Link to={href} className="section-head">
      {inner}
    </Link>
  ) : (
    <div className="section-head">{inner}</div>
  )
}

export function StarRating({ average, size = 16 }: { average: number; size?: number }) {
  return (
    <span className="stars" aria-label={`Rated ${formatRating(average)} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon key={i} size={size} fill={starFill(average, i) as 'full' | 'half' | 'empty'} />
      ))}
      <span style={{ fontSize: 'var(--fs-nav)' }}>{formatRating(average)}</span>
    </span>
  )
}

/** Square indicators — the design never uses circles. */
export function SquareDots({ count, active }: { count: number; active: number }) {
  if (count <= 1) return null
  return (
    <div className="dots">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`dots__dot${i === active ? ' dots__dot--on' : ''}`} />
      ))}
    </div>
  )
}

export function Accordion({
  items,
  initialOpen,
}: {
  items: { title: string; content: ReactNode }[]
  initialOpen?: number
}) {
  const [open, setOpen] = useState<number | null>(initialOpen ?? null)
  return (
    <div>
      {items.map((item, i) => (
        <div className="accordion__row" key={item.title}>
          <button
            type="button"
            className="accordion__trigger"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.title}
            <span className={`accordion__sign${open === i ? ' accordion__sign--open' : ''}`} />
          </button>
          {open === i && <div className="accordion__panel">{item.content}</div>}
        </div>
      ))}
    </div>
  )
}

function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body)
}

export function Drawer({
  open,
  onClose,
  title,
  side = 'right',
  footer,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  side?: 'left' | 'right'
  footer?: ReactNode
  children: ReactNode
}) {
  useLockBodyScroll(open)
  useEscape(open, onClose)
  if (!open) return null
  return (
    <Portal>
      <div className="overlay" onClick={onClose} />
      <aside
        className={`drawer${side === 'left' ? ' drawer--left' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="drawer__head">
          <span className="drawer__title">{title}</span>
          <button type="button" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__foot">{footer}</div>}
      </aside>
    </Portal>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  useLockBodyScroll(open)
  useEscape(open, onClose)
  if (!open) return null
  return (
    <Portal>
      <div className="overlay" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer__head">
          <span className="drawer__title">{title}</span>
          <button type="button" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div style={{ padding: 'var(--s-5)' }}>{children}</div>
      </div>
    </Portal>
  )
}
