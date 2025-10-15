import { LlmProvider } from '@renderer/services/ai'
import {
  deleteValueFromKeyValueStore,
  getValueFromKeyValueStore,
  setValueToKeyValueStore
} from '@renderer/services/idb'
import { isElectron } from '@renderer/utils'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const encryptedLocalStorage = {
  getItem: async (key) => {
    const encryptedValue = await getValueFromKeyValueStore<string>(key)
    if (!encryptedValue) {
      return null
    }
    return window.api.decryptString(encryptedValue)
  },
  setItem: async (key, value) => {
    const encryptedValue = await window.api.encryptString(value)
    await setValueToKeyValueStore(key, encryptedValue)
  },
  removeItem: async (key) => {
    await deleteValueFromKeyValueStore(key)
  }
}

type SettingsStore = {
  llmProvider: LlmProvider | null
  setLlmProvider: (provider: LlmProvider | null) => void
  llmConfig: Record<LlmProvider, unknown>
  setLlmConfig: (provider: LlmProvider, config: unknown | undefined) => void
  tavilyApiKey: string | null
  setTavilyApiKey: (key: string | null) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      llmProvider: null,
      setLlmProvider: (provider) => set({ llmProvider: provider }),
      llmConfig: {} as Record<LlmProvider, unknown>,
      setLlmConfig: (provider, config) =>
        set(({ llmConfig }) => ({ llmConfig: { ...llmConfig, [provider]: config } })),
      tavilyApiKey: null,
      setTavilyApiKey: (key) => set({ tavilyApiKey: key })
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => (isElectron() ? encryptedLocalStorage : localStorage))
    }
  )
)

export const selectIfLlmConfigured = (store: SettingsStore) => {
  return store.llmProvider && store.llmConfig[store.llmProvider]
}
