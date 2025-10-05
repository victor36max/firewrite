import { isElectron } from '@renderer/utils'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const encryptedLocalStorage = {
  getItem: (key) => {
    const encryptedValue = localStorage.getItem(key)
    if (!encryptedValue) {
      return null
    }
    return window.api.decryptString(encryptedValue)
  },
  setItem: async (key, value) => {
    const encryptedValue = await window.api.encryptString(value)
    localStorage.setItem(key, encryptedValue)
  },
  removeItem: (key) => {
    localStorage.removeItem(key)
  }
}

export const useSettingsStore = create<{
  azureApiKey: string | null
  setAzureApiKey: (key: string | null) => void
  azureResourceName: string | null
  setAzureResourceName: (name: string | null) => void
  tavilyApiKey: string | null
  setTavilyApiKey: (key: string | null) => void
}>()(
  persist(
    (set) => ({
      azureApiKey: null,
      setAzureApiKey: (key) => set({ azureApiKey: key }),
      azureResourceName: null,
      setAzureResourceName: (name) => set({ azureResourceName: name }),
      tavilyApiKey: null,
      setTavilyApiKey: (key) => set({ tavilyApiKey: key })
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => (isElectron() ? encryptedLocalStorage : localStorage))
    }
  )
)
