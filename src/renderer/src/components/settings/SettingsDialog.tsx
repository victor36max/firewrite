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
import { useState } from 'react'
import { LlmSettingsPanel } from './LlmSettingsPanel'
import { ToolsSettingsPanel } from './ToolsSettingsPanel'

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
  const [settingCategoryId, setSettingCategoryId] = useState<string>('llm')

  return (
    <DialogTrigger>
      <IconButton Icon={LuSettings} />
      <ModalOverlay
        isDismissable
        className="fixed inset-0 flex items-center justify-center bg-black/50"
      >
        <Modal className="w-full max-w-screen-lg p-4">
          <Dialog className="bg-background rounded-lg border border-muted">
            <div className="flex flex-row justify-between items-center p-4 border-b border-muted">
              <Heading slot="title" className="text-lg font-semibold">
                Settings
              </Heading>
              <IconButton slot="close" Icon={LuX} />
            </div>
            <div className="flex flex-row min-h-64">
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
                <SettingCategoryMenuItem id="tools" title="Tools" />
              </GridList>
              <div className="flex-1 border-l border-muted">
                {settingCategoryId === 'llm' && <LlmSettingsPanel />}
                {settingCategoryId === 'tools' && <ToolsSettingsPanel />}
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}
