import { LlmProvider } from '@renderer/services/ai'
import { encryptedKeyValueStore, keyValueStore } from '@renderer/services/idb'
import { isElectron } from '@renderer/utils'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type SettingsStore = {
  llmProvider: LlmProvider | null
  setLlmProvider: (provider: LlmProvider | null) => void
  llmConfig: Record<LlmProvider, unknown>
  setLlmConfig: (provider: LlmProvider, config: unknown | undefined) => void
  tavilyApiKey: string | null
  setTavilyApiKey: (key: string | null) => void
  folderSortMode: 'updated' | 'alpha'
  setFolderSortMode: (mode: 'updated' | 'alpha') => void
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
      setTavilyApiKey: (key) => set({ tavilyApiKey: key }),
      folderSortMode: 'updated',
      setFolderSortMode: (mode) => set({ folderSortMode: mode })
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => (isElectron() ? encryptedKeyValueStore : keyValueStore))
    }
  )
)

export const selectIfLlmConfigured = (store: SettingsStore) => {
  return store.llmProvider && store.llmConfig[store.llmProvider]
}
