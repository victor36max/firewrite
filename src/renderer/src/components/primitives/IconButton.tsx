import { Button, ButtonProps } from 'react-aria-components'
import { IconBaseProps, IconType } from 'react-icons'
import { tv } from 'tailwind-variants'

interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  className?: string
  iconClassName?: string
  Icon: IconType
  variant?: 'default' | 'primary' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  iconProps?: IconBaseProps
}

export const IconButton = ({
  className,
  iconClassName,
  Icon,
  variant = 'default',
  size = 'default',
  iconProps,
  ...props
}: IconButtonProps) => {
  const variants = tv({
    slots: {
      button: 'flex items-center justify-center rounded-md cursor-pointer outline-primary',
      icon: ''
    },
    variants: {
      variant: {
        default: {
          button: 'bg-background hover:bg-muted-light',
          icon: 'text-foreground'
        },
        primary: {
          button: 'bg-primary text-primary-foreground hover:bg-primary-dark',
          icon: 'text-primary-foreground'
        },
        secondary: {
          button: 'border border-muted bg-background hover:bg-muted-light',
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
      <Icon strokeWidth={1.25} className={icon({ className: iconClassName })} {...iconProps} />
    </Button>
  )
}
