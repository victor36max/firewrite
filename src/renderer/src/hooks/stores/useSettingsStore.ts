import { LlmProvider } from '@renderer/services/ai'
import { encryptedKeyValueStore, keyValueStore } from '@renderer/services/idb'
import { ColorTheme, Theme } from '@renderer/types'
import { isElectron } from '@renderer/utils'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type SettingsStore = {
  theme: Theme
  setTheme: (theme: Theme) => void
  llmProvider: LlmProvider | null
  setLlmProvider: (provider: LlmProvider | null) => void
  llmConfig: Record<LlmProvider, unknown>
  setLlmConfig: (provider: LlmProvider, config: unknown | undefined) => void
  tavilyApiKey: string | null
  setTavilyApiKey: (key: string | null) => void
  folderSortMode: 'updated' | 'alpha'
  setFolderSortMode: (mode: 'updated' | 'alpha') => void
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
  isAutocompleteEnabled: boolean
  setAutocompleteEnabled: (isEnabled: boolean) => void
  leftSidebarWidth: number
  setLeftSidebarWidth: (width: number) => void
  rightSidebarWidth: number
  setRightSidebarWidth: (width: number) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      llmProvider: null,
      setLlmProvider: (provider) => set({ llmProvider: provider }),
      llmConfig: {} as Record<LlmProvider, unknown>,
      setLlmConfig: (provider, config) =>
        set(({ llmConfig }) => ({ llmConfig: { ...llmConfig, [provider]: config } })),
      tavilyApiKey: null,
      setTavilyApiKey: (key) => set({ tavilyApiKey: key }),
      folderSortMode: 'updated',
      setFolderSortMode: (mode) => set({ folderSortMode: mode }),
      colorTheme: 'ember',
      setColorTheme: (theme) => set({ colorTheme: theme }),
      isAutocompleteEnabled: true,
      setAutocompleteEnabled: (isEnabled) => set({ isAutocompleteEnabled: isEnabled }),
      leftSidebarWidth: 250,
      setLeftSidebarWidth: (width) => set({ leftSidebarWidth: width }),
      rightSidebarWidth: 250,
      setRightSidebarWidth: (width) => set({ rightSidebarWidth: width })
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
