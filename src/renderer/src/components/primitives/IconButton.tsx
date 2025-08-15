import { Button, ButtonProps } from 'react-aria-components'
import { LucideIcon } from 'lucide-react'
import { tv } from 'tailwind-variants'

interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  className?: string
  Icon: LucideIcon
  variant?: 'default' | 'primary' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
}

export const IconButton = ({
  className,
  Icon,
  variant = 'default',
  size = 'default',
  ...props
}: IconButtonProps) => {
  const variants = tv({
    slots: {
      button:
        'flex items-center justify-center rounded-md cursor-pointer hover:brightness-95 outline-primary',
      icon: ''
    },
    variants: {
      variant: {
        default: {
          button: 'bg-background',
          icon: 'text-foreground'
        },
        primary: {
          button: 'bg-primary text-primary-foreground',
          icon: 'text-primary-foreground'
        },
        secondary: {
          button: 'border border-muted bg-background',
          icon: 'text-foreground'
        }
      },
      size: {
        default: {
          button: 'w-8 h-8 ',
          icon: 'w-6 h-6'
        },
        sm: {
          button: 'w-6 h-6',
          icon: 'w-4 h-4'
        },
        lg: {
          button: 'w-10 h-10',
          icon: 'w-6 h-6'
        }
      }
    }
  })

  const { button, icon } = variants({ variant, size })
  return (
    <Button type="button" className={button({ className })} {...props}>
      <Icon strokeWidth={1.25} className={icon()} />
    </Button>
  )
}
