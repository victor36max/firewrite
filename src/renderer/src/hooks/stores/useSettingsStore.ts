import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
      storage: createJSONStorage(() => localStorage)
    }
  )
)
