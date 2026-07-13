import { cn } from '../../lib/utils'

interface SealButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function SealButton({
  variant = 'solid',
  size = 'md',
  className,
  children,
  ...props
}: SealButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-serif font-bold tracking-wider transition-all duration-200 rounded border-2'

  const variantClasses = {
    solid: 'bg-wall-brick text-wall-paper border-wall-brick-dark hover:bg-wall-brick-dark shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
    outline: 'bg-transparent text-wall-brick border-wall-brick hover:bg-wall-brick hover:text-wall-paper',
    gold: 'bg-wall-gold text-wall-paper border-wall-gold-light hover:bg-wall-gold-light shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
  }

  const sizeClasses = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function SealBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center justify-center px-3 py-1 bg-wall-brick/10 text-wall-brick-dark font-serif text-sm border border-wall-brick/30 rounded',
      className
    )}>
      {children}
    </span>
  )
}

export function GoldBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center justify-center px-3 py-1 bg-wall-gold/10 text-wall-gold font-serif text-sm border border-wall-gold/30 rounded',
      className
    )}>
      {children}
    </span>
  )
}
