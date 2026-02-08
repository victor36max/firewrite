import { Select } from '../primitives/Select'
import { trackEvent } from '@renderer/services/tracking'
import { ColorTheme, Theme } from '@renderer/types'
import { useSettingsStore } from '@renderer/hooks/stores/useSettingsStore'
import { LuMonitor, LuMoon, LuSun } from 'react-icons/lu'

export const AppearanceSettingsPanel = () => {
  const theme = useSettingsStore((store) => store.theme)
  const setTheme = useSettingsStore((store) => store.setTheme)
  const folderSortMode = useSettingsStore((store) => store.folderSortMode)
  const setFolderSortMode = useSettingsStore((store) => store.setFolderSortMode)
  const colorTheme = useSettingsStore((store) => store.colorTheme)
  const setColorTheme = useSettingsStore((store) => store.setColorTheme)

  const colorThemeHex: Record<ColorTheme, string> = {
    ember: '#b85a44',
    ocean: '#0077b6',
    forest: '#1f7a72',
    violet: '#6d28d9',
    rose: '#c84b6b'
  }

  const ColorSwatch = ({ theme }: { theme: ColorTheme }) => {
    return (
      <span
        className="w-3 h-3 rounded-full border border-muted shrink-0"
        style={{ backgroundColor: colorThemeHex[theme] }}
      />
    )
  }

  return (
    <div className="p-4 w-full">
      <div className="flex flex-col gap-4">
        <div className="border border-muted rounded-lg p-4 space-y-4">
          <div className="font-semibold">Theme</div>
          <Select
            name="theme"
            selectedKey={theme}
            aria-label="Theme"
            onSelectionChange={(key) => {
              if (!key) return
              const next = key as Theme
              trackEvent('theme-updated', { theme: next })
              setTheme(next)
            }}
            items={[
              {
                label: 'System',
                value: 'system',
                icon: <LuMonitor className="w-4 h-4 text-muted-foreground" />
              },
              {
                label: 'Light',
                value: 'light',
                icon: <LuSun className="w-4 h-4 text-muted-foreground" />
              },
              {
                label: 'Dark',
                value: 'dark',
                icon: <LuMoon className="w-4 h-4 text-muted-foreground" />
              }
            ]}
          />
        </div>

        <div className="border border-muted rounded-lg p-4 space-y-4">
          <div className="font-semibold">Color Palette</div>
          <Select
            name="colorPalette"
            selectedKey={colorTheme}
            aria-label="Color palette"
            onSelectionChange={(key) => {
              if (!key) return
              const next = key as ColorTheme
              trackEvent('color-palette-updated', { theme: next })
              setColorTheme(next)
            }}
            items={[
              { label: 'Ember', value: 'ember', icon: <ColorSwatch theme="ember" /> },
              { label: 'Ocean', value: 'ocean', icon: <ColorSwatch theme="ocean" /> },
              { label: 'Forest', value: 'forest', icon: <ColorSwatch theme="forest" /> },
              { label: 'Violet', value: 'violet', icon: <ColorSwatch theme="violet" /> },
              { label: 'Rose', value: 'rose', icon: <ColorSwatch theme="rose" /> }
            ]}
          />
        </div>

        <div className="border border-muted rounded-lg p-4 space-y-4">
          <div className="font-semibold">Folders</div>
          <Select
            name="folderSortMode"
            selectedKey={folderSortMode}
            aria-label="Folder sort order"
            onSelectionChange={(key) => {
              if (!key) return
              const mode = key as 'updated' | 'alpha'
              setFolderSortMode(mode)
            }}
            items={[
              { label: 'Sort by: Last updated', value: 'updated' },
              { label: 'Sort by: Alphabetical', value: 'alpha' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
