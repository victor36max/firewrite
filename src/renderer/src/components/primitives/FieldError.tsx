import {
  FieldError as AriaFieldError,
  FieldErrorProps as AriaFieldErrorProps
} from 'react-aria-components'
import { forwardRef } from 'react'
import { cn } from '@renderer/utils'

interface FieldErrorProps extends AriaFieldErrorProps {
  className?: string
}

export const FieldError = forwardRef<HTMLDivElement, FieldErrorProps>(
  ({ className, ...props }, ref) => {
    return (
      <AriaFieldError ref={ref} className={cn('text-destructive text-sm', className)} {...props} />
    )
  }
)

FieldError.displayName = 'FieldError'
