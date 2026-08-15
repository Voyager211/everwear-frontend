type IconProps = { size?: number; className?: string }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export const SearchIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </svg>
)

export const AccountIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20c1.2-3.7 4-5.6 7.5-5.6s6.3 1.9 7.5 5.6" />
  </svg>
)

export const HeartIcon = ({ size = 22, className, filled = false }: IconProps & { filled?: boolean }) => (
  <svg {...base(size)} className={className} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20.5C6.5 16.8 3.5 13.9 3.5 10.3A4.3 4.3 0 0 1 12 8.2a4.3 4.3 0 0 1 8.5 2.1c0 3.6-3 6.5-8.5 10.2Z" />
  </svg>
)

export const BagIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M5 7.5h14l-1 12.5H6L5 7.5Z" />
    <path d="M9 9.5V6.8a3 3 0 0 1 6 0V9.5" />
  </svg>
)

export const FilterIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 7h11M18 7h3M3 17h3M10 17h11" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </svg>
)

export const CloseIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="m5 5 14 14M19 5 5 19" />
  </svg>
)

export const MenuIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 6.5h18M3 12h18M3 17.5h18" />
  </svg>
)

export const ChevronLeft = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="m15 4.5-7 7.5 7 7.5" />
  </svg>
)

export const ChevronRight = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="m9 4.5 7 7.5-7 7.5" />
  </svg>
)

/** The long thin arrow used as the CTA affordance across the home page. */
export const LongArrow = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 34 12"
    width="34"
    height="12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    className={className}
    aria-hidden
  >
    <path d="M0 6h32M26 1l6 5-6 5" />
  </svg>
)

export const StarIcon = ({
  size = 16,
  fill = 'full',
}: {
  size?: number
  fill?: 'full' | 'half' | 'empty'
}) => {
  const id = `half-${Math.round(size)}`
  const d =
    'M12 2.6l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.6 6.6 19.5l1-6.1L3.2 9.1l6.1-.9L12 2.6Z'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {fill === 'half' && (
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <path
        d={d}
        fill={fill === 'full' ? 'currentColor' : fill === 'half' ? `url(#${id})` : 'none'}
        stroke="currentColor"
        strokeWidth={1.2}
      />
    </svg>
  )
}

const socialPaths: Record<string, string> = {
  Instagram:
    'M12 2.2c-2.7 0-3 0-4.1.1-1 0-1.7.2-2.4.5-.6.2-1.2.6-1.7 1.1s-.9 1.1-1.1 1.7c-.3.7-.4 1.4-.5 2.4-.1 1.1-.1 1.4-.1 4.1s0 3 .1 4.1c0 1 .2 1.7.5 2.4.2.6.6 1.2 1.1 1.7s1.1.9 1.7 1.1c.7.3 1.4.4 2.4.5 1.1.1 1.4.1 4.1.1s3 0 4.1-.1c1 0 1.7-.2 2.4-.5.6-.2 1.2-.6 1.7-1.1s.9-1.1 1.1-1.7c.3-.7.4-1.4.5-2.4.1-1.1.1-1.4.1-4.1s0-3-.1-4.1c0-1-.2-1.7-.5-2.4-.2-.6-.6-1.2-1.1-1.7s-1.1-.9-1.7-1.1c-.7-.3-1.4-.4-2.4-.5-1.1-.1-1.4-.1-4.1-.1Zm0 1.8c2.7 0 3 0 4 .1.9 0 1.4.2 1.8.3.4.2.8.4 1.1.7.3.3.5.6.7 1.1.1.4.3.9.3 1.8.1 1 .1 1.3.1 4s0 3-.1 4c0 .9-.2 1.4-.3 1.8-.2.4-.4.8-.7 1.1-.3.3-.6.5-1.1.7-.4.1-.9.3-1.8.3-1 .1-1.3.1-4 .1s-3 0-4-.1c-.9 0-1.4-.2-1.8-.3-.4-.2-.8-.4-1.1-.7-.3-.3-.5-.6-.7-1.1-.1-.4-.3-.9-.3-1.8-.1-1-.1-1.3-.1-4s0-3 .1-4c0-.9.2-1.4.3-1.8.2-.4.4-.8.7-1.1.3-.3.6-.5 1.1-.7.4-.1.9-.3 1.8-.3 1-.1 1.3-.1 4-.1Zm0 3.1a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8Zm0 8.1a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm6.3-8.3a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z',
  YouTube:
    'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8A26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8l5.5 3.2-5.5 3.2Z',
  Pinterest: 'M12 2.8a9.2 9.2 0 0 0-3.4 17.7c-.1-.8-.1-2 .1-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.9 1.5 1.9 1.9 0 3.2-2.4 3.2-5.2 0-2.2-1.5-3.8-4.1-3.8-3 0-4.8 2.2-4.8 4.6 0 .9.3 1.5.7 2 .2.2.2.3.1.6l-.2.8c-.1.3-.3.4-.6.2-1.2-.5-1.8-1.9-1.8-3.6 0-2.7 2.3-5.9 6.8-5.9 3.6 0 6 2.6 6 5.4 0 3.7-2.1 6.5-5.1 6.5-1 0-2-.6-2.3-1.2l-.7 2.6c-.2.8-.7 1.7-1.1 2.3A9.2 9.2 0 1 0 12 2.8Z',
  X: 'M3 3h4.3l4.6 6.2L17.4 3H21l-6.9 7.9L21.4 21H17l-5-6.7L6.2 21H2.6l7.3-8.3L3 3Z',
  Facebook:
    'M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.4V13h2.7v8h3.4Z',
}

export const SocialIcon = ({ name, size = 22 }: { name: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="currentColor">
    {/* evenodd so the play triangle and lens knock through their outer shapes */}
    <path d={socialPaths[name] ?? socialPaths.Instagram} fillRule="evenodd" clipRule="evenodd" />
  </svg>
)
