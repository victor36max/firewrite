import { useCallback, useEffect, useState } from 'react'

interface AppLayoutProps {
  leftSideBar: React.JSX.Element
  rightSideBar: React.JSX.Element
  children: React.JSX.Element
}

export const AppLayout = ({
  leftSideBar,
  rightSideBar,
  children
}: AppLayoutProps): React.JSX.Element => {
  const [sideMenuWidth, setSideMenuWidth] = useState(300)
  const [chatWidth, setChatWidth] = useState(300)
  const [isDraggingSideMenuHandle, setIsDraggingSideMenuHandle] = useState(false)
  const [isDraggingChatHandle, setIsDraggingChatHandle] = useState(false)

  const renderSideMenuHandle = useCallback((): React.JSX.Element => {
    return (
      <div className="w-px h-screen bg-gray-200 relative">
        <div
          className="absolute top-0 left-0 w-4 h-full cursor-ew-resize -translate-x-1/2"
          onMouseDown={() => {
            setIsDraggingSideMenuHandle(true)
          }}
        />
      </div>
    )
  }, [setIsDraggingSideMenuHandle])

  const renderChatHandle = useCallback((): React.JSX.Element => {
    return (
      <div className="w-px h-screen bg-gray-200 relative">
        <div
          className="absolute top-0 left-0 w-4 h-full cursor-ew-resize -translate-x-1/2"
          onMouseDown={() => {
            setIsDraggingChatHandle(true)
          }}
        />
      </div>
    )
  }, [setIsDraggingChatHandle])

  useEffect(() => {
    if (!isDraggingSideMenuHandle) {
      return
    }

    const handleMouseMove = (e: MouseEvent): void => {
      const minWidth = 150
      const maxWidth = window.innerWidth - 640
      setSideMenuWidth(Math.min(maxWidth, Math.max(minWidth, e.clientX)))
    }

    const handleMouseUp = (): void => {
      setIsDraggingSideMenuHandle(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingSideMenuHandle])

  useEffect(() => {
    if (!isDraggingChatHandle) {
      return
    }

    const handleMouseMove = (e: MouseEvent): void => {
      const minWidth = 150
      const maxWidth = window.innerWidth - 640
      setChatWidth(Math.min(maxWidth, Math.max(minWidth, window.innerWidth - e.clientX)))
    }

    const handleMouseUp = (): void => {
      setIsDraggingChatHandle(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingChatHandle])

  return (
    <div className="flex flex-row w-screen h-screen">
      <div
        style={{
          width: `${sideMenuWidth}px`
        }}
        className="sticky top-0 bottom-0 overflow-y-auto"
      >
        {leftSideBar}
      </div>
      {renderSideMenuHandle()}
      <div className="flex-1 h-full overflow-y-auto">{children}</div>
      {renderChatHandle()}
      <div
        style={{
          width: `${chatWidth}px`
        }}
        className="sticky top-0 bottom-0 overflow-y-auto"
      >
        {rightSideBar}
      </div>
    </div>
  )
}
