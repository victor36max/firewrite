import { LuSettings, LuX } from 'react-icons/lu'
import {
  Dialog,
  DialogTrigger,
  Modal,
  Heading,
  ModalOverlay,
  GridListItem,
  GridList
} from 'react-aria-components'
import { IconButton } from '../primitives/IconButton'
import { cn } from '@renderer/utils'
import { useEffect, useState } from 'react'
import { LlmSettingsPanel } from './LlmSettingsPanel'
import { ToolsSettingsPanel } from './ToolsSettingsPanel'
import { AppearanceSettingsPanel } from './AppearanceSettingsPanel'
import { ShortcutsSettingsPanel } from './ShortcutsSettingsPanel'
import { EditorSettingsPanel } from './EditorSettingsPanel'
import { usePlatformQuery } from '@renderer/hooks/queries/usePlatformQuery'
import { useHotkeys } from 'react-hotkeys-hook'

const SettingCategoryMenuItem = ({ id, title }: { id: string; title: string }) => {
  return (
    <GridListItem
      aria-label={title}
      id={id}
      key={id}
      className={({ isSelected, isFocused, isHovered }) =>
        cn(
          'w-full py-2 px-4 text-left cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap outline-none',

          isHovered && 'bg-muted-light',
          isFocused && 'bg-muted-light',
          isSelected && 'bg-primary/10 font-medium'
        )
      }
    >
      {title}
    </GridListItem>
  )
}

export const SettingsDialog = () => {
  const { data: platform } = usePlatformQuery()
  const [settingCategoryId, setSettingCategoryId] = useState<string>('llm')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (platform !== 'darwin') {
      return
    }

    // On macOS, the Settings menu item is in the main menu, so we rely on its shortcut to open the settings dialog
    const handler = () => {
      setIsOpen(true)
    }
    const removeListener = window.electron.ipcRenderer.on('open-settings', handler)

    return () => {
      removeListener()
    }
  }, [platform])

  useHotkeys(
    ['ctrl+comma', 'meta+comma'],
    () => {
      // On macOS, the Settings menu item is in the main menu, so we rely on its shortcut to open the settings dialog
      if (platform === 'darwin') {
        return
      }
      setIsOpen(true)
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: ['input', 'textarea']
    },
    [setIsOpen, platform]
  )
  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <IconButton Icon={LuSettings} />
      <ModalOverlay
        isDismissable
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      >
        <Modal className="w-full max-w-screen-lg p-4">
          <Dialog className="bg-background rounded-lg border border-muted flex flex-col outline-none">
            <div className="flex flex-row justify-between items-center p-4 border-b border-muted">
              <Heading slot="title" className="text-lg font-semibold">
                Settings
              </Heading>
              <IconButton slot="close" Icon={LuX} />
            </div>
            <div className="flex flex-row flex-1 max-h-[50vh] min-h-[50vh]">
              <GridList
                className="outline-none w-48"
                aria-label="Setting Categories"
                selectionMode="single"
                selectedKeys={settingCategoryId ? new Set([settingCategoryId]) : new Set()}
                disallowEmptySelection
                onSelectionChange={(keys) => {
                  if (keys === 'all') return
                  const key = keys.values().next().value
                  setSettingCategoryId(key as string)
                }}
              >
                <SettingCategoryMenuItem id="llm" title="LLM" />
                <SettingCategoryMenuItem id="editor" title="Editor" />
                <SettingCategoryMenuItem id="tools" title="Tools" />
                <SettingCategoryMenuItem id="appearance" title="Appearance" />
                <SettingCategoryMenuItem id="shortcuts" title="Shortcuts" />
              </GridList>
              <div className="flex-1 border-l border-muted overflow-y-auto">
                {settingCategoryId === 'appearance' && <AppearanceSettingsPanel />}
                {settingCategoryId === 'llm' && <LlmSettingsPanel />}
                {settingCategoryId === 'editor' && <EditorSettingsPanel />}
                {settingCategoryId === 'tools' && <ToolsSettingsPanel />}
                {settingCategoryId === 'shortcuts' && <ShortcutsSettingsPanel />}
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}
