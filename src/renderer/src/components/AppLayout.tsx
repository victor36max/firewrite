import { useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { DraggableHandle } from './DraggableHandle'

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

  useHotkeys(
    ['ctrl+l', 'meta+l'],
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsShowRightSideBar(!isShowRightSideBar)
    },
    {
      enableOnContentEditable: true
    },
    [isShowRightSideBar]
  )

  useHotkeys(
    ['ctrl+b', 'meta+b'],
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsShowLeftSideBar(!isShowLeftSideBar)
    },
    {
      enableOnContentEditable: true
    },
    [isShowLeftSideBar]
  )

  return (
    <div className="flex flex-row w-screen h-screen">
      {isShowLeftSideBar && (
        <>
          <div ref={leftSideBarRef} className="sticky top-0 bottom-0 overflow-y-auto w-[300px]">
            {leftSideBar}
          </div>
          <DraggableHandle targetRef={leftSideBarRef} align="left" />
        </>
      )}
      <div className="flex-1 h-full overflow-y-auto">{children}</div>
      {isShowRightSideBar && (
        <>
          <DraggableHandle targetRef={rightSideBarRef} align="right" />
          <div ref={rightSideBarRef} className="sticky top-0 bottom-0 overflow-y-auto w-[300px]">
            {rightSideBar}
          </div>
        </>
      )}
    </div>
  )
}
