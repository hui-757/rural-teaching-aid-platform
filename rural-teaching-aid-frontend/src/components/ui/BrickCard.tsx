import { cn } from '../../lib/utils'

interface BrickCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  accent?: 'brick' | 'ink' | 'gold' | 'stone'
  onClick?: () => void
  hover?: boolean
}

export function BrickCard({
  children,
  className,
  title,
  subtitle,
  accent = 'brick',
  onClick,
  hover = false,
}: BrickCardProps) {
  const accentColors = {
    brick: 'border-l-4 border-l-wall-brick',
    ink: 'border-l-4 border-l-wall-ink',
    gold: 'border-l-4 border-l-wall-gold',
    stone: 'border-l-4 border-l-wall-stone',
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-wall-paper border-2 border-wall-border rounded relative overflow-hidden brick-pattern',
        accentColors[accent],
        hover && 'cursor-pointer hover:border-wall-border-dark hover:shadow-lg transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      {/* Top decorative line */}
      <div className="h-1 bg-gradient-to-r from-wall-brick/20 via-wall-gold/20 to-wall-ink/20" />

      {(title || subtitle) && (
        <div className="px-5 pt-4 pb-2">
          {title && (
            <h3 className="font-serif text-lg text-wall-text font-semibold tracking-wider">{title}</h3>
          )}
          {subtitle && (
            <p className="text-wall-text-muted text-sm mt-1">{subtitle}</p>
          )}
        </div>
      )}

      <div className={cn('px-5 pb-5', !title && !subtitle && 'pt-5')}>{children}</div>

      {/* Bottom decorative corner */}
      <div className="absolute bottom-0 right-0 w-8 h-8 border-t-2 border-l-2 border-wall-border/30 rounded-tl-lg" />
    </div>
  )
}

export function ScrollPanel({ children, className, title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <div className={cn('bg-wall-paper border-y-2 border-wall-border-dark relative', className)}>
      {/* Top scroll bar decoration */}
      <div className="h-3 bg-wall-bg-deep border-b border-wall-border flex items-center justify-center">
        <div className="w-16 h-1 bg-wall-brick/30 rounded-full" />
      </div>

      {title && (
        <div className="px-6 pt-4 pb-2">
          <h3 className="font-serif text-lg text-wall-text font-semibold tracking-wider">{title}</h3>
        </div>
      )}

      <div className="px-6 py-4">{children}</div>

      {/* Bottom scroll bar decoration */}
      <div className="h-3 bg-wall-bg-deep border-t border-wall-border flex items-center justify-center">
        <div className="w-16 h-1 bg-wall-brick/30 rounded-full" />
      </div>
    </div>
  )
}

export function GreatWallDivider({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 py-4', className)}>
      <div className="flex-1 h-px bg-wall-border-dark" />
      <div className="w-2 h-2 bg-wall-brick rotate-45" />
      <div className="w-2 h-2 bg-wall-gold rotate-45" />
      <div className="w-2 h-2 bg-wall-ink rotate-45" />
      <div className="flex-1 h-px bg-wall-border-dark" />
    </div>
  )
}
