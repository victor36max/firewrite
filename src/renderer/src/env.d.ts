/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_AZURE_API_KEY: string
  readonly PUBLIC_AZURE_RESOURCE_NAME: string
  readonly PUBLIC_AZURE_API_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
