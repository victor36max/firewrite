/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly RENDERER_VITE_MIXPANEL_PROJECT_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
