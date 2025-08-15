import { cn } from '@renderer/utils'
import { useEffect, useState } from 'react'

interface LoadingTextProps {
  className?: string
  text: string
}

export const LoadingText = ({ text, className }: LoadingTextProps) => {
  const [totalDots, setTotalDots] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalDots((prev) => prev + 1)
    }, 250)

    return () => clearInterval(interval)
  }, [])
  return (
    <span className={cn('animate-pulse text-muted-foreground', className)}>
      <i>
        {text}
        {'.'.repeat(totalDots % 4)}
      </i>
    </span>
  )
}
