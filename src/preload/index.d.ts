import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      encryptString: (plainText: string) => Promise<string>
      decryptString: (encryptedBase64: string) => Promise<string>
      getTheme: () => Promise<string>
      setTheme: (theme: 'system' | 'light' | 'dark') => Promise<void>
    }
  }
}
