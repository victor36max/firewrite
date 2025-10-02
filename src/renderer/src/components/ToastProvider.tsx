import { ToastContent, ToastContext } from '@renderer/contexts/ToastContext'
import { cn } from '@renderer/utils'
import toast, { Toast, Toaster } from 'react-hot-toast'
import { LuCheck, LuInfo, LuX } from 'react-icons/lu'
import { IconButton } from './primitives/IconButton'
import { useEffect, useState } from 'react'

const CustomToast = ({ t, content }: { t: Toast; content: ToastContent }) => {
  const [shouldShow, setShouldShow] = useState(false)

  // We need to wait for the toast to be visible before we can set the opacity to 100
  useEffect(() => {
    setShouldShow(t.visible)
  }, [t.visible])

  return (
    <div
      className={cn(
        'transition-opacity duration-200',
        t.visible && shouldShow ? 'opacity-100' : 'opacity-0',
        'bg-background rounded-lg border border-muted p-4 min-w-[250px]'
      )}
    >
      <IconButton
        className="absolute top-2 right-2"
        aria-label="Close"
        Icon={LuX}
        variant="default"
        size="sm"
        onClick={() => toast.dismiss(t.id)}
      />
      <div className="flex flex-row gap-2">
        <div className="mt-1">
          {content.variant === 'success' && <LuCheck className="text-success" />}
          {content.variant === 'error' && <LuX className="text-destructive" />}
          {content.variant === 'info' && <LuInfo className="text-info" />}
        </div>
        <div className="flex flex-col gap-1">
          <div className="font-semibold">{content.title}</div>
          {content.description && (
            <div className="text-sm text-muted-foreground">{content.description}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const showToast = (content: ToastContent) => {
    toast.custom((t) => <CustomToast t={t} content={content} />, {
      position: 'top-right',
      duration: 5000
    })
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toaster />
      {children}
    </ToastContext.Provider>
  )
}
