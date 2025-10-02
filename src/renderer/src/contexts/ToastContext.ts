import { createContext } from 'react'

export type ToastContent = {
  title: string
  description?: string
  variant: 'success' | 'error' | 'info'
}

export const ToastContext = createContext<{
  showToast: (content: ToastContent) => void
}>({
  showToast: () => {
    throw new Error('ToastContext not found')
  }
})
