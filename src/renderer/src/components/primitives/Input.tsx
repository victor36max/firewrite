import { cn } from '@renderer/utils'
import { Input as AriaInput, InputProps as AriaInputProps } from 'react-aria-components'
import { forwardRef } from 'react'

interface InputProps extends AriaInputProps {
  isError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, isError, ...props }, ref) => {
    return (
      <AriaInput
        ref={ref}
        className={cn(
          'w-full p-2 border border-muted rounded-lg caret-primary outline-primary placeholder:text-muted-foreground',
          isError && 'border-destructive',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
