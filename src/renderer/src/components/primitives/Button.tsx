import { cn } from '@renderer/utils'
import { Button as AriaButton, ButtonProps as AriaButtonProps } from 'react-aria-components'
import { tv } from 'tailwind-variants'

interface ButtonProps extends AriaButtonProps {
  className?: string
  variant?: 'default' | 'primary' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
}

export const Button = ({
  className,
  variant = 'default',
  size = 'default',
  isDisabled,
  ...props
}: ButtonProps) => {
  const variants = tv({
    base: 'cursor-pointer whitespace-nowrap',
    variants: {
      variant: {
        default: 'hover:bg-primary/10',
        primary: 'bg-primary text-primary-foreground hover:brightness-90',
        secondary: 'border border-muted-foreground hover:bg-primary/10'
      },
      size: {
        default: 'px-3 py-2 text-sm font-medium rounded-md',
        sm: 'px-2 py-1 text-sm font-medium rounded-md',
        lg: 'px-4 py-3 text-base font-medium rounded-lg'
      }
    }
  })

  return (
    <AriaButton
      className={variants({
        variant,
        size,
        className: cn(isDisabled && 'opacity-50', className)
      })}
      isDisabled={isDisabled}
      {...props}
    />
  )
}
