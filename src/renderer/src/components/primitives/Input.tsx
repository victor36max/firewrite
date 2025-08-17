import { cn } from '@renderer/utils'
import { Input as AriaInput, InputProps as AriaInputProps } from 'react-aria-components'
import { forwardRef } from 'react'

export const Input = forwardRef<HTMLInputElement, AriaInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <AriaInput
        ref={ref}
        className={cn(
          'p-2 border border-muted rounded-lg caret-primary outline-primary placeholder:text-muted-foreground',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
