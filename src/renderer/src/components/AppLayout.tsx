import { useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { DraggableHandle } from './DraggableHandle'
import { useSettingsStore } from '@renderer/hooks/stores/useSettingsStore'

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
  const leftSideBarRef = useRef<HTMLDivElement>(null)
  const rightSideBarRef = useRef<HTMLDivElement>(null)
  const [isShowLeftSideBar, setIsShowLeftSideBar] = useState(true)
  const [isShowRightSideBar, setIsShowRightSideBar] = useState(true)
  const leftSidebarWidth = useSettingsStore((store) => store.leftSidebarWidth)
  const setLeftSidebarWidth = useSettingsStore((store) => store.setLeftSidebarWidth)
  const rightSidebarWidth = useSettingsStore((store) => store.rightSidebarWidth)
  const setRightSidebarWidth = useSettingsStore((store) => store.setRightSidebarWidth)

  useHotkeys(
    ['ctrl+shift+backslash', 'meta+shift+backslash'],
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsShowRightSideBar(!isShowRightSideBar)
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: ['input', 'textarea']
    },
    [isShowRightSideBar]
  )

  useHotkeys(
    // Some keyboard libs normalize '\' as the named key 'backslash'.
    ['ctrl+backslash', 'meta+backslash'],
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsShowLeftSideBar(!isShowLeftSideBar)
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: ['input', 'textarea']
    },
    [isShowLeftSideBar]
  )

  return (
    <div className="flex flex-row w-screen h-screen">
      {isShowLeftSideBar && (
        <>
          <div
            ref={leftSideBarRef}
            className="sticky top-0 bottom-0 overflow-y-auto"
            style={{ width: leftSidebarWidth }}
          >
            {leftSideBar}
          </div>
          <DraggableHandle
            targetRef={leftSideBarRef}
            align="left"
            onWidthChange={setLeftSidebarWidth}
          />
        </>
      )}
      <div className="flex-1 h-full overflow-y-auto">{children}</div>
      {isShowRightSideBar && (
        <>
          <DraggableHandle
            targetRef={rightSideBarRef}
            align="right"
            onWidthChange={setRightSidebarWidth}
          />
          <div
            ref={rightSideBarRef}
            className="sticky top-0 bottom-0 overflow-y-auto"
            style={{ width: rightSidebarWidth }}
          >
            {rightSideBar}
          </div>
        </>
      )}
    </div>
  )
}
