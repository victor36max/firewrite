import { useContext } from 'react'
import { ToastContext } from '@renderer/contexts/ToastContext'

export const useToast = () => {
  return useContext(ToastContext)
}
