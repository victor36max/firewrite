import { cn } from '@renderer/utils'
import { Label as AriaLabel, LabelProps as AriaLabelProps } from 'react-aria-components'
import { forwardRef } from 'react'

export const Label = forwardRef<HTMLLabelElement, AriaLabelProps>(
  ({ className, ...props }, ref) => {
    return <AriaLabel ref={ref} className={cn('text-sm font-medium', className)} {...props} />
  }
)

Label.displayName = 'Label'
