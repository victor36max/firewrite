import { cn } from '@renderer/utils'
import { useEffect, useState } from 'react'

interface DraggableHandleProps {
  targetRef: React.RefObject<HTMLDivElement | null>
  align: 'left' | 'right'
}

export const DraggableHandle = ({ targetRef, align }: DraggableHandleProps) => {
  const [isHovering, setIsHovering] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (!isDragging) {
      return
    }

    const handleMouseMove = (e: MouseEvent): void => {
      e.preventDefault()
      e.stopPropagation()

      if (targetRef) {
        const target = targetRef.current
        if (!target) {
          return
        }

        const minWidth = 150
        const maxWidth = window.innerWidth - 640
        const newWidth =
          align === 'left'
            ? Math.min(maxWidth, Math.max(minWidth, e.clientX))
            : Math.min(maxWidth, Math.max(minWidth, window.innerWidth - e.clientX))
        target.style.width = `${newWidth}px`
      }
    }

    const handleMouseUp = (): void => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, targetRef])

  return (
    <div
      className={cn(
        'w-px h-screen bg-muted relative',
        (isHovering || isDragging) && 'bg-transparent'
      )}
    >
      <div
        className={cn(
          'absolute top-0 left-0 w-2 h-full cursor-col-resize -translate-x-1/2 hover:bg-primary/10 z-20',
          (isHovering || isDragging) && 'bg-primary/10 z-20'
        )}
        onMouseEnter={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsHovering(true)
        }}
        onMouseLeave={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsHovering(false)
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsDragging(true)
        }}
      />
    </div>
  )
}
